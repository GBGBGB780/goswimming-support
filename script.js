(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = [...document.querySelectorAll(".reveal")];

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  requestAnimationFrame(() => {
    document
      .querySelectorAll(".hero .reveal")
      .forEach((item) => item.classList.add("is-visible"));
  });

  const storySteps = [...document.querySelectorAll(".story-step")];
  const storyScreens = [...document.querySelectorAll(".story-screen")];
  const storyCaption = document.querySelector("[data-story-caption]");

  const activateStory = (step) => {
    if (!step) return;

    const target = step.dataset.target;
    storySteps.forEach((item) =>
      item.classList.toggle("is-active", item === step),
    );
    storyScreens.forEach((screen) =>
      screen.classList.toggle("is-active", screen.dataset.screen === target),
    );

    if (storyCaption && step.dataset.caption) {
      storyCaption.animate(
        [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" },
      );
      storyCaption.textContent = step.dataset.caption;
    }
  };

  if (storySteps.length && "IntersectionObserver" in window) {
    const storyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) activateStory(visible[0].target);
      },
      {
        rootMargin: "-34% 0px -38% 0px",
        threshold: [0.05, 0.2, 0.45, 0.7],
      },
    );

    storySteps.forEach((step) => storyObserver.observe(step));
  }

  document.querySelectorAll(".faq-list details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const counterElements = [...document.querySelectorAll("[data-counter]")];

  if (counterElements.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const target = Number(element.dataset.counter);
          const duration = 900;
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(element);
        });
      },
      { threshold: 0.7 },
    );

    counterElements.forEach((counter) => counterObserver.observe(counter));
  }

  const heroProduct = document.querySelector(".hero-product");

  if (heroProduct && !reducedMotion.matches && window.innerWidth > 860) {
    const handlePointer = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 9;
      heroProduct.style.setProperty("--pointer-x", `${x}px`);
      heroProduct.style.setProperty("--pointer-y", `${y}px`);
      heroProduct.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
  }

  const canvas = document.querySelector(".water-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frameId = 0;
  let lastFrame = 0;

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const drawWaves = (time = 0) => {
    context.clearRect(0, 0, width, height);

    const scrollShift = (window.scrollY || 0) * 0.035;
    const waveCount = width < 640 ? 4 : 6;

    for (let line = 0; line < waveCount; line += 1) {
      const baseline =
        height * (0.16 + line * 0.145) + Math.sin(scrollShift * 0.01 + line) * 12;
      const amplitude = 8 + line * 3.4;
      const speed = 0.00022 + line * 0.000025;
      const frequency = 0.008 + line * 0.0007;
      const alpha = 0.035 + (waveCount - line) * 0.008;
      const gradient = context.createLinearGradient(0, 0, width, 0);

      gradient.addColorStop(0, `rgba(71, 128, 230, ${alpha * 0.45})`);
      gradient.addColorStop(0.45, `rgba(94, 218, 244, ${alpha})`);
      gradient.addColorStop(1, `rgba(44, 101, 190, ${alpha * 0.3})`);

      context.beginPath();

      for (let x = -20; x <= width + 20; x += 5) {
        const primary = Math.sin(x * frequency + time * speed + line * 0.9);
        const secondary = Math.sin(x * frequency * 0.46 - time * speed * 0.7);
        const y = baseline + primary * amplitude + secondary * amplitude * 0.36;

        if (x === -20) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.strokeStyle = gradient;
      context.lineWidth = line % 2 === 0 ? 1.15 : 0.8;
      context.stroke();
    }
  };

  const animateWaves = (time) => {
    if (time - lastFrame > 22) {
      drawWaves(time);
      lastFrame = time;
    }
    frameId = requestAnimationFrame(animateWaves);
  };

  resizeCanvas();

  if (reducedMotion.matches) {
    drawWaves();
  } else {
    frameId = requestAnimationFrame(animateWaves);
  }

  window.addEventListener(
    "resize",
    () => {
      resizeCanvas();
      if (reducedMotion.matches) drawWaves();
    },
    { passive: true },
  );

  reducedMotion.addEventListener?.("change", (event) => {
    cancelAnimationFrame(frameId);
    if (event.matches) drawWaves();
    else frameId = requestAnimationFrame(animateWaves);
  });
})();
