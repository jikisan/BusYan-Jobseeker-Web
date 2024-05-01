import { getFormattedDateTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '../../utils/Utils.js';
import { DBPaths } from './DB.js';
import firebaseConfig from '/CONFIG.js';

// firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const notifUl = document.querySelector('.notif-ul');

let notifArray

document.addEventListener('DOMContentLoaded', init);

function init() {
    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';  
    }

    generateNotifs();

};

function generateNotifs() {

    const ref = database.ref(`${DBPaths.NOTIFICATIONS}`);
    notifArray = [];
    notifUl.innerHTML = '';

    ref.once('value',
        (snapshot) => {
            snapshot.forEach((notif) => {

                const notifKey = notif.key;
                const notifData = notif.val();
                notifData["key"] = notifKey;
                notifArray.push(notifData);
            });

            const reversedArray = notifArray.reverse();
            reversedArray.forEach((notifData) => {
                createNotifCard(notifData); 
            });
        }
    )
} 

function createNotifCard(notifData) {
    const li = document.createElement('li');
    li.className = 'notif-items';
    
    const divCard = document.createElement('div');
    divCard.className = 'notif-card';
    
    const anchor = document.createElement('a');
    anchor.href = '#';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-user-nurse';
    
    const divContent = document.createElement('div');
    divContent.className = 'notif-content';
    
    const h4 = document.createElement('h4');
    h4.className = 'notif-message';
    h4.textContent = convertToPascal(notifData.message);
    
    const p = document.createElement('p');
    p.className = 'notif-time';
    p.textContent = calculateTimeDiff(notifData.dateCreated);
    
    anchor.appendChild(icon);
    divCard.appendChild(anchor);
    divCard.appendChild(divContent);
    divContent.appendChild(h4);
    divContent.appendChild(p);
    li.appendChild(divCard);
    
    notifUl.appendChild(li);
}

function calculateTimeDiff(dateCreated) {
    const targetDate = new Date(dateCreated);
    const now = new Date();

    const diffInMillis = now - targetDate;
    const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
    const diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago.`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        if (minutes === 0) {
            return `${hours}h ago.`;
        }
        return `${hours}h ${minutes} min ago.`;
    } else {
        if (diffInDays === 1) {
            return `1 day ago.`;
        }
        return `${diffInDays} days ago.`;
    }
}