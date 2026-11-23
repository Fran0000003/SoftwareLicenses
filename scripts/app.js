
import LicenseController from "./controllers/licenseController.js";

let licenseController = null;

const STORAGE_KEY = "purchasedLicenses";


// Cargar las licencias desde el archivo JSON
async function LoadLicenses() {

    try {

        const response = await fetch("./data/licenses.json");

        if (!response.ok) {
            throw new Error("No se pudieron cargar las licencias.");
        }

        const data = await response.json();

        licenseController = new LicenseController(data);

        RenderSections();
        SetupFilters();
        SetupModal();
        RenderPurchasedLicenses();

        // Actualizar las compras cuando se realice una nueva compra
        window.addEventListener("purchasesUpdated", RenderPurchasedLicenses);

    } catch (error) {

        console.error("Error al cargar las licencias:", error);

    }

}


// Mostrar las diferentes secciones de la tienda
function RenderSections() {

    const featuredContainer = document.getElementById("featured-products");
    const offersContainer = document.getElementById("offers-products");
    const latestContainer = document.getElementById("latest-products");
    const allContainer = document.getElementById("all-products");

    licenseController.RenderFeatured(3, featuredContainer);

    licenseController.RenderOffers(3, offersContainer);

    licenseController.RenderLatest(3, latestContainer);

    licenseController.RenderAll(
        licenseController.licenses.length,
        allContainer
    );

}


// Mostrar las licencias compradas
function RenderPurchasedLicenses() {

    const container = document.getElementById("purchased-products");

    if (!container) return;

    container.innerHTML = "";

    let purchases = [];

    try {

        purchases = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(purchases)) {
            purchases = [];
        }

    } catch (error) {

        console.error("Error al recuperar las compras:", error);

    }


    // Comprobar si existen compras
    if (purchases.length === 0) {

        container.textContent = "Todavía no has comprado ninguna licencia.";

        return;

    }


    // Mostrar primero las compras más recientes
    purchases.slice().reverse().forEach(purchase => {

        const card = document.createElement("div");
        card.classList.add("product-card");


        // Buscar la licencia original en el catálogo
        const originalLicense = licenseController.licenses.find(license =>
            license.software === purchase.software &&
            license.version === purchase.version
        );


        // Recuperar la imagen
        const imagePath = purchase.image ||
            (originalLicense ? originalLicense.image : "");


        // Imagen del software
        const image = document.createElement("img");
        image.classList.add("product-image");
        image.src = imagePath;
        image.alt = purchase.software;

        image.onerror = () => {
            image.style.display = "none";
        };


        // Nombre del software
        const title = document.createElement("h3");
        title.textContent = purchase.software;


        // Versión
        const version = document.createElement("p");
        version.classList.add("product-version");
        version.textContent = `Versión: ${purchase.version}`;


        // Precio
        const price = document.createElement("p");
        price.classList.add("product-price");
        price.textContent = `${Number(purchase.price).toFixed(2)} €`;


        // Fecha de compra
        const date = document.createElement("p");
        date.classList.add("product-description");
        date.textContent = `Fecha de compra: ${purchase.date}`;


        // Clave de licencia
        const key = document.createElement("p");
        key.classList.add("purchased-key");
        key.textContent = `Clave: ${purchase.key}`;


        // Botón para copiar la clave
        const copyButton = document.createElement("button");
        copyButton.classList.add("buy-button", "purchased-copy-button");
        copyButton.textContent = "Copiar clave";

        copyButton.addEventListener("click", async () => {

            // Restablecer todos los botones de copia
            document.querySelectorAll(".purchased-copy-button").forEach(button => {

                button.textContent = "Copiar clave";

            });

            try {

                // Copiar la clave seleccionada
                await navigator.clipboard.writeText(purchase.key);

                copyButton.textContent = "¡Copiada!";

            } catch (error) {

                copyButton.textContent = "No se pudo copiar";

            }

        });


        // Botón para eliminar la compra
        const deleteButton = document.createElement("button");

        deleteButton.classList.add("delete-button");

        deleteButton.textContent = "Eliminar compra";

        deleteButton.addEventListener("click", () => {

            const confirmDelete = confirm(
                `¿Seguro que quieres eliminar la licencia de ${purchase.software}?`
            );

            if (!confirmDelete) return;


            // Recuperar las compras guardadas
            const savedPurchases = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );


            // Eliminar únicamente la compra seleccionada
            const updatedPurchases = savedPurchases.filter(item =>
                item.key !== purchase.key
            );


            // Guardar la lista actualizada
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedPurchases)
            );


            // Actualizar la sección de compras
            RenderPurchasedLicenses();

        });


        // Añadir elementos a la tarjeta
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(version);
        card.appendChild(price);
        card.appendChild(date);
        card.appendChild(key);
        card.appendChild(copyButton);
        card.appendChild(deleteButton);

        container.appendChild(card);

    });

}


// Configurar filtros
function SetupFilters() {

    const searchInput = document.getElementById("search-input");
    const maxPriceInput = document.getElementById("max-price");
    const sortFilter = document.getElementById("sort-filter");


    function ApplyFilters() {

        const search = searchInput.value.toLowerCase();
        const maxPrice = maxPriceInput.value;
        const sort = sortFilter.value;


        // Filtrar licencias
        let filtered = licenseController.licenses.filter(license => {

            const matchesSearch = license.software
                .toLowerCase()
                .includes(search);

            const finalPrice = license.price -
                (license.price * license.discount / 100);

            const matchesPrice = maxPrice === "" ||
                finalPrice <= Number(maxPrice);

            return matchesSearch && matchesPrice;

        });


        // Ordenar resultados
        if (sort === "price-asc") {

            filtered.sort((a, b) => {

                const priceA = a.price - (a.price * a.discount / 100);
                const priceB = b.price - (b.price * b.discount / 100);

                return priceA - priceB;

            });

        } else if (sort === "price-desc") {

            filtered.sort((a, b) => {

                const priceA = a.price - (a.price * a.discount / 100);
                const priceB = b.price - (b.price * b.discount / 100);

                return priceB - priceA;

            });

        } else if (sort === "discount") {

            filtered.sort((a, b) => b.discount - a.discount);

        }


        // Mostrar resultados
        const allContainer = document.getElementById("all-products");

        allContainer.innerHTML = "";


        if (filtered.length === 0) {

            allContainer.textContent = "No se encontraron licencias.";

        } else {

            filtered.forEach(license => {

                license.Render(allContainer);

            });

        }

    }


    // Detectar cambios en los filtros
    searchInput.addEventListener("input", ApplyFilters);

    maxPriceInput.addEventListener("input", ApplyFilters);

    sortFilter.addEventListener("change", ApplyFilters);

}


// Configurar ventana de compra
function SetupModal() {

    const modal = document.getElementById("purchase-modal");

    const closeButton = document.getElementById("close-modal");

    const copyButton = document.getElementById("copy-key");

    const licenseKey = document.getElementById("license-key");

    const copyMessage = document.getElementById("copy-message");


    // Cerrar ventana
    closeButton.addEventListener("click", () => {

        modal.style.display = "none";

    });


    // Cerrar al pulsar fuera
    modal.addEventListener("click", event => {

        if (event.target === modal) {

            modal.style.display = "none";

        }

    });


    // Copiar clave
    copyButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(licenseKey.textContent);

            copyMessage.textContent = "¡Clave copiada correctamente!";

        } catch (error) {

            copyMessage.textContent = "No se pudo copiar la clave.";

        }

    });

}


// Iniciar aplicación
LoadLicenses();
