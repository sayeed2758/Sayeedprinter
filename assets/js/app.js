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


    /* =========================
       IMAGE PREVIEW
    ========================= */

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        image.onload = function () {
            URL.revokeObjectURL(image.src);
        };

        previewArea.appendChild(image);

    }


    /* =========================
       PDF PREVIEW
    ========================= */

    else if (file.type === "application/pdf") {

        const pdfURL = URL.createObjectURL(file);

        const pdfFrame = document.createElement("iframe");

        pdfFrame.src = pdfURL;

        pdfFrame.title = "PDF Preview";

        pdfFrame.className = "pdf-preview";

        previewArea.appendChild(pdfFrame);

    }


    /* =========================
       UNSUPPORTED FILE
    ========================= */

    else {

        previewArea.innerHTML = `
            <div class="unsupported-file">
                This file type cannot be previewed.
            </div>
        `;

    }


    /* =========================
       ACTION BUTTONS
    ========================= */

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

/* =========================
   PDF PRINT
========================= */

if (file.type === "application/pdf") {

    if (typeof pdfjsLib === "undefined") {
        alert("PDF printing library could not be loaded.");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups to print the PDF.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preparing PDF for Print...</title>

            <style>
                body {
                    margin: 0;
                    padding: 30px;
                    background: #ffffff;
                    text-align: center;
                    font-family: Arial, sans-serif;
                }

                .print-page {
                    display: block;
                    width: 100%;
                    max-width: 794px;
                    margin: 0 auto 20px;
                    page-break-after: always;
                }

                .print-page img {
                    display: block;
                    width: 100%;
                    height: auto;
                    margin: 0 auto;
                }

                .loading {
                    font-size: 20px;
                    color: #475569;
                    padding: 40px 20px;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                    .print-page {
                        width: 100%;
                        max-width: none;
                        margin: 0;
                        page-break-after: always;
                    }

                    .print-page img {
                        width: 100%;
                        height: auto;
                    }

                    .loading {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>

            <div class="loading">
                Preparing PDF for printing...
            </div>

        </body>
        </html>
    `);

    printWindow.document.close();

    const loading = printWindow.document.querySelector(".loading");

    const fileReader = new FileReader();

    fileReader.onload = async function () {

        try {

            const typedArray = new Uint8Array(this.result);

            const pdf = await pdfjsLib.getDocument({
                data: typedArray
            }).promise;

            const pages = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                const page = await pdf.getPage(pageNumber);

                const viewport = page.getViewport({
                    scale: 1.5
                });

                const canvas = printWindow.document.createElement("canvas");

                const context = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const imageURL = canvas.toDataURL("image/png");

                pages.push(imageURL);
            }

            loading.remove();

            pages.forEach(function (imageURL) {

                const pageContainer =
                    printWindow.document.createElement("div");

                pageContainer.className = "print-page";

                const image =
                    printWindow.document.createElement("img");

                image.src = imageURL;

                pageContainer.appendChild(image);

                printWindow.document.body.appendChild(pageContainer);

            });

            const images =
                printWindow.document.querySelectorAll(".print-page img");

            let loadedImages = 0;

            images.forEach(function (image) {

                image.onload = function () {

                    loadedImages++;

                    if (loadedImages === images.length) {

                        setTimeout(function () {
                            printWindow.focus();
                            printWindow.print();
                        }, 300);

                    }

                };

            });

            if (images.length === 0) {

                printWindow.close();

                alert("The PDF does not contain printable pages.");

            }

        } catch (error) {

            console.error("PDF print error:", error);

            printWindow.document.body.innerHTML = `
                <div style="
                    font-family:Arial;
                    text-align:center;
                    padding:40px;
                ">
                    <h2>Unable to prepare PDF for printing</h2>
                    <p>Please try the PDF again.</p>
                </div>
            `;

        }

    };

    fileReader.onerror = function () {

        printWindow.close();

        alert("Unable to read the PDF file.");

    };

    fileReader.readAsArrayBuffer(file);

    return;
}
   
