// header script

window.addEventListener('scroll', function () {
    var header = document.querySelector('header');
    const navList = document.querySelector('.nav-list');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        navList.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
        navList.classList.remove('scrolled');
    }
});

const menuIcon = document.querySelector('.menu-icon');
const navList = document.querySelector('.nav-list');

menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('active');
    navList.classList.toggle('active');
});
