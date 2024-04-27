import { convertToMilitaryTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const busDriverBtn = document.getElementById('busDriverBtn');
const busConductorBtn = document.getElementById('busConductorBtn');

busDriverBtn.addEventListener('click', goToJobPage);
busConductorBtn.addEventListener('click', goToJobPage);

function goToJobPage() {
    window.location.href = '/Job Seekers/job-page.html';
}