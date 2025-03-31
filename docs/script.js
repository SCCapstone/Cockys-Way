document.querySelector('.hamburger').addEventListener("click", () => {
    document.querySelector('nav ul').classList.toggle('active');
    document.querySelector('.hamburger').classList.toggle('active');
})

document.querySelectorAll('nav ul li').forEach(navLink => {
    navLink.addEventListener("click", () => {
        document.querySelector('nav ul').classList.remove('active');
        document.querySelector('.hamburger').classList.remove('active');
    })
})