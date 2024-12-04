from langchain_community.document_loaders import WebBaseLoader
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline, HuggingFaceEmbeddings
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from transformers import pipeline as hf_pipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TextIteratorStreamer, GenerationConfig
from threading import Thread
import torch
import os

MODEL_NAME = "sh2orc/Llama-3.1-Korean-8B-Instruct" # HuggingFace에서 원하는 모델 이름 복사해서 여기에 넣으면 알아서 모델 실행 전에 다운로드 해줌

# 양자화 세팅 -> 양자화를 하면 정확도를 희생하고 속도를 얻을 수 있음
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

# 모델 로딩
generation_config = GenerationConfig.from_pretrained(
    MODEL_NAME, temperature=0.0001 # 모델이 답변 생성할 때 창의력(?)을 적게 발휘하도록 유도
)

model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="auto", quantization_config=quantization_config, generation_config=generation_config, torch_dtype=torch.bfloat16)
# 속도를 위한 모델 컴파일
model = torch.compile(model, mode="reduce-overhead", fullgraph=True)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# HuggingFace에서 뽑는 출력을 스트림으로 받기 위한 streamer 선언
streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

# 가능한 경우 하드웨어 가속을 위한 device 세팅
device_name = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
device = torch.device(device_name)
print('Using device:', device)

# cuda 사용 시 정보 출력
if device.type == 'cuda':
    print(torch.cuda.get_device_name(0))
    print('Memory Usage:')
    print('Allocated:', round(torch.cuda.memory_allocated(0)/1024**3,1), 'GB')
    print('Cached:   ', round(torch.cuda.memory_reserved(0)/1024**3,1), 'GB')


# pipeline 선언
pipe = hf_pipeline("text-generation", model=model, tokenizer=tokenizer, streamer=streamer, max_new_tokens=512)

hf = HuggingFacePipeline(pipeline=pipe, model_id=MODEL_NAME, batch_size=8)


# 문서 로딩
docs = []
print("Loading documents")
text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    separator='\n',
    chunk_size=1, chunk_overlap=0
)
for path in os.listdir('./data/'):
    print(path)
    loader = TextLoader(file_path='./data/' + path)
    docs.append(loader.load()[0])


# 문서 유사도 탐색을 위한 embeddings, Chroma vectorstore 선언
local_embeddings = HuggingFaceEmbeddings(model_name = "jhgan/ko-sroberta-multitask", model_kwargs = {'device': device}, encode_kwargs={"normalize_embeddings": False})

vectorstore = Chroma.from_documents(documents=docs, embedding=local_embeddings, collection_metadata={"hnsw:space": "cosine"}) #

# 실행
print("Starting invocation")
chat_hf = ChatHuggingFace(llm=hf, verbose=True)

prompt = ChatPromptTemplate.from_messages(
    [
        # 시스템 메시지, 모델이 할 일과 모델이 참고해야 하는 정보를 전달
        (
            "system",
            """
당신은 도움이 되는 정보를 전달해주는 사람입니다.
아래에 전달된 맥락만을 사용해 질문에 대한 답변을 최대 3개 문장으로 만들어주세요.
답변을 잘 모르겠다면, 지어내지 말고 모르겠다고 답변하세요:
\n\n
{context}",
            """
        ),
        # 유저의 메시지, 질문이 들어가게 됨
        ("human", "{question}"),
    ]
)

# 문서를 가져오는 retriever 선언
# 유사도가 0.4 이상인 데이터만 불러오도록 설정
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.4} 
)

def route(prompt_info):
    # print(prompt_info)
    if len(prompt_info["context"]) == 0:
        # 관련 문서를 찾을 수 없는 경우
        streamer.on_finalized_text("원하시는 정보를 찾을 수 없었어요. 다른 질문을 시도해보세요.", stream_end=True)
        return None
    else:
        # 문서가 있으니 모델 실행
        return prompt | chat_hf

# 체인 구성
chain = {
        "context": retriever,
        "question": RunnablePassthrough(),
    } | RunnableLambda(route)

# 실행 함수 선언
def invoke(question):
    print("질문: " + question)
    invoke_kwargs = dict(
        input = question, 
        kwargs = {"callbacks": [StdOutCallbackHandler()]}
    )

    runner = Thread(target=chain.invoke, kwargs=invoke_kwargs)

    runner.start()

    for output in streamer:
        print(output, end='', flush=True)

    print() # 줄바꿈
    print()


invoke("나는 다둥이행복카드가 있는데 주차 요금 감면을 얼마나 받을 수 있어?")

invoke("나는 경차를 몰고 있는데 주차 요금 감면을 얼마나 받을 수 있어?")

invoke("내가 이용할 수 있는 공영주차장의 주소를 한개 알려줘")

invoke("일요일 18시에 갈 수 있는 도서관이 있어?")

invoke("일론 머스크에 대해 설명해줘")