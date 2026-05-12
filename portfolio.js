const menuButton = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("section[id]");

const closeMenu = () => {
  navMenu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
};

menuButton.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

const markActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleSection) {
      markActiveLink(visibleSection.target.id);
    }
  },
  {
    threshold: [0.25, 0.5, 0.75],
    rootMargin: "-25% 0px -55% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));
