export {};

type LoggedInUser = { name: string; email: string };

 type ApiProduct = { title: string; brand: string; category: string; price: number; images: string[]; thumbnail?: string };
 type InventoryProduct = { id: number; title: string; brand: string; category: string; price: number; stock: number; images: string[] };
 type NotificationItem = { message: string; read: boolean };



let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")!) as  LoggedInUser;
let productKey = "products_" + loggedInUser.email;

let products = JSON.parse(localStorage.getItem(productKey ) || "null")as InventoryProduct[] | null;
if (products == null) {
    products = [];
}

let form = document.getElementById("form")  as HTMLFormElement;
let name = document.getElementById("apiTitle") as HTMLInputElement;
let brand = document.getElementById("apiBrand") as HTMLInputElement;
let cats = document.getElementById("apiCats") as HTMLInputElement;
let price = document.getElementById("apiPrice") as HTMLInputElement;
let stock = document.getElementById("stock") as HTMLInputElement;

//api products
let productSuggestions = document.getElementById("productSuggestions")as HTMLDivElement;
let apiProducts : ApiProduct[] = [];
let productImage: string  = "";

let apiTitle = document.getElementById("apiTitle")as HTMLInputElement;
let apiBrand = document.getElementById("apiBrand")as HTMLInputElement;
let apiCats = document.getElementById("apiCats")as HTMLInputElement;
let apiPrice = document.getElementById("apiPrice")as HTMLInputElement;

async function apiProductsFetching() {
    const response = await  fetch("https://dummyjson.com/products?limit=0");
    const res = await response.json()as { products: ApiProduct[] };

    apiProducts = res.products.filter(function(pro){
        return ["smartphones",
                "laptops",
                "tablets",
                "mobile-accessories"
            ].includes(pro.category);
    
    })
    
}
await apiProductsFetching();

apiTitle.addEventListener("input",function(_event: Event){
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
            apiPrice.value = pro.price as unknown as string;
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
//notification 

 // Notification
let notificationList = document.getElementById("notificationList")  as HTMLDivElement;
let notificationKey = "notifications_" + loggedInUser.email;
let notifications: NotificationItem[] | any[] = JSON.parse(localStorage.getItem(notificationKey) || "[]");

let showCount = 5;
let notificationBox = document.getElementById("notificationBox")as HTMLDivElement;
let unreadCount = document.getElementById("unreadCount")as HTMLElement;
let notificationSummary = document.getElementById("notificationSummary")as HTMLElement;

// Convert old notifications
for (let i = 0; i < notifications.length; i++) {
    if (typeof notifications[i] == "string") {
        notifications[i] = {
            message: notifications[i],
            read: true
        };
    }
}

// Save notifications
function saveNotifications() {
    localStorage.setItem(notificationKey, JSON.stringify(notifications));
}

// Add a notification
function showNotification(message: string) {
    notifications.unshift({
        message: message,
        read: false
    });

    showCount = 5;
    saveNotifications();
    displayNotification();
}

// Display notifications
function displayNotification() {
    notificationList.innerHTML = "";

    let unread = [];

    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].read == false) {
            unread.push(notifications[i]);
        }
    }

    unreadCount.innerText = unread.length as unknown as string;

    if (unread.length == 0) {
        notificationSummary.innerText = "No unread notifications";
    } else {
        notificationSummary.innerText =
            unread.length + " unread notification(s)";
    }

    if (notifications.length == 0) {
        notificationList.innerText = "No notifications yet.";
        return;
    }

    for (let i = 0; i < showCount && i < notifications.length; i++) {
        let item = notifications[i];

        let notification = document.createElement("div");
        notification.classList.add("notification-item");

        if (item.read == false) {
            notification.classList.add("unread");
        } else {
            notification.classList.add("read");
        }

        let message = document.createElement("p");
        message.innerText = item.message || "Notification";
        notification.appendChild(message);

        if (item.read == false) {
            let dot = document.createElement("span");
            dot.classList.add("notification-dot");
            dot.innerText = "●";
            notification.appendChild(dot);
        }

        // Mark one notification as read
        notification.addEventListener("click", function(event: MouseEvent) {
            event.stopPropagation();
            item.read = true;
            saveNotifications();
            displayNotification();
        });

        notificationList.appendChild(notification);
    }

    // Load More button
    if (showCount < notifications.length) {
        let loadMore = document.createElement("button");
        loadMore.classList.add("loadMore");
        loadMore.innerText = "Load More";

        loadMore.addEventListener("click", function(event: MouseEvent) {
            event.stopPropagation();
            showCount += 5;
            displayNotification();
        });

        notificationList.appendChild(loadMore);
    }
}

// Open notification dropdown
document.getElementById("notifications")!.addEventListener("click", function(event) {
    event.stopPropagation();
    notificationBox.classList.remove("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event: MouseEvent) {
    if (
        !notificationBox.contains(event.target as Node) &&
        !(document.getElementById("notifications") as HTMLElement).contains(event.target as Node)
    ) {
        notificationBox.classList.add("hidden");
    }
});

// Mark all notifications as read
document.getElementById("markAllRead")!.addEventListener("click", function() {
    notifications.forEach(function(item) {
        item.read = true;
    });

    saveNotifications();
    displayNotification();
});

// Display existing notifications
saveNotifications();
displayNotification();

form.addEventListener("submit",function(event: SubmitEvent){
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

    products!.unshift(newProduct);
    localStorage.setItem(productKey, JSON.stringify(products));

    showNotification(newProduct.title + " added successfully");
    alert("Product added succesfully!");
    if (newProduct.stock == 0) {
    showNotification(newProduct.title + " is out of stock!");
    } else if (newProduct.stock < 25) {
            showNotification(newProduct.title + " is running low on stock!");
    }

    form.reset();
    productImage = "";
    window.location.href = "product.html";


})

// let bell = document.getElementById("notifications");
// let box = document.getElementById("notificationBox");

// bell.addEventListener("click", function() {
//     box.classList.remove("hidden");
// });

// box.addEventListener("mouseleave", function() {
//     box.classList.add("hidden");
// });


//profile
let profileBtn = document.getElementById("profileBtn") as HTMLButtonElement;
let profileDropdown = document.getElementById("profileDropdown") as HTMLDivElement;;

let profileName = document.getElementById("profileName")as HTMLElement;
let profileEmail = document.getElementById("profileEmail")as HTMLElement;
let profileLogout = document.getElementById("profileLogout")as HTMLButtonElement;
function updateProfile() {
    type LoggedInUser = { name: string; email: string };

    type ApiProduct = { title: string; brand: string; category: string; price: number; images: string[]; thumbnail?: string };
    type InventoryProduct = { id: number; title: string; brand: string; category: string; price: number; stock: number; images: string[] };
    type NotificationItem = { message: string; read: boolean };


    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")!) as LoggedInUser;

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
document.addEventListener("click", function(event: MouseEvent) {
    if (!profileDropdown.contains(event.target as Node) &&
        !profileBtn.contains(event.target as Node)) {
        profileDropdown.classList.add("hidden");
    }
});

profileLogout.addEventListener("click", function() {
    let answer = confirm("Are you sure you want to log out?");
    if (answer) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "sign_in.html";
    }
});


// responsive sidebar

let menuBtn = document.getElementById("menuBtn")as HTMLButtonElement;
let sidebar = document.getElementById("sidebar")as HTMLElement;
let overlay = document.getElementById("sidebarOverlay")as HTMLElement;

// open sidebar
menuBtn.addEventListener("click", function() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
});

// close sidebar
overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});



//notification


// //
// let notificationList = document.getElementById("notificationList");
// let notificationKey = "notifications_" + loggedInUser.email;
// let notifications = JSON.parse(localStorage.getItem(notificationKey));
// if (notifications == null) {
//     notifications = [];
// }

// function showNotification(message){
//     notifications.unshift({
//     message: message,
//     read: false
// });
//     localStorage.setItem(notificationKey,JSON.stringify(notifications));
//     displayNotification();
// }

// function displayNotification(message){ 
//     notificationList.innerHTML = "";
//     if(notifications.length == 0){
//         notificationList.innerText = "No notifications yet."
//         return;
//     }
//     notifications.forEach(function(message) {
//     let notification = document.createElement("p");
//     notification.innerText = message;
//     notificationList.appendChild(notification);
//     })
// }
// displayNotification();
