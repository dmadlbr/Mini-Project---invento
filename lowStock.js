// Authentication
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
let thresholds = JSON.parse(localStorage.getItem("thresholds_" + loggedInUser.email) || "null");
if (thresholds === null) {
    thresholds = {
        "smartphones": 25,
        "laptops": 25,
        "tablets": 25,
        "mobile-accessories": 25
    };
    localStorage.setItem("thresholds_" + loggedInUser.email, JSON.stringify(thresholds));
}
let productKey = "products_" + loggedInUser.email;
let products = JSON.parse(localStorage.getItem(productKey) || "null");
if (products === null) {
    products = [];
}
// Low stock numbers
let lowStockNumber = document.getElementById("lowStockNumber_low");
lowStockNumber.style.color = "rgb(253,186,116)";
let criticalPdtsNumber = document.getElementById("criticalPdtsNumber_low");
criticalPdtsNumber.style.color = "rgb(138,69,39)";
let outStockNumber = document.getElementById("outStockNumber_low");
outStockNumber.style.color = "rgb(233,91,91)";
function updateLowStock() {
    let lowStockPdts = products.filter(function (pro) {
        let threshold = thresholds[pro.category] ?? 25;
        return pro.stock > 0 && pro.stock < threshold;
    });
    let criticalPdts = products.filter(function (pro) {
        let threshold = thresholds[pro.category] ?? 25;
        return pro.stock > 0 && pro.stock <= Math.min(5, threshold - 1);
    });
    let outStockPdts = products.filter(function (pro) {
        return pro.stock == 0;
    });
    lowStockNumber.innerHTML = String(lowStockPdts.length);
    criticalPdtsNumber.innerHTML = String(criticalPdts.length);
    outStockNumber.innerHTML = String(outStockPdts.length);
}
updateLowStock();
// Table
let container = document.querySelector(".lowPdts");
let table = document.createElement("table");
let thead = document.createElement("thead");
let tbody = document.createElement("tbody");
let headerRow = document.createElement("tr");
let product = document.createElement("th");
product.innerHTML = "Product";
let price = document.createElement("th");
price.innerHTML = "Price";
let stock = document.createElement("th");
stock.innerHTML = " Current Stock";
let status = document.createElement("th");
status.innerHTML = "Status";
let units = document.createElement("th");
units.innerHTML = "Units Needed";
let time = document.createElement("th");
time.innerHTML = "Last Restocked";
let action = document.createElement("th");
action.innerHTML = "Actions";
headerRow.appendChild(product);
headerRow.appendChild(price);
headerRow.appendChild(stock);
headerRow.appendChild(status);
headerRow.appendChild(units);
headerRow.appendChild(time);
headerRow.appendChild(action);
thead.appendChild(headerRow);
table.appendChild(thead);
table.appendChild(tbody);
container.appendChild(table);
let lowProducts = products.filter(function (pro) {
    let threshold = thresholds[pro.category] ?? 25;
    return pro.stock < threshold;
});
let filteredCount = lowProducts.length;
let productsPerPage = 3;
let currentPage = 1;
let totalPages = Math.ceil(lowProducts.length / productsPerPage);
let allCats = document.getElementById("cats");
let stocks = document.getElementById("stocks");
let sort = document.getElementById("sort");
let selectedCategory = "all";
let selectedStock = "";
let sortBy = "";
let search = document.getElementById("search");
let searchText = "";
function displayPdts() {
    tbody.innerHTML = "";
    // new..
    prev.style.display = "inline-block";
    next.style.display = "inline-block";
    pgNo.style.display = "flex";
    // new..
    // filtering
    let filteredProducts = products.filter(function (pro) {
        let threshold = thresholds[pro.category] ?? 25;
        return pro.stock < threshold;
    });
    if (selectedCategory != "all") {
        filteredProducts = filteredProducts.filter(function (pro) {
            return pro.category == selectedCategory;
        });
    }
    if (selectedStock != "") {
        filteredProducts = filteredProducts.filter(function (pro) {
            if (selectedStock == "critical") {
                let threshold = thresholds[pro.category] ?? 25;
                return pro.stock > 0 && pro.stock <= Math.min(5, threshold - 1);
            }
            else if (selectedStock == "low") {
                let threshold = thresholds[pro.category] ?? 25;
                return pro.stock > Math.min(5, threshold - 1) && pro.stock < threshold;
            }
            else if (selectedStock == "outOfStock") {
                return pro.stock == 0;
            }
            return false;
        });
    }
    if (sortBy != "") {
        if (sortBy == "lowToHigh") {
            filteredProducts = filteredProducts.sort(function (a, b) {
                return a.stock - b.stock;
            });
        }
        else if (sortBy == "highToLow") {
            filteredProducts = filteredProducts.sort(function (a, b) {
                return b.stock - a.stock;
            });
        }
        else if (sortBy == "needed") {
            filteredProducts.sort(function (a, b) {
                if (a.stock == 0 && b.stock != 0) {
                    return -1;
                }
                else if (b.stock == 0 && a.stock != 0) {
                    return 1;
                }
                else {
                    return a.stock - b.stock;
                }
            });
        }
    }
    // searching
    if (searchText != "") {
        filteredProducts = filteredProducts.filter(function (pro) {
            return pro.title.toLowerCase().includes(searchText.toLowerCase());
        });
    }
    filteredCount = filteredProducts.length;
    totalPages = Math.ceil(filteredCount / productsPerPage);
    // new..
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    // new..
    if (filteredProducts.length == 0) {
        prev.style.display = "none";
        next.style.display = "none";
        pgNo.style.display = "none";
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-15 px-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(203,239,203)] mb-4">
                    <i class="fa-solid fa-clipboard-check text-2xl text-green-800"></i>
                </div>

                <h4 class="font-semibold text-[rgb(28,78,73)] text-base">
                    Nothing to worry about!
                </h4>

                <p class="text-sm text-gray-500 mt-2 ">
                    All products have healthy stock levels. We'll show alerts here when stock runs low.
                </p>
            </div>
        `;
        cell.colSpan = 7;
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }
    let start = (currentPage - 1) * productsPerPage;
    let end = start + productsPerPage;
    let paginatedProducts = filteredProducts.slice(start, end);
    for (let i = 0; i < paginatedProducts.length; i++) {
        let pro = paginatedProducts[i];
        let row = document.createElement("tr");
        let productData = document.createElement("td");
        productData.innerHTML = pro.title;
        productData.classList.add("title");
        productData.style.fontSize = "16px";
        productData.style.color = "rgb(35, 81, 64)";
        productData.style.paddingLeft = "20px";
        let productPrice = document.createElement("td");
        productPrice.innerHTML = "$" + pro.price;
        productPrice.style.fontSize = "16px";
        productPrice.classList.add("pdtPrice");
        productPrice.style.textAlign = "center";
        productPrice.style.color = "rgb(197, 150, 69)";
        let productStock = document.createElement("td");
        productStock.innerHTML = pro.stock + " Units";
        productStock.style.fontSize = "16px";
        productStock.style.textAlign = "center";
        productStock.style.fontWeight = "bold";
        let threshold = thresholds[pro.category] ?? 25;
        if (pro.stock == 0) {
            productStock.style.color = "rgb(233,91,91)";
        }
        else if (pro.stock <= Math.min(5, threshold - 1)) {
            productStock.style.color = "rgb(138,69,39)";
        }
        else {
            productStock.style.color = "rgb(253,186,116)";
        }
        let statusData = document.createElement("td");
        statusData.style.textAlign = "center";
        let statusLabel = document.createElement("span");
        if (pro.stock == 0) {
            statusLabel.innerHTML = "Out of Stock";
            statusLabel.classList.add("outofstock");
        }
        else if (pro.stock <= Math.min(5, threshold - 1)) {
            statusLabel.innerHTML = "Critical";
            statusLabel.classList.add("critical");
        }
        else {
            statusLabel.innerHTML = "Low Stock";
            statusLabel.classList.add("lowstock");
        }
        statusData.appendChild(statusLabel);
        let unitsData = document.createElement("td");
        unitsData.innerHTML = String(threshold - pro.stock);
        unitsData.style.fontSize = "16px";
        unitsData.style.textAlign = "center";
        unitsData.style.fontWeight = "bold";
        if (pro.stock == 0) {
            unitsData.style.color = "rgb(233,91,91)";
        }
        else if (pro.stock <= Math.min(5, threshold - 1)) {
            unitsData.style.color = "rgb(138,69,39)";
        }
        else {
            unitsData.style.color = "rgb(253,186,116)";
        }
        let timeData = document.createElement("td");
        timeData.innerHTML = pro.lastRestocked || "Not recorded";
        timeData.style.fontSize = "16px";
        timeData.style.textAlign = "center";
        if (pro.lastRestocked) {
            timeData.style.color = "rgb(13, 116, 110)";
        }
        else {
            timeData.style.color = "rgb(107, 114, 128)";
        }
        let actionData = document.createElement("td");
        let restockBtn = document.createElement("button");
        restockBtn.innerHTML = `<i class="fa-solid fa-plus "></i> Restock`;
        restockBtn.style.color = "white";
        restockBtn.style.backgroundColor = "rgb(35,81,64)";
        restockBtn.style.padding = "8px";
        restockBtn.style.width = "100px";
        restockBtn.style.borderRadius = "10px";
        actionData.appendChild(restockBtn);
        actionData.style.fontSize = "16px";
        restockBtn.addEventListener("click", function () {
            restockProduct(pro);
        });
        row.appendChild(productData);
        row.appendChild(productPrice);
        row.appendChild(productStock);
        row.appendChild(statusData);
        row.appendChild(unitsData);
        row.appendChild(timeData);
        row.appendChild(actionData);
        tbody.appendChild(row);
    }
}
// Restock button
function restockProduct(pro) {
    let heading = document.createElement("h2");
    heading.innerHTML = "Restock Your Product";
    heading.classList.add("updateHeading");
    let formBox = document.createElement("div");
    formBox.classList.add("editBox");
    let form = document.createElement("form");
    form.classList.add("editForm");
    let item = document.createElement("div");
    item.classList.add("item");
    let title = document.createElement("p");
    title.innerHTML = pro.title;
    let id = document.createElement("p");
    id.innerHTML = "INV" + pro.id;
    item.appendChild(title);
    item.appendChild(id);
    let currentStock = document.createElement("p");
    currentStock.innerHTML = "Current Stock: " + pro.stock + " Units";
    // Quantity stepper
    let quantityBox = document.createElement("div");
    quantityBox.classList.add("quantityBox");
    let minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.innerHTML = "−";
    minusBtn.classList.add("quantityBtn");
    let quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = "1";
    quantity.step = "1";
    quantity.value = "1";
    quantity.classList.add("quantityNumber");
    let plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.innerHTML = "+";
    plusBtn.classList.add("quantityBtn");
    quantityBox.appendChild(minusBtn);
    quantityBox.appendChild(quantity);
    quantityBox.appendChild(plusBtn);
    let amount = Number(quantity.value);
    let newStock = document.createElement("p");
    newStock.innerHTML = "New Stock: " + (pro.stock + amount) + " Units";
    function updateQuantity() {
        amount = Number(quantity.value);
        newStock.innerHTML = "New Stock: " + (pro.stock + amount) + " Units";
    }
    minusBtn.addEventListener("click", function () {
        let current = Number(quantity.value) || 1;
        if (current > 1) {
            quantity.value = String(current - 1);
            updateQuantity();
        }
    });
    plusBtn.addEventListener("click", function () {
        let current = Number(quantity.value) || 0;
        quantity.value = String(current + 1);
        updateQuantity();
    });
    quantity.addEventListener("input", updateQuantity);
    minusBtn.addEventListener("click", updateQuantity);
    plusBtn.addEventListener("click", updateQuantity);
    let button = document.createElement("button");
    button.type = "submit";
    button.innerHTML = "Restock Product";
    let cancel = document.createElement("button");
    cancel.type = "button";
    cancel.innerHTML = "Cancel";
    cancel.classList.add("closeBtn");
    cancel.addEventListener("click", function () {
        formBox.remove();
    });
    form.appendChild(heading);
    form.appendChild(item);
    form.appendChild(currentStock);
    form.appendChild(quantityBox);
    form.appendChild(newStock);
    form.appendChild(button);
    form.appendChild(cancel);
    formBox.appendChild(form);
    document.body.appendChild(formBox);
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        amount = Number(quantity.value);
        if (!Number.isInteger(amount) || amount < 1)
            return;
        pro.stock += amount;
        pro.lastRestocked = new Date().toLocaleString("en-IN");
        localStorage.setItem(productKey, JSON.stringify(products));
        showNotification(pro.title + " restocked successfully. Added " + amount + " units.");
        formBox.remove();
        updateLowStock();
        displayPdts();
        updatePagination();
    });
}
// Pagination
let prev = document.getElementById("prev");
let next = document.getElementById("next");
let pgNo = document.getElementById("pgNo");
function updatePagination() {
    totalPages = Math.ceil(filteredCount / productsPerPage);
    // No results
    if (totalPages == 0) {
        prev.style.display = "none";
        next.style.display = "none";
        pgNo.style.display = "none";
        return;
    }
    prev.style.display = "inline-block";
    next.style.display = "inline-block";
    pgNo.style.display = "inline-block";
    pgNo.innerHTML = currentPage + " / " + totalPages;
    // Previous button
    prev.disabled = currentPage == 1;
    // Next button
    next.disabled = currentPage == totalPages;
}
prev.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        displayPdts();
        updatePagination();
    }
});
next.addEventListener("click", function () {
    if (currentPage < totalPages) {
        currentPage++;
        displayPdts();
        updatePagination();
    }
});
currentPage = 1;
// Searching
search.addEventListener("input", function () {
    searchText = search.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});
// Filtering
allCats.addEventListener("change", function () {
    selectedCategory = allCats.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});
stocks.addEventListener("change", function () {
    selectedStock = stocks.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});
sort.addEventListener("change", function () {
    sortBy = sort.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});
displayPdts();
updatePagination();
// Profile
let profileBtn = document.getElementById("profileBtn");
let profileDropdown = document.getElementById("profileDropdown");
let profileName = document.getElementById("profileName");
let profileEmail = document.getElementById("profileEmail");
let profileLogout = document.getElementById("profileLogout");
function updateProfile() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    profileName.innerHTML = loggedInUser.name;
    profileEmail.innerHTML = loggedInUser.email;
}
updateProfile();
// Open
profileBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    updateProfile();
    profileDropdown.classList.toggle("hidden");
});
// Close
document.addEventListener("click", function (event) {
    let target = event.target;
    if (!profileDropdown.contains(target) &&
        !profileBtn.contains(target)) {
        profileDropdown.classList.add("hidden");
    }
});
profileLogout.addEventListener("click", function () {
    let answer = confirm("Are you sure sure you want to log out?");
    if (answer) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "sign_in.html";
    }
});
// Notification
let notificationList = document.getElementById("notificationList");
let notificationKey = "notifications_" + loggedInUser.email;
// Convert old string notifications into NotificationItem objects
let savedNotifications = JSON.parse(localStorage.getItem(notificationKey) || "[]");
let notifications = [];
for (let i = 0; i < savedNotifications.length; i++) {
    if (typeof savedNotifications[i] == "string") {
        notifications.push({
            message: savedNotifications[i],
            read: true
        });
    }
    else {
        notifications.push(savedNotifications[i]);
    }
}
let showCount = 5;
let notificationBox = document.getElementById("notificationBox");
let unreadCount = document.getElementById("unreadCount");
let notificationSummary = document.getElementById("notificationSummary");
function saveNotifications() {
    localStorage.setItem(notificationKey, JSON.stringify(notifications));
}
function showNotification(message) {
    let alreadyExists = false;
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].message == message &&
            notifications[i].read == false) {
            alreadyExists = true;
            break;
        }
    }
    if (alreadyExists) {
        return;
    }
    let isRead = false;
    notifications.unshift({
        message: message,
        read: isRead
    });
    showCount = 5;
    saveNotifications();
    displayNotification();
}
function displayNotification() {
    notificationList.innerHTML = "";
    let unread = [];
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].read == false) {
            unread.push(notifications[i]);
        }
    }
    unreadCount.innerHTML = String(unread.length);
    if (unread.length == 0) {
        notificationSummary.innerHTML = "No unread notifications";
    }
    else {
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
        }
        else {
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
        notification.addEventListener("click", function (event) {
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
        loadMore.addEventListener("click", function (event) {
            event.stopPropagation();
            showCount += 5;
            displayNotification();
        });
        notificationList.appendChild(loadMore);
    }
}
let notificationsButton = document.getElementById("notifications");
let markAllRead = document.getElementById("markAllRead");
notificationsButton.addEventListener("click", function (event) {
    event.stopPropagation();
    notificationBox.classList.remove("hidden");
});
document.addEventListener("click", function (event) {
    let target = event.target;
    if (!notificationBox.contains(target) &&
        !notificationsButton.contains(target)) {
        notificationBox.classList.add("hidden");
    }
});
markAllRead.addEventListener("click", function () {
    notifications.forEach(function (item) {
        item.read = true;
    });
    saveNotifications();
    displayNotification();
});
saveNotifications();
displayNotification();
// Hamburger menu
let menuBtn = document.getElementById("menuBtn");
let sidebar = document.getElementById("sidebar");
let overlay = document.getElementById("sidebarOverlay");
menuBtn.addEventListener("click", function () {
    sidebar.classList.add("open");
    overlay.classList.add("active");
});
overlay.addEventListener("click", function () {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});
// export {};
