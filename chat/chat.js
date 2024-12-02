const input = document.querySelector('input');

document.addEventListener("DOMContentLoaded", function () {
    input.addEventListener('input', ()=>{
        this.style.height = "auto";
        const newHeight = Math.min(this.scrollHeight, 500);
        this.style.height = newHeight + "px"; 
    });
});