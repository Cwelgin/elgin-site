const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRVojs1qLtfQIp7KKv8Zdjz7f7ZmUAh1AEKa521ddmeaBjsSmFsIjtwvu5GRCX1anqcpLrXGbRf_POy/pub?gid=0&single=true&output=csv";

/*
============================================================

    artwork.js
    ELGIN Core v3.0.0

============================================================
*/

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

            artwork.dimensions =

                artwork.width &&
                artwork.height

                    ? `${artwork.width}" × ${artwork.height}"`

                    : "";

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

        let value = "";

        let quoted = false;

        for(let i=0;i<row.length;i++){

            const char =
                row[i];

            if(char === '"'){

                if(

                    quoted &&
                    row[i+1] === '"'

                ){

                    value += '"';

                    i++;

                }

                else{

                    quoted = !quoted;

                }

            }

            else if(

                char === "," &&
                !quoted

            ){

                values.push(
                    value
                );

                value = "";

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
/******************************************************
 * FORMAT DATE
 ******************************************************/

formatDate(start,end){

    const months = [

        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"

    ];

    const format = value=>{

        if(!value){

            return "";

        }

        const [year,month] = value.split("-");

        return `${months[Number(month)-1]} ${year}`;

    };

    const startText = format(start);
    const endText   = format(end);

    if(startText && endText){

        return `${startText} – ${endText}`;

    }

    return startText || endText;

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

            ["atlas","ATLAS"],
            ["regime","RÉGIME"],
            ["medium","MEDIUM"],
            ["dimensions","DIMENSIONS"],
            ["date","DATE"],
            ["status","STATUS"]

        ];

        fields.forEach(([key,label])=>{

            const value =
                artwork[key];

            if(!value) return;

            const display =

                key === "status"

                    ? `<span class="status ${value.toLowerCase().replace(/\s+/g,"-")}">${value}</span>`

                    : value;

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

                    image=>image.href

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

            img.src = source;

            img.loading = "eager";

            img.decoding = "async";

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
                        event.target===overlay
                    ){

                        close();

                    }

                }

            );

            document.addEventListener(

                "keydown",

                event=>{

                    if(
                        event.key==="Escape"
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


/******************************************************
 * STARTUP
 ******************************************************/

document.addEventListener(

    "DOMContentLoaded",

    ()=>Artwork.initialize()

);   
    
    
