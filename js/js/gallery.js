/*
============================================================

    gallery.js
    ELGIN Core v1.0.0
    Shared gallery renderer

============================================================

    Responsibilities

    • Load artwork collection
    • Build gallery layout
    • Render artwork cards

============================================================
*/

const Gallery = {

    /******************************************************
     * ENTRY POINT
     ******************************************************/

    async initialize(){

        const element =
            document.querySelector(".elgin-gallery");

        if(!element){

            return;

        }
      const artworks =
    this.sortCollection(

        await this.loadCollection()

    );

this.buildGallery(
    element,
    artworks
);

    },


    /******************************************************
     * LOAD COLLECTION
     ******************************************************/

    async loadCollection(){

        try{

            const response =
                await fetch(
                    "https://cwelgin.github.io/elgin-site/data/artworks.json"
                );

            if(!response.ok){

                throw new Error(
                    "Unable to load artworks."
                );

            }

            return await response.json();

        }

        catch(error){

            console.error(
                "Unable to load artwork collection.",
                error
            );

            return [];

        }

    },
      /******************************************************
     * BUILD GALLERY
     ******************************************************/

    buildGallery(element, artworks){

        element.innerHTML = "";

        artworks.forEach(artwork=>{

            element.append(

                this.createCard(
                    artwork
                )

            );

        });

    },


    /******************************************************
     * CREATE CARD
     ******************************************************/

    createCard(artwork){

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "artwork-card";

        card.innerHTML = `
<a href="${artwork.url}">

    <img
        src="${artwork.thumbnail}"
        alt="${artwork.title}"
        loading="lazy">

    <h3>

        ${artwork.title}

    </h3>

    <p>

        ${artwork.medium}

    </p>

    <p>

        ${artwork.date}

    </p>

</a>

`;

        return card;

    },
      /******************************************************
     * SORT ARTWORKS
     ******************************************************/

    sortCollection(artworks){

        return artworks.sort(

            (a,b)=>

                (b.date || "").localeCompare(
                    a.date || ""
                )

        );

    }

};


/******************************************************
 * STARTUP
 ******************************************************/

document.addEventListener(

    "DOMContentLoaded",

    ()=>Gallery.initialize()

);
