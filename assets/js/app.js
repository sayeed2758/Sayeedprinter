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

        const imageURL = URL.createObjectURL(file);

        image.src = imageURL;

        image.onload = function () {
            URL.revokeObjectURL(imageURL);
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

    printBtn.disabled = true;

    try {

        /* START ANIMATION */

        startPrintAnimation();

        setPrintAnimationStatus(
            "Starting printer..."
        );

        await wait(700);

        setPrintAnimationStatus(
            "Paper is feeding..."
        );

        await wait(1600);

        setPrintAnimationStatus(
            "Preparing your document..."
        );

        /* CREATE PRINT LAYER */

        const printLayer =
            createPrintLayer();

        /* IMAGE */

        if (file.type.startsWith("image/")) {

            await prepareImagePrintLayer(
                printLayer,
                file
            );
        }

        /* PDF */

        else if (
            file.type ===
            "application/pdf"
        ) {

            await preparePdfPrintLayer(
                printLayer,
                file
            );
        }

        setPrintAnimationStatus(
            "Opening print dialog..."
        );

        await wait(500);

        /* HIDE ANIMATION */

        printAnimation.classList.remove(
            "is-active"
        );

        printAnimation.setAttribute(
            "aria-hidden",
            "true"
        );

        await wait(150);

        /* NATIVE PRINT */

        window.print();

    } catch (error) {

        console.error(
            "Print Error:",
            error
        );

        printAnimationCard.classList.add(
            "error"
        );

        printAnimationTitle.textContent =
            "Print failed";

        printAnimationSubtitle.textContent =
            "Please try again";

        setPrintAnimationStatus(
            error?.message ||
            "Could not prepare the document."
        );

        setTimeout(() => {

            printAnimation.classList.remove(
                "is-active"
            );

            printAnimation.setAttribute(
                "aria-hidden",
                "true"
            );

            removePrintLayer();

        }, 1200);

    } finally {

        printBtn.disabled = false;
    }
});

/* =========================================================
   SAME-PAGE PRINT SYSTEM
   NO window.open()
   NO about:blank
========================================================= */

let activePrintLayer = null;

/* =========================================================
   CREATE PRINT LAYER
========================================================= */

function createPrintLayer() {

    removePrintLayer();

    const layer =
        document.createElement("div");

    layer.id =
        "samePagePrintLayer";

    layer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.appendChild(layer);

    activePrintLayer = layer;

    return layer;
}

/* =========================================================
   REMOVE PRINT LAYER
========================================================= */

function removePrintLayer() {

    const existing =
        document.getElementById(
            "samePagePrintLayer"
        );

    if (existing) {
        existing.remove();
    }

    activePrintLayer = null;
}

/* =========================================================
   IMAGE PRINT
========================================================= */

async function prepareImagePrintLayer(
    printLayer,
    file
) {

    const imageURL =
        URL.createObjectURL(file);

    try {

        const image =
            await loadImage(imageURL);

        const page =
            document.createElement(
                "section"
            );

        page.className =
            "print-page";

        const printImage =
            document.createElement("img");

        printImage.className =
            "print-content";

        printImage.src =
            image.src;

        printImage.alt =
            file.name;

        const watermark =
            createWatermark();

        page.appendChild(
            printImage
        );

        page.appendChild(
            watermark
        );

        printLayer.appendChild(
            page
        );

        await decodeImage(
            printImage
        );

    } finally {

        URL.revokeObjectURL(
            imageURL
        );
    }
}

/* =========================================================
   PDF PRINT
========================================================= */

async function preparePdfPrintLayer(
    printLayer,
    file
) {

    setPrintAnimationStatus(
        "Loading PDF..."
    );

    const pdfjsLib =
        await loadPdfJs();

    const data =
        new Uint8Array(
            await file.arrayBuffer()
        );

    const pdf =
        await pdfjsLib
            .getDocument({
                data
            })
            .promise;

    /* RENDER EVERY PAGE */

    for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ) {

        setPrintAnimationStatus(
            "Preparing page " +
            pageNumber +
            " of " +
            pdf.numPages +
            "..."
        );

        const page =
            await pdf.getPage(
                pageNumber
            );

        const baseViewport =
            page.getViewport({
                scale: 1
            });

        const maxDimension =
            1700;

        const scale =
            Math.min(
                2.0,
                maxDimension /
                    Math.max(
                        baseViewport.width,
                        baseViewport.height
                    )
            );

        const viewport =
            page.getViewport({
                scale:
                    Math.max(
                        1.35,
                        scale
                    )
            });

        const canvas =
            document.createElement(
                "canvas"
            );

        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false
                }
            );

        canvas.width =
            Math.ceil(
                viewport.width
            );

        canvas.height =
            Math.ceil(
                viewport.height
            );

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        /* PDF PAGE → IMAGE */

        const imageData =
            canvas.toDataURL(
                "image/png"
            );

        const pageElement =
            document.createElement(
                "section"
            );

        pageElement.className =
            "print-page";

        const image =
            document.createElement(
                "img"
            );

        image.className =
            "print-content";

        image.src =
            imageData;

        image.alt =
            "PDF page " +
            pageNumber;

        /* WATERMARK */

        const watermark =
            createWatermark();

        pageElement.appendChild(
            image
        );

        pageElement.appendChild(
            watermark
        );

        printLayer.appendChild(
            pageElement
        );

        await decodeImage(
            image
        );

        page.cleanup();

        /* RELEASE CANVAS MEMORY */

        canvas.width = 1;
        canvas.height = 1;
    }

    setPrintAnimationStatus(
        "All pages ready..."
    );
}

/* =========================================================
   WATERMARK
========================================================= */

function createWatermark() {

    const watermark =
        document.createElement(
            "div"
        );

    watermark.className =
        "watermark";

    watermark.textContent =
        WATERMARK_TEXT;

    return watermark;
}

/* =========================================================
   PDF.JS
========================================================= */

let pdfJsPromise = null;

function loadPdfJs() {

    if (pdfJsPromise) {
        return pdfJsPromise;
    }

    pdfJsPromise =
        import(
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.min.mjs"
        )
        .then((module) => {

            const pdfjsLib =
                module.default ||
                module;

            /*
             * PDF.JS WORKER
             */

            pdfjsLib
                .GlobalWorkerOptions
                .workerSrc =
                "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs";

            return pdfjsLib;
        });

    return pdfJsPromise;
}

/* =========================================================
   BASIC HELPERS
========================================================= */

function wait(ms) {

    return new Promise(
        function (resolve) {
            setTimeout(
                resolve,
                ms
            );
        }
    );
}

function loadImage(src) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();

            image.onload =
                function () {
                    resolve(image);
                };

            image.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not load the image for printing."
                        )
                    );
                };

            image.src = src;
        }
    );
}

function decodeImage(image) {

    if (image.decode) {

        return image
            .decode()
            .catch(
                function () {
                    return Promise.resolve();
                }
            );
    }

    if (image.complete) {
        return Promise.resolve();
    }

    return new Promise(
        function (resolve) {

            image.onload =
                resolve;

            image.onerror =
                resolve;
        }
    );
}

/* =========================================================
   AFTER PRINT
========================================================= */

window.addEventListener(
    "afterprint",
    function () {

        removePrintLayer();

        printBtn.disabled =
            false;
    }
);
