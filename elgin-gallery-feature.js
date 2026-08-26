(function () {

    /* ==========================================================
       ELGIN GALLERY FEATURE
       Version 1.2

       Squarespace provides:
       - data-source
       - text/content inside the container

       GitHub controls:
       - layout
       - artwork sizing
       - responsive behavior
       - gallery/image retrieval
       ========================================================== */


    /* ==========================================================
       FIND THIS PARTICULAR CODE BLOCK
       ========================================================== */

    const script = document.currentScript;
    const container = script.previousElementSibling;

    if (!container ||
        !container.classList.contains("elgin-gallery-feature")) {

        console.error(
            "ELGIN: Feature container not found."
        );

        return;
    }


    /* ==========================================================
       GET SETTINGS FROM SQUARESPACE
       ========================================================== */

    const SOURCE_PAGE =
        container.getAttribute("data-source");

    const TEXT =
        container.innerHTML;


    if (!SOURCE_PAGE) {

        console.error(
            "ELGIN: No data-source specified."
        );

        container.innerHTML =
            "<p>ELGIN Gallery Feature: No source page specified.</p>";

        return;
    }


    /* ==========================================================
       STYLING
       ========================================================== */

    const STYLE_ID =
        "elgin-gallery-feature-styles";

    if (!document.getElementById(STYLE_ID)) {

        const CSS = `

            /* ==================================================
               OUTER CONTAINER
               ================================================== */

            .elgin-gallery-feature {
                width: 100%;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }


            /* ==================================================
               MAIN FEATURE
               ================================================== */

            .elgin-gallery-feature .elgin-feature-inner {

                width: 100%;

                display: grid;

                grid-template-columns:
                    minmax(0, 1fr)
                    minmax(0, 1fr);

                margin: 0;
                padding: 0;

                border: 1px solid #e5e5e5;

                box-sizing: border-box;

                overflow: hidden;
            }


            /* ==================================================
               IMAGE COLUMN
               ================================================== */

            .elgin-gallery-feature
            .elgin-feature-image-wrap {

                width: 100%;

                display: flex;

                align-items: center;
                justify-content: center;

                padding: 20px;

                box-sizing: border-box;

                min-width: 0;

                overflow: hidden;
            }


            /* ==================================================
               ARTWORK

               Maximum:
               420px wide
               500px high

               IMPORTANT:
               These rules deliberately override
               Squarespace's global image styling.
               ================================================== */

            .elgin-gallery-feature
            .elgin-feature-image {

                display: block !important;

                width: auto !important;
                height: auto !important;

                max-width: 420px !important;
                max-height: 500px !important;

                min-width: 0 !important;
                min-height: 0 !important;

                object-fit: contain !important;

                margin: 0 !important;
                padding: 0 !important;

                flex: 0 0 auto !important;
            }


            /* ==================================================
               TEXT COLUMN
               ================================================== */

            .elgin-gallery-feature
            .elgin-feature-text {

                display: flex;

                flex-direction: column;

                justify-content: center;

                box-sizing: border-box;

                padding: 40px 50px;

                border-left: 1px solid #e5e5e5;

                min-width: 0;
            }


            /* ==================================================
               TEXT
               ================================================== */

            .elgin-gallery-feature
            .elgin-feature-text p {

                margin: 0;
                padding: 0;

                line-height: 1.6;
            }


            /* ==================================================
               LINK
               ================================================== */

            .elgin-gallery-feature
            .elgin-feature-text a {

                display: inline-block;

                margin-top: 22px;

                text-decoration: none;

                font-size: 0.85em;

                letter-spacing: 0.08em;

                text-transform: uppercase;
            }


            .elgin-gallery-feature
            .elgin-feature-text a:hover {

                text-decoration: underline;
            }


            /* ==================================================
               MOBILE
               ================================================== */

            @media screen and (max-width: 767px) {

                .elgin-gallery-feature
                .elgin-feature-inner {

                    display: block;

                }


                /* IMAGE */

                .elgin-gallery-feature
                .elgin-feature-image-wrap {

                    width: 100%;

                    min-height: 0;

                    max-height: none;

                    padding: 20px;

                    border-bottom:
                        1px solid #e5e5e5;

                }


                .elgin-gallery-feature
                .elgin-feature-image {

                    width: auto !important;
                    height: auto !important;

                    max-width: 100% !important;
                    max-height: 500px !important;

                }


                /* TEXT */

                .elgin-gallery-feature
                .elgin-feature-text {

                    width: 100%;

                    height: auto;

                    padding: 35px 30px;

                    border-left: none;

                }

            }

        `;


        const style =
            document.createElement("style");

        style.id = STYLE_ID;

        style.textContent = CSS;

        document.head.appendChild(style);

    }


    /* ==========================================================
       LOAD SOURCE PAGE
       ========================================================== */

    fetch(SOURCE_PAGE)

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Could not load source page: " +
                    response.status
                );

            }

            return response.text();

        })


        /* ======================================================
           PARSE SOURCE PAGE
           ====================================================== */

        .then(function (html) {

            const parser =
                new DOMParser();

            const sourceDocument =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            /* ==================================================
               FIND SQUARESPACE GALLERY
               ================================================== */

            const gallery =
                sourceDocument.querySelector(
                    ".sqs-gallery-container .sqs-gallery"
                );


            if (!gallery) {

                console.error(
                    "ELGIN: Squarespace gallery not found:",
                    SOURCE_PAGE
                );

                container.innerHTML =
                    "<p>Gallery not found.</p>";

                return;
            }


            /* ==================================================
               FIND GALLERY ITEMS
               ================================================== */

            const galleryItems =
                gallery.querySelectorAll(
                    ".sqs-gallery-design-grid-slide, .slide"
                );


            if (!galleryItems.length) {

                console.error(
                    "ELGIN: No gallery items found:",
                    SOURCE_PAGE
                );

                container.innerHTML =
                    "<p>No gallery images found.</p>";

                return;
            }


            /* ==================================================
               GET FINAL GALLERY ITEM
               ================================================== */

            const finalItem =
                galleryItems[
                    galleryItems.length - 1
                ];


            /* ==================================================
               FIND IMAGE
               ================================================== */

            const image =
                finalItem.querySelector("img");


            if (!image) {

                console.error(
                    "ELGIN: No image found in final gallery item:",
                    SOURCE_PAGE
                );

                container.innerHTML =
                    "<p>Final gallery image not found.</p>";

                return;
            }


            /* ==================================================
               GET BEST IMAGE URL
               ================================================== */

            let imageURL =
                image.getAttribute("data-src") ||
                image.getAttribute("src");


            const srcset =
                image.getAttribute("data-srcset") ||
                image.getAttribute("srcset");


            if (srcset) {

                const sources =
                    srcset
                        .split(",")
                        .map(function (source) {

                            const parts =
                                source
                                    .trim()
                                    .split(/\s+/);

                            return {
                                url: parts[0],

                                width:
                                    parseInt(
                                        parts[1],
                                        10
                                    ) || 0
                            };

                        })
                        .sort(function (a, b) {

                            return b.width - a.width;

                        });


                if (sources.length) {

                    imageURL =
                        sources[0].url;

                }

            }


            /* ==================================================
               CHECK IMAGE URL
               ================================================== */

            if (!imageURL) {

                console.error(
                    "ELGIN: Could not determine image URL:",
                    SOURCE_PAGE
                );

                container.innerHTML =
                    "<p>Image URL not found.</p>";

                return;
            }


            /* ==================================================
               CREATE COMPONENT
               ================================================== */

            container.innerHTML = `

                <div class="elgin-feature-inner">

                    <div class="elgin-feature-image-wrap">

                        <img
                            class="elgin-feature-image"
                            src="${imageURL}"
                            alt=""
                        >

                    </div>


                    <div class="elgin-feature-text">

                        ${TEXT}

                    </div>

                </div>

            `;


            /* ==================================================
               GET THE NEW IMAGE
               ================================================== */

            const featureImage =
                container.querySelector(
                    ".elgin-feature-image"
                );


            /* ==================================================
               FORCE ARTWORK SIZING

               This protects the component against
               Squarespace's global image CSS.
               ================================================== */

            if (featureImage) {

                featureImage.style.setProperty(
                    "width",
                    "auto",
                    "important"
                );

                featureImage.style.setProperty(
                    "height",
                    "auto",
                    "important"
                );

                featureImage.style.setProperty(
                    "max-width",
                    "420px",
                    "important"
                );

                featureImage.style.setProperty(
                    "max-height",
                    "500px",
                    "important"
                );

                featureImage.style.setProperty(
                    "object-fit",
                    "contain",
                    "important"
                );

                featureImage.style.setProperty(
                    "margin",
                    "0",
                    "important"
                );

                featureImage.style.setProperty(
                    "padding",
                    "0",
                    "important"
                );

            }


            /* ==================================================
               DEBUGGING
               ================================================== */

            console.log(
                "ELGIN: Gallery feature loaded:",
                SOURCE_PAGE
            );

            console.log(
                "ELGIN: Gallery images:",
                galleryItems.length
            );

            console.log(
                "ELGIN: Final image:",
                imageURL
            );

        })


        /* ======================================================
           ERROR HANDLING
           ====================================================== */

        .catch(function (error) {

            console.error(
                "ELGIN Gallery Feature:",
                error
            );

            container.innerHTML = `

                <p style="
                    font-size: 12px;
                    margin: 0;
                ">
                    ELGIN Gallery Feature Error:
                    ${error.message}
                </p>

            `;

        });

})();
