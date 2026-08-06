/*
============================================================

    artist.js
    ELGIN Core v1.2.0

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
            element.dataset.id?.trim().toUpperCase();

        if(!id){

            console.error("Artist ID not found.");

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
                `Unable to load artist spreadsheet. HTTP ${response.status}`
            );

        }

        const csv =
            await response.text();

        const rows =
            this.parseCSV(csv);

        return rows.find(

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

                artist[
                    header.trim()
                ] =
                    values[index]?.trim() || "";

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

        const months = [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"

        ];

        const [year,month] =
            date.split("-");

        return `${months[Number(month)-1]} ${year}`;

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
                "Movement",
                artist.movement
            )}

            ${this.row(
                "Genre",
                artist.genre
            )}

            ${this.row(
                "Period",
                artist.period
            )}

        </div>

        <p class="artist-updated">
        Last updated ${this.formatDate(artist.updated)}.
        </p>

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

    ()=>Artist.initialize()

);
