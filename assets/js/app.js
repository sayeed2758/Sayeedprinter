const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const previewArea = document.getElementById("previewArea");

const fileActions = document.getElementById("fileActions");
const removeBtn = document.getElementById("removeBtn");
const printBtn = document.getElementById("printBtn");


/* =========================
   INITIAL STATE
========================= */

fileActions.style.display = "none";


/* =========================
   FILE SELECT
========================= */

fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {
        clearFile();
        return;
    }

    displayFile(file);

});


/* =========================
   DISPLAY FILE
========================= */

function displayFile(file) {

    fileInfo.style.display = "block";

    fileInfo.textContent =
        "File: " +
        file.name +
        " | Type: " +
        (file.type || "File");


    previewArea.innerHTML = "";


    /* IMAGE */

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        image.alt = file.name;

        previewArea.appendChild(image);

    }


    /* SHOW ACTION BUTTONS */

    fileActions.style.display = "flex";

}


/* =========================
   REMOVE FILE
========================= */

removeBtn.addEventListener("click", function (event) {

    event.preventDefault();

    fileInput.value = "";

    clearFile();

});


function clearFile() {

    fileInfo.textContent = "";

    fileInfo.style.display = "none";

    previewArea.innerHTML = "";

    fileActions.style.display = "none";

}


/* =========================
   PRINT FILE
========================= */

printBtn.addEventListener("click", function (event) {

    event.preventDefault();

    const file = fileInput.files[0];

    if (!file) {

        alert("Please select a file first.");

        return;
    }


    /* IMAGE PRINT */

    if (file.type.startsWith("image/")) {

        const imageURL = URL.createObjectURL(file);

        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


        if (!printWindow) {

            alert(
                "Popup blocked. Please allow popups for this website."
            );

            URL.revokeObjectURL(imageURL);

            return;
        }


        printWindow.document.open();

        printWindow.document.write(`
            <!DOCTYPE html>

            <html>

            <head>

                <title>${file.name}</title>

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 20px;
                        background: white;
                        text-align: center;
                    }

                    img {
                        max-width: 100%;
                        max-height: 95vh;
                        object-fit: contain;
                    }

                    @media print {

                        body {
                            padding: 0;
                        }

                        img {
                            max-width: 100%;
                            max-height: 100vh;
                        }

                    }

                </style>

            </head>

            <body>

                <img src="${imageURL}" alt="Print Preview">

                <script>

                    window.onload = function () {

                        setTimeout(function () {

                            window.print();

                        }, 300);

                    };

                <\/script>

            </body>

            </html>
        `);

        printWindow.document.close();

        return;
    }


    /* PDF */

    if (file.type === "application/pdf") {

        const pdfURL = URL.createObjectURL(file);

        const pdfWindow = window.open(
            pdfURL,
            "_blank"
        );


        if (!pdfWindow) {

            alert(
                "Popup blocked. Please allow popups for this website."
            );

        }

        return;
    }


    alert("This file type is not supported for printing.");

});
