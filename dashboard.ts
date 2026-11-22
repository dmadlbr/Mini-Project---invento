export {};

interface User {
    name: string;
    email: string;
}

interface Product {
    id: number;
    title: string;
    brand: string;
    price: number;
    category: string;
    stock: number;
    images?: string[];
    image?: string;
}

interface Thresholds {
    [category: string]: number;
}

// Authentication

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null") as User | null;

if (!loggedInUser) {
    window.location.href = "sign_in.html";
    throw new Error("User not logged in");
}

let productKey = "products_" + loggedInUser.email;

// Products

let savedProducts = JSON.parse(localStorage.getItem(productKey) || "null") as Product[] | null;

let products: Product[] = savedProducts ?? [];

let savedThresholds = JSON.parse(localStorage.getItem("thresholds_" + loggedInUser.email) || "null") as Thresholds | null;

let thresholds: Thresholds = savedThresholds ?? {
    "smartphones": 25,
    "laptops": 25,
    "tablets": 25,
    "mobile-accessories": 25
};

if (savedThresholds === null)
     {
        localStorage.setItem("thresholds_" + loggedInUser.email, JSON.stringify(thresholds));
     }


// Total products

let totalProductNumber = document.getElementById("totalProductNumber") as HTMLElement;
totalProductNumber.innerHTML = String(products.length);
totalProductNumber.style.color = "rgb(50, 128, 99)";


// Total stock

let totStock = 0;
for (let i = 0; i < products.length; i++) {
    totStock += products[i].stock;
}

let totalStockNumber = document.getElementById("totalStockNumber") as HTMLElement;
totalStockNumber.innerHTML = String(totStock);
totalStockNumber.style.color = "rgb(187, 143, 99)";


// Low stock

let lowStock = 0;

for (let i = 0; i < products.length; i++) {
    let pro = products[i];
    let threshold = thresholds[pro.category] ?? 25;

    if (pro.stock > 0 && pro.stock < threshold) {
        lowStock++;
    }
}

let lowStockNumber = document.getElementById("lowStockNumber") as HTMLElement;
lowStockNumber.innerHTML = String(lowStock);
lowStockNumber.style.color = "rgb(237, 188, 103)";


// Out of stock

let outStock = 0;

for (let i = 0; i < products.length; i++) {
    if (products[i].stock == 0) {
        outStock++;
    }
}

let outStockNumber = document.getElementById("outStockNumber") as HTMLElement;
outStockNumber.innerHTML = String(outStock);
outStockNumber.style.color = "rgb(238, 84, 84)";


// Low stock box

let attentionPdts: Product[] = [];

for (let i = 0; i < products.length; i++) {
    if (products[i].stock == 0) {
        attentionPdts.push(products[i]);
    }
}

for (let i = 0; i < products.length; i++) {
    let pro = products[i];
    let threshold = thresholds[pro.category] ?? 25;

    if (pro.stock > 0 && pro.stock < threshold) {
        attentionPdts.push(pro);
    }
}

//Pagination
let currentPage = 1;
let productsPerPage = 3;
let totalPages = Math.ceil(attentionPdts.length / productsPerPage);

let lowList = document.getElementById("lowList") as HTMLElement;
let lowPage = document.querySelector(".lowPage") as HTMLElement;
let lowPrev = document.getElementById("lowPrev") as HTMLButtonElement;
let lowNext = document.getElementById("lowNext") as HTMLButtonElement;
let lowPgNo = document.getElementById("lowPgNo") as HTMLElement;


function displayLowProducts(): void {
    lowList.innerHTML = "";

    if (attentionPdts.length == 0) {
        lowList.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-15 px-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(203,239,203)] mb-4">
                    <i class="fa-solid fa-clipboard-check text-2xl text-green-800"></i>
                </div>

                <h4 class="font-semibold text-[rgb(28,78,73)] text-base">
                    You're all set!
                </h4>

                <p class="text-sm text-gray-500 mt-2 max-w-xs">
                    No products need attention right now. Low-stock and out-of-stock products will appear here.
                </p>
            </div>
        `;

        lowPage.style.display = "none";

    } else {
        lowPage.style.display = "flex";
        lowPage.style.justifyContent = "flex-end";
        lowPage.style.alignItems = "center";

// start and end index of prodcts for current pg
        let start = (currentPage - 1) * productsPerPage;
        let end = start + productsPerPage;

        for (let i = start; i < end && i < attentionPdts.length; i++) {
            let pro = attentionPdts[i];

            let item = document.createElement("div");

            item.className = "flex items-center justify-between gap-3 p-4 mb-3 rounded-xl bg-[rgb(248,249,244)] border border-[rgb(238,236,229)] hover:border-[rgb(197,150,69)] transition";

            item.innerHTML = `
                <div>
                    <h4 class="font-semibold text-[rgb(35,81,64)] ">${pro.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">Stock remaining: ${pro.stock}</p>
                </div>

                <span class="text-xs font-semibold px-3 py-1 rounded-full ${pro.stock == 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}">
                    ${pro.stock == 0 ? 'Out of Stock' : 'Low Stock'}
                </span>
            `;

            lowList.appendChild(item);
        }

        lowPgNo.innerText = String(currentPage);

        if (currentPage == 1) {
            lowPrev.disabled = true;
            lowPrev.classList.add("prev");
        } else {
            lowPrev.disabled = false;
            lowPrev.classList.remove("prev");
        }

        if (currentPage == totalPages || totalPages == 0) {
            lowNext.disabled = true;
            lowNext.classList.add("next");
        } else {
            lowNext.disabled = false;
            lowNext.classList.remove("next");
        }
    }
}


// Next page

lowNext.addEventListener("click", function() {
    if (currentPage < totalPages) {
        currentPage++;
        displayLowProducts();
    }
});


// Previous page

lowPrev.addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        displayLowProducts();
    }
});

displayLowProducts();


// Filter button

let filterButton = document.getElementById("filterButton") as HTMLButtonElement;

let showOutOfStock = false;

if (outStock == 0) {
    filterButton.disabled = true;
    filterButton.style.opacity = "0.5";
    filterButton.style.cursor = "not-allowed";
}


// Store all products that need attention

let allAttentionPdts: Product[] = [...attentionPdts];


// Store only out-of-stock products

let outOfStockPdts: Product[] = products.filter(function(pro: Product): boolean {
    return pro.stock == 0;
});


filterButton.addEventListener("click", function() {
    //toggle
    showOutOfStock = !showOutOfStock;

    if (showOutOfStock) {
        attentionPdts = [...outOfStockPdts];

        filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> Show All Alerts';

    } else {
        attentionPdts = [...allAttentionPdts];

        filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> Filter Out Of Stock';
    }

    currentPage = 1;
    totalPages = Math.ceil(attentionPdts.length / productsPerPage);

    displayLowProducts();
});


// Recently added products

let recentList = document.getElementById("recentList") as HTMLElement;

function displayRecentProducts(): void {
    recentList.innerHTML = "";

    if (products.length == 0) {
        recentList.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-25 px-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(203,239,203)] mb-4">
                    <i class="fa-solid fa-box-open text-2xl text-green-800"></i>
                </div>

                <h4 class="font-semibold text-[rgb(28,78,73)] text-base">
                    Your inventory starts here!
                </h4>

                <p class="text-sm text-gray-500 mt-2 max-w-xs">
                    No products added yet. Add your first product to see it here.
                </p>

                <a href="add.html" class="mt-5 px-5 py-2.5 rounded-lg bg-[rgb(35,81,64)] text-white text-sm font-medium hover:bg-[rgb(27,65,51)] transition">
                    <i class="fa-solid fa-plus mr-2"></i>
                    Add Product
                </a>
            </div>
        `;

    } else {
        let recentProducts = products.slice(0, 3);

        for (let i = 0; i < recentProducts.length; i++) {
            let pdt = recentProducts[i];
            let imageUrl = pdt.images?.[0] || pdt.image;

            recentList.innerHTML += `
                <div class="flex items-center gap-3 p-3 mb-3 mt-5 rounded-xl bg-[rgb(248,249,244)] border border-[rgb(238,236,229)] hover:border-[rgb(197,150,69)] transition">

                    ${imageUrl ? `<img src="${imageUrl}" class="w-14 h-14 object-contain rounded-lg bg-white">` : ''}
                    
                    <div>
                        <h4 class="font-semibold text-[rgb(28,78,73)]">
                            ${pdt.title}
                        </h4>

                        <p class="text-xs text-gray-500">
                            ID: INV00${pdt.id}
                        </p>

                        <p class="text-xs text-gray-500">
                            ${pdt.brand}
                        </p>
                    </div>

                    <div class="ml-auto text-right">
                        <p class="font-semibold text-[rgb(197,150,69)]">
                            $ ${pdt.price}
                        </p>
                    </div>

                </div>
            `;
        }
    }
}

displayRecentProducts();


// Responsive

let menuBtn = document.getElementById("menuBtn") as HTMLElement;
let sidebar = document.getElementById("sidebar") as HTMLElement;
let overlay = document.getElementById("sidebarOverlay") as HTMLElement;


menuBtn.addEventListener("click", function() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
});

overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});
