import { getFormattedDateTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const home = document.querySelector('.fa-house');
const notification = document.querySelector('.fa-bell');
const profile = document.querySelector('.fa-user');
const customPopup = document.getElementById('custom-popup');

const profileImage = document.querySelector('.profile-img');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const editProfileButton = document.getElementById('editProfileBtn');
const profileSavedJob = document.getElementById('profileSavedJob');
const profileAboutUs = document.getElementById('profileAboutUs');
const profileHelpCenter = document.getElementById('profileHelpCenter');
const profileLogout = document.getElementById('profileLogout');


document.addEventListener('DOMContentLoaded', init);
home.addEventListener('click', goToHomepage)
notification.addEventListener('click', goToNotifpage)
profile.addEventListener('click', manageProfileMenu)
editProfileButton.addEventListener('click', goToProfilePage)
profileSavedJob.addEventListener('click', goToSavedJobsPage)
profileAboutUs.addEventListener('click', goToAboutUsPage)
profileHelpCenter.addEventListener('click', goToHelpCenterPage)
profileLogout.addEventListener('click', logOut)

function init() {
    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';  
    }

    generateUserData()

};

function generateUserData() {
    profileImage.src = myData.imageUrl;
    profileName.textContent = convertToPascal(myData.fullName);
    profileEmail.textContent = myData.email;
}

function goToHomepage() {

    window.location.href = '/Job Seekers/specialization.html';
}

function goToNotifpage() {

    window.location.href = '/Job Seekers/notification-page.html';
}

function goToProfilePage() {
    window.location.href = '/Job Seekers/edit-profile.html';
}

function goToSavedJobsPage() {
    window.location.href = '/Job Seekers/saved-job.html';
}

function goToAboutUsPage() {
    window.location.href = '/Job Seekers/about-us.html';
}

function goToHelpCenterPage() {
    window.location.href = '/Job Seekers/help-center.html';
}

function manageProfileMenu() {
    if (customPopup) {
        const currentDisplay = customPopup.style.display;
        customPopup.style.display = currentDisplay === 'none' ? 'flex' : 'none';
    }
}

function logOut() {

    const isConfirmed = window.confirm("Are you sure you want to logout?");
    
    if (isConfirmed) {
        firebase.auth().signOut()
        .then(() => {
            alert('User logged out successfully');
            window.location.href = '/login.html';
        })
        .catch((error) => {
            alert('Error during logout:', error);
        });
    }
}

function show() {
    if (customPopup) {
        customPopup.style.display = 'flex';
    }
}

function hide() {
    if (customPopup) {
        customPopup.style.display = 'none';
    }
}
