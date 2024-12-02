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
const select = document.getElementsByClassName('select');

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
      if(document.querySelectorAll('input[type="radio"]:checked').length===select.length){
        test = false;
      }
      // window.scrollBy({
      //   top: 300,
      //   behavior: 'smooth'
      // });
    });
  });