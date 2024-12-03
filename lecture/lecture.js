const typeA = window.localStorage.getItem('A');
const typeB = window.localStorage.getItem('B');
const typeC = window.localStorage.getItem('C');
const typeD = window.localStorage.getItem('D');

console.log(typeA,typeB,typeC,typeD);

const frame = document.querySelector('.frame');
const lecture = document.querySelectorAll('.frame>a'); 
let page = 0;

const over = (page) => {
    if(page>4){
        return page-4;
    }
    else {
        return page;
    }
};

setInterval(()=>{
    if(page === 5){
        page=0;
    }

    lecture.forEach((e) => {
        e.style.left = '';
        e.style.right = '';
        e.style.transform = '';
        e.style.zIndex = '';
    });
    
    lecture[over(page)].style.left = '0';              
    lecture[over(page)].style.zIndex = '40';               
    lecture[over(page)].style.transform = 'scale(0.8)';                     
     
    lecture[over(page + 1)].style.left = '50%';                            
    lecture[over(page + 1)].style.transform = 'translate(-50%) scale(1.3)';
    lecture[over(page + 1)].style.zIndex = '50';                              

    lecture[over(page+2)].style.right = '0';             
    lecture[over(page+2)].style.zIndex = '40';     
    lecture[over(page+2)].style.transform = 'scale(0.8)';            

    lecture[over(page + 3)].style.left = '20%';            
    lecture[over(page + 3)].style.zIndex = '30';
    lecture[over(page + 3)].style.transform = 'scale(0.6)';             

    lecture[over(page + 4)].style.right = '20%';           
    lecture[over(page + 4)].style.zIndex = '30';       
    lecture[over(page + 4)].style.transform = 'scale(0.6)';     

    page++;

},3000);