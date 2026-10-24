// //notificationlisting

// let notificationList = document.getElementById("notificationList");
// let notificationKey = "notifications_" + loggedInUser.email;
// let notifications = JSON.parse(localStorage.getItem(notificationKey));

// if (notifications == null) {
//     notifications = [];
// }

// function showNotification(message){
//     notifications.unshift(message);
//     localStorage.setItem(notificationKey,JSON.stringify(notifications));
//     displayNotification();
// }

// function displayNotification() {
//     notificationList.innerHTML = "";

//     if (notifications.length == 0) {
//         notificationList.innerText = "No notifications yet.";
//         return;
//     }

//     notifications.forEach(function(message) {
//         let notification = document.createElement("p");
//         notification.innerText = message;
//         notificationList.appendChild(notification);
//     });
// }

// displayNotification();

//profile

let profileForm = document.getElementById("profileForm");

let nameInput = document.getElementById("name");
let emailInput = document.getElementById("email");

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

//displaying details if logged in 
    if (loggedInUser) {
        nameInput.value = loggedInUser.name;
        emailInput.value = loggedInUser.email;
    }

profileForm.addEventListener("submit",function(event){
    event.preventDefault();

    let newName = document.getElementById("name").value;
    let newEmail = document.getElementById("email").value;

    if (newName === "" || newEmail === "") {
        alert("Please fill in all fields.");
        return;
    }
   
    let oldEmail = loggedInUser.email;
    let users = JSON.parse(localStorage.getItem("users"));
        if (users === null) {
            users = [];
        }

//checking the new email is not an registered email of another user
    for (let i = 0; i < users.length; i++) {
        if (users[i].email != oldEmail && users[i].email == newEmail) {
            alert("This email is already registered.");
            return;
        }   
    }

    if (newName == loggedInUser.name && newEmail == loggedInUser.email) {
    return;
    }
    
    if(oldEmail != newEmail){
        let oldProducts = localStorage.getItem("products_"+oldEmail);
        if(oldProducts != null){
            localStorage.setItem("products_" + newEmail, oldProducts);
            localStorage.removeItem("products_" + oldEmail);
        }
    }

    loggedInUser.name= newName;
    loggedInUser.email = newEmail;
    localStorage.setItem("loggedInUser",JSON.stringify(loggedInUser));

   
    for(let i =0;i<users.length;i++){
        if(users[i].email == oldEmail){
            users[i].name = newName;
            users[i].email = newEmail;

        }
    }
    
    localStorage.setItem("users",JSON.stringify(users));
    
    alert("Profile updated successfully!")
})

//threshold
let thresholds = JSON.parse(localStorage.getItem("thresholds"));
if (thresholds === null) {
    thresholds = {
        "Smartphones": 25,
        "Laptops": 25,
        "Tablets": 25,
        "Accessories": 25,
    };
    localStorage.setItem("thresholds", JSON.stringify(thresholds));
}


let inventoryForm = document.getElementById("inventoryForm");
let thresholdInput = document.getElementById("threshold");
let categoryInput = document.getElementById("cats");

//profile
let profileBtn = document.getElementById("profileBtn");
let profileDropdown = document.getElementById("profileDropdown");

let profileName = document.getElementById("profileName");
let profileEmail = document.getElementById("profileEmail");
let profileLogout = document.getElementById("profileLogout");

function updateProfile() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    profileName.innerHTML = loggedInUser.name;
    profileEmail.innerHTML = loggedInUser.email;
}

updateProfile();

//open
profileBtn.addEventListener("click", function(event) {
    event.stopPropagation();

    updateProfile();

    profileDropdown.classList.toggle("hidden");
});

//close
document.addEventListener("click", function(event) {
    if (!profileDropdown.contains(event.target) &&
        !profileBtn.contains(event.target)) {
        profileDropdown.classList.add("hidden");
    }
});

profileLogout.addEventListener("click", function() {
    let answer = confirm("Are you sure sure you want to log out?");
    if (answer) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "sign_in.html";
    }
});