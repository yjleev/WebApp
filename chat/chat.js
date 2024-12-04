const textarea = document.querySelector('textarea');
const sent = document.querySelector('.sent');
const container = document.querySelector('.container');
let question = '';

const text = ()=>{
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
        container.scrollTop = container.scrollHeight;
    });

    textarea.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){
            e.preventDefault();
            saveText();
        }
    });

    sent.addEventListener('mousedown', ()=>{
        saveText();
    }); 

    const saveText = ()=>{
        question = textarea.value.trim();
        if(question === ''){
            alert('다시 입력해주세요.');
            return;
        }
        textarea.value = '';
        textarea.style.height = '50px';

        const section = document.createElement('section');
        const article = document.createElement('article');
        article.innerHTML = question;
        section.appendChild(article);
        container.appendChild(section);
        container.scrollTop = container.scrollHeight;
        receive(question);
    }
}

text();

const receive = (a)=>{
    const nav = document.createElement('nav');
    const aside = document.createElement('aside');
    aside.innerHTML = '<img src="../img/loading.gif">';
    nav.appendChild(aside);
    container.appendChild(nav);
    container.scrollTop = container.scrollHeight;
    setTimeout(()=>{
        aside.innerHTML = a;
        container.scrollTop = container.scrollHeight;
    },5000);
}

const socket = new WebSocket('ws://localhost:5215');

socket.onopen = () => {
    console.log("서버에 연결되었습니다.");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "response") {
        console.log(`모델 응답: ${data.message}`);
    }
};

socket.onerror = (error) => {
    console.error(`오류 발생: ${error.message}`);
};

function sendQuestion(question) {
    const payload = {
        type: "send_msg",
        question: question
    };
    socket.send(JSON.stringify(payload));
}

// 예시로 질문 보내기
sendQuestion("안녕하세요, 오늘 날씨는 어떤가요?");