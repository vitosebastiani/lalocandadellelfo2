const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav');
const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}

const setMenuState = (open) => {
  if (!navToggle || !nav) return;
  nav.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  document.body.classList.toggle('menu-open', open);
};

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    setMenuState(!nav.classList.contains('open'));
  });
}

document.addEventListener('click', (event) => {
  if (!nav || !navToggle) return;
  if (!nav.classList.contains('open')) return;
  if (nav.contains(event.target) || navToggle.contains(event.target)) return;
  setMenuState(false);
});

for (const link of navLinks) {
  link.addEventListener('click', () => setMenuState(false));
}

const sections = Array.from(document.querySelectorAll('main section[id]'));
const sectionObserver = sections.length
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.nav a[href="#${entry.target.id}"]`);
        if (link) {
          link.classList.toggle('is-active', entry.isIntersecting);
        }
      });
    }, { rootMargin: '-40% 0px -45% 0px', threshold: 0.05 })
  : null;

sections.forEach((section) => sectionObserver?.observe(section));

const onScroll = () => {
  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  for (const node of document.querySelectorAll('[data-parallax]')) {
    const speed = Number(node.dataset.parallax || 0.12);
    const offset = window.scrollY * speed;
    node.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
};

window.addEventListener('scroll', () => window.requestAnimationFrame(onScroll), { passive: true });
onScroll();

const revealItems = document.querySelectorAll('.reveal, .reveal-up, .reveal-scale');
const revealObserver = revealItems.length
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 })
  : null;

revealItems.forEach((item) => revealObserver?.observe(item));

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.counter || 0);
    const suffix = element.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
    observer.unobserve(element);
  });
}, { threshold: 0.55 });

document.querySelectorAll('[data-counter]').forEach((counter) => counterObserver.observe(counter));

const heroCarousel = document.querySelector('[data-hero-carousel]');

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll('[data-hero-slide]'));
  const prevButton = heroCarousel.querySelector('[data-hero-prev]');
  const nextButton = heroCarousel.querySelector('[data-hero-next]');
  const dotsWrap = heroCarousel.querySelector('[data-hero-dots]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroIndex = 0;
  let heroTimer = null;
  let touchStartX = 0;
  let touchCurrentX = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-label', `Vai alla slide ${index + 1}`);
    dot.addEventListener('click', () => {
      renderHero(index);
      restartHero();
    });
    dotsWrap?.appendChild(dot);
  });

  const renderHero = (nextIndex) => {
    heroIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === heroIndex);
    });
    dotsWrap?.querySelectorAll('.hero-carousel-dot').forEach((dot, index) => {
      dot.setAttribute('aria-current', index === heroIndex ? 'true' : 'false');
    });
  };

  const startHero = () => {
    if (prefersReducedMotion) return;
    heroTimer = window.setInterval(() => renderHero(heroIndex + 1), 5000);
  };

  const stopHero = () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  };

  const restartHero = () => {
    stopHero();
    startHero();
  };

  prevButton?.addEventListener('click', () => {
    renderHero(heroIndex - 1);
    restartHero();
  });

  nextButton?.addEventListener('click', () => {
    renderHero(heroIndex + 1);
    restartHero();
  });

  heroCarousel.addEventListener('mouseenter', stopHero);
  heroCarousel.addEventListener('mouseleave', startHero);
  heroCarousel.addEventListener('focusin', stopHero);
  heroCarousel.addEventListener('focusout', startHero);

  heroCarousel.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchCurrentX = touch.clientX;
    stopHero();
  }, { passive: true });

  heroCarousel.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchCurrentX = touch.clientX;
  }, { passive: true });

  heroCarousel.addEventListener('touchend', () => {
    const deltaX = touchCurrentX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      renderHero(deltaX < 0 ? heroIndex + 1 : heroIndex - 1);
    }
    restartHero();
  }, { passive: true });

  heroCarousel.addEventListener('pointerdown', stopHero);
  heroCarousel.addEventListener('pointerup', restartHero);
  heroCarousel.addEventListener('pointercancel', restartHero);

  renderHero(0);
  startHero();
}

const testimonialItems = [
  {
    name: 'Marta R.',
    role: 'Ospite - novembre 2025',
    quote: "Gli spaghetti all'assassina arrivano con carattere, il servizio e' attento e l'atmosfera resta calda fino all'ultimo tavolo.",
    image: 'assets/img/people/image.png'
  },
  {
    name: 'Dario A.',
    role: 'Cliente abituale - ottobre 2025',
    quote: 'Cucina barese autentica senza fronzoli, ma presentata con grande cura. Il mix tra tradizione e stile del locale funziona davvero.',
    image: 'assets/img/people/DA.jpeg'
  },
  {
    name: 'Giulia P.',
    role: 'Traveller review - settembre 2025',
    quote: "Materie prime ottime, porzioni ben calibrate e un ambiente che ti fa sentire in un posto speciale gia' dall'ingresso.",
    image: 'assets/img/locanda.jpeg'
  }
];

const testimonialRoot = document.querySelector('[data-testimonials]');

if (testimonialRoot) {
  const imageStage = testimonialRoot.querySelector('[data-testimonial-images]');
  const quoteNode = testimonialRoot.querySelector('[data-testimonial-quote]');
  const nameNode = testimonialRoot.querySelector('[data-testimonial-name]');
  const roleNode = testimonialRoot.querySelector('[data-testimonial-role]');
  const dotsNode = testimonialRoot.querySelector('[data-testimonial-dots]');
  const prevButton = testimonialRoot.querySelector('[data-testimonial-prev]');
  const nextButton = testimonialRoot.querySelector('[data-testimonial-next]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let autoplay = null;
  const avatars = [];

  testimonialItems.forEach((item, itemIndex) => {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name;
    image.className = 'testimonial-avatar';
    image.loading = itemIndex === 0 ? 'eager' : 'lazy';
    imageStage?.appendChild(image);
    avatars.push(image);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.setAttribute('aria-label', `Vai alla recensione ${itemIndex + 1}`);
    dot.addEventListener('click', () => {
      renderTestimonial(itemIndex);
      restartAutoplay();
    });
    dotsNode?.appendChild(dot);
  });

  const renderAvatars = () => {
    avatars.forEach((avatar, avatarIndex) => {
      const leftIndex = (index - 1 + avatars.length) % avatars.length;
      const rightIndex = (index + 1) % avatars.length;

      if (avatarIndex === index) {
        avatar.style.opacity = '1';
        avatar.style.transform = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)';
        avatar.style.zIndex = '3';
      } else if (avatarIndex === leftIndex) {
        avatar.style.opacity = '0.55';
        avatar.style.transform = 'translate3d(-12%, 8%, -40px) scale(0.82) rotateY(18deg)';
        avatar.style.zIndex = '2';
      } else if (avatarIndex === rightIndex) {
        avatar.style.opacity = '0.55';
        avatar.style.transform = 'translate3d(12%, -8%, -40px) scale(0.82) rotateY(-18deg)';
        avatar.style.zIndex = '2';
      } else {
        avatar.style.opacity = '0';
        avatar.style.transform = 'translate3d(0, 0, -80px) scale(0.75)';
        avatar.style.zIndex = '1';
      }
    });
  };

  const renderTestimonial = (nextIndex) => {
    index = (nextIndex + testimonialItems.length) % testimonialItems.length;
    const current = testimonialItems[index];

    if (quoteNode) {
      quoteNode.textContent = current.quote;
    }

    if (nameNode) {
      nameNode.textContent = current.name;
    }

    if (roleNode) {
      roleNode.textContent = current.role;
    }

    dotsNode?.querySelectorAll('.testimonial-dot').forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });

    renderAvatars();
  };

  const startAutoplay = () => {
    if (prefersReducedMotion) return;
    autoplay = window.setInterval(() => renderTestimonial(index + 1), 5500);
  };

  const stopAutoplay = () => {
    if (autoplay) {
      window.clearInterval(autoplay);
      autoplay = null;
    }
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  prevButton?.addEventListener('click', () => {
    renderTestimonial(index - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    renderTestimonial(index + 1);
    restartAutoplay();
  });

  testimonialRoot.addEventListener('mouseenter', stopAutoplay);
  testimonialRoot.addEventListener('mouseleave', startAutoplay);
  testimonialRoot.addEventListener('focusin', stopAutoplay);
  testimonialRoot.addEventListener('focusout', startAutoplay);

  renderTestimonial(0);
  startAutoplay();
}

const menuGrid = document.querySelector('#menuGrid');

if (menuGrid) {
  const menuData = [
    {
      title: 'Antipasti',
      tag: 'Inizio tavola',
      description: 'Piccoli assaggi pugliesi da condividere, tra fritti leggeri, mare e orto.',
      items: [
        { name: 'Saute di cozze', description: 'Cozze fresche, prezzemolo, aglio e pane tostato', price: 'EUR 12' },
        { name: 'Antipasto tradizionale', description: 'Selezione della casa con specialita del giorno', price: 'EUR 16' },
        { name: 'Gamberetti fritti', description: 'Croccanti, asciutti e serviti con maionese agrumata', price: 'EUR 14' }
      ]
    },
    {
      title: 'Primi iconici',
      tag: 'Best seller',
      description: 'Pasta, fondo saporito e carattere barese. Qui vive il cuore del menu.',
      items: [
        { name: "Spaghetti all'assassina", description: 'Pomodoro, crosta croccante e piccantezza calibrata', price: 'EUR 13' },
        { name: "Mb'a Vnginz", description: 'Gamberi, gorgonzola D.O.P., rucola e pomodoro fresco', price: 'EUR 16' },
        { name: 'Spaghetti allo scoglio', description: 'Frutti di mare e fondo intenso al profumo di mare', price: 'EUR 18' }
      ]
    },
    {
      title: 'Tradizione di terra',
      tag: 'Ricette di casa',
      description: 'Piatti rassicuranti, ingredienti stagionali e sapori puliti.',
      items: [
        { name: 'Orecchiette alle cime di rapa', description: 'Alici, pane croccante e olio extravergine', price: 'EUR 12' },
        { name: 'Pasta e fagioli', description: 'Cremosa, avvolgente, rifinita con olio pugliese', price: 'EUR 11' },
        { name: 'Rape stufate', description: 'Contorno tipico dal gusto deciso e autentico', price: 'EUR 7' }
      ]
    },
    {
      title: 'Dal mare',
      tag: 'Secondi',
      description: 'Cotture essenziali per lasciare spazio alla qualita del prodotto.',
      items: [
        { name: 'Scampi alla griglia', description: 'Cottura rapida, olio EVO e limone', price: 'EUR 22' },
        { name: 'Merluzzo dorato', description: 'Servito con verdure di stagione e salsa leggera', price: 'EUR 18' },
        { name: 'Pesce del giorno', description: 'Disponibilita secondo mercato e pescato', price: 'EUR 24' }
      ]
    }
  ];

  menuGrid.innerHTML = '';

  menuData.forEach((section, sectionIndex) => {
    const article = document.createElement('article');
    article.className = `menu-card reveal-up delay-${Math.min(sectionIndex, 4)}`;

    const tag = document.createElement('span');
    tag.className = 'menu-tag';
    tag.textContent = section.tag;

    const heading = document.createElement('h3');
    heading.textContent = section.title;

    const description = document.createElement('p');
    description.textContent = section.description;

    const list = document.createElement('dl');
    list.className = 'menu-list';

    section.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'menu-row';

      const dt = document.createElement('dt');
      dt.innerHTML = `<strong>${item.name}</strong><span>${item.description}</span>`;

      const dd = document.createElement('dd');
      dd.textContent = item.price;

      row.append(dt, dd);
      list.appendChild(row);
    });

    article.append(tag, heading, description, list);
    menuGrid.appendChild(article);
    revealObserver?.observe(article);
  });
}
