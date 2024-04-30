const home = document.querySelector('.fa-house');
const notification = document.querySelector('.fa-bell');
const profile = document.querySelector('.fa-user');

home.addEventListener('click', goToHomepage)

function goToHomepage() {

    window.location.href = '/Job Seekers/specialization.html';
}