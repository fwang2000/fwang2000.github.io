import { initCarousel } from "./ui/carousel_controller.js";
import { initTimelineFade } from "./ui/timeline_fade.js";

// Carousel slide partials, in display order.
const SLIDES = ["about", "experience", "projects", "hobbies", "contact"];

async function loadHTML(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to load ${url}: ${res.status}`);
    }
    return res.text();
}

async function loadSections() {
    // Landing section (nav + hero + scroll arrow).
    const landingHTML = await loadHTML("html/sections/landing.html");
    document.getElementById("landing").insertAdjacentHTML("beforeend", landingHTML);

    // Carousel slides: fetch in parallel, inject in order.
    const slideHTML = await Promise.all(
        SLIDES.map((name) => loadHTML(`html/sections/${name}.html`))
    );
    const wrapper = document.getElementById("carousel-wrapper");
    slideHTML.forEach((html) => wrapper.insertAdjacentHTML("beforeend", html));

    // The carousel controller clones the first/last slide, so it MUST run
    // only after the slides have been injected into #carousel-wrapper.
    initCarousel();

    // Edge-fade the timeline based on scroll position (also post-injection).
    initTimelineFade();

    // Smooth-scroll for in-page anchors (e.g. the landing scroll arrow),
    // done in JS so it isn't interrupted by scroll-snap-type: mandatory.
    initAnchorScroll();
}

function initAnchorScroll() {
    const arrow = document.getElementById("keep-scrolling-arrow-container");
    if (!arrow) return;
    arrow.addEventListener("click", (e) => {
        const id = arrow.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

loadSections().catch((err) => console.error("Section load failed:", err));
