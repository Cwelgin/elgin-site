/*
    artwork.js
    Shared artwork rendering library for cliffelgin.com
*/

const Artwork = {

    async init(){

        const element =
            document.querySelector(".artwork");

        if(!element) return;

        const artwork =
            this.read(element);

        this.build(element, artwork);

        this.renderMetadata(
            element.querySelector(".meta"),
            artwork
        );

        await this.loadHeroImage(
            element.querySelector(".artwork-image")
        );

    },


    read(element){

        const json =
            element.querySelector(
                'script[type="application/json"]'
            );

        if(!json){

            return {};

        }

        try{

            return JSON.parse(
                json.textContent
            );

        }

        catch(error){

            console.error(
                "Invalid artwork JSON",
                error
            );

            return {};

        }

    },


    build(element, artwork){

        element.innerHTML = `

<div class="artwork-header">

    <div class="artwork-image"></div>

    <div class="artwork-info">

        <h1>${artwork.title || ""}</h1>

        <div class="meta"></div>

        ${
            artwork.statement
            ? `<div class="statement">${artwork.statement}</div>`
            : ""
        }

    </div>

</div>

<div class="artwork-lightbox">

    <div class="artwork-close">&times;</div>

    <img>

</div>

`;

    },


    renderMetadata(container, artwork){

        const fields = [

            ["atlas","Atlas"],
            ["regime","Régime"],
            ["medium","Medium"],
            ["dimensions","Dimensions"],
            ["date","Date"]

        ];

        fields.forEach(([key,label])=>{

            if(!artwork[key]) return;

            container.insertAdjacentHTML(

                "beforeend",

                `
                <p>
                    <strong>${label}</strong>
                    ${artwork[key]}
                </p>
                `

            );

        });

    },


    async loadHeroImage(container){

        try{

            const response =
                await fetch(window.location.pathname);

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

            ].map(a=>a.href);

            if(!images.length) return;

            const src =
                images.at(-1);

            const img =
                document.createElement("img");

            img.src = src;

            container.append(img);

            this.setupLightbox(
                img,
                src
            );

        }

        catch(error){

            console.error(
                error
            );

        }

    },


    setupLightbox(image, src){

        const overlay =
            document.querySelector(
                ".artwork-lightbox"
            );

        const large =
            overlay.querySelector("img");

        const close = ()=>{

            overlay.classList.remove(
                "open"
            );

            document.body.classList.remove(
                "artwork-lightbox-open"
            );

        };

        image.onclick = ()=>{

            large.src = src;

            overlay.classList.add(
                "open"
            );

            document.body.classList.add(
                "artwork-lightbox-open"
            );

        };

        overlay.querySelector(
            ".artwork-close"
        ).onclick = close;

        overlay.onclick = e=>{

            if(e.target===overlay){

                close();

            }

        };

        document.addEventListener(

            "keydown",

            e=>{

                if(e.key==="Escape"){

                    close();

                }

            }

        );

    }

};


document.addEventListener(

    "DOMContentLoaded",

    ()=>Artwork.init()

);
