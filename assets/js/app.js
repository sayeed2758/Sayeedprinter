
const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");

const processing = document.getElementById("processing");

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    fileName.textContent = file.name;
    fileType.textContent = file.type || "File";

    fileInfo.style.display = "block";

    processing.style.display = "block";

    setTimeout(function () {
        processing.style.display = "none";
    }, 1500);

});
