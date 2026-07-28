const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRVojs1qLtfQIp7KKv8Zdjz7f7ZmUAh1AEKa521ddmeaBjsSmFsIjtwvu5GRCX1anqcpLrXGbRf_POy/pub?gid=0&single=true&output=csv";

/*
============================================================

    artwork.js
    ELGIN Core v2.0.0
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

    const id =
        element.dataset.id;

    if(!id){

        console.error(
            "Artwork ID not found."
        );

        return;

    }

let artwork;

try{

    artwork =
        await this.loadArtwork(id);

}

catch(error){

    console.error(error);

    return;

}

    if(!artwork){

        console.error(
            `Artwork ${id} not found.`
        );

        return;

    }

    this.buildLayout(
        element,
        artwork
    );

    this.renderMetadata(

        element.querySelector(".meta"),

        artwork

    );

    await this.loadHeroImage(

        element.querySelector(
            ".artwork-image"
        )

    );

},

async loadArtwork(id){

    const response =
        await fetch(SHEET_URL);

    if(!response.ok){

        throw new Error(
            "Unable to load artwork spreadsheet."
        );

    }

    const csv =
        await response.text();

    const rows =
        this.parseCSV(csv);

return rows.find(

    artwork =>

        artwork.id.trim().toUpperCase() ===
        id.trim().toUpperCase()

);

},


parseCSV(csv){

    const lines =
        csv.trim().split("\n");

    const headers =
        lines.shift().split(",");

    return lines.map(line=>{

        const values =
            line.split(",");

        const artwork = {};

        headers.forEach((header,index)=>{

            artwork[
                header.trim()
            ] =
                values[index]?.trim() || "";

        });

        artwork.dimensions =

            artwork.width && artwork.height

                ? `${artwork.width}" × ${artwork.height}"`

                : "";

artwork.date =

    artwork.startDate &&
    artwork.endDate

        ? `${artwork.startDate} – ${artwork.endDate}`

        : artwork.startDate;

        return artwork;

    });

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

        
    </div>

</div>

`;

        if(
            !document.querySelector(
                ".artwork-lightbox"
            )
        ){

            document.body.insertAdjacentHTML(

                "beforeend",

                `

<div class="artwork-lightbox">

    <div class="artwork-close">

        &times;

    </div>

    <img>

</div>

`

            );

        }

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

                console.warn(
                    "No gallery image found."
                );

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

    initializeLightbox(image, source){

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

        if(!overlay.dataset.initialized){

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

            overlay.dataset.initialized =
                "true";

        }

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

    }

};


/******************************************************
 * STARTUP
 ******************************************************/

document.addEventListener(

    "DOMContentLoaded",

    ()=>Artwork.initialize()

);
