document.addEventListener("DOMContentLoaded", () => {

    const fileInput = document.getElementById("fileInput");
    const fileInfo = document.getElementById("fileInfo");
    const previewArea = document.getElementById("previewArea");
    const removeBtn = document.getElementById("removeBtn");
    const printBtn = document.getElementById("printBtn");

    let currentFile = null;
    let currentURL = null;


    /* ================================
       FILE SELECT
    ================================= */

    fileInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) {
            return;
        }

        currentFile = file;

        // Remove previous preview URL
        if (currentURL) {
            URL.revokeObjectURL(currentURL);
        }

        currentURL = URL.createObjectURL(file);

        // File information
        fileInfo.innerHTML = `
            File: ${escapeHTML(file.name)}
            <span>|</span>
            Type: ${escapeHTML(file.type || "Unknown")}
        `;

        previewArea.innerHTML = "";

        /* IMAGE */
        if (file.type.startsWith("image/")) {

            const img = document.createElement("img");

            img.src = currentURL;
            img.alt = "Selected file preview";

            img.style.width = "100%";
            img.style.height = "auto";
            img.style.maxHeight = "600px";
            img.style.objectFit = "contain";
            img.style.display = "block";
            img.style.borderRadius = "18px";

            previewArea.appendChild(img);
        }

        /* PDF */
        else if (file.type === "application/pdf") {

            const iframe = document.createElement("iframe");

            iframe.src = currentURL;
            iframe.title = "PDF Preview";

            iframe.style.width = "100%";
            iframe.style.height = "500px";
            iframe.style.border = "1px solid #aaa";
            iframe.style.borderRadius = "12px";
            iframe.style.background = "#fff";

            previewArea.appendChild(iframe);
        }

        /* OTHER FILE */
        else {

            previewArea.innerHTML = `
                <div style="
                    padding:40px 20px;
                    text-align:center;
                    background:#f5f7fb;
                    border-radius:16px;
                    font-size:18px;
                ">
                    <strong>File selected</strong>
                    <br><br>
                    ${escapeHTML(file.name)}
                </div>
            `;
        }

        // Show buttons
        removeBtn.style.display = "block";
        printBtn.style.display = "block";
    });


    /* ================================
       REMOVE FILE
    ================================= */

    removeBtn.addEventListener("click", () => {

        fileInput.value = "";

        currentFile = null;

        if (currentURL) {
            URL.revokeObjectURL(currentURL);
            currentURL = null;
        }

        fileInfo.innerHTML = "";

        previewArea.innerHTML = "";

        removeBtn.style.display = "none";
        printBtn.style.display = "none";
    });


    /* ================================
       PRINT
    ================================= */

    printBtn.addEventListener("click", () => {

        if (!currentFile || !currentURL) {
            alert("Please select a file first.");
            return;
        }

        /* IMAGE PRINT */

        if (currentFile.type.startsWith("image/")) {

            const printWindow = window.open(
                "",
                "_blank",
                "width=900,height=700"
            );

            if (!printWindow) {
                alert("Please allow pop-ups for printing.");
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print - ${escapeHTML(currentFile.name)}</title>

                    <style>
                        @page {
                            size: A4;
                            margin: 10mm;
                        }

                        html,
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                            text-align: center;
                        }

                        img {
                            max-width: 100%;
                            max-height: 277mm;
                            object-fit: contain;
                        }
                    </style>
                </head>

                <body>

                    <img
                        src="${currentURL}"
                        onload="window.print();"
                    >

                </body>
                </html>
            `);

            printWindow.document.close();

            return;
        }


        /* PDF PRINT */

        if (currentFile.type === "application/pdf") {

            const pdfWindow = window.open(
                currentURL,
                "_blank"
            );

            if (!pdfWindow) {
                alert("Please allow pop-ups for printing.");
                return;
            }

            return;
        }


        alert("This file type cannot be printed directly.");
    });


    /* ================================
       SAFE TEXT
    ================================= */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }

});
