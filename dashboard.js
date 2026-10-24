
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let productKey = "products_" + loggedInUser.email;

let products = JSON.parse(localStorage.getItem(productKey));

if (products == null) {
    products = [];
}

let totalProductNumber = document.getElementById("totalProductNumber");
totalProductNumber.innerHTML = products.length;
totalProductNumber.style.color = "rgb(50, 128, 99)"

let totStock = 0;
for(let i=0;i<products.length;i++){
    totStock += products[i].stock;
}
let totalStockNumber = document.getElementById("totalStockNumber");
totalStockNumber.innerHTML = totStock;
totalStockNumber.style.color = "rgb(187, 143, 99)";

let lowStock = 0;
for(let i=0;i<products.length;i++){
    if(products[i].stock > 0 && products[i].stock<25){
        lowStock++;
    }
}
let lowStockNumber = document.getElementById("lowStockNumber");
lowStockNumber.innerHTML = lowStock;
lowStockNumber.style.color = "rgb(237, 188, 103)"

let outStock = 0;
for(let i=0;i<products.length;i++){
    if(products[i].stock == 0){
        outStock++;
    }
}
let outStockNumber = document.getElementById("outStockNumber");
outStockNumber.innerHTML = outStock;
outStockNumber.style.color = "rgb(238, 84, 84)"

//low stock box

let attentionPdts = [];

for(let i=0;i<products.length;i++){
    if(products[i].stock == 0){
        attentionPdts.push(products[i])
    }
}

for(let i=0;i<products.length;i++){
    if(products[i].stock > 0 && products[i].stock<25){
        attentionPdts.push(products[i]);
    }
}

let currentPage = 1;
let productsPerPage = 3;
let totalPages = Math.ceil( attentionPdts.length / productsPerPage);


let lowList = document.getElementById("lowList");
let lowPage = document.querySelector(".lowPage");
let lowPrev = document.getElementById("lowPrev");
let lowNext = document.getElementById("lowNext");
let lowPgNo = document.getElementById("lowPgNo");

function displayLowProducts(){
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
    } else{
        lowPage.style.display = "flex";
        lowPage.style.justifyContent = "flex-end";
        lowPage.style.alignItems = "center";
    
    let start = (currentPage - 1) * productsPerPage;
    let end = start + productsPerPage;
    for (let i = start; i < end && i < attentionPdts.length; i++) {
        let pro = attentionPdts[i];
        let item = document.createElement("div");
        item.className = "flex items-center justify-between gap-3 p-4 mb-3 rounded-xl bg-[rgb(248,249,244)] border border-[rgb(238,236,229)] hover:border-[rgb(197,150,69)] transition";
        item.innerHTML = `
    <div>
        <h4 class="font-semibold text-[rgb(35,81,64)] text-lg">${pro.title}</h4>
        <p class="text-xs text-gray-500 mt-1">Stock remaining: ${pro.stock}</p>
    </div>

    <span class="text-xs font-semibold px-3 py-1 rounded-full ${pro.stock == 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}">
        ${pro.stock == 0 ? 'Out of Stock' : 'Low Stock'}
    </span>
`;
          lowList.appendChild(item);
    }
     lowPgNo.innerText = currentPage;

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
lowNext.addEventListener("click", function() {
    if (currentPage < totalPages) {
        currentPage++;
        displayLowProducts();
    }
});

lowPrev.addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        displayLowProducts();
    }
});

displayLowProducts();
    
//filterbtn

let filterButton = document.getElementById("filterButton");
let showLowStock = false;

// Store all products that need attention
let allAttentionPdts = [...attentionPdts];

// Store only low-stock products
let lowStockPdts = products.filter(function(pro) {
    return pro.stock > 0 && pro.stock < 25;
});

filterButton.addEventListener("click", function() {
    showLowStock = !showLowStock;

    if (showLowStock) {
        attentionPdts = [...lowStockPdts];
        filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> Show All Alerts';
    } else {
        attentionPdts = [...allAttentionPdts];
        filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> Filter Low Stock';
    }
    currentPage = 1;
    totalPages = Math.ceil(attentionPdts.length / productsPerPage);

    displayLowProducts();
    
});

//recently added products

let recentList = document.getElementById("recentList");

function displayRecentProducts() {
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
    }else{
        let recentProducts = products.slice(0, 3);
        for (let i = 0; i < recentProducts.length; i++) {
            let pdt = recentProducts[i];
            recentList.innerHTML += `
                <div class="flex items-center gap-3 p-3 mb-3 mt-5 rounded-xl bg-[rgb(248,249,244)] border border-[rgb(238,236,229)] hover:border-[rgb(197,150,69)] transition">

                    <img src="${pdt.images[0]}" 
                        class="w-14 h-14 object-contain rounded-lg bg-white">

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
                        <p class="font-semibold text-[rgb(35,81,64)]">
                            $ ${pdt.price}
                        </p>
                    </div>

                </div>
            `;
        }

    }
}
displayRecentProducts()














// //4 boxes
// const products = fetch("https://dummyjson.com/products");

// products.then((res) => {
//     return res.json();
// }).then((res) => {
   
//     let totalProductNumber = document.getElementById("totalProductNumber");
//     totalProductNumber.innerHTML = res.products.length;

//     let totalStock = 0;
//     for(let i=0;i<res.products.length;i++) {
//         totalStock += res.products[i].stock;

//     }

//     let totalStockNumber = document.getElementById("totalStockNumber");
//     totalStockNumber.innerHTML = totalStock;

//     let lowStock =0;
//     for(let i =0;i<res.products.length;i++){
//         if((res.products[i].stock < 25) && (res.products[i].stock > 0)){
//             lowStock++;
//         }
//     }

//     let lowStockNumber = document.getElementById("lowStockNumber")
//     lowStockNumber.innerHTML = lowStock;

//     let outStock = 0;
//     for(let i =0;i<res.products.length;i++){
//         if(res.products[i].stock == 0){
//             outStock ++;
//         }

//     }

//     let outStockNumber = document.getElementById("outStockNumber")
//     outStockNumber.innerHTML = outStock;

//     // recently added and low stock

//     let recentList = document.getElementById("recentList");
//     let recentProducts = [];
//     for(let i=0;i<res.products.length;i++){
//         let pro = res.products[i];
//         if(
//             pro.category == "smartphones" ||
//             pro.category == "laptops" ||
//             pro.category == "tablets" ||
//             pro.category == "mobile-accessories"
//         ){
//             recentProducts.push(pro);
//         }

//     }

//     // table

    

    


// }).catch((err) => {
//     console.log(err);
// });


// // totalProducts.addEventListener("click",function(){
// //     location.href = "product.html";
// // })

