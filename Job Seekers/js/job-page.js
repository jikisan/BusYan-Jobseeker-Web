import { convertToMilitaryTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const jobContainer = document.querySelector(".job-container");
const jobPageModal = document.getElementById("jobPageModal");
const viewJobModalCloseBtn = document.querySelector(".viewJobModalCloseBtn");

// Get references to radio buttons and content divs
const jobDescriptionRadio = document.getElementById("jobDescription");
const aboutCompanyRadio = document.getElementById("aboutCompany");

const jobDescriptionContent = document.getElementById("jobDescriptionContent");
const aboutCompanyContent = document.getElementById("aboutCompanyContent");

const jobType = document.getElementById('jobType'); 
const jobTitle = document.getElementById('jobTitle'); 
const company = document.getElementById('company'); 
const address = document.getElementById('address'); 
const salary = document.getElementById('salary'); 
const postedDate = document.getElementById('postedDate'); 
const companyImage = document.getElementById('companyImage'); 
const jobHighligths = document.getElementById('jobHighligths'); 
const qualifications = document.getElementById('qualifications'); 
const instructions = document.getElementById('instructions'); 
const aboutCompanyId = document.getElementById('aboutCompanyId'); 

let jobArray;
let questionnaireArray;

document.addEventListener('DOMContentLoaded', init);
jobDescriptionRadio.addEventListener('change', updateContent);
aboutCompanyRadio.addEventListener('change', updateContent);
viewJobModalCloseBtn.addEventListener('click', hideViewJobModal);


function init() {
    generateJobs();
};

function generateJobs() {
    const jobRef = database.ref(`${DBPaths.JOB}`);
    jobArray = [];
    questionnaireArray = [];
    jobContainer.innerHTML = '';

    jobRef.once('value',
        (snapshot) => {
            snapshot.forEach((job) => {

                const jobKey = job.key;
                const jobData = job.val();
                jobData["key"] = jobKey;
                jobArray.push(jobData);

                createJobCard(jobData);
            });
        }
    )
}

function createJobCard(jobData) {

    // Create the main job card container
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';  // Set class name for styling

    // Create the inner flex container
    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.justifyContent = 'space-between';
    flexContainer.style.flexDirection = 'row';

    // Create the elements inside the flex container
    const jobTitle = document.createElement('h5');
    jobTitle.textContent = jobData.title;
    jobTitle.style.cursor = 'pointer';

    const bookmarkIcon = document.createElement('i');
    bookmarkIcon.className = 'fa-solid fa-bookmark';
    bookmarkIcon.style.marginRight = '10px';

    checkBookmark(bookmarkIcon, jobData);

    jobCard.appendChild(flexContainer);

    // Append elements to the flex container
    flexContainer.appendChild(jobTitle);
    flexContainer.appendChild(bookmarkIcon);

    // Create and append the company name (h6)
    const companyName = document.createElement('h6');
    companyName.textContent = jobData.company;
    jobCard.appendChild(companyName);

    // Create and append the job location with icon (h5)
    const locationElement = document.createElement('h5');
    locationElement.innerHTML = `<i class="fa-solid fa-location-dot"></i>${jobData.location}`;
    jobCard.appendChild(locationElement);

    // Create and append the salary range (p)
    const salary = document.createElement('p');
    salary.textContent = jobData.salary;
    jobCard.appendChild(salary);

    // Create and append the date posted (span)
    const dateSpan = document.createElement('span');
    dateSpan.textContent = jobData.postDate;
    jobCard.appendChild(dateSpan);

    // Append the job card to the job container
    jobContainer.appendChild(jobCard);

    bookmarkIcon.addEventListener('click', function () {
        bookmarkJob(jobData, bookmarkIcon);
    })

    jobTitle.addEventListener('click', function () {
        viewJob(jobData);
    })
}

function checkBookmark(bookmarkIcon, jobData) {
    checkIfBookmarked(jobData.key, bookmarkIcon);
}

function bookmarkJob(jobData, bookmarkIcon) {

    const isBookmarked = bookmarkIcon.style.color === 'rgb(67, 138, 85)';
    console.log(bookmarkIcon.style.color);

    if (!isBookmarked) {
        console.log('no bookmark');
        addInBookmark(jobData, bookmarkIcon);
    }
    else if (isBookmarked) {
        console.log('bookmark');
        getBookmarkId(jobData, bookmarkIcon);
    }
}

function checkIfBookmarked(jobId, bookmarkIcon) {
    const ref = database.ref(`${DBPaths.BOOKMARK_JOBS}`);

    // Use 'once' to get the value once, and then resolve the promise
    ref.once('value', (snapshot) => {
        snapshot.forEach(data => {
            const bookmarkData = data.val();
            const userId = bookmarkData.userId;
            const jobId = bookmarkData.jobId;
            const isBookmarked = userId === myData.key && jobId === jobId;
            bookmarkIcon.style.color = isBookmarked ? '#438a55' : '#000000';

        })
    }, (error) => {
        reject(error); // Handle errors
    });
}

// function getBookmarkedId
function addInBookmark(job, bookmarkIcon) {
    const bookmarkData = {
        bookmarkDate: getFormattedDate(),
        jobId: job.key,
        userId: myData.key,
    };

    const id = getCurrentDateTimeInMillis();

    const jobRef = database.ref(`${DBPaths.BOOKMARK_JOBS}/${id}`);

    jobRef.set(bookmarkData)
        .then(() => {
            bookmarkIcon.style.color = '#438a55';
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });
}

function getBookmarkId(jobData, bookmarkIcon) {

    const ref = database.ref(`${DBPaths.BOOKMARK_JOBS}`);

    // Use 'once' to get the value once, and then resolve the promise
    ref.once('value', (snapshot) => {
        snapshot.forEach(item => {
            const bookmarkData = item.val();
            const bookmarkId = item.key;
            if (bookmarkData.userId === myData.key &&
                bookmarkData.jobId === jobData.key) {
                console.log(bookmarkId);
                removeAsBookmarked(bookmarkId, bookmarkIcon);
            }
        });
    }, (error) => {
        // reject(error); // Handle errors
    });
}

function removeAsBookmarked(bookmarkId, bookmarkIcon) {
    const dbRef = firebase.database().ref(`${DBPaths.BOOKMARK_JOBS}/${bookmarkId}`);

    dbRef.remove()
        .then(() => {
            bookmarkIcon.style.color = '#000000';
        })
        .catch((error) => {
            alert('Failed.');
        });
}


function viewJob(jobData) {
    jobType.textContent = jobData.jobType;
    jobTitle.textContent = jobData.title;
    company.textContent = jobData.company;
    address.textContent = jobData.location;
    salary.textContent = jobData.salary;
    postedDate.textContent = jobData.postDate;
    companyImage.src = jobData.companyPhotoUrl;
    jobHighligths.textContent = jobData.description;
    qualifications.textContent = jobData.qualifications;
    instructions.textContent = jobData.applicationInstructions;
    aboutCompanyId.textContent = jobData.aboutCompany;
    showViewJobModal();
}

function getFormattedDate() {
    const date = new Date(); // Get the current date and time

    // Extract components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Create the formatted date string
    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}


// Function to initialize the radio filter and set up event listeners
// Function to show/hide content based on selected radio button
function updateContent() {
    if (jobDescriptionRadio.checked) {
        jobDescriptionContent.style.display = 'flex';
        aboutCompanyContent.style.display = 'none';
    } else if (aboutCompanyRadio.checked) {
        aboutCompanyContent.style.display = 'flex';
        jobDescriptionContent.style.display = 'none';

    }
}

function showViewJobModal() {
    jobPageModal.style.display = 'block';
}

function hideViewJobModal() {
    jobPageModal.style.display = "none";
}