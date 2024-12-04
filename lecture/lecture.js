const typeA = window.localStorage.getItem('A');
const typeB = window.localStorage.getItem('B');
const typeC = window.localStorage.getItem('C');
const typeD = window.localStorage.getItem('D');

console.log(typeA,typeB,typeC,typeD);

const slides = document.querySelectorAll('.frame > .slide');
let current = 0; 

const Slide = () => {

    slides.forEach((slide, index) => {
        slide.className = 'slide';

        if (index === current) {
            slide.classList.add('center');
        } else if (index === (current - 1 + slides.length) % slides.length) {
            slide.classList.add('left');
        } else if (index === (current + 1) % slides.length) {
            slide.classList.add('right');
        } else if (index === (current - 2 + slides.length) % slides.length) {
            slide.classList.add('left-back');
        } else if (index === (current + 2) % slides.length) {
            slide.classList.add('right-back');
        }
    });
};

Slide();

// 3초마다 슬라이드 이동
setInterval(() => {
    current = (current + 1) % slides.length; // 현재 슬라이드 인덱스 갱신
    Slide(); // 상태 업데이트
}, 4000);