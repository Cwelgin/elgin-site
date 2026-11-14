/*
ELGIN Gallery Feature
Shared data-driven component.

Squarespace usage:
<div class="elgin-feature" data-id="V001"></div>
<div class="elgin-feature" data-id="OBJ007"></div>
*/

(function () {
    "use strict";

    const API_URL = "https://script.google.com/macros/s/AKfycbwsxbrVU3irqM75ymKLk4tsevplEDWWUUXKzLI6xHpn-psauODtWKghJyM2mqQS2ij0/exec";
    const SELECTOR = ".elgin-feature";
    const STYLE_ID = "elgin-gallery-feature-styles";

    const artworkCache = new Map();
    const imageCache = new Map();

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            .elgin-feature {
                width: 100%;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            .elgin-feature .elgin-feature-inner {
                width: 100%;
                height: 360px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
            }

            .elgin-feature .elgin-feature-image-wrap {
                width: 100%;
                height: 358px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 2px;
                box-sizing: border-box;
            }

            .elgin-feature .elgin-feature-image {
                display: block;
                max-width: 100%;
                max-height: 354px;
                width: auto;
                height: auto;
                object-fit: contain;
            }

            .elgin-feature .elgin-feature-text {
                height: 358px;
                padding: 40px 50px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-sizing: border-box;
                border-left: 1px solid #d8d8d8;
            }

            .elgin-feature .elgin-feature-title {
                margin: 0 0 14px;
                padding: 0;
            }

            .elgin-feature .elgin-feature-description {
                margin: 0;
                padding: 0;
                line-height: 1.6;
                white-space: pre-line;
            }

            .elgin-feature .elgin-feature-link {
                display: inline-block;
                align-self: flex-start;
                margin-top: 22px;
                text-decoration: none;
                font-size: 12px;
                letter-spacing: .10em;
                text-transform: uppercase;
            }

            .elgin-feature .elgin-feature-link:hover {
                text-decoration: underline;
            }

            @media screen and (max-width: 767px) {
                .elgin-feature .elgin-feature-inner {
                    height: auto;
                    display: block;
                }

                .elgin-feature .elgin-feature-image-wrap {
                    width: 100%;
                    height: 360px;
                    min-height: 300px;
                    border-bottom: 1px solid #d8d8d8;
                }

                .elgin-feature .elgin-feature-text {
                    width: 100%;
                    height: auto;
                    padding: 35px 30px;
                    border-left: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function loadArtwork(id) {
        if (artworkCache.has(id)) return artworkCache.get(id);

        const promise = new Promise((resolve, reject) => {
            const callbackName = "elginFeature_" + Date.now() + "_" +
                Math.random().toString(36).slice(2);
            const script = document.createElement("script");
            let finished = false;

            function cleanup() {
                if (finished) return;
                finished = true;
                delete window[callbackName];
                script.remove();
            }

            window[callbackName] = function (record) {
                cleanup();
                if (!record) {
                    reject(new Error("No artwork record found for ID: " + id));
                    return;
                }
                resolve(record);
            };

            script.onerror = function () {
                cleanup();
                reject(new Error("Could not retrieve artwork data for ID: " + id));
            };

            script.src = API_URL +
                "?id=" + encodeURIComponent(id) +
                "&callback=" + encodeURIComponent(callbackName);

            document.head.appendChild(script);
        });

        artworkCache.set(id, promise);
        promise.catch(() => artworkCache.delete(id));
        return promise;
    }

    function getFinalGalleryImage(sourcePage) {
        if (imageCache.has(sourcePage)) return imageCache.get(sourcePage);

        const promise = fetch(sourcePage)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not load source page: " + response.status);
                }
                return response.text();
            })
            .then(html => {
                const doc = new DOMParser().parseFromString(html, "text/html");
                const gallery = doc.querySelector(
                    ".sqs-gallery-container .sqs-gallery"
                );

                if (!gallery) throw new Error("Squarespace gallery not found: " + sourcePage);

                const items = gallery.querySelectorAll(
                    ".sqs-gallery-design-grid-slide, .slide"
                );

                if (!items.length) throw new Error("No gallery images found: " + sourcePage);

                const image = items[items.length - 1].querySelector("img");
                if (!image) throw new Error("Final gallery image not found: " + sourcePage);

                let imageURL = image.getAttribute("data-src") || image.getAttribute("src");
                const srcset = image.getAttribute("data-srcset") || image.getAttribute("srcset");

                if (srcset) {
                    const sources = srcset.split(",").map(source => {
                        const parts = source.trim().split(/\s+/);
                        return { url: parts[0], width: parseInt(parts[1], 10) || 0 };
                    }).sort((a, b) => b.width - a.width);

                    if (sources.length) imageURL = sources[0].url;
                }

                if (!imageURL) throw new Error("Could not determine final gallery image URL.");
                return new URL(imageURL, sourcePage).href;
            });

        imageCache.set(sourcePage, promise);
        promise.catch(() => imageCache.delete(sourcePage));
        return promise;
    }

    function renderFeature(container, artwork, imageURL) {
        const inner = document.createElement("div");
        inner.className = "elgin-feature-inner";

        const imageWrap = document.createElement("div");
        imageWrap.className = "elgin-feature-image-wrap";

        const image = document.createElement("img");
        image.className = "elgin-feature-image";
        image.src = imageURL;
        image.alt = artwork.title || "";
        image.loading = "lazy";
        imageWrap.appendChild(image);

        const textWrap = document.createElement("div");
        textWrap.className = "elgin-feature-text";

        if (artwork.title) {
            const title = document.createElement("h3");
            title.className = "elgin-feature-title";
            title.textContent = artwork.title;
            textWrap.appendChild(title);
        }

        if (artwork.description) {
            const description = document.createElement("p");
            description.className = "elgin-feature-description";
            description.textContent = artwork.description;
            textWrap.appendChild(description);
        }

        if (artwork.urlSlug) {
            const link = document.createElement("a");
            link.className = "elgin-feature-link";
            link.href = new URL(artwork.urlSlug, window.location.origin).href;
            link.textContent = "Read more here";
            textWrap.appendChild(link);
        }

        inner.append(imageWrap, textWrap);
        container.replaceChildren(inner);
        container.style.visibility = "visible";
        container.removeAttribute("aria-busy");
    }

    async function initializeFeature(container) {
        if (container.dataset.elginFeatureInitialized === "true") return;

        const id = (container.getAttribute("data-id") || "").trim();
        if (!id) {
            console.error("ELGIN Feature: Missing data-id.", container);
            return;
        }

        container.dataset.elginFeatureInitialized = "true";
        container.style.visibility = "hidden";
        container.setAttribute("aria-busy", "true");

        try {
            const artwork = await loadArtwork(id);
            if (!artwork.urlSlug) throw new Error("Artwork record has no urlSlug: " + id);

            const sourcePage = new URL(artwork.urlSlug, window.location.origin).href;
            const imageURL = await getFinalGalleryImage(sourcePage);

            renderFeature(container, artwork, imageURL);
            console.log("ELGIN Feature loaded:", id, sourcePage);
        } catch (error) {
            console.error("ELGIN Feature error for " + id + ":", error);
            container.replaceChildren();

            const message = document.createElement("p");
            message.textContent = "Feature could not be loaded.";
            container.appendChild(message);

            container.style.visibility = "visible";
            container.removeAttribute("aria-busy");
            delete container.dataset.elginFeatureInitialized;
        }
    }

    function initializeAll() {
        addStyles();
        document.querySelectorAll(SELECTOR).forEach(initializeFeature);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeAll);
    } else {
        initializeAll();
    }

    // Also detect feature blocks inserted after initial page load.
    const observer = new MutationObserver(mutations => {
        const addedFeature = mutations.some(mutation =>
            Array.from(mutation.addedNodes).some(node =>
                node.nodeType === 1 &&
                (node.matches(SELECTOR) || node.querySelector(SELECTOR))
            )
        );

        if (addedFeature) initializeAll();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

})();
