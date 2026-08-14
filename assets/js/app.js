const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const previewArea = document.getElementById("previewArea");
const fileActions = document.getElementById("fileActions");
const removeBtn = document.getElementById("removeBtn");
const printBtn = document.getElementById("printBtn");

const printAnimation = document.getElementById("printAnimation");
const printAnimationTitle = document.getElementById("printAnimationTitle");
const printAnimationSubtitle = document.getElementById("printAnimationSubtitle");
const printAnimationStatus = document.getElementById("printAnimationStatus");
const printAnimationCard = document.querySelector(".print-animation-card");

const WATERMARK_TEXT = "Made By Shahid Sir";

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

        image.alt = file.name || "Uploaded image";

        previewArea.appendChild(image);
    }

    /* PDF PREVIEW */

    else if (file.type === "application/pdf") {
        const pdfURL = URL.createObjectURL(file);

        const pdfFrame = document.createElement("iframe");

        pdfFrame.src = pdfURL;
        pdfFrame.title = "PDF Preview";
        pdfFrame.className = "pdf-preview";

        previewArea.appendChild(pdfFrame);
    }

    /* UNSUPPORTED FILE */

    else {
        previewArea.innerHTML = `
            <div class="unsupported-file">
                This file type cannot be previewed or printed
                with this version.
            </div>
        `;
    }

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
   PRINT ANIMATION UI
========================= */

function startPrintAnimation() {
    printAnimationCard.classList.remove("success", "error");

    printAnimationTitle.textContent = "Receipt print";
    printAnimationSubtitle.textContent = "Animation";
    printAnimationStatus.textContent = "Starting printer...";

    printAnimation.classList.add("is-active");
    printAnimation.setAttribute("aria-hidden", "false");
}

function setPrintAnimationStatus(status) {
    printAnimationStatus.textContent = status;
}

function finishPrintAnimation(success = true) {
    printAnimationCard.classList.toggle("success", success);
    printAnimationCard.classList.toggle("error", !success);

    printAnimationTitle.textContent = success
        ? "Print ready"
        : "Print failed";

    printAnimationSubtitle.textContent = success
        ? "Watermark added to every printed page"
        : "Please try again";
}

/* =========================
   PRINT
========================= */

printBtn.addEventListener("click", async function () {
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    if (
        !file.type.startsWith("image/") &&
        file.type !== "application/pdf"
    ) {
        alert("This file type cannot be printed directly.");
        return;
    }

    startPrintAnimation();
    printBtn.disabled = true;

    let printWindow = null;

    try {
        /*
         * Open immediately from the user's click.
         * This reduces the chance of popup blocking.
         */
        printWindow = window.open("", "_blank");

        if (!printWindow) {
            throw new Error(
                "Popup blocked. Please allow pop-ups for this website."
            );
        }

        writePrintLoadingPage(printWindow, file.name);

        setPrintAnimationStatus("Paper is feeding...");

        await wait(2300);

        setPrintAnimationStatus("Preparing your document...");

        if (file.type.startsWith("image/")) {
            await prepareImagePrint(printWindow, file);
        } else {
            await preparePdfPrint(printWindow, file);
        }

        setPrintAnimationStatus("Opening print dialog...");

        finishPrintAnimation(true);

        /*
         * Let the print window finish layout/decoding before printing.
         */
        await wait(350);

        printWindow.focus();
        printWindow.print();

    } catch (error) {
        console.error(error);

        finishPrintAnimation(false);

        setPrintAnimationStatus(
            error?.message || "Could not prepare the print."
        );

        if (printWindow && !printWindow.closed) {
            printWindow.document.body.innerHTML = `
                <div style="
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #b91c1c;
                ">
                    <h2>Print preparation failed</h2>
                    <p>${escapeHtml(error?.message || "Unknown error")}</p>
                </div>
            `;
        } else {
            alert(error?.message || "Could not prepare the print.");
        }

    } finally {
        printBtn.disabled = false;

        /*
         * Keep the animation visible briefly so the success/error state
         * is visible, then close it.
         */
        setTimeout(() => {
            printAnimation.classList.remove("is-active");
            printAnimation.setAttribute("aria-hidden", "true");
        }, 900);
    }
});

/* =========================
   PRINT WINDOW - LOADING
========================= */

function writePrintLoadingPage(printWindow, fileName) {
    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preparing Print - ${escapeHtml(fileName)}</title>

            <style>
                @page {
                    margin: 0;
                    size: auto;
                }

                html,
                body {
                    margin: 0;
                    min-height: 100%;
                    background: #ffffff;
                }

                body {
                    display: grid;
                    place-items: center;
                    font-family: Arial, sans-serif;
                    color: #111827;
                }

                .loading {
                    text-align: center;
                }

                .printer {
                    width: 280px;
                    height: 38px;
                    margin: 0 auto 28px;
                    border-radius: 8px;
                    background:
                        linear-gradient(
                            180deg,
                            #ffe0a3 0%,
                            #eeb968 42%,
                            #bc7b2b 72%,
                            #f4d18f 100%
                        );
                    box-shadow:
                        0 12px 24px rgba(148, 95, 22, 0.22);
                }

                .paper {
                    width: 190px;
                    height: 0;
                    margin: -6px auto 0;
                    background: #fff;
                    box-shadow:
                        0 14px 24px rgba(15, 23, 42, 0.13);
                    animation: feed 2.3s cubic-bezier(.2,.8,.25,1) forwards;
                }

                .status {
                    margin-top: 20px;
                    color: #64748b;
                    font-weight: 600;
                }

                @keyframes feed {
                    from {
                        height: 0;
                    }
                    to {
                        height: 240px;
                    }
                }

                @media print {
                    .loading {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>
            <div class="loading">
                <div class="printer"></div>
                <div class="paper"></div>
                <div class="status">
                    Preparing ${escapeHtml(fileName)}...
                </div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
}

/* =========================
   IMAGE PRINT
========================= */

async function prepareImagePrint(printWindow, file) {
    const imageURL = URL.createObjectURL(file);

    try {
        const image = await loadImage(imageURL);

        printWindow.document.open();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Print - ${escapeHtml(file.name)}</title>

                <style>
                    @page {
                        margin: 0;
                        size: auto;
                    }

                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                    }

                    .print-page {
                        position: relative;
                        width: 100%;
                        min-height: 100vh;
                        display: grid;
                        place-items: center;
                        padding: 24px;
                        page-break-after: always;
                        break-after: page;
                    }

                    .print-content {
                        max-width: 100%;
                        max-height: calc(100vh - 48px);
                        object-fit: contain;
                        display: block;
                    }

                    .watermark {
                        position: fixed;
                        left: 50%;
                        bottom: 10mm;
                        transform: translateX(-50%);
                        z-index: 20;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                        font-weight: 700;
                        letter-spacing: 0.3px;
                        color: rgba(17, 24, 39, 0.45);
                        white-space: nowrap;
                        pointer-events: none;
                    }

                    @media print {
                        .print-page {
                            min-height: 100vh;
                            padding: 10mm;
                        }

                        .print-content {
                            max-height: 95vh;
                        }
                    }
                </style>
            </head>

            <body>
                <section class="print-page">
                    <img
                        id="printImage"
                        class="print-content"
                        alt="${escapeHtml(file.name)}"
                    >

                    <div class="watermark">
                        ${escapeHtml(WATERMARK_TEXT)}
                    </div>
                </section>
            </body>
            </html>
        `);

        const printImage = printWindow.document.getElementById("printImage");

        printImage.src = image.src;

        await decodeImage(printImage);

        printWindow.document.title =
            "Print - " + file.name;

    } finally {
        URL.revokeObjectURL(imageURL);
    }
}

/* =========================
   PDF PRINT WITH WATERMARK
========================= */

async function preparePdfPrint(printWindow, file) {
    /*
     * PDF.js is loaded only when a PDF is actually printed.
     * The current PDF.js release is imported from jsDelivr dynamically.
     * This keeps the original page lightweight.
     */
    const pdfjsLib = await loadPdfJs();

    const data = new Uint8Array(
        await file.arrayBuffer()
    );

    const pdf = await pdfjsLib.getDocument({
    data
}).promise;

    const renderedPages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        /*
         * A bounded render scale keeps the print output sharp without
         * creating unnecessarily huge canvases on mobile devices.
         */
        const baseViewport = page.getViewport({
            scale: 1
        });

        const maxDimension = 1700;

        const scale = Math.min(
            2.0,
            maxDimension /
                Math.max(
                    baseViewport.width,
                    baseViewport.height
                )
        );

        const viewport = page.getViewport({
            scale: Math.max(1.35, scale)
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
            alpha: false
        });

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        /*
         * PNG keeps text/lines cleaner than JPEG for typical documents.
         */
        renderedPages.push({
            dataUrl: canvas.toDataURL("image/png"),
            width: canvas.width,
            height: canvas.height
        });

        page.cleanup();
    }

    writePdfPrintDocument(
        printWindow,
        renderedPages,
        file.name
    );

    /*
     * Release the large canvas/image data from this temporary array.
     */
    renderedPages.length = 0;
}

/* =========================
   LOAD PDF.JS
========================= */

let pdfJsPromise = null;

function loadPdfJs() {
    if (pdfJsPromise) {
        return pdfJsPromise;
    }

    pdfJsPromise = import(
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.min.mjs"
    ).then((module) => {

        const pdfjsLib =
            module.default || module;

        /*
         * IMPORTANT:
         * PDF.js needs its worker file to render PDF pages.
         */
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs";

        return pdfjsLib;
    });

    return pdfJsPromise;
}



/* =========================
   WRITE PDF PRINT DOCUMENT
========================= */

function writePdfPrintDocument(
    printWindow,
    pages,
    fileName
) {
    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Print - ${escapeHtml(fileName)}</title>

            <style>
                @page {
                    margin: 0;
                    size: auto;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }

                .pdf-page {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    display: grid;
                    place-items: center;
                    overflow: hidden;
                    page-break-after: always;
                    break-after: page;
                }

                .pdf-page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }

                .pdf-image {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .watermark {
                    position: absolute;
                    left: 50%;
                    bottom: 10mm;
                    transform: translateX(-50%);
                    z-index: 20;
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    color: rgba(17, 24, 39, 0.45);
                    white-space: nowrap;
                    pointer-events: none;
                }

                @media print {
                    .pdf-page {
                        min-height: 100vh;
                    }

                    .pdf-image {
                        max-width: 100%;
                        max-height: 100vh;
                    }
                }
            </style>
        </head>

        <body>
            ${pages.map((page, index) => `
                <section class="pdf-page">
                    <img
                        class="pdf-image"
                        src="${page.dataUrl}"
                        alt="PDF page ${index + 1}"
                    >

                    <div class="watermark">
                        ${escapeHtml(WATERMARK_TEXT)}
                    </div>
                </section>
            `).join("")}
        </body>
        </html>
    `);

    printWindow.document.close();

    /*
     * Make sure all page images are decoded before print() is called.
     */
    return waitForImages(printWindow.document);
}

/* =========================
   HELPERS
========================= */

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(
                new Error("The image could not be loaded.")
            );

        image.src = url;
    });
}

async function decodeImage(image) {
    if (
        image.complete &&
        typeof image.decode === "function"
    ) {
        try {
            await image.decode();
            return;
        } catch (error) {
            // Fall back to normal load event.
        }
    }

    await new Promise((resolve, reject) => {
        if (image.complete) {
            resolve();
            return;
        }

        image.addEventListener(
            "load",
            resolve,
            { once: true }
        );

        image.addEventListener(
            "error",
            () =>
                reject(
                    new Error("Print image failed to load.")
                ),
            { once: true }
        );
    });
}

async function waitForImages(doc) {
    const images =
        Array.from(
            doc.querySelectorAll("img")
        );

    await Promise.all(
        images.map((image) =>
            decodeImage(image)
        )
    );
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
