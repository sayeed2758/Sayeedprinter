const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");

const previewArea = document.getElementById("previewArea");

const fileActions = document.getElementById("fileActions");

const removeBtn = document.getElementById("removeBtn");

const printBtn = document.getElementById("printBtn");


/* =========================
   FILE SELECT
========================= */

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        resetFile();
        return;
    }

    showFile(file);

});


/* =========================
   SHOW FILE
========================= */

function showFile(file) {

    fileInfo.style.display = "block";

    fileInfo.textContent =
        "File: " +
        file.name +
        " | Type: " +
        (file.type || "File");


    previewArea.innerHTML = "";


    /* IMAGE PREVIEW */

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        image.onload = function () {
            URL.revokeObjectURL(image.src);
        };

        previewArea.appendChild(image);

    }


    /* ACTION BUTTONS */

    fileActions.style.display = "flex";

}


/* =========================
   REMOVE FILE
========================= */

removeBtn.addEventListener("click", function () {

    resetFile();

});


function resetFile() {

    fileInput.value = "";

    fileInfo.textContent = "";

    fileInfo.style.display = "none";

    previewArea.innerHTML = "";

    fileActions.style.display = "none";

}


/* =========================
   PRINT
========================= */

printBtn.addEventListener("click", function () {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }


    /* IMAGE PRINT */

    if (file.type.startsWith("image/")) {

        const imageURL = URL.createObjectURL(file);

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Please allow pop-ups to print the file.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print - ${file.name}</title>

                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        text-align: center;
                        background: white;
                    }

                    img {
                        max-width: 100%;
                        height: auto;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }

                        img {
                            max-width: 100%;
                        }
                    }
                </style>
            </head>

            <body>

                <img src="${imageURL}">

                <script>
                    window.onload = function () {
                        window.print();
                    };
                <\/script>

            </body>
            </html>
        `);

        printWindow.document.close();

        return;
    }


    /* PDF PRINT */

    if (file.type === "application/pdf") {

        const pdfURL = URL.createObjectURL(file);

        const printWindow = window.open(pdfURL, "_blank");

        if (!printWindow) {
            alert("Please allow pop-ups to print the PDF.");
        }

        return;
    }


    alert("This file type cannot be printed directly.");

});
