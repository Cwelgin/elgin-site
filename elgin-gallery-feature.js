/*
============================================================
ELGIN Gallery Feature
Shared data-driven Squarespace component

Squarespace usage:
<div class="elgin-feature" data-id="V001"></div>
<div class="elgin-feature" data-id="OBJ007"></div>
============================================================
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
            .elgin-feature-inner {
                width: 100%;
                min-height: 360px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
            }
            .elgin-feature-image-wrap {
                width: 100%;
                min-height: 358px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 2px;
                box-sizing: border-box;
            }
            .elgin-feature-image {
                display: block;
                max-width: 100%;
                max-height: 354px;
                width: auto;
                height: auto;
                object-fit: contain;
            }
            .elgin-feature-text {
                min-height: 358px;
                padding: 40px 50px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-sizing: border-box;
                border-left: 1px solid #d8d8d8;
            }
            .elgin-feature-title {
                margin: 0 0 14px;
                padding: 0;
            }
            .elgin-feature-description {
                margin: 0;
                padding: 0;
                line-height: 1.6;
                white-space: pre-line;
            }
            .elgin-feature-link {
                display: inline-block;
                align-self: flex-start;
                margin-top: 22px;
                text-decoration: none;
                font-size: 12px;
                letter-spacing: .10em;
                text-transform: uppercase;
            }
            .elgin-feature-link:hover {
                text-decoration: underline;
            }
            .elgin-feature-status {
                margin: 12px 0;
                font-size: 13px;
                line-height: 1.5;
            }
            @media screen and (max-width: 767px) {
                .elgin-feature-inner {
                    min-height: 0;
                    display: block;
                }
                .elgin-feature-image-wrap {
                    width: 100%;
                    height: 360px;
                    min-height: 300px;
                    border-bottom: 1px solid #d8d8d8;
                }
                .elgin-feature-text {
                    width: 100%;
                    min-height: 0;
                    padding: 35px 30px;
                    border-left: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function showStatus(container, message, isError) {
        container.replaceChildren();
        const status = document.createElement("p");
        status.className = "elgin-feature-status";
        status.textContent = message;
        if (isError) status.setAttribute("role", "alert");
        container.appendChild(status);
        container.style.visibility = "visible";
        container.removeAttribute("aria-busy");
    }

    function loadArtwork(id) {
        if (artworkCache.has(id)) return artworkCache.get(id);

        const promise = new Promise((resolve, reject) => {
            const callbackName = "elginFeature_" + Date.now() + "_" +
                Math.random().toString(36).slice(2);
            const script = document.createElement("script");
            let finished = false;

            const timeout = window.setTimeout(() => {
                cleanup();
                reject(new Error("The artwork API did not respond in time for ID " + id + "."));
            }, 15000);

            function cleanup() {
                if (finished) return;
                finished = true;
                window.clearTimeout(timeout);
                try {
                    delete window[callbackName];
                } catch (error) {
                    window[callbackName] = undefined;
                }
                script.remove();
            }

            window[callbackName] = function (record) {
                cleanup();
                if (!record) {
                    reject(new Error("No spreadsheet record was found for artwork ID " + id + "."));
                    return;
                }
                resolve(record);
            };

            script.onerror = function () {
                cleanup();
                reject(new Error("The browser could not contact the Google Sheets artwork API."));
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

    function extractImageURL(image, sourcePage) {
        if (!image) return "";

        const candidates = [
            image.getAttribute("data-src"),
            image.getAttribute("data-image"),
            image.getAttribute("src")
        ].filter(Boolean);

        const srcset = image.getAttribute("data-srcset") || image.getAttribute("srcset");

        if (srcset) {
            const largest = srcset.split(",").map(part => {
                const pieces = part.trim().split(/\s+/);
                return {
                    url: pieces[0],
                    width: parseInt(pieces[1], 10) || 0
                };
            }).sort((a, b) => b.width - a.width)[0];

            if (largest && largest.url) candidates.unshift(largest.url);
        }

        return candidates.length
            ? new URL(candidates[0], sourcePage).href
            : "";
    }

    function getFinalGalleryImage(sourcePage) {
        if (imageCache.has(sourcePage)) return imageCache.get(sourcePage);

        const promise = fetch(sourcePage, {
            method: "GET",
            credentials: "same-origin",
            redirect: "follow"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Artwork page returned HTTP " + response.status + ".");
                }
                return response.text();
            })
            .then(html => {
                const doc = new DOMParser().parseFromString(html, "text/html");

                // Squarespace 7.1 gallery blocks on this site are separate
                // block elements. Each gallery block has its own ID and
                // contains slides marked .slide[data-type="image"].
                const galleryBlocks = Array.from(
                    doc.querySelectorAll('div[id^="block-"]')
                ).filter(block =>
                    block.querySelector('.slide[data-type="image"] img')
                );

                if (!galleryBlocks.length) {
                    throw new Error("No Squarespace gallery blocks containing images were found on " + sourcePage);
                }

                // Use the last gallery block in document order.
                const finalGallery = galleryBlocks[galleryBlocks.length - 1];

                // Within that gallery, use the last image slide.
                const imageSlides = finalGallery.querySelectorAll(
                    '.slide[data-type="image"]'
                );

                const finalSlide = imageSlides[imageSlides.length - 1];
                const image = finalSlide
                    ? finalSlide.querySelector("img.thumb-image, img")
                    : null;

                const imageURL = extractImageURL(image, sourcePage);

                if (!imageURL) {
                    throw new Error("The final image in the final gallery has no usable image URL.");
                }

                console.info(
                    "ELGIN Feature: selected final gallery",
                    finalGallery.id,
                    "with",
                    imageSlides.length,
                    "images."
                );

                return imageURL;
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

        image.onerror = () => {
            image.alt = (artwork.title || "Artwork") + " image could not be displayed";
            console.error("ELGIN Feature: image failed to load:", imageURL);
        };

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
            showStatus(container, "ELGIN Feature: add a data-id to this block.", true);
            console.error("ELGIN Feature: missing data-id.", container);
            return;
        }

        container.dataset.elginFeatureInitialized = "true";
        container.style.visibility = "visible";
        container.setAttribute("aria-busy", "true");
        showStatus(container, "Loading artwork " + id + "…", false);

        try {
            const artwork = await loadArtwork(id);

            if (!artwork.urlSlug) {
                throw new Error("The spreadsheet record for " + id + " is missing its urlSlug value.");
            }

            const sourcePage = new URL(artwork.urlSlug, window.location.origin).href;
            const imageURL = await getFinalGalleryImage(sourcePage);

            renderFeature(container, artwork, imageURL);
            console.info("ELGIN Feature loaded:", id);

        } catch (error) {
            console.error("ELGIN Feature error for " + id + ":", error);

            showStatus(
                container,
                "ELGIN feature " + id + " could not load: " + error.message,
                true
            );

            delete container.dataset.elginFeatureInitialized;
        }
    }

    function initializeAll() {
        addStyles();

        document.querySelectorAll(SELECTOR).forEach(container => {
            initializeFeature(container);
        });
    }

    // Run at all relevant Squarespace lifecycle points.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeAll, { once: true });
    } else {
        initializeAll();
    }

    window.addEventListener("load", initializeAll);
    document.addEventListener("mercury:load", initializeAll);

    // Squarespace can insert code blocks after the initial page render.
    const observer = new MutationObserver(mutations => {
        let shouldScan = false;

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches(SELECTOR) || node.querySelector(SELECTOR)) {
                    shouldScan = true;
                    break;
                }
            }

            if (shouldScan) break;
        }

        if (shouldScan) initializeAll();
    });

    if (document.documentElement) {
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // Final delayed scans cover late Squarespace block hydration.
    window.setTimeout(initializeAll, 1000);
    window.setTimeout(initializeAll, 3000);

})();
