const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");

if (toggle && nav) {
  const openLabel = toggle.dataset.labelOpen || "Open menu";
  const closeLabel = toggle.dataset.labelClose || "Close menu";

  const syncMenuState = (open) => {
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? closeLabel : openLabel);
    document.body.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => {
    syncMenuState(!nav.classList.contains("open"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      syncMenuState(false);
    }
  });
}

for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (toggle) {
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", toggle.dataset.labelOpen || "Open menu");
    }
    if (nav) nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
}

(() => {
  const navElement = document.querySelector(".nav");
  if (!navElement) return;

  const pageLinks = Array.from(navElement.querySelectorAll('a[href^="#"]'));
  if (!pageLinks.length) return;

  const linkMap = new Map();
  const sections = [];

  pageLinks.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    linkMap.set(id, link);
    sections.push(target);
  });

  if (!sections.length) return;

  const setActive = (id) => {
    pageLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const updateActiveSection = () => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (documentHeight - scrollBottom <= 24) {
      setActive(sections[sections.length - 1].id);
      return;
    }

    const marker = window.innerHeight * 0.38;
    let current = sections[0].id;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker) {
        current = section.id;
      }
    });

    setActive(current);
  };

  updateActiveSection();
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  window.addEventListener("hashchange", updateActiveSection);
})();

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const slider = document.getElementById("foodSlider");
if (slider) {
  const slides = Array.from(slider.querySelectorAll(".slide"));
  let index = 0;

  const show = (nextIndex) => {
    index = nextIndex;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
  };

  if (slides.length > 1) {
    window.setInterval(() => {
      show((index + 1) % slides.length);
    }, 4200);
  } else {
    show(0);
  }
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const observedRevealTargets = new WeakSet();
let revealObserver = null;

const revealNow = (root = document) => {
  root.querySelectorAll(".reveal, .reveal-img").forEach((element) => {
    element.classList.add("visible");
  });
};

const observeReveals = (root = document) => {
  const targets = root.querySelectorAll(".reveal, .reveal-img");

  if (!targets.length) return;

  if (prefersReducedMotion) {
    revealNow(root);
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );
  }

  targets.forEach((element) => {
    if (observedRevealTargets.has(element)) return;
    observedRevealTargets.add(element);
    revealObserver.observe(element);
  });
};

observeReveals();
window.__codexObserveReveals = observeReveals;

(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-shrink", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
})();

(() => {
  if (prefersReducedMotion) return;

  const parallaxItems = Array.from(document.querySelectorAll(".parallax-soft"));
  if (!parallaxItems.length) return;

  const updateParallax = () => {
    const viewportHeight = window.innerHeight || 1;

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
      const offset = Math.max(-14, Math.min(14, progress * -14));
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
})();

(() => {
  const container = document.getElementById("ctImages");
  const prev = document.getElementById("ctPrev");
  const next = document.getElementById("ctNext");
  const name = document.getElementById("ctName");
  const meta = document.getElementById("ctDesig");
  const quote = document.getElementById("ctQuote");
  const wrap = document.getElementById("ctQuoteWrap");

  if (!container || !prev || !next || !name || !meta || !quote || !wrap) return;

  const isItalian = document.documentElement.lang === "it";
  const testimonials = isItalian
    ? [
        {
          name: "Marta R.",
          designation: "5 stelle - ospite recente",
          quote: "Atmosfera calda, impiattamento curato e una sensazione di autenticita che resta dall'inizio alla fine.",
          src: "assets/img/people/image.png"
        },
        {
          name: "Dario A.",
          designation: "4 stelle - visita serale",
          quote: "Cucina tipica barese fatta bene, servizio cordiale e un'identita visiva finalmente all'altezza del locale.",
          src: "assets/img/people/DA.jpeg"
        },
        {
          name: "Vito U.",
          designation: "5 stelle - cliente soddisfatto",
          quote: "Piatti chiari, atmosfera avvolgente e un sito che adesso trasmette davvero il carattere della locanda.",
          src: "assets/img/people/ubaldini.gif"
        }
      ]
    : [
        {
          name: "Marta R.",
          designation: "5 stars - recent guest",
          quote: "Warm atmosphere, thoughtful plating, and a strong sense of authenticity from the first course to the last.",
          src: "assets/img/people/image.png"
        },
        {
          name: "Dario A.",
          designation: "4 stars - evening visit",
          quote: "Well-made Bari classics, friendly service, and a visual identity that now matches the quality of the restaurant.",
          src: "assets/img/people/DA.jpeg"
        },
        {
          name: "Vito U.",
          designation: "5 stars - happy guest",
          quote: "Clear menu, inviting mood, and a website that finally feels aligned with the place itself.",
          src: "assets/img/people/ubaldini.gif"
        }
      ];

  let active = 0;
  let timer = null;

  const images = testimonials.map((testimonial) => {
    const image = document.createElement("img");
    image.className = "ct-img";
    image.src = testimonial.src;
    image.alt = testimonial.name;
    container.appendChild(image);
    return image;
  });

  const gap = () => {
    const width = container.offsetWidth;
    return Math.min(84, Math.max(24, width * 0.2));
  };

  const renderImages = () => {
    const distance = gap();
    const rise = distance * 0.78;
    const total = testimonials.length;

    images.forEach((image, index) => {
      const isActive = index === active;
      const isLeft = (active - 1 + total) % total === index;
      const isRight = (active + 1) % total === index;

      if (isActive) {
        image.style.cssText = "z-index:3;opacity:1;transform:translateX(0) translateY(0) scale(1) rotateY(0deg);";
      } else if (isLeft) {
        image.style.cssText = `z-index:2;opacity:0.96;transform:translateX(-${distance}px) translateY(-${rise}px) scale(0.84) rotateY(16deg);`;
      } else if (isRight) {
        image.style.cssText = `z-index:2;opacity:0.96;transform:translateX(${distance}px) translateY(-${rise}px) scale(0.84) rotateY(-16deg);`;
      } else {
        image.style.cssText = "z-index:1;opacity:0;transform:scale(0.7);";
      }
    });
  };

  const renderText = () => {
    const current = testimonials[active];
    wrap.style.animation = "none";
    void wrap.offsetWidth;
    wrap.style.animation = "ctFade .35s ease";
    name.textContent = current.name;
    meta.textContent = current.designation;
    quote.textContent = current.quote;
  };

  const render = () => {
    renderImages();
    renderText();
  };

  const go = (direction) => {
    active = (active + direction + testimonials.length) % testimonials.length;
    render();
    restartAutoplay();
  };

  const startAutoplay = () => {
    if (prefersReducedMotion) return;
    timer = window.setInterval(() => {
      active = (active + 1) % testimonials.length;
      render();
    }, 5500);
  };

  const stopAutoplay = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  window.addEventListener("resize", renderImages);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  });

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  render();
  startAutoplay();
})();
