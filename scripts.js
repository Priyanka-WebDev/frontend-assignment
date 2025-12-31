const primaryNav = document.querySelector('.nav--primary');
const stickyNav = document.getElementById('stickyNav');

const toggleStickyNav = () => {
    const triggerPoint = primaryNav.offsetHeight;

    if (window.scrollY > triggerPoint) {
        stickyNav.style.display = 'block';
    } else {
        stickyNav.style.display = 'none';
    }
};

window.addEventListener('scroll', toggleStickyNav, { passive: true });



const logos = document.getElementById("logos");
let currentTranslate = 0;

window.addEventListener("scroll", () => {
    currentTranslate -= 0.6; // speed
    logos.style.transform = `translateX(${currentTranslate}px)`;
});

document.querySelectorAll(".schools__row").forEach(wrapper => {
    let isDown = false;
    let startX;
    let scrollLeft;

    wrapper.addEventListener("mousedown", (e) => {
        isDown = true;
        wrapper.classList.add("active");
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("mouseleave", () => {
        isDown = false;
    });

    wrapper.addEventListener("mouseup", () => {
        isDown = false;
    });

    wrapper.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.5; // speed
        wrapper.scrollLeft = scrollLeft - walk;
    });
});
