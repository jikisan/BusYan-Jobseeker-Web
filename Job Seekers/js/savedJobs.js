import { getFormattedDateTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

// firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const savedJobsUl = document.querySelector('.saved-jobs-ul');
const jobPageModal = document.getElementById("jobPageModal");

let savedJobsArray

document.addEventListener('DOMContentLoaded', init);

function init() {
    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';
    }

    generateSavedJobs();

};

function generateSavedJobs() {

    const jobRef = database.ref(`${DBPaths.BOOKMARK_JOBS}`);
    savedJobsArray = [];

    jobRef.once('value',
        (snapshot) => {
            snapshot.forEach((job) => {

                const jobKey = job.key;
                const savedJobData = job.val();
                savedJobData["key"] = jobKey;

                if (savedJobData.userId == myData.key) {
                    getJobData(savedJobData);
                    savedJobsArray.push(savedJobData);
                }

            });
        }
    )
}

function getJobData(savedJobData) {
    const jobRef = database.ref(`${DBPaths.JOB}/${savedJobData.jobId}`);
    jobRef.once('value', (snapshot) => {
            if (snapshot.exists()) {

                const jobKey = snapshot.key;
                const jobData = snapshot.val();
                jobData["key"] = jobKey;
                savedJobData["jobData"] = jobData;
                createSavedJobs(savedJobData);

            }
        }
    )

}

function createSavedJobs(savedJobData) {
    const li = document.createElement('li');
    li.id = 'savedJobLi';

    const divContainer = document.createElement('div');
    divContainer.id = 'savedJobContainer';

    const jobType = document.createElement('span');
    jobType.id = 'jobType';
    jobType.textContent = savedJobData.jobData.jobType;

    const jobCompany = document.createElement('span');
    jobCompany.id = 'jobCompany';
    jobCompany.textContent = savedJobData.jobData.company;
    const jobAddress = document.createElement('span');
    jobAddress.id = 'jobAddress';
    jobAddress.textContent = savedJobData.jobData.location;

    const viewBtn = document.createElement('span');
    viewBtn.id = 'viewBtn';
    viewBtn.textContent = 'View';
    viewBtn.style.cursor = 'pointer';

    divContainer.appendChild(jobType);
    divContainer.appendChild(jobCompany);
    divContainer.appendChild(jobAddress);

    li.appendChild(divContainer);
    li.appendChild(viewBtn);

    savedJobsUl.appendChild(li);

    viewBtn.addEventListener('click', function() {
        goToJobPage(savedJobData.jobData.jobType)
    })
}

function goToJobPage(jobType) {
    sessionStorage.setItem('searchQuery', jobType);
    window.location.href = '/Job Seekers/job-page.html';
}

function showViewJobModal() {
    jobPageModal.style.display = 'block';
}

function hideViewJobModal() {
    jobPageModal.style.display = "none";
}
