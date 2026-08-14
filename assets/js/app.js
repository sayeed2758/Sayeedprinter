document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.getElementById("fileInput");
    const fileInfo = document.getElementById("fileInfo");
    const previewArea = document.getElementById("previewArea");
    const removeBtn = document.getElementById("removeBtn");
    const printBtn = document.getElementById("printBtn");

    let selectedFile = null;
    let previewURL = null;


    // ==============================
    // FILE SELECT
    // ==============================

    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        selectedFile = file;

        showFileInfo(file);
        showPreview(file);

        removeBtn.style.display = "block";
        printBtn.style.display = "block";
    });


    // ==============================
    // FILE INFORMATION
    // ==============================

    function showFileInfo(file) {

        fileInfo.innerHTML = `
            <div class="file-info-box">
                <strong>File:</strong> ${escapeHTML(file.name)}
                <span>|</span>
                <strong>Type:</strong> ${escapeHTML(file.type || "Unknown")}
            </div>
        `;
    }


    // ==============================
    // PREVIEW
    // ==============================

    function showPreview(file) {

        previewArea.innerHTML = "";

        if (previewURL) {
            URL.revokeObjectURL(previewURL);
            previewURL = null;
        }


        // IMAGE PREVIEW
        if (file.type.startsWith("image/")) {

            previewURL = URL.createObjectURL(file);

            const img = document.createElement("img");

            img.src = previewURL;
            img.alt = "File Preview";
            img.className = "preview-image";

            previewArea.appendChild(img);

            return;
        }


        // PDF PREVIEW
        if (file.type === "application/pdf") {

            previewURL = URL.createObjectURL(file);

            const iframe = document.createElement("iframe");

            iframe.src = previewURL;
            iframe.className = "preview-pdf";
            iframe.title = "PDF Preview";

            previewArea.appendChild(iframe);

            return;
        }


        // OTHER FILE
        previewArea.innerHTML = `
            <div class="unsupported-preview">
                <p>Preview is not available for this file.</p>
                <p>${escapeHTML(file.name)}</p>
            </div>
        `;
    }


    // ==============================
    // REMOVE FILE
    // ==============================

    removeBtn.addEventListener("click", function () {

        selectedFile = null;

        fileInput.value = "";

        fileInfo.innerHTML = "";
        previewArea.innerHTML = "";

        removeBtn.style.display = "none";
        printBtn.style.display = "none";

        if (previewURL) {
            URL.revokeObjectURL(previewURL);
            previewURL = null;
        }
    });


    // ==============================
    // PRINT
    // ==============================

    printBtn.addEventListener("click", function () {

        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        if (selectedFile.type.startsWith("image/")) {

            const imageURL = URL.createObjectURL(selectedFile);

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert("Please allow pop-ups to print the file.");
                URL.revokeObjectURL(imageURL);
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print - ${escapeHTML(selectedFile.name)}</title>

                    <style>

                        @page {
                            margin: 10mm;
                        }

                        * {
                            box-sizing: border-box;
                        }

                        html,
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }

                        body {
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            padding: 10mm;
                        }

                        img {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                        }

                    </style>
                </head>

                <body>

                    <img
                        src="${imageURL}"
                        onload="window.print();"
                    >

                </body>
                </html>
            `);

            printWindow.document.close();

            return;
        }


        // PDF PRINT
        if (selectedFile.type === "application/pdf") {

            const pdfURL = URL.createObjectURL(selectedFile);

            const printWindow = window.open(pdfURL, "_blank");

            if (!printWindow) {
                alert("Please allow pop-ups to print the PDF.");
            }

            return;
        }


        alert("Printing this file type is not supported yet.");
    });


    // ==============================
    // HTML ESCAPE
    // ==============================

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    // ==============================
    // INITIAL STATE
    // ==============================

    removeBtn.style.display = "none";
    printBtn.style.display = "none";

});
