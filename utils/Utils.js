export const convertToPascal = (str) => {

    if (str === null || typeof (null) === undefined) {
        return str;
    }
    else {
        // Split the string into an array of words
        let words = str.split(' ');

        // Capitalize the first letter of each word
        for (let i = 0; i < words.length; i++) {
            // Capitalize the first letter of each word
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }

        // Join the words back into a single string
        return words.join(' ');
    }
}

export const getCurrentDateTimeInMillis = () => {
    return new Date().getTime();
}

export const convertTo12Hour = (time24) => {
    const [hours24, minutes] = time24.split(':').map(Number);

    // Determine AM/PM and 12-hour representation
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours24 + 11) % 12) + 1; // Converts 24-hour to 12-hour and avoids 0

    // Return the formatted 12-hour time
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const convertToMilitaryTime = (time12) => {
     // Separate the time from the AM/PM designation
     let [time, period] = time12.split(' ');

     // Separate hours and minutes
     let [hours, minutes] = time.split(':').map(Number);
 
     // Convert to 24-hour format based on AM/PM
     if (period === 'PM' && hours !== 12) {
         hours += 12; // Add 12 to convert PM hours to 24-hour format
     } else if (period === 'AM' && hours === 12) {
         hours = 0; // 12:00 AM is 00:00 in military time
     }
 
     // Format the hours and minutes to ensure leading zeros
     const formattedHours = hours.toString().padStart(2, '0');
     const formattedMinutes = minutes.toString().padStart(2, '0');
 
     // Return the military time as HH:MM
     return `${formattedHours}:${formattedMinutes}`;
}

export const convertToDDMMMYYYY = (isoDateString) => {
    const date = new Date(isoDateString);  // Create a Date object from the ISO string

    const day = date.getUTCDate();  // Get the day (1-31)
    const month = date.getUTCMonth();  // Get the month (0-11)
    const year = date.getUTCFullYear();  // Get the year

    // Array of month abbreviations (1-based index)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format the date as "DD-MMM-YYYY"
    const formattedDate = `${day.toString().padStart(2, '0')}-${monthNames[month]}-${year}`;

    return formattedDate;  // Return the formatted date
}