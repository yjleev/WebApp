const textarea = document.querySelector('textarea');
const sent = document.querySelector('.sent');
const container = document.querySelector('.container');
let question = '';

// WebSocket 객체 생성 (Node.js 서버와 연결)
const socket = new WebSocket('ws://localhost:5215');

socket.onopen = () => {
    console.log("서버에 연결되었습니다.");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "response") {
        console.log(`모델 응답: ${data.message}`);
        displayResponse(data.message);
    }
};

socket.onerror = (error) => {
    console.error(`오류 발생: ${error.message}`);
};

const text = () => {
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
        container.scrollTop = container.scrollHeight;
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveText();
        }
    });

    sent.addEventListener('mousedown', () => {
        saveText();
    });

    const saveText = () => {
        question = textarea.value.trim();
        if (question === '') {
            alert('다시 입력해주세요.');
            return;
        }
        textarea.value = '';
        textarea.style.height = '50px';

        // 사용자 입력을 화면에 표시
        const section = document.createElement('section');
        const article = document.createElement('article');
        article.innerHTML = question;
        section.appendChild(article);
        container.appendChild(section);
        container.scrollTop = container.scrollHeight;

        // 질문을 서버로 전송
        sendQuestion(question);

        // 로딩 상태 표시
        displayLoading();
    }
}

text();

// 서버로 질문 전송
function sendQuestion(question) {
    const payload = {
        type: "send_msg",
        message: question
    };
    socket.send(JSON.stringify(payload));
}

// 로딩 상태 표시 함수
function displayLoading() {
    const nav = document.createElement('nav');
    const aside = document.createElement('aside');
    aside.innerHTML = '<img src="../img/loading.gif">';
    nav.appendChild(aside);
    container.appendChild(nav);
    container.scrollTop = container.scrollHeight;
}

// 모델 응답 표시 함수
function displayResponse(response) {const textarea = document.querySelector('textarea');
    const sent = document.querySelector('.sent');
    const container = document.querySelector('.container');
    let question = '';
    
    // WebSocket 객체 생성 (Node.js 서버와 연결)
    let socket;
    
    function initializeWebSocket() {
        socket = new WebSocket('ws://localhost:5215');
    
        socket.onopen = () => {
            console.log("서버에 연결되었습니다.");
        };
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "response") {
                console.log(`모델 응답: ${data.message}`);
                displayResponse(data.message);
            }
        };
    
        socket.onerror = (error) => {
            console.error(`오류 발생: ${error.message}`);
        };
    
        socket.onclose = () => {
            console.log("서버와의 연결이 종료되었습니다. 재연결 시도 중...");
            setTimeout(initializeWebSocket, 1000); // 1초 후 재연결 시도
        };
    }
    
    initializeWebSocket();
    
    const text = () => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
            container.scrollTop = container.scrollHeight;
        });
    
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveText();
            }
        });
    
        sent.addEventListener('mousedown', () => {
            saveText();
        });
    
        const saveText = () => {
            question = textarea.value.trim();
            if (question === '') {
                alert('다시 입력해주세요.');
                return;
            }
            textarea.value = '';
            textarea.style.height = '50px';
    
            // 사용자 입력을 화면에 표시
            const section = document.createElement('section');
            const article = document.createElement('article');
            article.innerHTML = question;
            section.appendChild(article);
            container.appendChild(section);
            container.scrollTop = container.scrollHeight;
    
            // 질문을 서버로 전송
            sendQuestion(question);
    
            // 로딩 상태 표시
            displayLoading();
        }
    }
    
    text();
    
    // 서버로 질문 전송
    function sendQuestion(question) {
        if (socket.readyState === WebSocket.OPEN) {
            const payload = {
                type: "send_msg",
                message: question
            };
            socket.send(JSON.stringify(payload));
        } else {
            console.error("WebSocket이 열려 있지 않습니다. 메시지를 보낼 수 없습니다.");
        }
    }
    
    // 로딩 상태 표시 함수
    function displayLoading() {
        const nav = document.createElement('nav');
        const aside = document.createElement('aside');
        aside.innerHTML = '<img src="../img/loading.gif">';
        nav.appendChild(aside);
        container.appendChild(nav);
        container.scrollTop = container.scrollHeight;
    }
    
    // 모델 응답 표시 함수
    function displayResponse(response) {
        const nav = document.createElement('nav');
        const aside = document.createElement('aside');
        aside.innerHTML = response;
        nav.appendChild(aside);
        container.appendChild(nav);
        container.scrollTop = container.scrollHeight;
    }
    
    const nav = document.createElement('nav');
    const aside = document.createElement('aside');
    aside.innerHTML = response;
    nav.appendChild(aside);
    container.appendChild(nav);
    container.scrollTop = container.scrollHeight;
}
