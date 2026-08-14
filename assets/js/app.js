const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");

const processing = document.getElementById("processing");
const previewArea = document.getElementById("previewArea");

const uploadBox = document.getElementById("uploadBox");


fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;


    fileName.textContent = file.name;

    fileType.textContent = file.type || "File";

    fileInfo.style.display = "block";


    previewArea.innerHTML = "";


    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        previewArea.appendChild(image);

    }


    processing.style.display = "block";


    setTimeout(function () {

        processing.style.display = "none";

    }, 1500);

});


uploadBox.addEventListener("dragover", function (e) {

    e.preventDefault();

    uploadBox.classList.add("dragging");

});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.classList.remove("dragging");

});


uploadBox.addEventListener("drop", function (e) {

    e.preventDefault();

    uploadBox.classList.remove("dragging");


    const files = e.dataTransfer.files;

    if (!files.length) return;


    fileInput.files = files;

    fileInput.dispatchEvent(new Event("change"));

});
