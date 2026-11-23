
import License from "../types/license.js";

export default class LicenseController {

    constructor(data) {

        // Convertir los objetos JSON en objetos License
        this.licenses = data.map(item => {

            return new License(
                item.id,
                item.software,
                item.version,
                item.description,
                item.price,
                item.key,
                item.featured,
                item.discount,
                item.image
            );

        });

    }


    // Mostrar las licencias destacadas sin repetir software
    RenderFeatured(count, parent) {

        const featured = this.licenses
            .filter(license => license.featured);

        const uniqueFeatured = [];

        const usedSoftware = new Set();

        featured.forEach(license => {

            if (!usedSoftware.has(license.software)) {

                usedSoftware.add(license.software);

                uniqueFeatured.push(license);

            }

        });

        uniqueFeatured.slice(0, count).forEach(license => {

            license.Render(parent);

        });

    }


    // Mostrar las mejores ofertas
    RenderOffers(count, parent) {

        const offers = this.licenses
            .filter(license => license.discount > 0)
            .sort((a, b) => b.discount - a.discount)
            .slice(0, count);

        offers.forEach(license => {

            license.Render(parent);

        });

    }


    // Mostrar las últimas versiones de cada software
    RenderLatest(count, parent) {

        const latestBySoftware = new Map();

        // Buscar la versión más reciente de cada software
        this.licenses.forEach(license => {

            const current = latestBySoftware.get(license.software);

            if (
                !current ||
                license.version.localeCompare(
                    current.version,
                    undefined,
                    { numeric: true }
                ) > 0
            ) {

                latestBySoftware.set(license.software, license);

            }

        });


        // Ordenar las últimas versiones encontradas
        const latest = Array.from(latestBySoftware.values())
            .sort((a, b) => {

                return b.version.localeCompare(
                    a.version,
                    undefined,
                    { numeric: true }
                );

            })
            .slice(0, count);


        // Mostrar los resultados
        latest.forEach(license => {

            license.Render(parent);

        });

    }


    // Mostrar todas las licencias en orden aleatorio
    RenderAll(count, parent) {

        const shuffled = [...this.licenses];

        // Mezclar las licencias aleatoriamente
        for (let i = shuffled.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

        }

        // Mostrar las licencias
        shuffled.slice(0, count).forEach(license => {

            license.Render(parent);

        });

    }

}
