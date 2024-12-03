const typeA = window.localStorage.getItem('A');
const typeB = window.localStorage.getItem('B');
const typeC = window.localStorage.getItem('C');
const typeD = window.localStorage.getItem('D');

console.log(typeA,typeB,typeC,typeD);

const slides = document.querySelectorAll('.frame > .slide');
let current = 0; // 초기 슬라이드는 첫 번째(인덱스 0)

// 슬라이드 상태를 업데이트하는 함수
const updateSlides = () => {
    const totalSlides = slides.length;

    slides.forEach((slide, index) => {
        // 모든 슬라이드 초기화
        slide.className = 'slide';

        // 현재 슬라이드와 위치를 계산해 클래스 추가
        if (index === current) {
            slide.classList.add('center'); // 중앙 슬라이드
        } else if (index === (current - 1 + totalSlides) % totalSlides) {
            slide.classList.add('left'); // 왼쪽 슬라이드
        } else if (index === (current + 1) % totalSlides) {
            slide.classList.add('right'); // 오른쪽 슬라이드
        } else if (index === (current - 2 + totalSlides) % totalSlides) {
            slide.classList.add('left-back'); // 왼쪽 뒤 슬라이드
        } else if (index === (current + 2) % totalSlides) {
            slide.classList.add('right-back'); // 오른쪽 뒤 슬라이드
        }
    });
};

// 초기 상태 설정
updateSlides();

// 3초마다 슬라이드 이동
setInterval(() => {
    current = (current + 1) % slides.length; // 현재 슬라이드 인덱스 갱신
    updateSlides(); // 상태 업데이트
}, 4000);