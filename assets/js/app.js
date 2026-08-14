const browseBtn = document.getElementById("browseBtn");
const fileInput = document.getElementById("fileInput");

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    console.log("Selected file:", file.name);
});
