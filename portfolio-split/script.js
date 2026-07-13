// Dasari Hemavathi — Portfolio interactions
// 1) Highlights the active nav link based on scroll position
// 2) Fades sections in as they enter the viewport

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navlinks a');
  const sections = document.querySelectorAll('section[id]');

  // Active nav link on scroll
  const setActiveLink = () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 90;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach((link) => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--gold)';
      }
    });
  };

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  // Fade-in sections as they scroll into view
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sections.forEach((section) => {
    if (!prefersReducedMotion) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(16px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
    revealObserver.observe(section);
  });
});
