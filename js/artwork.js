const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRVojs1qLtfQIp7KKv8Zdjz7f7ZmUAh1AEKa521ddmeaBjsSmFsIjtwvu5GRCX1anqcpLrXGbRf_POy/pub?gid=0&single=true&output=csv";


/*
============================================================
    artwork.js
    ELGIN Core v3.1.0
    Shared artwork renderer
============================================================
*/


/* ==========================================================
   SOCIAL ICON CONFIGURATION
   ==========================================================

   The spreadsheet contains the destination URL for each
   artwork.

   These six values contain the actual icon image URLs.

   Leave blank until the official icon assets are ready.
   ========================================================== */

const SOCIAL_ICONS = {

    instagram:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/b5725b5b-f048-4f6d-a5c0-d6eaff563415/Instagram_icon.png?content-type=image%2Fpng",

    facebook:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/af0d0641-99bb-4818-b3a3-60f1173ed15f/Facebook_logo_%28square%29.png?content-type=image%2Fpng",

    pinterest:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/e73f62cc-cda8-4e06-a463-1b4a7bd99a24/Pinterest.svg.webp?content-type=image%2Fwebp",

    cara:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/414229ef-f40c-492a-b79a-7dce8b0c1713/Cara-app-logo-square.svg.webp?content-type=image%2Fwebp",

    bluesky:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/b5d74408-e6cf-4d0a-a34f-f87216adeb9a/Bluesky_Logo.svg.webp?content-type=image%2Fwebp",

    flickr:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/91384811-5bd7-4298-acdd-28edb40b7f06/Antu_flickr.svg.webp?content-type=image%2Fwebp",

    youtube:
        "https://cdn.simpleicons.org/youtube",

    tumblr:
        "https://images.squarespace-cdn.com/content/55c198cce4b054daaf17f596/b5725b5b-f048-4f6d-a5c0-d6eaff563415/Instagram_icon.png?content-type=image%2Fpng"

};


/* ==========================================================
   ARTWORK
   ========================================================== */

const Artwork = {


    /******************************************************
     * ENTRY POINT
     ******************************************************/

    async initialize(){

        const element =
            document.querySelector(".artwork");


        if(!element) return;


        const id =
            element.dataset.id?.trim();


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


        /* --------------------------------------------------
           BUILD PAGE
           -------------------------------------------------- */

        this.buildLayout(
            element,
            artwork
        );


        /* --------------------------------------------------
           RENDER METADATA
           -------------------------------------------------- */

        this.renderMetadata(

            element.querySelector(".meta"),

            artwork

        );


        /* --------------------------------------------------
           RENDER SOCIAL LINKS
           -------------------------------------------------- */

        this.renderSocialLinks(

            element.querySelector(".artwork-social"),

            artwork

        );


        /* --------------------------------------------------
           LOAD HERO IMAGE
           -------------------------------------------------- */

        await this.loadHeroImage(

            element.querySelector(
                ".artwork-image"
            )

        );

    },


    /******************************************************
     * LOAD ARTWORK
     ******************************************************/

    async loadArtwork(id){

        const response =
            await fetch(SHEET_URL);


        if(!response.ok){

            throw new Error(
                "Unable to load spreadsheet."
            );

        }


        const csv =
            await response.text();


        const rows =
            this.parseCSV(csv);


        return rows.find(

            artwork =>

                artwork.id &&

                artwork.id.trim().toUpperCase() ===

                id.trim().toUpperCase()

        );

    },


    /******************************************************
     * PARSE CSV
     ******************************************************/

    parseCSV(csv){

        const rows =
            [];


        const lines =
            csv.trim().split(/\r?\n/);


        const headers =
            this.parseCSVRow(

                lines.shift()

            );


        lines.forEach(line=>{

            if(!line.trim()) return;


            const values =
                this.parseCSVRow(line);


            const artwork =
                {};


            headers.forEach((header,index)=>{

                artwork[
                    header.trim()
                ] =
                    values[index]?.trim() || "";

            });


            /* --------------------------------------------------
               DIMENSIONS
               -------------------------------------------------- */

            artwork.dimensions =

                artwork.width &&
                artwork.height

                    ? `${artwork.width}" × ${artwork.height}"`

                    : "";


            /* --------------------------------------------------
               DATE
               -------------------------------------------------- */

            artwork.date =

                this.formatDate(

                    artwork.startDate,

                    artwork.endDate,

                    artwork.status

                );


            rows.push(
                artwork
            );

        });


        return rows;

    },


    /******************************************************
     * PARSE CSV ROW
     ******************************************************/

    parseCSVRow(row){

        const values =
            [];


        let value =
            "";


        let quoted =
            false;


        for(
            let i = 0;
            i < row.length;
            i++
        ){

            const char =
                row[i];


            if(char === '"'){

                if(

                    quoted &&
                    row[i + 1] === '"'

                ){

                    value += '"';

                    i++;

                }

                else{

                    quoted =
                        !quoted;

                }

            }


            else if(

                char === "," &&
                !quoted

            ){

                values.push(
                    value
                );


                value =
                    "";

            }


            else{

                value += char;

            }

        }


        values.push(
            value
        );


        return values;

    },


    /******************************************************
     * FORMAT DATE
     ******************************************************/

    formatDate(start,end){

        const months = [

            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"

        ];


        const format = value=>{

            if(!value){

                return "";

            }


            const [
                year,
                month
            ] =
                value.split("-");


            return `${months[Number(month)-1]} ${year}`;

        };


        const startText =
            format(start);


        const endText =
            format(end);


        return [

            startText,

            "–",

            endText

        ].join(" ");

    },


    /******************************************************
     * BUILD LAYOUT
     ******************************************************/

    buildLayout(element, artwork){

        element.innerHTML = `

<div class="artwork-header">

    <div class="artwork-image-column">

        <div class="artwork-image"></div>

        <div
            class="artwork-social"
            aria-label="External artwork links">
        </div>

    </div>


    <div class="artwork-info">

        <h1>${artwork.title}</h1>

        <div class="meta"></div>

    </div>

</div>

`;


        /* --------------------------------------------------
           CREATE LIGHTBOX
           -------------------------------------------------- */

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

            [
                "atlas",
                "ATLAS"
            ],

            [
                "regime",
                "RÉGIME"
            ],

            [
                "medium",
                "MEDIUM"
            ],

            [
                "dimensions",
                "DIMENSIONS"
            ],

            [
                "date",
                "DATE"
            ],

            [
                "status",
                "STATUS"
            ]

        ];


        fields.forEach(
            ([key,label])=>{

                const value =
                    artwork[key];


                if(!value) return;


                const display =

                    key === "status"

                        ?

                        `<span class="status ${value.toLowerCase().replace(/\s+/g,"-")}">${value}</span>`

                        :

                        value;


                container.insertAdjacentHTML(

                    "beforeend",

                    `

<div class="meta-row">

    <div class="meta-label">

        ${label}

    </div>

    <div class="meta-value">

        ${display}

    </div>

</div>

`

                );

            }

        );

    },


    /******************************************************
     * RENDER SOCIAL LINKS
     ******************************************************/

    renderSocialLinks(container, artwork){

        if(!container) return;


        const platforms = [

            {
                key: "instagram",
                label: "Instagram",
                icon: SOCIAL_ICONS.instagram
            },

            {
                key: "facebook",
                label: "Facebook",
                icon: SOCIAL_ICONS.facebook
            },

            {
                key: "pinterest",
                label: "Pinterest",
                icon: SOCIAL_ICONS.pinterest
            },

            {
                key: "cara",
                label: "Cara",
                icon: SOCIAL_ICONS.cara
            },

            {
                key: "bluesky",
                label: "Bluesky",
                icon: SOCIAL_ICONS.bluesky
            },

            {
                key: "flickr",
                label: "Flickr",
                icon: SOCIAL_ICONS.flickr
            },
            {
                key: "youtube",
                label: "youtube",
                icon: SOCIAL_ICONS.youtube
            },
            {
                key: "tumblr",
                label: "tumblr",
                icon: SOCIAL_ICONS.tumblr
            }

        ];


        platforms.forEach(platform=>{


            /* --------------------------------------------------
               NO ARTWORK URL = NO ICON
               -------------------------------------------------- */

            const url =
                artwork[platform.key];


            if(!url) return;


            /* --------------------------------------------------
               NO ICON ASSET YET = DON'T RENDER
               -------------------------------------------------- */

            if(!platform.icon){

                console.warn(

                    `Icon asset not configured for ${platform.label}.`

                );

                return;

            }


            /* --------------------------------------------------
               CREATE LINK
               -------------------------------------------------- */

            const link =
                document.createElement("a");


            link.className =
                `artwork-social-link artwork-social-${platform.key}`;


            link.href =
                url;


            link.target =
                "_blank";


            link.rel =
                "noopener noreferrer";


            link.setAttribute(

                "aria-label",

                `View on ${platform.label}`

            );


            link.title =
                platform.label;


            /* --------------------------------------------------
               CREATE ICON
               -------------------------------------------------- */

            const image =
                document.createElement("img");


            image.src =
                platform.icon;


            image.alt =
                "";


            image.loading =
                "lazy";


            image.setAttribute(

                "aria-hidden",

                "true"

            );


            /* --------------------------------------------------
               ADD ICON TO LINK
               -------------------------------------------------- */

            link.append(
                image
            );


            container.append(
                link
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


            if(!response.ok){

                throw new Error(

                    "Unable to load page."

                );

            }


            const html =
                await response.text();


            const doc =
                new DOMParser().parseFromString(

                    html,

                    "text/html"

                );


            const images =

                [

                    ...doc.querySelectorAll(

                        ".image-slide-anchor"

                    )

                ].map(

                    image =>
                        image.href

                );


            if(!images.length){

                console.warn(

                    "No gallery images found."

                );

                return;

            }


            const source =
                images.at(-1);


            const img =
                document.createElement(
                    "img"
                );


            img.src =
                source;


            img.loading =
                "eager";


            img.decoding =
                "async";


            container.append(
                img
            );


            this.initializeLightbox(

                img,

                source

            );

        }


        catch(error){

            console.error(error);

        }

    },


    /******************************************************
     * LIGHTBOX
     ******************************************************/

    initializeLightbox(image,source){

        const overlay =
            document.querySelector(

                ".artwork-lightbox"

            );


        if(!overlay) return;


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


        if(

            !overlay.dataset.initialized

        ){

            overlay.dataset.initialized =
                "true";


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


        image.addEventListener(

            "click",

            ()=>{

                large.src =
                    source;


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


/* ==========================================================
   STARTUP
   ========================================================== */

window.Artwork = Artwork;


if(document.readyState === "loading"){

    document.addEventListener(

        "DOMContentLoaded",

        ()=>Artwork.initialize()

    );

}
else{

    Artwork.initialize();

}
