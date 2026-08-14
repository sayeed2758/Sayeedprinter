const browseBtn = document.getElementById("browseBtn");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    fileName.textContent = file.name;
    fileType.textContent = file.type || "Unknown file type";

    fileInfo.style.display = "block";
});

