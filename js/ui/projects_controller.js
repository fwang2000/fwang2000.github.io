// Projects slide: click a card to flip + expand + center it on the page
// (FLIP technique -- measure the card's slot, fix it there, then animate its
// geometry and a rotateY flip to the centered two-column detail face).
// Clicking the X or the backdrop reverses the animation back to the slot.
//
// A small state machine guards against rapid/double clicks: open() only fires
// from "closed", close() only from "opening"/"open", and teardown is idempotent
// (guarded by state, removes its own listener, clears its timer) so extra
// clicks during an animation are harmless no-ops rather than leaking stale
// transitionend handlers that would sabotage the next open.

export function initProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".project-card"));

    let state = "closed";     // closed | opening | open | closing
    let active = null;        // currently expanded card
    let placeholder = null;   // holds the card's grid slot while it floats
    let backdrop = null;
    let endHandler = null;    // the transitionend handler registered by close()
    let endTimer = null;      // safety-net timeout registered by close()

    function expandedRect() {
        const w = Math.min(900, window.innerWidth * 0.82);
        const h = Math.min(560, window.innerHeight * 0.74);
        return {
            width: w,
            height: h,
            left: (window.innerWidth - w) / 2,
            top: (window.innerHeight - h) / 2,
        };
    }

    function applyRect(el, r) {
        el.style.top = r.top + "px";
        el.style.left = r.left + "px";
        el.style.width = r.width + "px";
        el.style.height = r.height + "px";
    }

    function open(card) {
        if (state !== "closed") return; // ignore clicks mid-animation
        state = "opening";
        active = card;

        const rect = card.getBoundingClientRect();

        // Placeholder keeps the row intact (siblings don't reflow/re-center).
        placeholder = document.createElement("div");
        placeholder.className = "project-card-placeholder";
        placeholder.style.flex = `0 0 ${rect.width}px`;
        placeholder.style.width = rect.width + "px";
        placeholder.style.height = rect.height + "px";
        card.after(placeholder);

        // Backdrop for outside-click + scrim.
        backdrop = document.createElement("div");
        backdrop.id = "project-backdrop";
        backdrop.addEventListener("click", close);
        document.body.appendChild(backdrop);
        document.body.classList.add("project-open");

        // Pin the card exactly over its current slot (no visible jump yet).
        card.classList.add("is-floating");
        applyRect(card, rect);

        // Next frame: grow to centered target + flip to the back face.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // A close() may have fired during these frames; bail if so.
                if (state !== "opening") return;
                backdrop.classList.add("is-visible");
                card.classList.add("is-expanded");
                applyRect(card, expandedRect());
                state = "open";
            });
        });
    }

    function teardown() {
        if (state !== "closing") return; // idempotent: run exactly once per cycle
        state = "closed";

        if (endTimer) {
            clearTimeout(endTimer);
            endTimer = null;
        }
        if (active && endHandler) {
            active.removeEventListener("transitionend", endHandler);
        }
        endHandler = null;

        if (active) {
            active.classList.remove("is-floating");
            active.removeAttribute("style");
        }
        if (placeholder) placeholder.remove();
        if (backdrop) backdrop.remove();
        document.body.classList.remove("project-open");

        active = null;
        placeholder = null;
        backdrop = null;
    }

    function close() {
        // Only an opening/open card can be closed; re-entrant calls are no-ops.
        if (state !== "open" && state !== "opening") return;
        state = "closing";

        const card = active;
        const rect = placeholder.getBoundingClientRect();

        card.classList.remove("is-expanded"); // flip back to front
        if (backdrop) backdrop.classList.remove("is-visible");
        applyRect(card, rect);                 // shrink back to the slot

        endHandler = (e) => {
            if (e.target !== card) return;
            if (!["width", "height", "top", "left"].includes(e.propertyName)) return;
            teardown();
        };
        card.addEventListener("transitionend", endHandler);

        // Safety net if transitionend never fires (e.g. no geometry change).
        endTimer = setTimeout(teardown, 800);
    }

    cards.forEach((card) => {
        card.addEventListener("click", () => open(card));

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(card);
            }
        });

        const closeBtn = card.querySelector(".project-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                close();
            });
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });

    window.addEventListener("resize", () => {
        if (state === "open") applyRect(active, expandedRect());
    });
}
