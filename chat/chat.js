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