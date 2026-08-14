/* =========================================
   SAYEED PRINT STUDIO
   PRINTING ANIMATION
   Phase 1
   Made By Shahid Sir
   ========================================= */

(function () {

    "use strict";

    /* -----------------------------------------
       CREATE ANIMATION UI
       ----------------------------------------- */

    function createPrintingAnimation() {

        if (document.getElementById("printAnimationOverlay")) {
            return;
        }

        const overlay = document.createElement("div");

        overlay.id = "printAnimationOverlay";

        overlay.className = "print-animation-overlay";

        overlay.innerHTML = `

            <div class="print-animation-stage">

                <div class="print-animation-title">
                    Receipt print
                </div>

                <div class="print-animation-subtitle">
                    Animation
                </div>


                <div class="print-machine"></div>


                <div class="print-paper">

                    <div class="receipt-content">

                        <div class="receipt-brand">
                            SAYEED PRINT STUDIO
                        </div>

                        <div class="receipt-subtitle">
                            DIGITAL PRINT RECEIPT
                        </div>

                        <div class="receipt-line"></div>

                        <div class="receipt-total">
                            PRINTING
                        </div>

                        <div class="receipt-row">
                            <span>Document</span>
                            <strong>Print File</strong>
                        </div>

                        <div class="receipt-row">
                            <span>Type</span>
                            <strong>Digital</strong>
                        </div>

                        <div class="receipt-row">
                            <span>Status</span>
                            <strong>Processing</strong>
                        </div>

                        <div class="receipt-line"></div>

                        <div class="receipt-row">
                            <span>Print Quality</span>
                            <strong>High</strong>
                        </div>

                        <div class="receipt-row">
                            <span>Copies</span>
                            <strong>1</strong>
                        </div>

                        <div class="receipt-line"></div>

                        <div class="receipt-thanks">
                            HAVE A NICE DAY!
                        </div>

                        <div class="receipt-barcode"></div>

                        <div class="receipt-small">
                            SAYEED-PRINT-STUDIO
                        </div>

                    </div>

                    <div class="receipt-tear"></div>

                </div>


                <div class="print-status">

                    <div class="print-status-main">
                        Printing<span class="printing-dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </span>
                    </div>

                    <div class="print-status-text">
                        Please wait while your document is being printed
                    </div>

                </div>

            </div>

            <div class="print-watermark">
                Made By Shahid Sir
            </div>
        `;

        document.body.appendChild(overlay);
    }


    /* -----------------------------------------
       START ANIMATION
       ----------------------------------------- */

    window.startPrintingAnimation = function () {

        createPrintingAnimation();

        const overlay =
            document.getElementById("printAnimationOverlay");

        if (!overlay) {
            return;
        }

        /* Reset animation */

        const paper =
            overlay.querySelector(".print-paper");

        if (paper) {

            paper.style.animation = "none";

            void paper.offsetWidth;

            paper.style.animation = "";
        }

        /* Show */

        overlay.classList.add("active");

    };


    /* -----------------------------------------
       STOP ANIMATION
       ----------------------------------------- */

    window.stopPrintingAnimation = function () {

        const overlay =
            document.getElementById("printAnimationOverlay");

        if (!overlay) {
            return;
        }

        overlay.classList.remove("active");

    };


    /* -----------------------------------------
       TEST
       ----------------------------------------- */

    window.testPrintingAnimation = function () {

        startPrintingAnimation();

        setTimeout(function () {

            stopPrintingAnimation();

        }, 7000);

    };


    /* -----------------------------------------
       READY
       ----------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            createPrintingAnimation
        );

    } else {

        createPrintingAnimation();

    }

})();
