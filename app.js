// --- ПОЛУЧАЕМ ЭЛЕМЕНТЫ СО СТРАНИЦЫ ---
const homePage = document.getElementById("home-page");
const catalogPage = document.getElementById("catalog-page");
const productPage = document.getElementById("product-page");
const popularGrid = document.getElementById("popular-grid");
const catalogGrid = document.getElementById("catalog-grid");
const brandsPanel = document.getElementById("brands-panel");

// Элементы для модалки с фото
const imageModal = document.getElementById("image-modal");
const fullImage = document.getElementById("full-image");
const ppImage = document.getElementById("pp-image");
const closeImage = document.querySelector(".close-image");

let homeQuery = "";
let catalogQuery = "";
let currentCategory = "all";
let currentBrand = "all";
let previousPage = "home-page";

// --- ФУНКЦИИ РЕНДЕРА ---
function createCard(product, index) {
    const card = document.createElement("div");
    
    // Анимация появления с задержкой
    card.className = "card anim-bottom";
    card.style.animationDelay = `${index * 0.03}s`; 
    
    card.setAttribute("data-id", product.id);
    
    const stockText = product.in_stock ? "В наличии" : "Нет в наличии";
    const stockClass = product.in_stock ? "in-stock" : "out-of-stock";
    
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${product.price} ₽</p>
        <p class="${stockClass}">${stockText}</p>
    `;
    card.addEventListener("click", () => openProductPage(product));
    return card;
}

function renderPopular() {
    popularGrid.innerHTML = "";
    let filtered = PRODUCTS.filter(product => {
        return product.name.toLowerCase().includes(homeQuery.toLowerCase());
    }).slice(0, 4); 

    filtered.forEach((product, index) => {
        popularGrid.appendChild(createCard(product, index));
    });
}

function renderCatalog() {
    catalogGrid.innerHTML = "";
    let filtered = PRODUCTS.filter(product => {
        const categoryMatch = currentCategory === "all" || product.category === currentCategory;
        const searchMatch = product.name.toLowerCase().includes(catalogQuery.toLowerCase());
        
        let brandMatch = true;
        if (currentCategory === "Электронные сигареты" && currentBrand !== "all") {
            brandMatch = product.brand === currentBrand;
        }
        return categoryMatch && searchMatch && brandMatch;
    });

    // Сортировка по затяжкам (от большего к меньшему)
    if (currentCategory === "Электронные сигареты") {
        filtered.sort((a, b) => {
            const aPuffs = parseInt(a.specs["Затяжек"]?.replace(/\s/g, '')) || 0;
            const bPuffs = parseInt(b.specs["Затяжек"]?.replace(/\s/g, '')) || 0;
            return bPuffs - aPuffs;
        });
    }

    filtered.forEach((product, index) => {
        catalogGrid.appendChild(createCard(product, index));
    });
}

// --- ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ ---
function showPage(pageId) {
    [homePage, catalogPage, productPage].forEach(p => p.classList.add("hidden"));
    const target = document.getElementById(pageId);
    target.classList.remove("hidden");

    target.querySelectorAll('.anim-top, .anim-left, .anim-right, .anim-bottom, .anim-zoom').forEach(el => {
        el.classList.remove('anim-top', 'anim-left', 'anim-right', 'anim-bottom', 'anim-zoom');
    });
    
    void target.offsetWidth; // Триггер анимации

    if (pageId === "catalog-page") {
        target.querySelector(".top-bar").classList.add("anim-top");
        target.querySelector(".search-section").classList.add("anim-left");
    } else if (pageId === "home-page") {
        target.querySelector(".top-bar").classList.add("anim-top");
        target.querySelector(".search-section").classList.add("anim-right");
        target.querySelector(".hero-carousel").classList.add("anim-zoom");
        target.querySelector(".section-title").classList.add("anim-left");
    } else if (pageId === "product-page") {
        target.querySelector(".back-to-prev-btn").classList.add("anim-left");
        target.querySelector(".pp-image").classList.add("anim-zoom");
        target.querySelector(".pp-title").classList.add("anim-right");
        target.querySelector(".pp-price").classList.add("anim-right");
        target.querySelectorAll(".pp-section").forEach((sec, i) => {
            sec.classList.add("anim-bottom");
            sec.style.animationDelay = `${0.2 + (i * 0.1)}s`;
        });
    }
    window.scrollTo(0, 0);
}

// --- ОТКРЫТИЕ КАРТОЧКИ ТОВАРА ---
function openProductPage(product) {
    previousPage = catalogPage.classList.contains("hidden") ? "home-page" : "catalog-page";
    
    document.getElementById("pp-image").src = product.image_url;
    document.getElementById("full-image").src = product.image_url;
    document.getElementById("pp-title").innerText = product.name;
    document.getElementById("pp-price").innerText = product.price + " ₽";
    
    // Скрываем описание, если его нет
    const descSection = document.getElementById("desc-section");
    if (product.description && product.description.trim() !== "") {
        document.getElementById("pp-desc").innerText = product.description;
        descSection.style.display = "block";
    } else {
        descSection.style.display = "none";
    }
    
    // Скрываем характеристики, если их нет
    const specsSection = document.getElementById("specs-section");
    if (product.specs && Object.keys(product.specs).length > 0) {
        let specsHtml = "";
        for (let key in product.specs) {
            specsHtml += `<li><span>${key}</span> <b>${product.specs[key]}</b></li>`;
        }
        document.getElementById("pp-specs").innerHTML = specsHtml;
        specsSection.style.display = "block";
    } else {
        specsSection.style.display = "none";
    }

    // Скрываем вкусы, если их нет
    const optionsBlock = document.getElementById("pp-options-block");
    const optionsTitle = document.getElementById("pp-options-title");
    const flavorsContainer = document.getElementById("pp-flavors");

    if (product.flavors && product.flavors.length > 0) {
        optionsBlock.style.display = "block";
        if (["Pod-системы", "Картриджи-испарители", "Аксессуары", "Аксессуары для кальяна", "Аксессуары-сигары", "Кальяны", "Сигареты"].includes(product.category)) {
            optionsTitle.innerText = "Доступные варианты";
        } else {
            optionsTitle.innerText = "Доступные вкусы";
        }

        let flavorsHtml = "";
        product.flavors.forEach(flavor => {
            flavorsHtml += `<button class="flavor-btn">${flavor}</button>`;
        });
        flavorsContainer.innerHTML = flavorsHtml;
    } else {
        optionsBlock.style.display = "none";
    }

    showPage("product-page");
}

// --- ОБРАБОТЧИКИ КНОПОК ---
document.querySelectorAll(".go-to-catalog").forEach(btn => {
    btn.addEventListener("click", () => showPage("catalog-page"));
});

document.querySelector(".back-to-home-btn").addEventListener("click", () => showPage("home-page"));
document.querySelector(".back-to-prev-btn").addEventListener("click", () => showPage(previousPage));

document.getElementById("home-search").addEventListener("input", (e) => {
    homeQuery = e.target.value;
    renderPopular();
});

document.getElementById("catalog-search").addEventListener("input", (e) => {
    catalogQuery = e.target.value;
    renderCatalog();
});

document.querySelector(".filters-section").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    
    if (currentCategory === "Электронные сигареты") {
        brandsPanel.classList.remove("hidden");
    } else {
        brandsPanel.classList.add("hidden");
        currentBrand = "all";
        document.querySelectorAll(".brand-btn").forEach(b => b.classList.remove("active"));
        document.querySelector('.brand-btn[data-brand="all"]').classList.add("active");
    }
    renderCatalog();
});

document.querySelector(".brands-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".brand-btn");
    if (!btn) return;

    document.querySelectorAll(".brand-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentBrand = btn.getAttribute("data-brand");
    renderCatalog();
});

// --- ПОЛНОЭКРАННОЕ ФОТО ---
ppImage.addEventListener("click", () => {
    imageModal.classList.remove("hidden");
});

closeImage.addEventListener("click", () => {
    imageModal.classList.add("hidden");
});

imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
        imageModal.classList.add("hidden");
    }
});

// --- ЗАПУСК ---
renderPopular();
renderCatalog();
showPage("home-page");