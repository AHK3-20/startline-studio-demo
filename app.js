(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  document.querySelectorAll('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialog);
      if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  document.querySelectorAll('.concept-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchTargets = document.querySelectorAll('.desktop-nav a, .mobile-nav a, .header-cta, .button, .round-link, .creative-break-link, .project-button, .service-list summary, .faq-list summary, .payment-option, .text-link, .menu-toggle, .footer-up, .concept-dialog button');
  touchTargets.forEach(target => {
    target.classList.add('tap-responsive');
    target.addEventListener('pointerdown', event => {
      if (reducedMotion.matches) return;
      const bounds = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'tap-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.setProperty('--tap-x', `${event.clientX - bounds.left}px`);
      ripple.style.setProperty('--tap-y', `${event.clientY - bounds.top}px`);
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      window.setTimeout(() => ripple.remove(), 1000);
    }, { passive: true });
  });

  const serviceArt = document.querySelector('.service-art');
  document.querySelectorAll('.service-list details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open || reducedMotion.matches || !serviceArt) return;
      serviceArt.classList.remove('is-reacting');
      void serviceArt.offsetWidth;
      serviceArt.classList.add('is-reacting');
    });
  });

  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.project-visual').forEach(visual => {
    let frame = 0;
    visual.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !canTilt.matches || event.pointerType !== 'mouse') return;
      const rect = visual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - .5) * -6;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        visual.style.setProperty('--tilt-x', `${x.toFixed(2)}deg`);
        visual.style.setProperty('--tilt-y', `${y.toFixed(2)}deg`);
      });
    }, { passive: true });
    visual.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      visual.style.removeProperty('--tilt-x');
      visual.style.removeProperty('--tilt-y');
    });
  });

  const hero = document.querySelector('.hero');
  let heroFrame = 0;
  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !canTilt.matches || event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - .5) * -12;
    const y = ((event.clientY - box.top) / box.height - .5) * -8;
    cancelAnimationFrame(heroFrame);
    heroFrame = requestAnimationFrame(() => {
      hero.style.setProperty('--hero-x', `${x.toFixed(1)}px`);
      hero.style.setProperty('--hero-y', `${y.toFixed(1)}px`);
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    cancelAnimationFrame(heroFrame);
    hero.style.removeProperty('--hero-x');
    hero.style.removeProperty('--hero-y');
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view-animate');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.pillars>div, .video-card, .project-card, .steps>div').forEach(el => observer.observe(el));
  }

  document.querySelectorAll('.project-visual img, .concept-dialog img').forEach(image => {
    image.addEventListener('pointerdown', () => {
      if (reducedMotion.matches) return;
      image.classList.remove('image-pressed');
      void image.offsetWidth;
      image.classList.add('image-pressed');
    }, { passive: true });
  });

  const videos = document.querySelectorAll('.video-card video');
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));

  const paymentOptions = document.querySelectorAll('[data-payment-option]');
  const paymentPreview = document.getElementById('payment-method-preview');
  const paymentMessage = document.querySelector('.payment-message');
  paymentOptions.forEach(option => option.addEventListener('click', () => {
    paymentOptions.forEach(item => item.setAttribute('aria-pressed', String(item === option)));
    const method = option.dataset.paymentOption;
    paymentPreview.textContent = method;
    paymentMessage.textContent = `${method} selected for this demo. No payment is taken.`;
  }));

  const year = document.getElementById('year');
  year.textContent = String(new Date().getFullYear());

  const form = document.getElementById('brief-form');
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const brief = [
      'Hello Startline Studio,',
      '',
      'My name: ' + data.get('name'),
      'Business or idea: ' + (data.get('business') || 'Not provided'),
      'Interested in: ' + data.get('service'),
      'About my project: ' + (data.get('details') || 'Not provided')
    ].join('\n');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(brief);
      } else {
        const area = document.createElement('textarea');
        area.value = brief;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        if (!ok) throw new Error('Copy unavailable');
      }
      status.textContent = 'Copied. Your project details are ready to paste into a message.';
    } catch (err) {
      status.textContent = 'Unable to copy automatically. Please select and copy your details manually.';
    }
  });
})();
