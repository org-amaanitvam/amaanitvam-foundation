const slideshow = document.querySelector('[data-slideshow="daan-utsav"]');

if (slideshow) {
    const image = slideshow.querySelector("img");
    const previousButton = slideshow.querySelector(".project-slideshow-arrow-previous");
    const nextButton = slideshow.querySelector(".project-slideshow-arrow-next");
    const images = [
        {
            src: "/images/Projects/ProjectDaanUtsav/1.jpeg",
            alt: "Daan Utsav open donation drive poster for Delhi Metro stations",
        },
        {
            src: "/images/Projects/ProjectDaanUtsav/2.jpeg",
            alt: "Daan Utsav scan-and-play quiz activity at Delhi Metro",
        },
        {
            src: "/images/Projects/ProjectDaanUtsav/3.jpeg",
            alt: "Daan Utsav games and activity stalls at Delhi Metro",
        },
        {
            src: "/images/Projects/ProjectDaanUtsav/4.jpeg",
            alt: "Daan Utsav volunteers and young changemakers at the event",
        },
    ];
    let activeImage = 0;

    const showImage = (index, direction = "next") => {
        activeImage = (index + images.length) % images.length;
        slideshow.querySelector(".project-slideshow-incoming")?.remove();

        const incomingImage = document.createElement("img");
        incomingImage.className = `project-slideshow-incoming slides-in-${direction}`;
        incomingImage.src = images[activeImage].src;
        incomingImage.alt = images[activeImage].alt;
        incomingImage.addEventListener("animationend", () => {
            image.src = incomingImage.src;
            image.alt = incomingImage.alt;
            incomingImage.remove();
        }, { once: true });
        image.after(incomingImage);
    };

    previousButton.addEventListener("click", () => showImage(activeImage - 1, "previous"));
    nextButton.addEventListener("click", () => showImage(activeImage + 1, "next"));

    let autoplayTimer = null;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && autoplayTimer === null) {
            autoplayTimer = window.setInterval(() => {
                if (!slideshow.matches(":hover")) {
                    showImage(activeImage + 1, "next");
                }
            }, 4000);
        } else if (!entry.isIntersecting && autoplayTimer !== null) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }, { threshold: 0.25 });

    visibilityObserver.observe(slideshow);
}
