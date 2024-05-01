import { getFormattedDateTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

// firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const jobContainer = document.querySelector(".job-container");
const jobPageModal = document.getElementById("jobPageModal");
const jobPageModalContent = document.querySelector(".job-page-modal-content");
const viewJobModalCloseBtn = document.querySelector(".viewJobModalCloseBtn");

const searchJobsInput = document.getElementById('searchJobsInput');
const jobType = document.getElementById('jobType');
const jobType2 = document.getElementById('jobType2');
const jobTitle = document.getElementById('jobTitle');
const company = document.getElementById('company');
const address = document.getElementById('address');
const salary = document.getElementById('salary');
const postedDate = document.getElementById('postedDate');
const companyImage = document.getElementById('companyImage');
const applyBtn = document.getElementById('applyBtn');
const saveBtn = document.getElementById('saveBtn');

const jobHighligths = document.getElementById('jobHighligths');
const qualifications = document.getElementById('qualifications');
const instructions = document.getElementById('instructions');
const aboutCompanyId = document.getElementById('aboutCompanyId');

// Get references to radio buttons and content divs
const jobDescriptionRadio = document.getElementById("jobDescription");
const aboutCompanyRadio = document.getElementById("aboutCompany");

const jobDescriptionContent = document.getElementById("jobDescriptionContent");
const aboutCompanyContent = document.getElementById("aboutCompanyContent");

let jobArray;
let questionnaireArray;
let tempBookmarkIcon;
let tempJobData;

document.addEventListener('DOMContentLoaded', init);
jobDescriptionRadio.addEventListener('change', updateContent);
aboutCompanyRadio.addEventListener('change', updateContent);
applyBtn.addEventListener('click', goToApplyPage);
saveBtn.addEventListener('click', bookmarkJobInViewJobPage);
viewJobModalCloseBtn.addEventListener('click', hideViewJobModal);
searchJobsInput.addEventListener('input', handleSearchJob);

function init() {
    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';  
    }

    generateJobs();

};

function handleSearchJob() {
    const searchTerm = searchJobsInput.value.toLowerCase().trim();
    const results = jobArray.filter(item => {
        return item.title.toLowerCase().includes(searchTerm);
    });
    jobContainer.innerHTML = '';
    results.forEach(result => {
        createJobCard(result);
    });
}

function generateJobs() {

    const searchText = sessionStorage.getItem('searchQuery'); 
    searchJobsInput.value = searchText; 

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

                if (searchText) {
                    if ( searchText === jobData.jobType) {
                        createJobCard(jobData);
                        jobArray.push(jobData);
                    }
                }
                else {
                    createJobCard(jobData);
                    jobArray.push(jobData);

                }
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
        viewJob(jobData, bookmarkIcon);
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

function bookmarkJobInViewJobPage() {

    const isBookmarked = saveBtn.style.backgroundColor === 'rgb(67, 138, 85)';
    console.log(saveBtn.style.backgroundColor);

    if (!isBookmarked) {
        console.log('no bookmark');
        addInBookmark(tempJobData, tempBookmarkIcon);
    }
    else if (isBookmarked) {
        console.log('bookmark');
        getBookmarkId(tempJobData, tempBookmarkIcon);
    }

    saveBtn.style.backgroundColor = !isBookmarked ? '#438a55' : '#ababab';
    saveBtn.textContent = !isBookmarked ? 'Unsave' : 'Save';

}

function checkIfBookmarked(jobId, icon) {
    const ref = database.ref(`${DBPaths.BOOKMARK_JOBS}`);

    // Use 'once' to get the value once, and then resolve the promise
    ref.once('value', (snapshot) => {
        snapshot.forEach(data => {
            const bookmarkData = data.val();
            const userId = bookmarkData.userId;
            const bookmarkJobId = bookmarkData.jobId;
            const isBookmarked = userId === myData.key && bookmarkJobId === jobId;

            icon.style.color = isBookmarked ? '#438a55' : '#000000';

        })
    }, (error) => {
        reject(error); // Handle errors
    });
}

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


function viewJob(jobData, bookmarkIcon) {
    tempBookmarkIcon = bookmarkIcon;
    tempJobData = jobData;

    jobType.textContent = jobData.jobType;
    jobType2.textContent = jobData.jobType;
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

    const isBookmarked = bookmarkIcon.style.color === 'rgb(67, 138, 85)';
    saveBtn.style.backgroundColor = isBookmarked ? '#438a55' : '#ababab';
    saveBtn.textContent = isBookmarked ? 'Unsave' : 'Save';

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

function goToApplyPage() {

    resumePhoto.src = '/Job Seekers/images/placeholder.png'
    resumePhotoBtn.value = ''
    addressInput.value = ''
    educationInput.value = ''
    licensePhoto.src = '/Job Seekers/images/placeholder.png'
    licensePhotoBtn.value = ''
    addInfoTxtArea.value = ''

    generateUserDetails();
    generateQuestionsForParticipant();
    showApplyJobModal();
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


// APPLY JOB ELEMENTS
const applyJobPageModalContent = document.querySelector(".apply-job-page-modal-content");
const applyJobModalCloseBtn = document.querySelector(".applyJobModalCloseBtn");
const applyJobForm = document.getElementById("applyJobForm");

const myName = document.getElementById('myName');
const myEmail = document.getElementById('myEmail');
const myPhoneNum = document.getElementById('myPhoneNum');
const myPhoto = document.getElementById('myPhoto');

const answeredQuestionsBtn = document.getElementById('answeredQuestionsBtn');

const questionnairesListUl = document.getElementById('questionnairesListUl');
const liElement = document.createElement('li');
const pElement = document.createElement('p');
const inputElement = document.createElement('input');

const resumeBtn = document.getElementById('resumeBtn');
const resumePhoto = document.getElementById('resumePhoto');
const resumePhotoBtn = document.getElementById('resumePhotoBtn');
const workExperienceSelect = document.getElementById('workExperienceSelect');
const addressInput = document.getElementById('addressinput');
const educationInput = document.getElementById('educationinput');
const driversLicenseBtn = document.getElementById('driversLicenseBtn');
const licensePhoto = document.getElementById('licensePhoto');
const licensePhotoBtn = document.getElementById('licensePhotoBtn');
const addInfoTxtArea = document.getElementById('addInfoTxtArea');
const submitBtn = document.getElementById('submitBtn');

let answersArray
let fileNameResumePhoto
let fileResumePhoto
let fileNameLicensePhoto
let fileLicensePhoto

applyJobForm.addEventListener('submit', processApplication)
applyJobModalCloseBtn.addEventListener('click', hideApplyJobModal)

function generateUserDetails() {
    myName.textContent = myData.fullName;
    myEmail.textContent = myData.email;
    myPhoneNum.textContent = myData.phoneNum;
    myPhoto.src = myData.imageUrl;
}

function generateQuestionsForParticipant() {
    const questionnaires = tempJobData.questionnaires;
    questionnairesListUl.innerHTML = '';

    questionnaires.forEach(question => {
        createQuestionItems(question);
    });
}

function createQuestionItems(question) {

    const liElement = document.createElement('li');
    liElement.classList.add('questions-list')

    const pElement = document.createElement('p');
    pElement.classList.add('questions-p')

    const inputElement = document.createElement('input');
    inputElement.classList.add('questions-inputs')
    inputElement.required = true;

    pElement.textContent = question;

    liElement.appendChild(pElement);
    liElement.appendChild(inputElement);

    questionnairesListUl.appendChild(liElement);
}

function processApplication(event) {
    event.preventDefault()

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed) {
        uploadResumePhoto()
    }
}

function uploadResumePhoto() {
    const ref = firebase.storage().ref(`${DBPaths.APPLICATIONS}`);

    const metadata = {
        contentType: fileResumePhoto.type
    };

    const task = ref.child(fileNameResumePhoto).put(fileResumePhoto, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload resume photo is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log(downloadURL);

                uploadLicensePhoto(downloadURL)

            });
        }
    );
}

function uploadLicensePhoto(resumeURL) {
    const ref = firebase.storage().ref(`${DBPaths.APPLICATIONS}`);

    const metadata = {
        contentType: fileLicensePhoto.type
    };

    const task = ref.child(fileNameLicensePhoto).put(fileLicensePhoto, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload resume photo is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (licenseUrl) {
                console.log(licenseUrl);

                saveDataInDb(resumeURL, licenseUrl)

            });
        }
    );
}

function saveDataInDb(resumeURL, licenseUrl) {

    const applicationData = {
        additionalInfo: addInfoTxtArea.value,
        address: addressInput.value,
        applicantId: myData.key,
        applicationDateCreated: getFormattedDateTime(),
        educationalAttainment: educationInput.value,
        jobId: tempJobData.key,
        latitude: 'N/A',
        licenseUrl: licenseUrl,
        longitude: 'N/A',
        profileUrl: myData.imageUrl,
        resumeUrl: resumeURL,
        status: 'pending',
        workExperience: workExperienceSelect.options[workExperienceSelect.selectedIndex].textContent,
        qaSets: getAnswers(),
    }


    const id = getCurrentDateTimeInMillis();

    const ref = database.ref(`${DBPaths.APPLICATIONS}/${id}`);

    ref.set(applicationData)
        .then(() => {
            alert('Application Sent!!')
            hideApplyJobModal()
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });

}

function getAnswers() {
    const ulElement = document.getElementById('questionnairesListUl');
    const liElements = ulElement.getElementsByClassName('questions-list');
    answersArray = []

    for (const li of liElements) {
        const p = li.querySelector('.questions-p'); // Get the input inside this 'li'
        const dataArray = []

        const input = li.querySelector('.questions-inputs'); // Get the input inside this 'li'
        if (input) {
            dataArray.push(p.textContent)
            dataArray.push(input.value)
            answersArray.push(dataArray)
        }
    }
    console.log(answersArray)
    console.log(typeof (answersArray))

    return answersArray
}

function showApplyJobModal() {
    jobPageModalContent.style.display = 'none';
    applyJobPageModalContent.style.display = 'flex';
}

function hideApplyJobModal() {
    jobPageModalContent.style.display = 'flex';
    applyJobPageModalContent.style.display = 'none';
}

window.addEventListener('load', function () {

    resumePhotoBtn.addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            resumePhoto.onload = () => {
                URL.revokeObjectURL(resumePhoto.src);
            }
            resumePhoto.src = URL.createObjectURL(this.files[0]);
            fileNameResumePhoto = this.files[0].name;
            fileResumePhoto = event.target.files[0];
        }
    });
});

window.addEventListener('load', function () {

    licensePhotoBtn.addEventListener('change', function (event) {

        if (this.files && this.files[0]) {
            licensePhoto.onload = () => {
                URL.revokeObjectURL(licensePhoto.src);
            }
            licensePhoto.src = URL.createObjectURL(this.files[0]);
            fileNameLicensePhoto = this.files[0].name;
            fileLicensePhoto = event.target.files[0];
        }
    });
});
