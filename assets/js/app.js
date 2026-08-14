const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const previewArea = document.getElementById("previewArea");

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    fileInfo.style.display = "block";

    fileInfo.textContent =
        "File: " + file.name +
        " | Type: " + file.type;

    previewArea.innerHTML = "";

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        previewArea.appendChild(image);
    }

});
