
export default class License {

    // Almacena las claves que ya se han generado
    static generatedKeys = new Set();


    constructor(id, software, version, description, price, key, featured, discount, image) {

        this.id = id;
        this.software = software;
        this.version = version;
        this.description = description;
        this.price = price;
        this.key = key;
        this.featured = featured;
        this.discount = discount;
        this.image = image;

    }


    // Renderiza la licencia dentro del elemento recibido
    Render(parent) {

        const card = document.createElement("div");
        card.classList.add("product-card");

        // Calcular precio con descuento
        const finalPrice = this.price - (this.price * this.discount / 100);

        // Imagen del producto
        const image = document.createElement("img");
        image.classList.add("product-image");
        image.src = this.image;
        image.alt = this.software;

        image.onerror = () => {
            image.style.display = "none";
        };

        // Nombre del software
        const title = document.createElement("h3");
        title.textContent = this.software;

        // Versión
        const version = document.createElement("p");
        version.textContent = `Versión: ${this.version}`;

        // Descripción
        const description = document.createElement("p");
        description.classList.add("product-description");
        description.textContent = this.description;

        // Etiqueta de destacado
        if (this.featured) {

            const featuredLabel = document.createElement("span");
            featuredLabel.classList.add("product-featured");
            featuredLabel.textContent = "DESTACADO";

            card.appendChild(featuredLabel);

        }

        // Etiqueta de descuento
        if (this.discount > 0) {

            const discountLabel = document.createElement("span");
            discountLabel.classList.add("product-discount");
            discountLabel.textContent = `-${this.discount}%`;

            card.appendChild(discountLabel);

        }

        // Precio
        const price = document.createElement("div");
        price.classList.add("product-price");

        if (this.discount > 0) {

            price.innerHTML = `
                <span class="product-old-price">
                    ${this.price.toFixed(2)} €
                </span>
                ${finalPrice.toFixed(2)} €
            `;

        } else {

            price.textContent = `${this.price.toFixed(2)} €`;

        }

        // Botón de compra
        const buyButton = document.createElement("button");
        buyButton.classList.add("buy-button");
        buyButton.textContent = "Comprar licencia";

        buyButton.addEventListener("click", () => {
            this.Buy();
        });

        // Añadir elementos a la tarjeta
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(version);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(buyButton);

        // Añadir tarjeta al contenedor recibido
        parent.appendChild(card);

    }


    // Genera una clave, guarda la compra y muestra la ventana emergente
    Buy() {

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let randomKey;

        // Recuperar las compras anteriores
        let purchases = [];

        try {

            purchases = JSON.parse(
                localStorage.getItem("purchasedLicenses") || "[]"
            );

            if (!Array.isArray(purchases)) {
                purchases = [];
            }

        } catch (error) {

            console.error("Error al recuperar las compras:", error);

        }


        // Evitar reutilizar claves de compras anteriores
        const previousKeys = new Set(
            purchases.map(purchase =>
                purchase.key.replace(/-/g, "")
            )
        );


        // Generar una clave que no se haya utilizado
        do {

            let generatedKey = "";

            for (let i = 0; i < 16; i++) {

                generatedKey += characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );

            }

            randomKey = generatedKey;

        } while (
            License.generatedKeys.has(randomKey) ||
            previousKeys.has(randomKey)
        );


        // Guardar la clave para evitar repetirla
        License.generatedKeys.add(randomKey);


        // Separar la clave en bloques de 4 caracteres
        const formattedKey = randomKey.match(/.{1,4}/g).join("-");


        // Calcular el precio final con descuento
        const finalPrice = this.price -
            (this.price * this.discount / 100);


        // Obtener la fecha de compra
        const purchaseDate = new Date().toLocaleString("es-ES");


        // Crear el registro de la compra
        const purchase = {

            software: this.software,
            version: this.version,
            price: finalPrice,
            key: formattedKey,
            date: purchaseDate,
            image: this.image

        };


        // Guardar la compra en localStorage
        try {

            purchases.push(purchase);

            localStorage.setItem(
                "purchasedLicenses",
                JSON.stringify(purchases)
            );

        } catch (error) {

            console.error("No se pudo guardar la compra:", error);

        }


        // Avisar a app.js para actualizar la lista
        window.dispatchEvent(new Event("purchasesUpdated"));


        // Obtener elementos de la ventana emergente
        const modal = document.getElementById("purchase-modal");

        const licenseKey = document.getElementById("license-key");

        const copyMessage = document.getElementById("copy-message");


        // Limpiar el mensaje de copia anterior
        if (copyMessage) {
            copyMessage.textContent = "";
        }


        // Mostrar la clave generada
        licenseKey.textContent = formattedKey;


        // Abrir ventana emergente
        modal.style.display = "flex";

    }

}
