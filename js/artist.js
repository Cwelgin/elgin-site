/*
============================================================

    artist.js
    ELGIN Core v3.0

============================================================
*/

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRVojs1qLtfQIp7KKv8Zdjz7f7ZmUAh1AEKa521ddmeaBjsSmFsIjtwvu5GRCX1anqcpLrXGbRf_POy/pub?gid=983448754&single=true&output=csv";

const Artist = {

    /******************************************************
     * ENTRY POINT
     ******************************************************/

    async initialize(){

        const element =
            document.querySelector(".artist");

        if(!element) return;

        const id =
            element.dataset.id
                ?.trim()
                .toUpperCase();

        if(!id){

            console.error(
                "Artist ID not found."
            );

            return;

        }

        try{

            const artist =
                await this.loadArtist(id);

            if(!artist){

                element.innerHTML =
                    "<p>Artist not found.</p>";

                return;

            }

            this.buildLayout(
                element,
                artist
            );

        }

        catch(error){

            console.error(error);

            element.innerHTML =
                "<p>Unable to load artist.</p>";

        }

    },



    /******************************************************
     * LOAD ARTIST
     ******************************************************/

    async loadArtist(id){

        const response =
            await fetch(SHEET_URL);

        if(!response.ok){

            throw new Error(
                `Unable to load spreadsheet (${response.status})`
            );

        }

        const csv =
            await response.text();

        const artists =
            this.parseCSV(csv);

        return artists.find(

            artist =>

                artist.id &&
                artist.id.trim().toUpperCase() === id

        );

    },



    /******************************************************
     * PARSE CSV
     ******************************************************/

    parseCSV(csv){

        const rows = [];

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

            const artist = {};

headers.forEach((header,index)=>{

    const key =
        header
            .trim()
            .toLowerCase()
            .replace(/^\uFEFF/, "")
            .replace(/[^a-z0-9]/g, "");

    artist[key] =
        values[index]
            ? values[index].trim()
            : "";

});

            rows.push(artist);

        });

        return rows;

    },



    /******************************************************
     * PARSE CSV ROW
     ******************************************************/

    parseCSVRow(row){

        const values = [];

        let value = "";

        let quoted = false;

        for(let i=0;i<row.length;i++){

            const char = row[i];

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

                values.push(value);

                value = "";

            }

            else{

                value += char;

            }

        }

        values.push(value);

        return values;

    },

/******************************************************
 * FORMAT DATE
 ******************************************************/

formatDate(date){

    if(!date) return "";

    const d = new Date(date);

    if(isNaN(d)) return date;

    return d.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long"
        }
    );

},


/******************************************************
 * BUILD PAGE
 ******************************************************/

buildLayout(element,artist){

    const years =

        artist.died

            ? `${artist.born}–${artist.died}`

            : `${artist.born}–`;

    element.innerHTML = `

<div class="artist-header">

    <div class="artist-image">

        <img
            src="${artist.image}"
            alt="${artist.name}">

        <p class="artist-updated">
            Last Updated: ${this.formatDate(artist.updated)}
        </p>

    </div>

    <div class="artist-info">

        <h1>

            ${artist.name}

        </h1>

        <div class="artist-years">

            ${years}

        </div>

        <div class="meta">

            ${this.row(
                "Nationality",
                artist.nationality
            )}

            ${this.row(
                "Genre",
                artist.genre
            )}

            ${this.row(
                "School",
                artist.school
            )}

            ${this.row(
                "Period",
                artist.period
            )}

            ${this.researchRow(artist)}

            ${this.representationRow(artist)}

        </div>

    </div>

</div>

`;

},
/******************************************************
 * RESEARCH ROW
 ******************************************************/

researchRow(artist){

    const score =
        parseInt(artist.research, 10) || 0;

    if(!score) return "";

    let level = "medium";

    if(score <= 2){

        level = "low";

    }

    else if(score >= 4){

        level = "high";

    }

    const dots =

        Array.from(
            {length:5},
            (_,index) => `

                <span
                    class="research-dot ${index < score ? level : ""}"
                ></span>

            `
        ).join("");

    return `
        <div class="meta-row">

            <div class="meta-label">
                Research
            </div>

            <div class="meta-value research-value">
                ${dots}
            </div>

        </div>
    `;

},
/******************************************************
 * METADATA ROW
 ******************************************************/

row(label,value){

    if(!value) return "";

    return `
        <div class="meta-row">

            <div class="meta-label">
                ${label}
            </div>

<div class="meta-value ${label.toLowerCase()}-value">
    ${value}
</div>

        </div>
    `;

},


/******************************************************
 * REPRESENTATION ROW
 ******************************************************/

representationRow(artist){

    if(!artist.representation) return "";

    let value = artist.representation;

    if(
        artist.representationUrl &&
        value.toLowerCase() !== "n/a"
    ){

        value = `
            <a
                href="${artist.representationUrl}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${artist.representation}
            </a>
        `;

    }

    return `
        <div class="meta-row">

            <div class="meta-label">
                Gallery
            </div>

            <div class="meta-value">
                ${value}
            </div>

        </div>
    `;
}

};

/******************************************************
 * STARTUP
 ******************************************************/

document.addEventListener(

    "DOMContentLoaded",

    () => Artist.initialize()

);
