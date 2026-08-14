
const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");

const processing = document.getElementById("processing");
const previewArea = document.getElementById("previewArea");

fileInput.addEventListener("change", function () {
previewArea.innerHTML = "";

if (file.type.startsWith("image/")) {
    const image = document.createElement("img");

    image.src = URL.createObjectURL(file);

    previewArea.appendChild(image);
}
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
const uploadBox = document.getElementById("uploadBox");

uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("dragging");
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("dragging");
});

uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();

    uploadBox.classList.remove("dragging");

    const file = e.dataTransfer.files[0];

    if (!file) return;

    fileInput.files = e.dataTransfer.files;

    fileInput.dispatchEvent(new Event("change"));
});
