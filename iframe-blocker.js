(() => {
    "use strict";

    // --- CONFIGURATION ---
    const APP_NAME = "Horizon_Tech Gallery";
    const CANONICAL_URL = "https://akshat-881236.github.io/HorizonTechX_Gallery/";
    const ALLOWED_EMBED_TOKEN = "HTX_EMBED_V1";

    // --- ENVIRONMENT CHECKS ---
    const isIframe = window.self !== window.top;
    const params = new URLSearchParams(window.location.search);
    const embedToken = params.get("embed");
    const authorizedEmbed = embedToken === ALLOWED_EMBED_TOKEN;
    const expectedOrigin = new URL(CANONICAL_URL).origin;

    // Grab the CSS blocker from the HTML <head>
    const securityBlocker = document.getElementById("htx-security-blocker");

    // --- HELPER FUNCTIONS ---
    function injectRedirectMeta() {
        const meta = document.createElement("meta");
        meta.httpEquiv = "refresh";
        meta.content = `3;url=${CANONICAL_URL}`;
        document.head.appendChild(meta);
    }

    function showIframeBlockedCard() {
        document.documentElement.innerHTML = `
        <head>
            <title>Access Restricted - ${APP_NAME}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body {
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#0f172a;
                    font-family: Inter, Arial, sans-serif;
                    color:#fff;
                    padding:24px;
                }
                .htx-card {
                    width:100%;
                    max-width:540px;
                    background:#111827;
                    border:1px solid #334155;
                    border-radius:24px;
                    padding:32px;
                    text-align:center;
                    box-shadow: 0 20px 60px rgba(0,0,0,.45);
                }
                .htx-logo {
                    width:100px;
                    height:100px;
                    margin:0 auto 20px;
                    display:block;
                }
                .htx-title {
                    font-size:28px;
                    font-weight:700;
                    margin-bottom:12px;
                }
                .htx-desc {
                    color:#94a3b8;
                    line-height:1.7;
                    margin-bottom:24px;
                }
                .htx-btn {
                    display:inline-block;
                    text-decoration:none;
                    background:#2563eb;
                    color:#fff;
                    padding:14px 24px;
                    border-radius:12px;
                    font-weight:600;
                    transition:.3s;
                }
                .htx-btn:hover {
                    transform:translateY(-2px);
                }
                .htx-badge {
                    margin-top:18px;
                    font-size:13px;
                    color:#60a5fa;
                }
            </style>
        </head>
        <body>
            <div class="htx-card">
                <img src="logo.svg" alt="Horizon Gallery" class="htx-logo">
                <div class="htx-title">Horizon_Tech Gallery</div>
                <div class="htx-desc">
                    Unauthorized iframe embedding has been blocked.
                    <br><br>
                    Please use the official Horizon_Tech Gallery website.
                </div>
                <a href="${CANONICAL_URL}" class="htx-btn">Open Official Website</a>
                <div class="htx-badge">Protected by Horizon_Tech Security Policy</div>
            </div>
        </body>
        `;
    }

    // --- SECURITY EVALUATION LOGIC ---
    if (isIframe && !authorizedEmbed) {
        // Scenario 1: Framed without permission
        // Remove the CSS blocker so our custom error card is visible
        if (securityBlocker) securityBlocker.remove();
        
        showIframeBlockedCard();
        throw new Error("Unauthorized iframe embedding blocked.");
    } else {
        // Scenario 2: Safe Environment (Not framed, or framed with correct token)
        // Remove the CSS blocker to reveal the actual gallery
        if (securityBlocker) securityBlocker.remove();
    }

    // --- ORIGIN CHECK LOGIC ---
    // (Added a check for "file:" protocol so you can still test it locally without triggering redirects)
    if (location.origin !== expectedOrigin && location.protocol !== "file:") {
        injectRedirectMeta();
        setTimeout(() => {
            location.replace(CANONICAL_URL);
        }, 3000);
    }

})();
