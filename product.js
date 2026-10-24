//for auth

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let productKey = "products_" + loggedInUser.email;

let products = JSON.parse(localStorage.getItem(productKey));
if (products == null) {
    products = [];
}
//notificationlisting

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

function displayNotification() {
    notificationList.innerHTML = "";

    if (notifications.length == 0) {
        notificationList.innerText = "No notifications yet.";
        return;
    }

    notifications.forEach(function(message) {
        let notification = document.createElement("p");
        notification.innerText = message;
        notificationList.appendChild(notification);
    });
}

displayNotification();

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
let lastPage;
const prev = document.getElementById("prev");
const pageNo = document.getElementById("pgNo");
pageNo.classList.add("pageNo")
const next = document.getElementById("next");

let search = document.getElementById("search");
let searchText = "";
let allCats = document.getElementById("cats");
let stocks = document.getElementById("stocks");
let selectedCategory = "all";
let selectedStock = "";
async function getProducts() {
    try{
    // if(products.length == 0){
    //     let smartphones = await fetch('https://dummyjson.com/products/category/smartphones');
    //     let sData = await smartphones.json();
    //     let laptops = await fetch('https://dummyjson.com/products/category/laptops');
    //     let lData = await laptops.json();
    //     let tablets = await fetch('https://dummyjson.com/products/category/tablets');
    //     let tData = await tablets.json();
    //     let accessories = await fetch('https://dummyjson.com/products/category/mobile-accessories');
    //     let aData = await accessories.json();


    //     products = [...sData.products,...lData.products,...tData.products,...aData.products];
    // }

    //cat filter
    let filteredProducts = products;
    if (selectedCategory != "all"){
        filteredProducts = filteredProducts.filter(function(pro){
            return pro.category == selectedCategory;
        });
    }
    //stock filter
    if(selectedStock != ""){
        filteredProducts = filteredProducts.filter(function(pro){
            if(selectedStock == "stock"){
                return pro.stock >= 25;
            }else if(selectedStock == "outOfStock"){
                return pro.stock == 0;
            }else if(selectedStock == "low"){
                return pro.stock > 0 && pro.stock<25;
            }
        });
    }
    //search filter
    if(searchText != ""){
        filteredProducts = filteredProducts.filter(function(pro){
            return pro.title.toLowerCase().includes(searchText.toLowerCase());
        });
    }
    tbody.innerHTML = "";
    if(products.length == 0){

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

if(filteredProducts.length == 0){

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
    //pagination
    lastPage = Math.ceil(filteredProducts.length / productsPerPge);
    let start = (page - 1)*productsPerPge;
    let end = start + productsPerPge;
    let pageProducts = filteredProducts.slice(start,end)
    tbody.innerHTML = ""; 
    
    // if(pageProducts.length == 0){
    //       let row = document.createElement("tr");
    //       let cell = document.createElement("td");
    //       cell.innerHTML = "Product not Found";
    //       cell.style.fontWeight = "bold";
    //       cell.colSpan = 7;
           
    //        row.appendChild(cell);
    //        tbody.appendChild(cell);

    //        return;
    // }

    //display products
    for(let i=0;i<pageProducts.length;i++){
        let pro = pageProducts[i];
        console.log(pageProducts);

        let row = document.createElement("tr");

        let data = document.createElement("td");
        data.classList.add("data");
        data.addEventListener("click", function(){
        showProduct(pro);
        });
        
        let img = document.createElement("img");
        img.src = pro.images[0];
        img.classList.add("pdtImg")
        data.appendChild(img);

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
        price.innerHTML =  "$" + pro.price;
        price.classList.add("pdtPrice");
        row.appendChild(price);

        let cat = document.createElement("td");
        cat.innerHTML = pro.category;
        cat.classList.add("pdtCat")
        row.appendChild(cat);

        let stock = document.createElement("td");
        stock.innerHTML = pro.stock + " Units";
        stock.classList.add("stock")
        
        let status = document.createElement("td");
        let statusText = document.createElement("span");
        if(pro.stock >= 25){
            statusText.innerHTML = `<i class="fa-solid fa-circle circleIn"></i>` +"In-Stock";
            statusText.classList.add("statusIn");
        }
        else if(pro.stock == 0){
            statusText.innerHTML = `<i class="fa-solid fa-circle circleOut"></i>` +"Out-Of-Stock";
            statusText.classList.add("statusOut");
        }else{
            statusText.innerHTML = `<i class="fa-solid fa-circle circleLow"></i>` + "Low-Stock";
            statusText.classList.add("statusLow");
        }

        if(pro.stock >= 25){
            stock.classList.add("in")
        }else if(pro.stock == 0){
            stock.classList.add("out");
        }else{
            stock.classList.add("low")
        }

        
        status.appendChild(statusText);
        row.appendChild(stock);


        row.appendChild(status);

        
        let actions = document.createElement("td");
        actions.innerHTML = 
        `<i class="fa-solid fa-pen editIcon" title="Edit product"></i> <i class="fa-solid fa-box-open stockIcon"title="Update stock"></i>
        <i class="fa-solid fa-trash-can deltIcon" title="Delete product"></i>`;
    
        row.appendChild(actions);
        let stockIcon = actions.querySelector(".stockIcon");
        stockIcon.addEventListener("click",function(){
            updateStock(pro,row,statusText);
        })

        let editIcon = actions.querySelector(".editIcon");
        editIcon.addEventListener("click",function(){
            editProduct(pro,row);
        })

        let deleteIcon = actions.querySelector(".deltIcon");
        deleteIcon.addEventListener("click", function(){
            deleteProduct(pro, row);
        });

        tbody.appendChild(row)
    }

    //pg no 
        pgNo.innerHTML = page;
    //prev btn
        if (page == 1) {
        prev.classList.add("prev");
    } else {
        prev.classList.remove("prev");
    }
    //next btn
      if(page == lastPage){
        next.classList.add("next");
      }else{
        next.classList.remove("next");
      }
    }
    catch(err){
        console.log(err);
        }

    }
    //product info
    function showProduct(pro){
    console.log(pro);

    let pDetails = document.createElement("div");
    pDetails.classList.add("pDetails");
    let detailsBox = document.createElement("div");
    detailsBox.classList.add("detailsBox");

    let pTitle = document.createElement("h2");
    pTitle.innerHTML = pro.title;
    pTitle.classList.add("pTitle");

    let imageIndex = 0;
    let imageBox = document.createElement("div");
    imageBox.classList.add("imageBox");
    let pImage = document.createElement("img");
    pImage.src = pro.images[imageIndex];
    let prevImage = document.createElement("button");
    prevImage.innerHTML = "<";
    prevImage.classList.add("prevNextImage");
    let nextImage = document.createElement("button");
    nextImage.innerHTML = ">";
    nextImage.classList.add("prevNextImage");
    function updateArrows() {
    if (imageIndex == 0) {
        prevImage.style.opacity = "0.3";
    } else {
        prevImage.style.opacity = "1";
    }

    if (imageIndex == pro.images.length - 1) {
        nextImage.style.opacity = "0.3";
    } else {
        nextImage.style.opacity = "1";
    }
}
    updateArrows();
    prevImage.addEventListener("click", function(){
    if(imageIndex > 0){
        imageIndex--;
        pImage.src = pro.images[imageIndex];
        updateArrows();
    }
    });

    nextImage.addEventListener("click", function(){
    if(imageIndex < pro.images.length - 1){
        imageIndex++;
        pImage.src = pro.images[imageIndex];
        updateArrows();
    }
    });
    
    let proBox = document.createElement("div");
    proBox.classList.add("proBox");

    let leftBox = document.createElement("div");
    let rightBox = document.createElement("div");

    let proId = document.createElement("p");
    proId.innerHTML = "INV00" + pro.id;
    proId.classList.add("proId");

    let brandBox = document.createElement("div");
    brandBox.innerHTML =`<i class="fa-solid fa-tag"></i>` +"Brand : " + pro.brand;
    brandBox.classList.add("brandBox");

    let priceBox = document.createElement("div");
    priceBox.innerHTML = `<i class="fa-solid fa-dollar-sign"></i>`+"Price: $" + pro.price;
    priceBox.classList.add("priceBox");

    leftBox.appendChild(brandBox);
    leftBox.appendChild(priceBox);
    leftBox.classList.add("leftBox")

    let catBox = document.createElement("div");
    catBox.innerHTML = `<i class="fa-solid fa-layer-group"></i>` +"Category : " + pro.category;
    catBox.classList.add("catBox");

    let stockBox = document.createElement("div");
    stockBox.innerHTML = `<i class="fa-solid fa-box-open"></i>`+"Stock: " + pro.stock + " Units";
    stockBox.classList.add("stockBox");

    rightBox.appendChild(catBox);
    rightBox.appendChild(stockBox);
    rightBox.classList.add("rightBox")

    let close = document.createElement("button");
    close.classList.add("close");
    close.innerHTML = "x";

    imageBox.appendChild(prevImage);
    imageBox.appendChild(pImage);
    imageBox.appendChild(nextImage);

    proBox.appendChild(leftBox);
    proBox.appendChild(rightBox);

    detailsBox.appendChild(close);
    detailsBox.appendChild(imageBox);
    detailsBox.appendChild(pTitle);
    detailsBox.appendChild(proId);
    detailsBox.appendChild(proBox);

    pDetails.appendChild(detailsBox);
    document.body.appendChild(pDetails);

    close.addEventListener("click", function() {
        pDetails.remove();
    });
    }
   
    //update stockicon
    function updateStock(pro,row,statusText){
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
        id.innerHTML = "INV" +pro.id;

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

        let quantity =document.createElement("input");
        quantity.type = "number";
        quantity.min = "1";
        quantity.placeholder = "Enter quantity";

        let button = document.createElement("button");
        button.type="submit";
        button.innerHTML = "Update Stock";
         
        let cancel =  document.createElement("button");
        cancel.type="button";
        cancel.innerHTML = "Cancel";
        cancel.classList.add("closeBtn");
        cancel.addEventListener("click",function(){
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

        form.addEventListener("submit",function(event){
            event.preventDefault();

            let amount = Number(quantity.value);
            if(action.value == "increase"){
                pro.stock += amount;
            }else{
                if(amount > pro.stock){
                    alert("Stock cannot be negative");
                    return;
                }
                pro.stock -= amount;
            }
            let stockText = row.querySelector(".stock");
            stockText.innerHTML = pro.stock + " Units";

            if(pro.stock >= 25){
            stockText.className = "stock in";
            statusText.innerHTML = `<i class="fa-solid fa-circle circleIn"></i>` +"In-Stock";
            statusText.className = "statusIn";
        }
        else if(pro.stock == 0){
            stockText.className = "stock out";
            statusText.innerHTML = `<i class="fa-solid fa-circle circleOut"></i>` +"Out-Of-Stock";
            statusText.className = "statusOut";
        }else{
            stockText.className = "stock low";
            statusText.innerHTML = `<i class="fa-solid fa-circle circleLow"></i>` + "Low-Stock";
            statusText.className="statusLow";
        }
         localStorage.setItem(productKey, JSON.stringify(products));
         showNotification(pro.title + " stock updated!");
            formBox.remove();
            
        })

    }

    //Edit product details

    function editProduct(pro,row){

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

        // let idIp = document.createElement("input");
        // idIp.type = "text";
        // idIp.placeholder = "Enter Product ID";
        // idIp.value = "INV00" +pro.id;

        let brandIp = document.createElement("input");
        brandIp.type = "text";
        brandIp.placeholder = "Enter Product Brand";
        brandIp.value = pro.brand;

        let priceIp = document.createElement("input");
        priceIp.type = "number";
        priceIp.step = 1;
        priceIp.placeholder = "Enter Product Price";
        priceIp.value = pro.price;

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

        let saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.innerHTML = "Save Changes";

        let closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.innerHTML = "Cancel";
        closeBtn.classList.add("closeBtn")

        closeBtn.addEventListener("click", function(){
        formBox.remove();

        
    });

        form.appendChild(heading);
        form.appendChild(titleIp);
        // form.appendChild(idIp);
        form.appendChild(brandIp);
        form.appendChild(priceIp);
        form.appendChild(categoryIp);
        form.appendChild(saveBtn);
        form.appendChild(closeBtn);
        
        formBox.appendChild(form);
        document.body.appendChild(formBox);

        form.addEventListener("submit",function(event){
            event.preventDefault();

            pro.title = titleIp.value;
            pro.brand = brandIp.value;
            pro.price = Number(priceIp.value);
            pro.category = categoryIp.value;

            //save the edit
            localStorage.setItem(productKey, JSON.stringify(products));
            showNotification(pro.title + " updated successfully!");

            row.querySelector(".title").innerHTML = pro.title;
            row.querySelector(".pdtBrand").innerHTML = pro.brand;
            row.querySelector(".pdtPrice").innerHTML = "$" + pro.price;
            row.querySelector(".pdtCat").innerHTML = pro.category;

            formBox.remove();
        })


    }

    //Delete Product
    function deleteProduct(pro,row){
        let confirmDelt = confirm('Are you sure you want to delete this product?');
        if(confirmDelt){
            row.remove();
            let index = products.indexOf(pro);
            products.splice(index, 1);
            localStorage.setItem(productKey, JSON.stringify(products));
            showNotification(pro.title + " deleted succesfully!");
            getProducts();
        }
    }


    getProducts();
    

    //prev

    next.addEventListener("click",function(){
        if(page<lastPage){
        page ++;
        getProducts();
        }
    });

   
    prev.addEventListener("click",function(){
        if (page>1){
            page --;
        getProducts();
        }
    });

    // filtering cats and stock

    allCats.addEventListener("change",function(){
        selectedCategory = allCats.value;
        page = 1;
        getProducts();
    });

    stocks.addEventListener("change",function(){
        selectedStock = stocks.value;
        page = 1;
        getProducts();
    });

    //searching products
    
    search.addEventListener("input", function(){
        searchText = search.value;
        page = 1;
        getProducts();
    });
  
    //notifications..
    let bell = document.getElementById("notifications");
    let box = document.getElementById("notificationBox");
    bell.addEventListener("click",function(){
        box.classList.remove("hidden")
    })

    bell.addEventListener("mouseleave",function(){
        box.classList.add("hidden")
    })


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