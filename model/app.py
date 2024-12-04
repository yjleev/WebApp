from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
import os
import torch
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline as hf_pipeline, AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TextIteratorStreamer, GenerationConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline, HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader, PyPDFLoader, WebBaseLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from threading import Thread
import bs4

# FastAPI 초기화
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 및 설정 초기화
MODEL_NAME = "sh2orc/Llama-3.1-Korean-8B-Instruct"

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

generation_config = GenerationConfig.from_pretrained(
    MODEL_NAME, temperature=0.4
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    device_map="auto",
    quantization_config=quantization_config,
    generation_config=generation_config,
    torch_dtype=torch.bfloat16
)
model = torch.compile(model, mode="reduce-overhead", fullgraph=True)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
device_name = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
device = torch.device(device_name)

pipe = hf_pipeline("text-generation", model=model, tokenizer=tokenizer, streamer=streamer, max_new_tokens=2048)
hf = HuggingFacePipeline(pipeline=pipe, model_id=MODEL_NAME, batch_size=8)

# 문서 로딩
docs = []
web_docs = []
print("문서 로딩 중...")
text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    separator='\n',
    chunk_size=1, chunk_overlap=0
)

# 먼저 CSV 파일을 로딩합니다.
for path in os.listdir('./data/'):
    if path.endswith('.csv'):
        loader = TextLoader(file_path='./data/' + path)
        docs.append(loader.load()[0])

# 그다음으로 PDF 파일을 로딩합니다.
for path in os.listdir('./data/'):
    if path.endswith('.pdf'):
        loader = PyPDFLoader(file_path='./data/' + path)
        docs.extend(loader.load())

# 마지막으로 링크를 로딩합니다.
file = open("./links.txt", 'r', encoding='utf-8')
link_entries = set(file.readlines())
file.close()
for link in link_entries:
    try:
        loader = WebBaseLoader(web_path=link.replace('\n', ''), raise_for_status=True, bs_kwargs={"parse_only": bs4.SoupStrainer(class_="subcontent_box")})
        for doc in loader.load():
            web_docs.append(doc)
    except Exception as e:
        print(e)

print(web_docs)

local_embeddings = HuggingFaceEmbeddings(
    model_name="jhgan/ko-sroberta-multitask",
    model_kwargs={'device': device},
    encode_kwargs={"normalize_embeddings": False}
)
vectorstore = Chroma.from_documents(
    documents=docs + web_docs,
    embedding=local_embeddings,
    collection_metadata={"hnsw:space": "cosine"}
)

retriever = vectorstore.as_retriever(search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.4})
chat_hf = ChatHuggingFace(llm=hf, verbose=True)
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "당신은 도움이 되는 정보를 전달해주는 사람입니다. 아래에 전달된 맥락만을 사용해 질문에 대한 답변을 최대 3개 문장으로 만들어주세요. \n{context}\n\n답변 작성 시 다음 규칙을 반드시 지켜주세요:\n1. 중요한 내용은 <b></b>로 강조해주세요\n2. 목록이 필요한 경우 - 또는 1. 2. 3. 을 사용해주세요\n3. 줄바꿈이 필요한 경우 <br/>이라고 명시해주세요.\n4. 링크는 [텍스트](URL) 형식으로 작성해주세요"),
        ("human", "{question}")
    ]
)

def route(prompt_info):
    if len(retriever.search_kwargs) <= 0.4:
        return "원하시는 정보를 찾을 수 없었어요. 다른 질문을 시도해보세요."
    else:
        return prompt | chat_hf

chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnableLambda(route)

class Question(BaseModel):
    type: str
    question: str
    message: str

# 웹소켓 엔드포인트 정의
@app.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            question = Question.model_validate_json(data)

            async def generate_stream():
                invoke_kwargs = dict(input=question.message, kwargs={})
                runner = Thread(target=chain.invoke, kwargs=invoke_kwargs)
                runner.start()
                for output in streamer:
                    if len(output) < 1:
                        continue
                    await websocket.send_text(f'{{"type": "message-stream", "message": "{output}"}}\n')
                    print(output, end="")
               
                await websocket.send_text(f'{{"type": "message-stream", "message": "end"}}\n')

            await generate_stream()
    except WebSocketDisconnect:
        print("클라이언트가 연결을 끊었습니다.")
    except Exception as e:
        await websocket.send_text(f'{{"error": "{str(e)}"}}')
        print(f"에러: {e}")

# 실행 명령
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)