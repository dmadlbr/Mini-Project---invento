let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let productKey = "products_" + loggedInUser.email;
let products = JSON.parse(localStorage.getItem(productKey)) || [];

let lowStockNumber = document.getElementById("lowStockNumber_low");
lowStockNumber.style.color = "rgb(253,186,116)";


let criticalPdtsNumber = document.getElementById("criticalPdtsNumber_low");
criticalPdtsNumber.style.color="rgb(138,69,39)";

let outStockNumber = document.getElementById("outStockNumber_low");
outStockNumber.style.color = "rgb(233,91,91)";

function updateLowStock() {
    let lowStockPdts = products.filter(function(pro){
        return pro.stock > 0  && pro.stock<25
    })

    let criticalPdts = products.filter(function(pro){
        return pro.stock > 0 && pro.stock<=5
    })

    let outStockPdts = products.filter(function(pro){
        return pro.stock == 0;
    })

    lowStockNumber.innerHTML = lowStockPdts.length;
    criticalPdtsNumber.innerHTML = criticalPdts.length;
    outStockNumber.innerHTML = outStockPdts.length;
} 
updateLowStock();


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

let lowProducts = products.filter(function(pro) {
    return pro.stock < 25;
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

function displayPdts () {
    tbody.innerHTML = "";

// filtering
    let filteredProducts = products.filter(function(pro) {
        return pro.stock < 25;
    });

    if(selectedCategory != "all"){
        filteredProducts = filteredProducts.filter(function(pro){
            return pro.category == selectedCategory;
        })
    }

    if(selectedStock != ""){
        filteredProducts = filteredProducts.filter(function(pro){
              if(selectedStock == "critical"){
                return pro.stock > 0 && pro.stock <=5 
              }else if(selectedStock == "low"){
                return pro.stock> 5 && pro.stock < 25
              }else if(selectedStock == "outOfStock"){
                return pro.stock == 0;
              }
        })
      
    }

    if(sortBy != ""){
       
            if(sortBy == "lowToHigh"){
                filteredProducts = filteredProducts.sort(function(a,b){
                    return a.stock - b.stock;
                })

            }else if(sortBy == "highToLow"){
                filteredProducts=filteredProducts.sort(function(a,b){
                    return b.stock - a.stock;
                })
            }else if(sortBy == "needed"){
                 filteredProducts.sort(function(a, b) {
                    if (a.stock == 0 && b.stock != 0) {
                        return -1;
                    } else if (b.stock == 0 && a.stock != 0) {
                        return 1;
                    } else {
                        return a.stock - b.stock;
                    }
                 })
            }
             
    }
// searching

    if(searchText != ""){
        filteredProducts = filteredProducts.filter(function(pro){
            return pro.title.toLowerCase().includes(searchText.toLowerCase());
        })
    }

    if(filteredProducts.length == 0){
        filteredCount = filteredProducts.length;
        totalPages = Math.ceil(filteredCount / productsPerPage);

        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }
        let row = document.createElement("tr");
        let cell = document.createElement("td"); 

            
        cell.innerHTML = "Product not found";

        cell.colSpan = 7;
        cell.style.fontWeight = "bold";
        cell.style.textAlign = "center";
        cell.style.padding = "20px";
        cell.style.fontSize ="15px";
        cell.style.color = "rgb(107,114,128)";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;

    }

    let start = (currentPage - 1) * productsPerPage;
    let end = start + productsPerPage;

    let paginatedProducts = filteredProducts.slice(start, end);


    for(let i=0;i<paginatedProducts.length;i++){
        let pro = paginatedProducts[i];

        let row = document.createElement("tr");

        // let imageData = document.createElement("td");
        // let image = document.createElement("img");
        // image.src = pro.images[0];

        let productData = document.createElement("td");
        productData.innerHTML = pro.title;
        productData.classList.add("title");
        productData.style.fontSize = "16px";
        productData.style.paddingLeft = "30px";
     
        let productPrice = document.createElement("td");
        productPrice.innerHTML = "$" + pro.price;
        productPrice.style.fontSize = "16px";
        productPrice.classList.add("pdtPrice");
        productPrice.style.textAlign = "center";
       
        let productStock = document.createElement("td");
        productStock.innerHTML = pro.stock + " Units";
        productStock.style.fontSize = "16px";
        productStock.style.textAlign = "center";
        productStock.style.fontWeight ="bold";

        if(pro.stock == 0){
            productStock.style.color = "rgb(233,91,91)";
        }else if(pro.stock <= 5 && pro.stock > 0){
            productStock.style.color = "rgb(138,69,39)";
        }else if(pro.stock < 25 && pro.stock>5){
            productStock.style.color = "rgb(253,186,116)";
        }
        
        let statusData = document.createElement("td");
        statusData.style.textAlign = "center";
        let statusLabel = document.createElement("span");
           if(pro.stock == 0) {
                statusLabel.innerHTML = "Out of Stock";
                statusLabel.classList.add("outofstock");
            } else if (pro.stock <= 5) {
                statusLabel.innerHTML = "Critical";
                statusLabel.classList.add("critical");
            } else {
                statusLabel.innerHTML = "Low Stock";
                statusLabel.classList.add("lowstock");
            }
        statusData.appendChild(statusLabel);       
        
        let unitsData = document.createElement("td");
        unitsData.innerHTML = 25 - pro.stock;
        unitsData.style.fontSize = "16px";
        unitsData.style.textAlign = "center";
        unitsData.style.fontWeight = "bold";
            
        if ((25 - pro.stock) == 25) {
            unitsData.style.color = "rgb(233,91,91)";
        } else if ((25 - pro.stock) < 5) {
            unitsData.style.color = "rgb(253,186,116)";
        } else if ((25 - pro.stock) > 20) {
            unitsData.style.color = "rgb(138,69,39)";
        }

        let timeData = document.createElement("td");
        timeData.innerHTML = pro.lastRestocked || "Not recorded";
        timeData.style.fontSize = "16px"; 
        timeData.style.textAlign = "center";
     
        if(pro.lastRestocked){
            timeData.style.color = "rgb(13, 116, 110)";
        }else{
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
        restockBtn.addEventListener("click", function() {
            restockProduct(pro);
        });

        // imageData.appendChild(image);

        // row.appendChild(imageData);
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

//restock btn

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

        let quantity = document.createElement("span");
        quantity.innerHTML = "1";
        quantity.classList.add("quantityNumber");

        let plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.innerHTML = "+";
        plusBtn.classList.add("quantityBtn");

        let amount = 1;

        minusBtn.addEventListener("click", function() {
            if (amount > 1) {
                amount--;
                quantity.innerHTML = amount;
            }
        });

        plusBtn.addEventListener("click", function() {
            amount++;
            quantity.innerHTML = amount;
        });

        quantityBox.appendChild(minusBtn);
        quantityBox.appendChild(quantity);
        quantityBox.appendChild(plusBtn);

        let newStock = document.createElement("p");
        newStock.innerHTML = "New Stock: " + (pro.stock + amount) + " Units";

        function updateQuantity() {
            quantity.innerHTML = amount;
            newStock.innerHTML = "New Stock: " + (pro.stock + amount) + " Units";
        }

        minusBtn.addEventListener("click", updateQuantity);
        plusBtn.addEventListener("click", updateQuantity);

        let button = document.createElement("button");
        button.type = "submit";
        button.innerHTML = "Restock Product";

        let cancel = document.createElement("button");
        cancel.type = "button";
        cancel.innerHTML = "Cancel";
        cancel.classList.add("closeBtn");

        cancel.addEventListener("click", function() {
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

        form.addEventListener("submit", function(event) {
            event.preventDefault();

            pro.stock += amount;
            pro.lastRestocked = new Date().toLocaleString("en-IN");

            localStorage.setItem(productKey, JSON.stringify(products));

            // showNotification(pro.title + " restocked successfully!");

            formBox.remove();

            updateLowStock();
            displayPdts();
            updatePagination();
        });
    }


//

let prev = document.getElementById("prev");
let next = document.getElementById("next");
let pgNo = document.getElementById("pgNo");

function updatePagination() {
   totalPages = Math.ceil(filteredCount / productsPerPage);

    pgNo.innerHTML = currentPage;

    if (currentPage == 1) {
        prev.classList.add("prev");
    } else {
        prev.classList.remove("prev");
    }

    if (currentPage == totalPages || totalPages == 0) {
        next.classList.add("next");
    } else {
        next.classList.remove("next");
    }
}
prev.addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        displayPdts();
        updatePagination();
    }
});

next.addEventListener("click", function() {
    if (currentPage < totalPages) {
        currentPage++;
        displayPdts();
        updatePagination();
    }
});

currentPage = 1;

//searching
    search.addEventListener("input",function(){
        searchText=search.value;
        currentPage=1;
        displayPdts();
        updatePagination();
    })

//filtering 
allCats.addEventListener("change", function() {
    selectedCategory = allCats.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});

stocks.addEventListener("change", function() {
    selectedStock = stocks.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});

sort.addEventListener("change", function() {
    sortBy = sort.value;
    currentPage = 1;
    displayPdts();
    updatePagination();
});

displayPdts();
updatePagination();

//restock btn
restockBtn.addEventListener("click", function() {
    restockProduct(pro);
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