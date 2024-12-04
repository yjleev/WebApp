let bar = document.querySelector('.scroll>div');
let scrollTop;

window.addEventListener('scroll', () => {
    scrollTop = document.documentElement.scrollTop;
    let per = Math.round(
      (scrollTop / (document.body.scrollHeight - window.outerHeight)) * 100
    );
    bar.style.width = per + "%";
});

const radios = document.querySelectorAll('input[type="radio"]');
const typeA = document.getElementsByClassName('C');
const typeB = document.getElementsByClassName('Cpp');
const typeC = document.getElementsByClassName('CS');
const typeD = document.getElementsByClassName('python');
const typeE = document.getElementsByClassName('java');
const typeF = document.getElementsByClassName('js');
const question = document.getElementsByClassName('select');
const page = document.getElementsByClassName('page');

let a = [], b = [], c = [], d = [], e = [], f = [];
let A = 0, B = 0, C = 0, D = 0, E = 0, F = 0;
let test = false;

radios.forEach(function(radio){
  radio.addEventListener('click', function(){
    test = true;
    for (let i = 0; i < 6; i++) {
      if(radio.closest('.C') === typeA[i]){
        a[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.Cpp') === typeB[i]){
        b[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.CS') === typeC[i]){
        c[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.python') === typeD[i]){
        d[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.java') === typeE[i]){
        E[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.js') === typeF[i]){
        F[i] = parseInt(radio.value);
        break;
      }
    }
    const move = radio.closest('.page>*').nextElementSibling;
    if(!move.classList.contains('block')){
      radio.closest('section').scrollIntoView();
      move.classList.add('block');
    }
    if(document.querySelectorAll('input[type="radio"]:checked').length===question.length){
      test = false;
    }
  });
});

//next
const nav = document.querySelectorAll('a');
const link = document.querySelectorAll('.next>a');
const main = document.querySelector('#test');
let i = 0;

nav.forEach(function(nav){
  nav.addEventListener('click', (e)=>{
    if(test===true&![link[0],link[1]].includes(e.target)){
      const userResponse = window.confirm('테스트 중단하시겠습니까?');
      if (!userResponse) {
        e.preventDefault();    //out
      }
    }
    else if(e.target===link[0]|e.target ===link[1]){
      if(page[i].querySelectorAll('input[type="radio"]:checked').length<question.length/page.length){
        alert('테스트 미완료');
      }
      else{
        page[i].style.display = 'none';
        page[i+1].style.display = 'block';
        i++;
        e.preventDefault();
        window.scrollTo({
        top: main.offsetTop - document.querySelector('header').clientHeight-5-200,
        });
      }
    }
  });
});

const result = document.querySelector('.result>a');

result.addEventListener('click', ()=>{
  for(let i = 0; i < 4; i++){
    A += a[i] || 0;
    B += b[i] || 0;
    C += c[i] || 0;
    D += d[i] || 0;
    E += e[i] || 0;
    F += f[i] || 0; 
  }
  window.localStorage.setItem('A', String(A));
  window.localStorage.setItem('B', String(B));
  window.localStorage.setItem('C', String(C));
  window.localStorage.setItem('D', String(D));
  window.localStorage.setItem('E', String(E));
  window.localStorage.setItem('F', String(F));

});