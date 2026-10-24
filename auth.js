//sign up
let signupForm = document.getElementById("signupForm");
if(signupForm){
    signupForm.addEventListener("submit",function(event){

        event.preventDefault();    
        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirmPassword").value;

        if(password != confirmPassword){
            alert("Password do not match!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users"));
        if(users == null){
            users = [];
        }

        for(let i=0;i<users.length;i++){
            if(users[i].email == email){
                alert("Email already exists!");
                return;
            }
        }

        let user = {
            name : name,
            email : email,
            password : password
        };
        users.push(user);

        localStorage.setItem("users", JSON.stringify(users));
        alert("Account created succesffully!");
        window.location.href = "sign_in.html";

});

}

//sign in
let signinForm = document.getElementById("signinForm");
if(signinForm){
    signinForm.addEventListener("submit",function(event){

        event.preventDefault();
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        let users = JSON.parse(localStorage.getItem("users"));

        if(users == null){
            alert("No account found. Please sign up first");
            return;
        }
         
        let user;
        for(let i=0;i<users.length;i++){
            if(users[i].email == email){
                user = users[i];
                break;
            }
        }
        if(user == undefined){
            alert("No account found. Please sign up first");
            return;
        }

      if(password == user.password){

            localStorage.setItem("loggedInUser", JSON.stringify(user));
            alert("Login successful!");
            window.location.href = "dashboard.html";
        }else{
            alert("Invalid password!");
        }
    });
}

//logout
let logout = document.getElementById("logout");

    if(logout){
        logout.addEventListener("click",function(event){
            if(confirm("Are you sure you want to log out?")){
                   localStorage.removeItem("loggedInUser");
                   window.location.href = "sign_in.html";
            }
         
        })
    }