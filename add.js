let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let productKey = "products_" + loggedInUser.email;

let products = JSON.parse(localStorage.getItem(productKey));
if (products == null) {
    products = [];
}

let form = document.getElementById("form");
let name = document.getElementById("apiTitle");
let brand = document.getElementById("apiBrand");
let cats = document.getElementById("apiCats");
let price = document.getElementById("apiPrice");
let stock = document.getElementById("stock");


let notificationList = document.getElementById("notificationList");
let notificationKey = "notifications_" + loggedInUser.email;
let notifications = JSON.parse(localStorage.getItem(notificationKey));
if (notifications == null) {
    notifications = [];
}

function showNotification(message){
    notifications.unshift(message);
    localStorage.setItem(notificationKey,JSON.stringify(notifications));
    displayNotification();
}

function displayNotification(message){ 
    notificationList.innerHTML = "";
    if(notifications.length == 0){
        notificationList.innerText = "No notifications yet."
        return;
    }
    notifications.forEach(function(message) {
    let notification = document.createElement("p");
    notification.innerText = message;
    notificationList.appendChild(notification);
    })
}
displayNotification();

//api products
let productSuggestions = document.getElementById("productSuggestions");
let apiProducts = [];
let productImage = "";

let apiTitle = document.getElementById("apiTitle");
let apiBrand = document.getElementById("apiBrand");
let apiCats = document.getElementById("apiCats");
let apiPrice = document.getElementById("apiPrice");

async function apiProductsFetching() {
    const response = await  fetch("https://dummyjson.com/products?limit=0");
    const res = await response.json();

    apiProducts = res.products.filter(function(pro){
        return ["smartphones",
                "laptops",
                "tablets",
                "mobile-accessories"
            ].includes(pro.category);
    
    })
    
}
apiProductsFetching();

apiTitle.addEventListener("input",function(){
    let searchText = apiTitle.value.trim().toLowerCase();
    let apiMatchingProducts = apiProducts.filter(function(pro){
    return pro.title.toLowerCase().includes(searchText);
    })

    productSuggestions.innerHTML = "";
    if (searchText === "") {
        productSuggestions.classList.add("hidden");
        return;
    }
    
    for(let i=0;i<apiMatchingProducts.length;i++){
        let pro = apiMatchingProducts[i];

        let option = document.createElement("button");
        option.type = "button";
        option.className = "flex items-center gap-3 w-full text-left border border-[rgb(210,225,211)]  p-3 hover:bg-gray-100";

        let image = document.createElement("img");
        image.src = pro.images[0];
        image.className = "w-12 h-12 object-contain rounded";

        let title = document.createElement("span");
        title.innerHTML = pro.title;

        option.appendChild(image);
        option.appendChild(title);

        option.onclick = function() {
            apiTitle.value = pro.title;
            apiBrand.value = pro.brand;
            apiCats.value = pro.category;
            apiPrice.value = pro.price;
            productImage = pro.images?.[0] || pro.thumbnail || "";
            productSuggestions.classList.add("hidden");
        };

        productSuggestions.appendChild(option)
    }

    if(apiMatchingProducts.length>0){
        productSuggestions.classList.remove("hidden")
    }else{
        productSuggestions.classList.add("hidden")
    }
})

form.addEventListener("submit",function(event){
    event.preventDefault();

    let pdtName = name.value;
    let pdtBrand = brand.value;
    let pdtCat = cats.value;
    let pdtPrice = Number(price.value);
    let pdtStock = Number(stock.value);

    let newProduct = {
        id : Math.floor(100 + Math.random() * 900),
        title : pdtName,
        brand : pdtBrand,
        category : pdtCat,
        price : pdtPrice,
        stock : pdtStock,
        images: [productImage]
        
    }

    products.unshift(newProduct);
    localStorage.setItem(productKey, JSON.stringify(products));
    showNotification(newProduct.title + " added successfully");
    alert("Product added succesfully!");
    form.reset();
    productImage = "";
    window.location.href = "product.html";

})

let bell = document.getElementById("notifications");
let box = document.getElementById("notificationBox");

bell.addEventListener("click", function() {
    box.classList.remove("hidden");
});

box.addEventListener("mouseleave", function() {
    box.classList.add("hidden");
});


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