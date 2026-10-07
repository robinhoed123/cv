/* =========================================================
   Portfolio – shared script
   - Projects dropdown (open on click, close on outside click / Escape)
   - Subtle fade when navigating between pages
   - Project photo galleries (click the photo for the next one)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setupDropdowns();
    setupPageTransitions();
    setupGalleries();
});

/* ---------- Photo galleries ---------- */

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

        frame.addEventListener("click", () => show(current + 1));
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
