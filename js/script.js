(() => {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // Header state
  const header = $(".site-header");
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 30);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Smooth-scroll for same-page anchors and close mobile offcanvas.
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      UIkit.offcanvas("#mobileMenu").hide();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Search interaction
  const searchToggle = $("#searchToggle");
  const searchPanel = $("#searchPanel");
  const searchInput = $("#siteSearch");
  const searchButton = $("#searchButton");
  const searchResult = $("#searchResult");

  searchToggle?.addEventListener("click", () => {
    searchPanel.hidden = !searchPanel.hidden;
    if (!searchPanel.hidden) setTimeout(() => searchInput.focus(), 50);
  });

  const runSearch = () => {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) {
      searchResult.textContent = "Type a note, ingredient, or perfume name.";
      return;
    }
    const matches = $$(".product-card").filter(card => card.dataset.search.includes(term));
    if (matches.length) {
      searchResult.textContent = `${matches.length} signature${matches.length > 1 ? "s" : ""} found.`;
      matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
      matches.forEach(card => {
        card.animate(
          [{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }, { transform: "translateY(0)" }],
          { duration: 650, easing: "ease-out" }
        );
      });
    } else {
      searchResult.textContent = "No exact match — try amber, rose, oud, citrus, or musk.";
    }
  };

  searchButton?.addEventListener("click", runSearch);
  searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") runSearch();
  });

  // Scroll reveal
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px" });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("revealed"));
  }

  // Consultation modal triggers
  $$("[data-open-consultation]").forEach(button => {
    button.addEventListener("click", () => UIkit.modal("#consultationModal").show());
  });

  // Product data + quick-view modal
  const products = {
    "l-or-dombre": {
      no: "NO. 01 · BESTSELLER",
      name: "Noir Éclat",
      description: "A warm, glowing amber built around saffron, polished cedar and a soft vanilla skin trail. Rich, but never loud.",
      notes: ["Saffron", "Amber", "Vanilla", "Cedar"],
      price: "€185",
      image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=85"
    },
    "rose-minuit": {
      no: "NO. 02 · NEW",
      name: "Velours Rose",
      description: "A midnight rose with a peppery opening and clean musk beneath. Velvet texture, modern attitude.",
      notes: ["Damask Rose", "Pink Pepper", "Iris", "Musk"],
      price: "€165",
      image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85"
    },
    "sillage-solaire": {
      no: "NO. 03",
      name: "Santal Lumière",
      description: "A radiant citrus-floral that starts bright and dries down to a creamy, mineral vetiver.",
      notes: ["Neroli", "Bergamot", "Orange Blossom", "Vetiver"],
      price: "€155",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"
    },
    "velours-noir": {
      no: "NO. 04 · INTENSE",
      name: "Maison Noire",
      description: "Dark oud, incense and suede wrapped in sandalwood. A slow-burning evening fragrance with exceptional depth.",
      notes: ["Black Oud", "Incense", "Suede", "Sandalwood"],
      price: "€195",
      image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85"
    }
  };

  const productModal = UIkit.modal("#productModal");
  const modalImage = $("#modalProductImage");
  const modalNo = $("#modalProductNo");
  const modalName = $("#modalProductName");
  const modalDescription = $("#modalProductDescription");
  const modalNotes = $("#modalProductNotes");
  const modalPrice = $("#modalProductPrice");
  const modalAdd = $("#modalAddButton");

  let activeProduct = null;

  $$("[data-product]").forEach(button => {
    button.addEventListener("click", () => {
      const product = products[button.dataset.product];
      if (!product) return;
      activeProduct = product;
      modalImage.src = product.image;
      modalImage.alt = `${product.name} perfume`;
      modalNo.textContent = product.no;
      modalName.textContent = product.name;
      modalDescription.textContent = product.description;
      modalNotes.innerHTML = product.notes.map(note => `<span>${note}</span>`).join("");
      modalPrice.textContent = product.price;
      productModal.show();
    });
  });

  // Bag state
  let bagCount = 0;
  const bagCountEl = $(".bag-count");
  const toast = $("#toast");
  let toastTimer;

  const showToast = message => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  };

  const addToBag = name => {
    bagCount += 1;
    bagCountEl.textContent = bagCount;
    showToast(`${name} added to your bag.`);
  };

  $$("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
      const name = $(".product-info h3", button.closest(".product-card")).textContent;
      addToBag(name);
    });
  });

  modalAdd?.addEventListener("click", () => {
    if (!activeProduct) return;
    addToBag(activeProduct.name);
    productModal.hide();
  });

  // Contact form validation
  const form = $("#contactForm");
  const status = $("#formStatus");

  const setError = (input, message = "") => {
    const field = input.closest(".field");
    const error = $(".field-error", field);
    field.classList.toggle("invalid", Boolean(message));
    error.textContent = message;
  };

  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  form?.addEventListener("submit", event => {
    event.preventDefault();
    status.textContent = "";

    const name = $("#name");
    const email = $("#email");
    const phone = $("#phone");
    const message = $("#message");
    let valid = true;

    if (name.value.trim().length < 2) {
      setError(name, "Please enter your name.");
      valid = false;
    } else setError(name);

    if (!validEmail(email.value.trim())) {
      setError(email, "Please enter a valid email.");
      valid = false;
    } else setError(email);

    if (phone.value.trim() && !/^[+()\d\s-]{7,20}$/.test(phone.value.trim())) {
      setError(phone, "Please enter a valid phone number.");
      valid = false;
    } else setError(phone);

    if (message.value.trim().length < 10) {
      setError(message, "Please tell us a little more.");
      valid = false;
    } else setError(message);

    if (!valid) {
      status.textContent = "Please check the highlighted fields.";
      return;
    }

    // Frontend-only success state. Connect this submit handler to your API/email service in production.
    status.textContent = "Thank you — your enquiry has been received. Our atelier will be in touch.";
    form.reset();
    showToast("Enquiry sent successfully.");
  });

  // Clear field errors while typing
  $$(".luxury-form input, .luxury-form textarea").forEach(input => {
    input.addEventListener("input", () => setError(input));
  });

  // Footer year
  $("#year").textContent = new Date().getFullYear();
})();


/* =========================================================
   HighClassPerfume — Enhanced Motion Controller
   ========================================================= */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress indicator
  const progress = document.createElement('div');
  progress.className = 'hcp-progress';
  document.body.appendChild(progress);

  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (reducedMotion) return;

  // Re-observe useful visual elements for image/heading reveals.
  const motionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll(
    '.reveal-image, .section-heading, .experience-head, .collection-banner, .journal-card'
  ).forEach(el => motionObserver.observe(el));

  // Desktop pointer glow — subtle and intentionally low contrast.
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'hcp-cursor-glow';
    document.body.appendChild(glow);
    document.body.classList.add('hcp-pointer');

    let targetX = -300, targetY = -300, currentX = targetX, currentY = targetY;
    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    const animateGlow = () => {
      currentX += (targetX - currentX) * .12;
      currentY += (targetY - currentY) * .12;
      glow.style.left = `${currentX}px`;
      glow.style.top = `${currentY}px`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  // Very small ambient gold particles on the page.
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('span');
    particle.className = 'hcp-particle';
    particle.style.left = `${8 + Math.random() * 84}%`;
    particle.style.top = `${45 + Math.random() * 45}%`;
    particle.style.setProperty('--duration', `${7 + Math.random() * 8}s`);
    particle.style.setProperty('--drift', `${-35 + Math.random() * 70}px`);
    particle.style.animationDelay = `${Math.random() * -8}s`;
    document.body.appendChild(particle);
  }

  // Tiny magnetic-style movement for primary CTAs.
  document.querySelectorAll('.gold-button').forEach(button => {
    button.addEventListener('pointermove', e => {
      const r = button.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .045;
      const y = (e.clientY - r.top - r.height / 2) * .045;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });

  // Product add-to-bag micro animation.
  document.addEventListener('click', event => {
    const button = event.target.closest('.add-bag');
    if (!button) return;
    button.classList.remove('is-added');
    requestAnimationFrame(() => button.classList.add('is-added'));
    setTimeout(() => button.classList.remove('is-added'), 650);
  });

  // Highlight navigation section while scrolling.
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'uk-active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  }, { threshold: .35 });

  sections.forEach(section => navObserver.observe(section));
})();
