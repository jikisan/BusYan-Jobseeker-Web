import { getFormattedDateTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

// firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const profileForm = document.getElementById('profileForm');
const editProfileImg = document.getElementById('editProfileImg');
const editProfileImgBtn = document.getElementById('editProfileImgBtn');
const editProfileName = document.getElementById('editProfileName');
const editProfileEmail = document.getElementById('editProfileEmail');
const editProfilePhoneNum = document.getElementById('editProfilePhoneNum');
const updateProfileBtn = document.getElementById('updateProfileBtn');

let fileName;
let file;

updateProfileBtn.addEventListener('click', saveProfileInDb);
document.addEventListener('DOMContentLoaded', init);

function init() {
    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';  
    }

    generateProfileData();

};

function generateProfileData() {
    editProfileImg.src = myData.imageUrl;
    editProfileName.value = convertToPascal(myData.fullName);
    editProfileEmail.value = myData.email;
    editProfilePhoneNum.value = myData.phoneNum;
}

function saveProfileInDb(event) {
    event.preventDefault()

    const isConfirmed = window.confirm('Make sure all information are correct!')

    showLoader();

    if (isConfirmed) {
        if (editProfileImgBtn && (editProfileImgBtn.files.length === 0 || editProfileImgBtn.value === '')) {
            updateProfile(myData.imageUrl);
        } else {
            uploadProfilePhoto();
        }

        // Check if all inputs are empty
        if (editProfileName.value === '' && editProfilePhoneNum.value === '') {
            hideLoader();
            return;
        }
    }

    hideLoader();
}

function uploadProfilePhoto() {
    const ref = firebase.storage().ref(`${DBPaths.PASSENGERS}`);

    const metadata = {
        contentType: file.type
    };

    const task = ref.child(fileName).put(file, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log(downloadURL);
                updateProfile(downloadURL);
                // Save the downloadURL to your database or use it as needed
            });
        }
    );
}

function updateProfile(url) {
    // Construct data object to send to server
    const data = {
        fullName: editProfileName.value,
        imageUrl: url,
        phoneNum: editProfilePhoneNum.value
    };

    if (data.fullName !== myData.fullName ||
        data.imageUrl !== myData.imageUrl ||
        data.phoneNum !== myData.phoneNum) {

        const id = myData.key;
        const userRef = firebase.database().ref(`${DBPaths.PASSENGERS}/${id}`);
        userRef.update(data)
            .then(() => {
                myData.key = id;
                myData.fullName = data.fullName;
                myData.imageUrl = data.imageUrl;
                myData.phoneNum = data.phoneNum;

                sessionStorage.setItem('currentUser', JSON.stringify(myData));
                alert('Profile updated!')
            })
            .catch(error => {
                console.error('Error updating multiple fields:', error);
            });

    }



}

function showLoader() {
    const loader = document.querySelector('.loader-container');
    loader.style.display = 'flex'
}

function hideLoader() {
    const loader = document.querySelector('.loader-container');
    loader.style.display = "none";
}

window.addEventListener('load', function () {
    editProfileImgBtn.addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            editProfileImg.onload = () => {
                URL.revokeObjectURL(editProfileImg.src);
            }
            editProfileImg.src = URL.createObjectURL(this.files[0]);
            fileName = this.files[0].name;
            file = event.target.files[0];
        }
    });
});
