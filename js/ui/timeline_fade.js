// Toggles the edge fade on horizontally-scrollable timelines so a side only
// fades when there is hidden content past it. Driven via the --fade-l /
// --fade-r CSS variables consumed by .timeline-scroll's mask-image.

const FADE = "2.5rem"; // fade width when a side is active

function updateFade(el) {
    const maxScroll = el.scrollWidth - el.clientWidth;
    const x = el.scrollLeft;
    // 1px tolerance for sub-pixel rounding at the extremes.
    el.style.setProperty("--fade-l", x > 1 ? FADE : "0px");
    el.style.setProperty("--fade-r", x < maxScroll - 1 ? FADE : "0px");
}

export function initTimelineFade() {
    const scrollers = document.querySelectorAll(".timeline-scroll");
    scrollers.forEach((el) => {
        const update = () => updateFade(el);
        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update(); // set the initial state
    });
}
