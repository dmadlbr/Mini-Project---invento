
export {};

interface User {
    name: string;
    email: string;
}

interface NotificationItem {
    message: string;
    read: boolean;
}

type Thresholds = {
    [category: string]: number;
};

// Profile

let profileForm = document.getElementById("profileForm") as HTMLFormElement;

let nameInput = document.getElementById("name") as HTMLInputElement;
let emailInput = document.getElementById("email") as HTMLInputElement;

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null") as User | null;

if (!loggedInUser) {
    window.location.href = "sign_in.html";
    throw new Error("User not logged in");
}

// Displaying details if logged in

if (loggedInUser) {
    nameInput.value = loggedInUser.name;
    emailInput.value = loggedInUser.email;
}

profileForm.addEventListener("submit", function(event: SubmitEvent) {
    event.preventDefault();

    let newName = (document.getElementById("name") as HTMLInputElement).value;
    let newEmail = (document.getElementById("email") as HTMLInputElement).value;

    if (newName === "" || newEmail === "") {
        alert("Please fill in all fields.");
        return;
    }

    let oldEmail = loggedInUser.email;

    let users = JSON.parse(localStorage.getItem("users") || "null") as User[] | null;

    if (users === null) {
        users = [];
    }

    // Checking the new email is not a registered email of another user

    for (let i = 0; i < users.length; i++) {
        if (users[i].email != oldEmail && users[i].email == newEmail) {
            alert("This email is already registered.");
            return;
        }
    }

    if (newName == loggedInUser.name && newEmail == loggedInUser.email) {
        return;
    }

    if (oldEmail != newEmail) {
        let oldProducts = localStorage.getItem("products_" + oldEmail);

        if (oldProducts != null) {
            localStorage.setItem("products_" + newEmail, oldProducts);
            localStorage.removeItem("products_" + oldEmail);
        }

        let oldNotifications = localStorage.getItem("notifications_" + oldEmail);

        if (oldNotifications != null) {
            localStorage.setItem("notifications_" + newEmail, oldNotifications);
            localStorage.removeItem("notifications_" + oldEmail);
        }

        let oldThresholds = localStorage.getItem("thresholds_" + oldEmail);

        if (oldThresholds != null) {
            localStorage.setItem("thresholds_" + newEmail, oldThresholds);
            localStorage.removeItem("thresholds_" + oldEmail);
        }
    }

    loggedInUser.name = newName;
    loggedInUser.email = newEmail;

    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

    for (let i = 0; i < users.length; i++) {
        if (users[i].email == oldEmail) {
            users[i].name = newName;
            users[i].email = newEmail;
        }
    }

    localStorage.setItem("users", JSON.stringify(users));

    showNotification("Your profile was updated successfully!");
    alert("Profile updated successfully!");
});


// Threshold

let thresholdKey = "thresholds_" + loggedInUser.email;

let savedThresholds = JSON.parse(
    localStorage.getItem(thresholdKey) || "null"
) as Thresholds | null;

let thresholds: Thresholds = savedThresholds ?? {
    "smartphones": 25,
    "laptops": 25,
    "tablets": 25,
    "mobile-accessories": 25
};

if (savedThresholds === null) {
    localStorage.setItem(thresholdKey, JSON.stringify(thresholds));
}

let inventoryForm = document.getElementById("inventoryForm") as HTMLFormElement;
let thresholdInput = document.getElementById("threshold") as HTMLInputElement;
let categoryInput = document.getElementById("cats") as HTMLSelectElement;


// Display threshold for selected category

function displayThreshold(): void {
    let category = categoryInput.value;

    if (category === "all") {
        thresholdInput.value = "";
    } else {
        thresholdInput.value = String(thresholds[category] ?? 25);
    }
}

displayThreshold();

// Change threshold when category changes

categoryInput.addEventListener("change", function() {
    displayThreshold();
});


// Save threshold

inventoryForm.addEventListener("submit", function(event: SubmitEvent) {
    event.preventDefault();

    let category = categoryInput.value;
    let newThreshold = Number(thresholdInput.value);

    if (
        thresholdInput.value === "" ||
        newThreshold < 1 ||
        !Number.isInteger(newThreshold)
    ) {
        alert("Please enter a valid whole number greater than 0.");
        return;
    }

    if (category === "all") {
        thresholds["smartphones"] = newThreshold;
        thresholds["laptops"] = newThreshold;
        thresholds["tablets"] = newThreshold;
        thresholds["mobile-accessories"] = newThreshold;
    } else {
        thresholds[category] = newThreshold;
    }

    localStorage.setItem(thresholdKey, JSON.stringify(thresholds));
    showNotification("Inventory preferences updated successfully!");
    alert("Inventory preferences saved successfully!");
});


// Profile

let profileBtn = document.getElementById("profileBtn") as HTMLElement;
let profileDropdown = document.getElementById("profileDropdown") as HTMLElement;

let profileName = document.getElementById("profileName") as HTMLElement;
let profileEmail = document.getElementById("profileEmail") as HTMLElement;
let profileLogout = document.getElementById("profileLogout") as HTMLElement;

function updateSettingsProfile(): void {
    let loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
    ) as User | null;

    if (!loggedInUser) return;

    profileName.textContent = loggedInUser.name;
    profileEmail.textContent = loggedInUser.email;
}

updateSettingsProfile();

// Open

profileBtn.addEventListener("click", function(event: MouseEvent) {
    event.stopPropagation();

    updateSettingsProfile();

    profileDropdown.classList.toggle("hidden");
});

// Close

document.addEventListener("click", function(event: MouseEvent) {
    if (
        !profileDropdown.contains(event.target as Node) &&
        !profileBtn.contains(event.target as Node)
    ) {
        profileDropdown.classList.add("hidden");
    }
});

// Logout

profileLogout.addEventListener("click", function() {
    let answer = confirm("Are you sure you want to log out?");

    if (answer) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "sign_in.html";
    }
});


// Notification

let notificationList = document.getElementById("notificationList") as HTMLElement;

let notificationKey = "notifications_" + loggedInUser.email;

let storedNotifications = JSON.parse(
    localStorage.getItem(notificationKey) || "[]"
) as (NotificationItem | string)[];

let notifications: NotificationItem[] = storedNotifications.map(function(item): NotificationItem {
    if (typeof item === "string") {
        return { message: item, read: true };
    }

    return item;
});

let showCount = 5;

let notificationBox = document.getElementById("notificationBox") as HTMLElement;
let unreadCount = document.getElementById("unreadCount") as HTMLElement;
let notificationSummary = document.getElementById("notificationSummary") as HTMLElement;


function saveNotifications(): void {
    localStorage.setItem(notificationKey, JSON.stringify(notifications));
}

function showNotification(message: string): void {
    let alreadyExists = false;

    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].message == message && notifications[i].read == false) {
            alreadyExists = true;
            break;
        }
    }

    if (alreadyExists) {
        return;
    }

    let isRead = false;

    notifications.unshift({ message: message, read: isRead });

    showCount = 5;
    saveNotifications();
    displayNotification();
}

function displayNotification(): void {
    notificationList.innerHTML = "";

    let unread: NotificationItem[] = [];

    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].read == false) {
            unread.push(notifications[i]);
        }
    }

    unreadCount.innerHTML = String(unread.length);

    if (unread.length == 0) {
        notificationSummary.innerHTML = "No unread notifications";
    } else {
        notificationSummary.innerText = unread.length + "notification(s)";
    }

    if (notifications.length == 0) {
        notificationList.innerText = "No notifications yet";
        return;
    }

    for (let i = 0; i < notifications.length && i < showCount; i++) {
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
            dot.innerHTML = `<i class="fa-solid fa-circle"></i>`;

            notification.appendChild(dot);
        }

        notification.addEventListener("click", function(event: MouseEvent) {
            event.stopPropagation();

            item.read = true;

            saveNotifications();
            displayNotification();
        });

        notificationList.appendChild(notification);
    }

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

document.getElementById("notifications")!.addEventListener("click", function(event: MouseEvent) {
    event.stopPropagation();
    notificationBox.classList.remove("hidden");
});

document.addEventListener("click", function(event: MouseEvent) {
    if (
        !notificationBox.contains(event.target as Node) &&
        !(document.getElementById("notifications") as HTMLElement).contains(event.target as Node)
    ) {
        notificationBox.classList.add("hidden");
    }
});

document.getElementById("markAllRead")!.addEventListener("click", function() {
    notifications.forEach(function(item: NotificationItem) {
        item.read = true;
    });

    saveNotifications();
    displayNotification();
});

saveNotifications();
displayNotification();


// Responsive

let menuBtn = document.getElementById("menuBtn") as HTMLElement;
let sidebar = document.getElementById("sidebar") as HTMLElement;
let overlay = document.getElementById("sidebarOverlay") as HTMLElement;

menuBtn.addEventListener("click", function() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
});

overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});
