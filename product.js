// For auth
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
let productKey = "products_" + loggedInUser.email;
let products = JSON.parse(localStorage.getItem(productKey) || "null");
if (products == null) {
    products = [];
}
let thresholds = JSON.parse(localStorage.getItem("thresholds_" + loggedInUser.email) || "null");
if (thresholds === null) {
    thresholds = {
        smartphones: 25,
        laptops: 25,
        tablets: 25,
        "mobile-accessories": 25
    };
    localStorage.setItem("thresholds_" + loggedInUser.email, JSON.stringify(thresholds));
}

// Notification
let notificationList = document.getElementById("notificationList");
let notificationKey = "notifications_" + loggedInUser.email;
let notifications = JSON.parse(localStorage.getItem(notificationKey) || "[]");
let showCount = 5;
let notificationBox = document.getElementById("notificationBox");
let unreadCount = document.getElementById("unreadCount");
let notificationSummary = document.getElementById("notificationSummary");
// Convert old notifications
for (let i = 0; i < notifications.length; i++) {
    if (typeof notifications[i] === "string") {
        notifications[i] = {
            message: notifications[i],
            read: true
        };
    }
}
let updatedNotifications = notifications;
// Save notifications
function saveNotifications() {
    localStorage.setItem(notificationKey, JSON.stringify(updatedNotifications));
}
// Add a notification
function showNotification(message) {
    updatedNotifications.unshift({
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
    for (let i = 0; i < updatedNotifications.length; i++) {
        if (updatedNotifications[i].read === false) {
            unread.push(updatedNotifications[i]);
        }
    }
    unreadCount.innerText = String(unread.length);
    if (unread.length === 0) {
        notificationSummary.innerText = "No unread notifications";
    }
    else {
        notificationSummary.innerText =
            unread.length + " unread notification(s)";
    }
    if (updatedNotifications.length === 0) {
        notificationList.innerText = "No notifications yet.";
        return;
    }
    for (let i = 0; i < showCount && i < updatedNotifications.length; i++) {
        let item = updatedNotifications[i];
        let notification = document.createElement("div");
        notification.classList.add("notification-item");
        if (item.read === false) {
            notification.classList.add("unread");
        }
        else {
            notification.classList.add("read");
        }
        let message = document.createElement("p");
        message.innerText = item.message || "Notification";
        notification.appendChild(message);
        if (item.read === false) {
            let dot = document.createElement("span");
            dot.classList.add("notification-dot");
            dot.innerHTML =  `<i class="fa-solid fa-circle"></i>`;
            notification.appendChild(dot);
        }
        // Mark one notification as read
        notification.addEventListener("click", function (event) {
            event.stopPropagation();
            item.read = true;
            saveNotifications();
            displayNotification();
        });
        notificationList.appendChild(notification);
    }
    // Load More button
    if (showCount < updatedNotifications.length) {
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
// Open notification
document.getElementById("notifications")
    .addEventListener("click", function (event) {
    event.stopPropagation();
    notificationBox.classList.remove("hidden");
});
// Close notification when clicking anywhere else
document.addEventListener("click", function (event) {
    let notificationButton = document.getElementById("notifications");
    if (!notificationBox.contains(event.target) &&
        !notificationButton.contains(event.target)) {
        notificationBox.classList.add("hidden");
    }
});
// Mark all notifications as read
document.getElementById("markAllRead")
    .addEventListener("click", function () {
    updatedNotifications.forEach(function (item) {
        item.read = true;
    });
    saveNotifications();
    displayNotification();
});
// Save and display existing notifications
saveNotifications();
displayNotification();
// All and Unread filters
// document.querySelectorAll(".notification-filters button").forEach(function(button) {
//     button.addEventListener("click", function() {
//         currentFilter = button.dataset.filter;
//         showCount = 5;
//
//         document.querySelectorAll(".notification-filters button").forEach(function(btn) {
//             btn.classList.remove("active");
//         });
//
//         button.classList.add("active");
//         displayNotification();
//     });
// });

// Products table
let container = document.querySelector(".allPdts");
let table = document.createElement("table");
let thead = document.createElement("thead");
let tbody = document.createElement("tbody");
let headerRow = document.createElement("tr");
let productHead = document.createElement("th");
productHead.innerHTML = "Product";
let brand = document.createElement("th");
brand.innerHTML = "Brand";
let price = document.createElement("th");
price.innerHTML = "Price";
let category = document.createElement("th");
category.innerHTML = "Category";
let stock = document.createElement("th");
stock.innerHTML = "Stock";
let status = document.createElement("th");
status.innerHTML = "Status";
let action = document.createElement("th");
action.innerHTML = "Actions";
headerRow.appendChild(productHead);
headerRow.appendChild(brand);
headerRow.appendChild(price);
headerRow.appendChild(category);
headerRow.appendChild(stock);
headerRow.appendChild(status);
headerRow.appendChild(action);
thead.appendChild(headerRow);
table.appendChild(thead);
table.appendChild(tbody);
container.appendChild(table);
let page = 1;
let productsPerPge = 4;
let lastPage = 1;
const prev = document.getElementById("prev");
const pageNo = document.getElementById("pgNo");
pageNo.classList.add("pageNo");
const next = document.getElementById("next");
let search = document.getElementById("search");
let searchText = "";
let allCats = document.getElementById("cats");
let stocks = document.getElementById("stocks");
let selectedCategory = "all";
let selectedStock = "";
// Get products
async function getProducts() {
    try {
        let filteredProducts = products;
        // Category filter
        if (selectedCategory !== "all") {
            filteredProducts = filteredProducts.filter(function (pro) {
                return pro.category === selectedCategory;
            });
        }
        // Stock filter
        if (selectedStock !== "") {
            filteredProducts = filteredProducts.filter(function (pro) {
                let threshold = thresholds[pro.category] ?? 25;
                if (selectedStock === "stock") {
                    return pro.stock >= threshold;
                }
                else if (selectedStock === "outOfStock") {
                    return pro.stock === 0;
                }
                else if (selectedStock === "low") {
                    return pro.stock > 0 && pro.stock < threshold;
                }
                return true;
            });
        }
        // Search filter
        if (searchText !== "") {
            filteredProducts = filteredProducts.filter(function (pro) {
                return pro.title.toLowerCase().includes(searchText.toLowerCase());
            });
        }
        tbody.innerHTML = "";
        // Empty products
        if (products.length === 0) {
            prev.style.display = "none";
            next.style.display = "none";
            pageNo.style.display = "none";
            let row = document.createElement("tr");
            let cell = document.createElement("td");
            cell.innerHTML = `
                <a href="add.html">
                    <div class="flex flex-col items-center justify-center py-8 px-4">
                        <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(203,239,203)] mb-3">
                            <i class="fa-solid fa-box-open text-2xl text-[rgb(35,81,64)]"></i>
                        </div>

                        <h4 class="font-semibold text-[rgb(35,81,64)] text-base">
                            Nothing here yet?
                        </h4>

                        <p class="text-sm text-gray-500 mt-2">
                            Your products will appear here once you add them.
                        </p>
                    </div>
                </a>
            `;
            cell.colSpan = 7;
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        // No matching products
        if (filteredProducts.length === 0) {
            prev.style.display = "inline-block";
            next.style.display = "inline-block";
            pageNo.style.display = "inline-block";
            let row = document.createElement("tr");
            let cell = document.createElement("td");
            cell.innerHTML = "Product not found";
            cell.colSpan = 7;
            cell.style.fontWeight = "bold";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            cell.style.color = "rgb(107,114,128)";
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        // Pagination
        lastPage = Math.ceil(filteredProducts.length / productsPerPge);
        if (page > lastPage) {
            page = lastPage;
        }
        let start = (page - 1) * productsPerPge;
        let end = start + productsPerPge;
        let pageProducts = filteredProducts.slice(start, end);
        tbody.innerHTML = "";
        // Display products
        for (let i = 0; i < pageProducts.length; i++) {
            let pro = pageProducts[i];
            let row = document.createElement("tr");
            let data = document.createElement("td");
            data.classList.add("data");
            data.addEventListener("click", function () {
                showProduct(pro);
            });
            let imageUrl = pro.images?.[0] || pro.image;
            if (imageUrl) {
                let img = document.createElement("img");
                img.src = imageUrl;
                img.classList.add("pdtImg");
                data.appendChild(img);
            }
            let key = document.createElement("span");
            key.classList.add("key");
            let title = document.createElement("span");
            title.classList.add("title");
            title.innerHTML = pro.title;
            let pId = document.createElement("span");
            pId.innerHTML = "INV00" + pro.id;
            pId.classList.add("pId");
            key.appendChild(title);
            key.appendChild(pId);
            data.appendChild(key);
            row.appendChild(data);
            let brand = document.createElement("td");
            brand.innerHTML = pro.brand;
            brand.classList.add("pdtBrand");
            row.appendChild(brand);
            let price = document.createElement("td");
            price.innerHTML = "$" + pro.price;
            price.classList.add("pdtPrice");
            row.appendChild(price);
            let cat = document.createElement("td");
            cat.innerHTML = pro.category;
            cat.classList.add("pdtCat");
            row.appendChild(cat);
            let stock = document.createElement("td");
            stock.innerHTML = pro.stock + " Units";
            stock.classList.add("stock");
            let status = document.createElement("td");
            let statusText = document.createElement("span");
            let threshold = thresholds[pro.category] ?? 25;
            if (pro.stock >= threshold) {
                statusText.innerHTML =
                    `<i class="fa-solid fa-circle circleIn"></i>` + "In-Stock";
                statusText.classList.add("statusIn");
            }
            else if (pro.stock === 0) {
                statusText.innerHTML =
                    `<i class="fa-solid fa-circle circleOut"></i>` + "Out-Of-Stock";
                statusText.classList.add("statusOut");
            }
            else {
                statusText.innerHTML =
                    `<i class="fa-solid fa-circle circleLow"></i>` + "Low-Stock";
                statusText.classList.add("statusLow");
            }
            if (pro.stock >= threshold) {
                stock.classList.add("in");
            }
            else if (pro.stock === 0) {
                stock.classList.add("out");
            }
            else {
                stock.classList.add("low");
            }
            status.appendChild(statusText);
            row.appendChild(stock);
            row.appendChild(status);
            let actions = document.createElement("td");
            actions.innerHTML = `
                <i class="fa-solid fa-pen editIcon" title="Edit product"></i>
                <i class="fa-solid fa-box-open stockIcon" title="Update stock"></i>
                <i class="fa-solid fa-trash-can deltIcon" title="Delete product"></i>
            `;
            row.appendChild(actions);
            let stockIcon = actions.querySelector(".stockIcon");
            stockIcon.addEventListener("click", function () {
                updateStock(pro, row, statusText);
            });
            let editIcon = actions.querySelector(".editIcon");
            editIcon.addEventListener("click", function () {
                editProduct(pro, row);
            });
            let deleteIcon = actions.querySelector(".deltIcon");
            deleteIcon.addEventListener("click", function () {
                deleteProduct(pro, row);
            });
            tbody.appendChild(row);
        }
        // Page number
        pageNo.innerHTML = String(page);
        // Previous button
        if (page === 1) {
            prev.classList.add("prev");
        }
        else {
            prev.classList.remove("prev");
        }
        // Next button
        if (page === lastPage) {
            next.classList.add("next");
        }
        else {
            next.classList.remove("next");
        }
    }
    catch (err) {
        console.log(err);
    }
}
// Product information
function showProduct(pro) {
    let pDetails = document.createElement("div");
    pDetails.classList.add("pDetails");
    let detailsBox = document.createElement("div");
    detailsBox.classList.add("detailsBox");
    // Product images
    let images = pro.images && pro.images.length > 0
        ? pro.images
        : pro.image
            ? [pro.image]
            : [];
    let imageIndex = 0;
    // Close button
    let close = document.createElement("button");
    close.classList.add("close");
    close.innerHTML = "&times;";
    // Left side: image gallery
    let galleryBox = document.createElement("div");
    galleryBox.classList.add("galleryBox");
    let mainImageBox = document.createElement("div");
    mainImageBox.classList.add("mainImageBox");
    let pImage = document.createElement("img");
    pImage.classList.add("mainProductImage");
    pImage.alt = pro.title;
    if (images.length > 0) {
        pImage.src = images[0];
    }
    else {
        pImage.alt = "No product image available";
    }
    mainImageBox.appendChild(pImage);
    // Thumbnail images
    let thumbnailBox = document.createElement("div");
    thumbnailBox.classList.add("thumbnailBox");
    function selectImage(index) {
        imageIndex = index;
        pImage.src = images[imageIndex];
        let thumbnails = thumbnailBox.querySelectorAll("img");
        thumbnails.forEach(function (thumbnail, i) {
            if (i === imageIndex) {
                thumbnail.classList.add("activeThumbnail");
            }
            else {
                thumbnail.classList.remove("activeThumbnail");
            }
        });
    }
    images.forEach(function (image, index) {
        let thumbnail = document.createElement("img");
        thumbnail.src = image;
        thumbnail.alt = pro.title + " image " + (index + 1);
        if (index === 0) {
            thumbnail.classList.add("activeThumbnail");
        }
        thumbnail.addEventListener("click", function () {
            selectImage(index);
        });
        thumbnailBox.appendChild(thumbnail);
    });
    galleryBox.appendChild(mainImageBox);
    galleryBox.appendChild(thumbnailBox);
    // Right side: product information
    let infoBox = document.createElement("div");
    infoBox.classList.add("productInfoBox");
    let smallTitle = document.createElement("p");
    smallTitle.classList.add("productInfoLabel");
    smallTitle.textContent = "PRODUCT INFORMATION";
    let pTitle = document.createElement("h2");
    pTitle.classList.add("pTitle");
    pTitle.textContent = pro.title;
    let proId = document.createElement("p");
    proId.classList.add("proId");
    proId.textContent = "INV00" + pro.id;
    let priceBox = document.createElement("div");
    priceBox.classList.add("infoItem");
    priceBox.innerHTML = `
        <i class="fa-solid fa-dollar-sign"></i>
        <span>Price</span>
        <strong>$${pro.price}</strong>
    `;
    let brandBox = document.createElement("div");
    brandBox.classList.add("infoItem");
    brandBox.innerHTML = `
        <i class="fa-solid fa-tag"></i>
        <span>Brand</span>
        <strong></strong>
    `;
    brandBox.querySelector("strong").textContent = pro.brand;
    let catBox = document.createElement("div");
    catBox.classList.add("infoItem");
    catBox.innerHTML = `
        <i class="fa-solid fa-layer-group"></i>
        <span>Category</span>
        <strong></strong>
    `;
    catBox.querySelector("strong").textContent = pro.category;
    let stockBox = document.createElement("div");
    stockBox.classList.add("infoItem");
    stockBox.innerHTML = `
        <i class="fa-solid fa-box-open"></i>
        <span>Quantity</span>
        <strong>${pro.stock} units</strong>
    `;
    // Stock status using category threshold
    let categoryThreshold = thresholds && thresholds[pro.category] != null
        ? Number(thresholds[pro.category])
        : 25;
    let statusBox = document.createElement("div");
    statusBox.classList.add("productStatus");
    if (Number(pro.stock) === 0) {
        statusBox.textContent = "Out of Stock";
        statusBox.classList.add("outStatus");
    }
    else if (Number(pro.stock) < categoryThreshold) {
        statusBox.textContent = "Low Stock";
        statusBox.classList.add("lowStatus");
    }
    else {
        statusBox.textContent = "In Stock";
        statusBox.classList.add("inStatus");
    }
    infoBox.appendChild(smallTitle);
    infoBox.appendChild(pTitle);
    infoBox.appendChild(proId);
    infoBox.appendChild(priceBox);
    infoBox.appendChild(brandBox);
    infoBox.appendChild(catBox);
    infoBox.appendChild(stockBox);
    infoBox.appendChild(statusBox);
    // Assemble popup
    detailsBox.appendChild(close);
    detailsBox.appendChild(galleryBox);
    detailsBox.appendChild(infoBox);
    pDetails.appendChild(detailsBox);
    document.body.appendChild(pDetails);
    // Close popup
    close.addEventListener("click", function () {
        pDetails.remove();
    });
    // Close when clicking the dark background
    pDetails.addEventListener("click", function (event) {
        if (event.target === pDetails) {
            pDetails.remove();
        }
    });
    // Close with Escape key
    function closeOnEscape(event) {
        if (event.key === "Escape") {
            pDetails.remove();
            document.removeEventListener("keydown", closeOnEscape);
        }
    }
    document.addEventListener("keydown", closeOnEscape);
}
// Update stock
function updateStock(pro, row, statusText) {
    let heading = document.createElement("h2");
    heading.innerHTML = "Update Your Stock";
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
    let action = document.createElement("select");
    let increase = document.createElement("option");
    increase.value = "increase";
    increase.innerHTML = "Increase Stock";
    let decrease = document.createElement("option");
    decrease.value = "decrease";
    decrease.innerHTML = "Decrease Stock";
    action.appendChild(increase);
    action.appendChild(decrease);
    let quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = "1";
    quantity.placeholder = "Enter quantity";
    quantity.required = true;
    let button = document.createElement("button");
    button.type = "submit";
    button.innerHTML = "Update Stock";
    let cancel = document.createElement("button");
    cancel.type = "button";
    cancel.innerHTML = "Cancel";
    cancel.classList.add("closeBtn");
    cancel.addEventListener("click", function () {
        formBox.remove();
    });
    form.appendChild(heading);
    form.appendChild(item);
    form.appendChild(action);
    form.appendChild(quantity);
    form.appendChild(button);
    form.appendChild(cancel);
    formBox.appendChild(form);
    document.body.appendChild(formBox);
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        let threshold = thresholds[pro.category] ?? 25;
        let amount = Number(quantity.value);
        if (amount <= 0 || !Number.isFinite(amount)) {
            alert("Please enter a valid quantity");
            return;
        }
        if (action.value === "increase") {
            pro.stock += amount;
        }
        else {
            if (amount > pro.stock) {
                alert("Stock cannot be negative");
                return;
            }
            pro.stock -= amount;
        }
        let stockText = row.querySelector(".stock");
        stockText.innerHTML = pro.stock + " Units";
        if (pro.stock >= threshold) {
            stockText.className = "stock in";
            statusText.innerHTML =
                `<i class="fa-solid fa-circle circleIn"></i>` + "In-Stock";
            statusText.className = "statusIn";
        }
        else if (pro.stock === 0) {
            stockText.className = "stock out";
            statusText.innerHTML =
                `<i class="fa-solid fa-circle circleOut"></i>` + "Out-Of-Stock";
            statusText.className = "statusOut";
        }
        else {
            stockText.className = "stock low";
            statusText.innerHTML =
                `<i class="fa-solid fa-circle circleLow"></i>` + "Low-Stock";
            statusText.className = "statusLow";
        }
        localStorage.setItem(productKey, JSON.stringify(products));
        showNotification(pro.title + " stock updated!");
        if (pro.stock === 0) {
            showNotification(pro.title + " is out of stock!");
        }
        else if (pro.stock < threshold) {
            showNotification(pro.title + " is running low on stock!");
        }
        formBox.remove();
    });
}
// Edit product details
function editProduct(pro, row) {
    let formBox = document.createElement("div");
    formBox.classList.add("editBox");
    let form = document.createElement("form");
    form.classList.add("editForm");
    let heading = document.createElement("h2");
    heading.innerHTML = "Edit Product";
    heading.classList.add("updateHeading");
    let titleIp = document.createElement("input");
    titleIp.type = "text";
    titleIp.placeholder = "Enter Product Name";
    titleIp.value = pro.title;
    let brandIp = document.createElement("input");
    brandIp.type = "text";
    brandIp.placeholder = "Enter Product Brand";
    brandIp.value = pro.brand;
    let priceIp = document.createElement("input");
    priceIp.type = "number";
    priceIp.step = "0.01";
    priceIp.placeholder = "Enter Product Price";
    priceIp.value = String(pro.price);
    let categoryIp = document.createElement("select");
    let smartphones = document.createElement("option");
    smartphones.value = "smartphones";
    smartphones.innerHTML = "Smartphones";
    let laptops = document.createElement("option");
    laptops.value = "laptops";
    laptops.innerHTML = "Laptops";
    let tablets = document.createElement("option");
    tablets.value = "tablets";
    tablets.innerHTML = "Tablets";
    let accessories = document.createElement("option");
    accessories.value = "mobile-accessories";
    accessories.innerHTML = "Accessories";
    categoryIp.appendChild(smartphones);
    categoryIp.appendChild(laptops);
    categoryIp.appendChild(tablets);
    categoryIp.appendChild(accessories);
    categoryIp.value = pro.category;
    titleIp.required = true;
    brandIp.required = true;
    priceIp.required = true;
    let saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.innerHTML = "Save Changes";
    let closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.innerHTML = "Cancel";
    closeBtn.classList.add("closeBtn");
    closeBtn.addEventListener("click", function () {
        formBox.remove();
    });
    form.appendChild(heading);
    form.appendChild(titleIp);
    form.appendChild(brandIp);
    form.appendChild(priceIp);
    form.appendChild(categoryIp);
    form.appendChild(saveBtn);
    form.appendChild(closeBtn);
    formBox.appendChild(form);
    document.body.appendChild(formBox);
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (titleIp.value === pro.title &&
            brandIp.value === pro.brand &&
            Number(priceIp.value) === pro.price &&
            categoryIp.value === pro.category) {
            alert("No changes made");
            return;
        }
        pro.title = titleIp.value;
        pro.brand = brandIp.value;
        pro.price = Number(priceIp.value);
        pro.category = categoryIp.value;
        // Save the edit
        localStorage.setItem(productKey, JSON.stringify(products));
        showNotification(pro.title + " updated successfully!");
        formBox.remove();
        getProducts();
    });
}
// Delete product
function deleteProduct(pro, row) {
    let confirmDelt = confirm("Are you sure you want to delete this product?");
    if (confirmDelt) {
        row.remove();
        let index = products.indexOf(pro);
        products.splice(index, 1);
        localStorage.setItem(productKey, JSON.stringify(products));
        showNotification(pro.title + " deleted succesfully!");
        getProducts();
    }
}
// Initial display
getProducts();
// Next button
next.addEventListener("click", function () {
    if (page < lastPage) {
        page++;
        getProducts();
    }
});
// Previous button
prev.addEventListener("click", function () {
    if (page > 1) {
        page--;
        getProducts();
    }
});
// Category filter
allCats.addEventListener("change", function () {
    selectedCategory = allCats.value;
    page = 1;
    getProducts();
});
// Stock filter
stocks.addEventListener("change", function () {
    selectedStock = stocks.value;
    page = 1;
    getProducts();
});
// Search products
search.addEventListener("input", function () {
    searchText = search.value;
    page = 1;
    getProducts();
});
// Profile
let profileBtn = document.getElementById("profileBtn");
let profileDropdown = document.getElementById("profileDropdown");
let profileName = document.getElementById("profileName");
let profileEmail = document.getElementById("profileEmail");
let profileLogout = document.getElementById("profileLogout");
function updateProductsProfile() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    profileName.innerHTML = loggedInUser.name;
    profileEmail.innerHTML = loggedInUser.email;
}
updateProductsProfile();
// Open profile dropdown
profileBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    updateProductsProfile();
    profileDropdown.classList.toggle("hidden");
});
// Close profile dropdown
document.addEventListener("click", function (event) {
    if (!profileDropdown.contains(event.target) &&
        !profileBtn.contains(event.target)) {
        profileDropdown.classList.add("hidden");
    }
});
// Logout
profileLogout.addEventListener("click", function () {
    let answer = confirm("Are you sure sure you want to log out?");
    if (answer) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "sign_in.html";
    }
});
// Hamburger menu
let menuBtn = document.getElementById("menuBtn");
let sidebar = document.getElementById("sidebar");
let sidebarOverlay = document.getElementById("sidebarOverlay");
menuBtn.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
});
sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
});
// export {};
