/*
============================================================

    artwork.js
    ELGIN Core v1.0.0
    Shared artwork renderer

============================================================

    Responsibilities

    • Read artwork metadata
    • Build artwork layout
    • Render metadata
    • Load hero image
    • Initialize lightbox

============================================================
*/

const Artwork = {

    /******************************************************
     * ENTRY POINT
     ******************************************************/

    async initialize(){

        const element =
            document.querySelector(".artwork");

        if(!element){

            return;

        }

        const artwork =
            this.readMetadata(element);

        this.buildLayout(
            element,
            artwork
        );

        this.renderMetadata(
            element.querySelector(".meta"),
            artwork
        );

        await this.loadHeroImage(
            element.querySelector(".artwork-image")
        );

    },


    /******************************************************
     * READ METADATA
     ******************************************************/

    readMetadata(element){

        const json =
            element.querySelector(
                'script[type="application/json"]'
            );

        if(!json){

            console.error(
                "Artwork metadata not found."
            );

            return this.defaultMetadata();

        }

        let artwork;

        try{

            artwork =
                JSON.parse(
                    json.textContent
                );

        }

        catch(error){

            console.error(
                "Invalid artwork metadata.",
                error
            );

            return this.defaultMetadata();

        }

        return {

            id:
                artwork.id || "",

            series:
                artwork.series || "",

            title:
                artwork.title || "",

            atlas:
                artwork.atlas || "",

            regime:
                artwork.regime || "",

            medium:
                artwork.medium || "",

            dimensions:
                artwork.dimensions || "",

            date:
                artwork.date || "",

            statement:
                artwork.statement || ""

        };

    },


    /******************************************************
     * DEFAULT METADATA
     ******************************************************/

    defaultMetadata(){

        return {

            id:"",
            series:"",
            title:"",
            atlas:"",
            regime:"",
            medium:"",
            dimensions:"",
            date:"",
            statement:""

        };

    },
        /******************************************************
     * BUILD LAYOUT
     ******************************************************/

    buildLayout(element, artwork){

        element.innerHTML = `

<div class="artwork-header">

    <div class="artwork-image"></div>

    <div class="artwork-info">

        <h1>${artwork.title}</h1>

        <div class="meta"></div>

        ${
            artwork.statement
                ? `
        <div class="statement">

            ${artwork.statement}

        </div>
        `
                : ""
        }

    </div>

</div>

<div class="artwork-lightbox">

    <div class="artwork-close">

        &times;

    </div>

    <img>

</div>

`;

    },


    /******************************************************
     * RENDER METADATA
     ******************************************************/

    renderMetadata(container, artwork){

        const fields = [

            ["atlas","Atlas"],
            ["regime","Régime"],
            ["medium","Medium"],
            ["dimensions","Dimensions"],
            ["date","Date"]

        ];

        fields.forEach(([key,label])=>{

            const value =
                artwork[key];

            if(!value){

                return;

            }

            container.insertAdjacentHTML(

                "beforeend",

                `
<p>

    <strong>${label}</strong>

    ${value}

</p>
`

            );

        });

    },
        /******************************************************
     * LOAD HERO IMAGE
     ******************************************************/

    async loadHeroImage(container){

        try{

            const response =
                await fetch(
                    window.location.pathname
                );

            const html =
                await response.text();

            const doc =
                new DOMParser().parseFromString(
                    html,
                    "text/html"
                );

            const images = [

                ...doc.querySelectorAll(
                    ".image-slide-anchor"
                )

            ].map(anchor=>anchor.href);

            if(!images.length){

                return;

            }

            const source =
                images.at(-1);

            const image =
                document.createElement(
                    "img"
                );

            image.src = source;

            image.loading = "eager";

            image.decoding = "async";

            container.append(
                image
            );

            this.initializeLightbox(
                image,
                source
            );

        }

        catch(error){

            console.error(

                "Unable to load artwork image.",

                error

            );

        }

    },


    /******************************************************
     * INITIALIZE LIGHTBOX
     ******************************************************/

    initializeLightbox(image,source){

        const overlay =
            document.querySelector(
                ".artwork-lightbox"
            );

        if(!overlay){

            return;

        }

        const large =
            overlay.querySelector(
                "img"
            );

        const close = ()=>{

            overlay.classList.remove(
                "open"
            );

            document.body.classList.remove(
                "artwork-lightbox-open"
            );

        };

        image.addEventListener(

            "click",

            ()=>{

                large.src = source;

                overlay.classList.add(
                    "open"
                );

                document.body.classList.add(
                    "artwork-lightbox-open"
                );

            }

        );

        overlay
            .querySelector(
                ".artwork-close"
            )
            .addEventListener(
                "click",
                close
            );

        overlay.addEventListener(

            "click",

            event=>{

                if(
                    event.target === overlay
                ){

                    close();

                }

            }

        );

        document.addEventListener(

            "keydown",

            event=>{

                if(
                    event.key === "Escape"
                ){

                    close();

                }

            }

        );

    }

};


/******************************************************
 * STARTUP
 ******************************************************/

document.addEventListener(

    "DOMContentLoaded",

    ()=>Artwork.initialize()

);
