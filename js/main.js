/* =========================================================
   Portfolio – shared script
   - Projects dropdown (open on click, close on outside click / Escape)
   - Subtle fade when navigating between pages
   - Project photo galleries (click the photo for the next one)
   - Motivation letter per company (?bedrijf in the address)
   ========================================================= */

/* ---------- Motivation letter per company ----------
   Share the site as  .../cv/?robonext  -> the Motivatiebrief page shows that company's letter.
   Share it as        .../cv/?x         -> the Motivatiebrief button disappears everywhere.
   Without anything the default letter is shown.
   The choice is remembered while the browser tab stays open.

   To add a company: put the PDF in assets/motivatiebrieven/ and add a line below.
   The key (left) is what goes after the ? in the address, written in lowercase. */

const MOTIVATIEBRIEVEN = {
    robonext: "Robonext_motivatieBrief.pdf",
    ixor: "Ixor_motivatieBrief.pdf",
    boi: "BOI_motivatieBrief.pdf",
    vanbreda: "Vanbreda_motivatieBrief.pdf",
    bosch: "Bosch_motivatieBrief.pdf",
    kwery: "Kwery_motivatieBrief.pdf",
    itplanet: "ITPlanet_motivatieBrief.pdf",
    keyes: "KEYES_motivatieBrief.pdf",
};

const MOTIVATIEBRIEF_FOLDER = "assets/motivatiebrieven/";
const DEFAULT_MOTIVATIEBRIEF = "motivatiebrief.pdf";
const HIDE_MOTIVATIEBRIEF_KEY = "x";
const MOTIVATIEBRIEF_STORAGE_KEY = "motivatiebrief";

const motivatiebriefChoice = readMotivatiebriefChoice();
if (motivatiebriefChoice === HIDE_MOTIVATIEBRIEF_KEY) {
    // Set right away so the button is hidden before the page fades in
    document.documentElement.classList.add("no-motivatiebrief");
}

function readMotivatiebriefChoice() {
    // "?robonext" or "?robonext&..." -> "robonext"
    const fromAddress = window.location.search.slice(1).split(/[&=]/)[0].toLowerCase();

    if (fromAddress) {
        const isKnown = fromAddress === HIDE_MOTIVATIEBRIEF_KEY || fromAddress in MOTIVATIEBRIEVEN;
        try {
            if (isKnown) {
                sessionStorage.setItem(MOTIVATIEBRIEF_STORAGE_KEY, fromAddress);
            } else {
                sessionStorage.removeItem(MOTIVATIEBRIEF_STORAGE_KEY);
            }
        } catch {
            // Storage blocked (e.g. private mode): the choice then only applies to this page
        }
        return isKnown ? fromAddress : "";
    }

    try {
        return sessionStorage.getItem(MOTIVATIEBRIEF_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function setupMotivatiebrief() {
    const viewer = document.querySelector("[data-motivatiebrief]");

    if (motivatiebriefChoice === HIDE_MOTIVATIEBRIEF_KEY) {
        // Someone landing on the letter page directly in the "x" version goes home instead
        if (viewer) window.location.replace("index.html");
        return;
    }

    if (!viewer) return;

    const file = MOTIVATIEBRIEVEN[motivatiebriefChoice] || DEFAULT_MOTIVATIEBRIEF;
    const url = MOTIVATIEBRIEF_FOLDER + file;

    // A fresh <object> is the reliable way to make every browser load the chosen PDF
    const freshViewer = viewer.cloneNode(true);
    freshViewer.data = url;
    freshViewer.querySelectorAll("a[download]").forEach((link) => {
        link.href = url;
    });
    viewer.replaceWith(freshViewer);
}

document.addEventListener("DOMContentLoaded", () => {
    setupMotivatiebrief(); // must run before setupPdfViewers: it picks which PDF to show
    setupMobileMenu();
    setupDropdowns();
    setupPageTransitions();
    setupGalleries();
    setupPdfViewers();
});

/* ---------- Mobile menu (the ☰ button, only visible on phones) ---------- */

function setupMobileMenu() {
    const navbar = document.querySelector(".navbar");
    const toggle = navbar && navbar.querySelector(".nav-toggle");
    if (!toggle) return;

    function setOpen(isOpen) {
        navbar.classList.toggle("menu-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
    }

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(!navbar.classList.contains("menu-open"));
    });

    // Close when tapping outside the menu, pressing Escape, or coming back with the back button
    document.addEventListener("click", (event) => {
        if (!navbar.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });
    window.addEventListener("pageshow", () => setOpen(false));
}

/* ---------- PDFs on phones ----------
   Phones can't show a PDF inside a page (Android shows nothing, iPhone only page 1).
   There, PDF.js draws every page as an image instead. On a PC the normal viewer stays. */

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PHONE_MEDIA_QUERY = "(max-width: 760px)"; // keep equal to the Mobile section in style.css
const PDF_MAX_PIXEL_RATIO = 3; // sharper text when zooming in, capped to spare phone memory

function setupPdfViewers() {
    const viewers = document.querySelectorAll("object.pdf-viewer");
    const needsPdfJs = window.matchMedia(PHONE_MEDIA_QUERY).matches || navigator.pdfViewerEnabled === false;
    if (viewers.length === 0 || !needsPdfJs) return;

    loadScript(PDFJS_URL)
        .then(() => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
            viewers.forEach(drawPdf);
        })
        .catch(() => {
            // PDF.js could not load: the normal viewer with its download link stays
        });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
    });
}

async function drawPdf(viewer) {
    const container = document.createElement("div");
    container.className = "pdf-pages";
    container.innerHTML = '<p class="pdf-loading muted">PDF laden…</p>';
    viewer.replaceWith(container);

    try {
        const pdf = await window.pdfjsLib.getDocument(viewer.getAttribute("data")).promise;
        const firstPage = await pdf.getPage(1);
        const size = firstPage.getViewport({ scale: 1 });
        container.textContent = "";

        // Only pages near the screen are drawn; pages far away are cleared again to save memory
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) drawPdfPage(pdf, target);
                else clearPdfPage(target);
            });
        }, { rootMargin: "1200px 0px" });

        for (let number = 1; number <= pdf.numPages; number++) {
            const holder = document.createElement("div");
            holder.className = "pdf-page";
            holder.dataset.page = number;
            holder.style.aspectRatio = `${size.width} / ${size.height}`;
            container.append(holder);
            observer.observe(holder);
        }
    } catch {
        // Could not read the PDF: put the normal viewer back
        container.replaceWith(viewer);
    }
}

async function drawPdfPage(pdf, holder) {
    if (holder.querySelector("canvas") || holder.drawing) return;
    const drawId = (holder.drawId || 0) + 1;
    holder.drawId = drawId;
    holder.drawing = true;

    const page = await pdf.getPage(Number(holder.dataset.page));
    const baseViewport = page.getViewport({ scale: 1 });
    const pixelRatio = Math.min((window.devicePixelRatio || 1) * 1.5, PDF_MAX_PIXEL_RATIO);
    const viewport = page.getViewport({ scale: (holder.clientWidth / baseViewport.width) * pixelRatio });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `Pagina ${holder.dataset.page}`);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

    // The page may have been scrolled far away (and cleared) while it was drawing
    if (holder.drawId !== drawId) {
        canvas.width = 0;
        canvas.height = 0;
        return;
    }
    holder.drawing = false;
    holder.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`;
    holder.append(canvas);
}

function clearPdfPage(holder) {
    holder.drawId = (holder.drawId || 0) + 1;
    holder.drawing = false;
    const canvas = holder.querySelector("canvas");
    if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
    }
}

/* ---------- Photo galleries ---------- */

const SWIPE_MIN_DISTANCE = 40; // px a finger must move sideways to count as a swipe
const SWIPE_CLICK_IGNORE_MS = 500;
const NEXT_ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

function setupGalleries() {
    const galleries = document.querySelectorAll(".gallery");

    galleries.forEach((gallery) => {
        const frame = gallery.querySelector(".gallery-frame");
        const images = frame.querySelectorAll("img");
        let current = 0;

        images[0].classList.add("is-active");
        if (images.length < 2) {
            return;
        }

        gallery.classList.add("has-multiple");
        frame.setAttribute("role", "button");
        frame.setAttribute("tabindex", "0");
        frame.setAttribute("aria-label", "Volgende foto");
        frame.title = "Klik voor de volgende foto";

        const counter = document.createElement("span");
        counter.className = "gallery-counter glass";
        const arrow = document.createElement("span");
        arrow.className = "gallery-next glass";
        arrow.innerHTML = NEXT_ARROW_SVG;
        frame.append(counter, arrow);

        const dotsContainer = document.createElement("div");
        dotsContainer.className = "gallery-dots";
        const dots = Array.from(images, (_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "gallery-dot";
            dot.setAttribute("aria-label", `Foto ${index + 1}`);
            dot.addEventListener("click", () => show(index));
            dotsContainer.append(dot);
            return dot;
        });
        gallery.append(dotsContainer);

        function show(index) {
            current = (index + images.length) % images.length;
            images.forEach((image, i) => image.classList.toggle("is-active", i === current));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
            counter.textContent = `${current + 1} / ${images.length}`;
        }

        // Swipe on touch screens: left = next photo, right = previous photo
        let touchStartX = 0;
        let touchStartY = 0;
        let lastSwipeTime = 0;

        frame.addEventListener("touchstart", (event) => {
            touchStartX = event.changedTouches[0].clientX;
            touchStartY = event.changedTouches[0].clientY;
        }, { passive: true });

        frame.addEventListener("touchend", (event) => {
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            const deltaY = event.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > SWIPE_MIN_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
                lastSwipeTime = Date.now();
                show(current + (deltaX < 0 ? 1 : -1));
            }
        });

        frame.addEventListener("click", () => {
            // The click some phones fire right after a swipe must not count as an extra tap
            if (Date.now() - lastSwipeTime < SWIPE_CLICK_IGNORE_MS) return;
            show(current + 1);
        });
        frame.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                show(current + 1);
            }
        });

        // Arrow keys work anywhere on the page (there is one gallery per page)
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") show(current + 1);
            if (event.key === "ArrowLeft") show(current - 1);
        });

        show(0);
    });
}

/* ---------- Projects dropdown ---------- */

function setupDropdowns() {
    const dropdowns = document.querySelectorAll(".nav-dropdown");

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".dropdown-toggle");

        toggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = dropdown.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    });

    // Close every open dropdown when clicking elsewhere
    document.addEventListener("click", (event) => {
        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                closeDropdown(dropdown);
            }
        });
    });

    // Close with the Escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            dropdowns.forEach(closeDropdown);
        }
    });
}

function closeDropdown(dropdown) {
    dropdown.classList.remove("open");
    dropdown.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
}

/* ---------- Page transitions ---------- */

const FADE_OUT_DURATION_MS = 200;

function setupPageTransitions() {
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!shouldAnimateLink(link, event)) {
            return;
        }

        event.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => {
            window.location.href = link.href;
        }, FADE_OUT_DURATION_MS);
    });

    // When returning with the browser back button the page can come from cache
    // while still faded out, so reset it.
    window.addEventListener("pageshow", () => {
        document.body.classList.remove("is-leaving");
    });
}

function shouldAnimateLink(link, event) {
    if (!link || !link.href) return false;
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute("download") || link.target === "_blank") return false;
    if (link.protocol !== window.location.protocol || link.host !== window.location.host) return false;

    // Skip links that only jump within the same page
    const samePage = link.pathname === window.location.pathname;
    if (samePage && link.hash) return false;

    // Skip placeholder links (href="#")
    if (link.getAttribute("href") === "#") return false;

    return true;
}
