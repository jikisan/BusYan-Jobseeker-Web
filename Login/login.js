import { DBPaths } from '/Job Seekers/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('password');

document.getElementById('loginMainForm').addEventListener('submit', loginUser);

function loginUser(event) {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    firebase.auth().signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            // User successfully signed in
            const uid = userCredential.uid;
            saveDataInLocalStorage(uid);
            // Handle successful login
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // Handle login errors

            alert(`Login failed!`)
        });

}

function saveDataInLocalStorage(uid) {
    console.log(uid);

    const passengerRef = database.ref(`${DBPaths.PASSENGER}/${uid}`);

    passengerRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            console.log(`exist`);

            const userKey = snapshot.key;
            const data = snapshot.val();

            // saveLoginTime(userKey, data);
            window.location.href = './../Job Seekers/specialization.html'; // Redirect if credentials match
            data["key"] = userKey;
            console.log(data);
            sessionStorage.setItem('currentUser', JSON.stringify(data));
            return;
        }
    });
}

function saveLoginTime(userId, data) {

    const loginDetailsData = {
        id: userId,
        fullName: data.fullName,
        role: 'operator',
        loginDateTime: new Date().toISOString()
    }

    const userRef = database.ref(`${DBPaths.LOGIN_NOTIF}`);

    userRef.push(loginDetailsData)
        .then(() => {
            hideAddBusCoopModal();
            // getBusCoop();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });
}

