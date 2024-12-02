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
const typeA = document.getElementsByClassName('typeA');
const typeB = document.getElementsByClassName('typeB');
const typeC = document.getElementsByClassName('typeC');
const typeD = document.getElementsByClassName('typeD');
const question = document.getElementsByClassName('select');

let a = [], b = [], c = [], d = [];
let A = 0, B = 0, C = 0, D = 0;
let test = false;

radios.forEach(function(radio){
  radio.addEventListener('click', function(){
    test = true;
    for (let i = 0; i < typeA.length; i++) {
      if(radio.closest('.typeA') === typeA[i]){
        a[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.typeB') === typeB[i]){
        b[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.typeC') === typeC[i]){
        c[i] = parseInt(radio.value);
        break;
      }else if(radio.closest('.typeD') === typeD[i]){
        d[i] = parseInt(radio.value);
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
const page = document.getElementsByClassName('page');
const main = document.querySelector('#test');
let i = 0;

nav.forEach(function(nav){
  nav.addEventListener('click', (e)=>{
    if(test===true&![link[0],link[1],link[2]].includes(e.target)){
      const userResponse = window.confirm('테스트 중단하시겠습니까?');
      if (!userResponse) {
        e.preventDefault();    //out
      }
    }
    else if(e.target===link[0]|e.target ===link[1]|e.target===link[2]){
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
    A += a[i]; B += b[i]; C += c[i]; D += d[i];
  }
  window.localStorage.setItem('A',A);
  window.localStorage.setItem('B',B);
  window.localStorage.setItem('C',C);
  window.localStorage.setItem('D',D);
});