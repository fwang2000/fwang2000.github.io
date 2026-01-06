const carousel = document.getElementById("carousel");
const viewport = document.getElementById("carousel-viewport");
const wrapper = document.getElementById("carousel-wrapper");
const prevButton = document.getElementById('carousel-prev-button');
const nextButton = document.getElementById('carousel-next-button');

const slides = Array.from(wrapper.children);
const first = slides[0];
const last = slides[slides.length - 1];

const firstClone = first.cloneNode(true);
const lastClone = last.cloneNode(true);

wrapper.appendChild(firstClone);
wrapper.insertBefore(lastClone, first);

const allSlides = Array.from(wrapper.children);
let index = 1;

function goToIndex(i, smooth = true) {
    console.log("Going to index:", i);
    viewport.scrollTo({
        left: i * viewport.offsetWidth,
        behavior: smooth ? "smooth" : "auto"
    });
}

/* Event Listeners */

nextButton.addEventListener('click', () => {
    index++;
    goToIndex(index);
});

prevButton.addEventListener('click', () => {
    index--;
    goToIndex(index);
});

viewport.addEventListener('scroll', () => {
    const scrollLeft = viewport.scrollLeft;
    const slideWidth = viewport.offsetWidth;
    index = Math.round(scrollLeft / slideWidth);
});

viewport.addEventListener('scrollend', () => {
    if (index === 0) {
        index = slides.length;
        goToIndex(index, false);
    } else if (index === slides.length + 1) {
        index = 1;
        goToIndex(index, false);
    }
});

goToIndex(index, false);