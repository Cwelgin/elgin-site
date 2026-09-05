(function () {

    const script = document.currentScript;
    const container = script.previousElementSibling;

    if (!container ||
        !container.classList.contains("elgin-gallery-feature")) {
        console.error("ELGIN: Feature container not found.");
        return;
    }

    const sourcePage = container.getAttribute("data-source");
    const text = container.innerHTML;

    if (!sourcePage) {
        console.error("ELGIN: No data-source specified.");
        return;
    }

    const CSS = `

        .elgin-gallery-feature {
            width: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .elgin-feature-inner {
            width: 100%;
            height: 360px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            border: 1px solid #d8d8d8;
            box-sizing: border-box;
        }

        .elgin-feature-image-wrap {
            width: 100%;
            height: 358px;
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
            height: 358px;
            padding: 40px 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
            border-left: 1px solid #d8d8d8;
        }

        .elgin-feature-text p {
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }

        .elgin-feature-text a {
            display: inline-block;
            margin-top: 22px;
            text-decoration: none;
            font-size: 12px;
            letter-spacing: .10em;
            text-transform: uppercase;
        }

        .elgin-feature-text a:hover {
            text-decoration: underline;
        }

        @media screen and (max-width: 767px) {

            .elgin-feature-inner {
                height: auto;
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
                height: auto;
                padding: 35px 30px;
                border-left: none;
            }

        }

    `;

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    container.style.visibility = "hidden";

    fetch(sourcePage)

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Could not load source page.");
            }

            return response.text();

        })

        .then(function (html) {

            const doc =
                new DOMParser().parseFromString(
                    html,
                    "text/html"
                );

            const gallery =
                doc.querySelector(
                    ".sqs-gallery-container .sqs-gallery"
                );

            if (!gallery) {
                throw new Error("Gallery not found.");
            }

            const items =
                gallery.querySelectorAll(
                    ".sqs-gallery-design-grid-slide, .slide"
                );

            if (!items.length) {
                throw new Error("No gallery images found.");
            }

            const finalItem =
                items[items.length - 1];

            const image =
                finalItem.querySelector("img");

            if (!image) {
                throw new Error("Final gallery image not found.");
            }

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
                                source.trim().split(/\s+/);

                            return {
                                url: parts[0],
                                width:
                                    parseInt(parts[1], 10) || 0
                            };

                        })
                        .sort(function (a, b) {
                            return b.width - a.width;
                        });

                if (sources.length) {
                    imageURL = sources[0].url;
                }

            }

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

                        ${text}

                    </div>

                </div>

            `;

            container.style.visibility = "visible";

        })

        .catch(function (error) {

            console.error(
                "ELGIN Gallery Feature:",
                error
            );

            container.innerHTML = "";

            container.style.visibility = "visible";

        });

})();
