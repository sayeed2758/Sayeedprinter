const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");
const previewArea = document.getElementById("previewArea");

fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    fileName.textContent = file.name;
    fileType.textContent = file.type;

    fileInfo.style.display = "block";

    previewArea.innerHTML = "";

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        previewArea.appendChild(image);
    }

});
