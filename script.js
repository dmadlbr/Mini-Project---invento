const sign_in = document.getElementById("sign_in");
sign_in.addEventListener("click",function(){
    location.href = "sign_in.html";
})

const pass = document.getElementById("password");
const cPass = document.getElementById("confirmPassword");
const form = document.getElementById("form");
form.addEventListener("submit",function(event){
if(pass.value != cPass.value){
    event.preventDefault();
    alert("Passwords do not Match!")
}
   
if(pass.value.length < 8){
    event.preventDefault();
    alert("Minimum 8 Characters required")
}
    alert("Account Created Successfully")
})

//notification
function addNotification(message){

    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if(loggedInUser == null){
        return;
    }

    let notificationKey = "notifications_" + loggedInUser.email;

    let notifications = JSON.parse(localStorage.getItem(notificationKey));

    if(notifications == null){
        notifications = [];
    }

    let notification = {
        message: message,
        time: new Date().toLocaleString(),
        read: false
    };

    notifications.unshift(notification);

    localStorage.setItem(notificationKey, JSON.stringify(notifications));
}
