/**
 * QASNILAB IT SOLUTIONS — Core Interactive & Lead Generation Engine
 * Handles CRO, Form Validation, Dynamic WhatsApp Funnel, 10s Modal, and Tracking
 */

(function () {
  'use strict';

  const PHONE_NUMBER = '+91 9236323804';
  const WHATSAPP_RAW = '919236323804';

  // 1. Analytics & Conversion Tracking Wrapper
  window.trackEvent = function (eventName, eventParams) {
    eventParams = eventParams || {};
    try {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: eventName, ...eventParams });
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
      }
      // Custom console log in development/testing
      console.log('[Analytics Event]', eventName, eventParams);
    } catch (e) {
      console.warn('Analytics tracking error:', e);
    }
  };

  // 2. Service-Specific WhatsApp Message Funnel
  const SERVICE_MESSAGES = {
    'website': 'Hello QasniLab, I need a website for my business in Kanpur. Please share details.',
    'software': 'Hello QasniLab, I need custom software for my business. Please share details.',
    'erp': 'Hello QasniLab, I am interested in ERP/business management software. Please share details.',
    'automation': 'Hello QasniLab, I want to automate my daily business processes in Kanpur. Please share details.',
    'marketing': 'Hello QasniLab, I need digital marketing services for my business in Kanpur.',
    'seo': 'Hello QasniLab, I want to improve my business visibility on Google in Kanpur.',
    'gbp': 'Hello QasniLab, I need Google Business Profile optimization for my Kanpur business.',
    'app': 'Hello QasniLab, I need mobile app development for my business.',
    'default': 'Hello QasniLab, I am interested in IT solutions for my business in Kanpur.'
  };

  window.openServiceWhatsApp = function (serviceKey) {
    const text = SERVICE_MESSAGES[serviceKey] || SERVICE_MESSAGES.default;
    window.trackEvent('whatsapp_click', { service: serviceKey, intent: 'service_cta' });
    const url = 'https://wa.me/' + WHATSAPP_RAW + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  // 3. Initialize Interactive Features
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initFaqAccordion();
    initLeadForms();
    initDelayedModal();
    initLinkTracking();
  });

  // Mobile Nav Toggle
  function initMobileNav() {
    const toggleBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('show');
      });
    });
  }

  // FAQ Accordions
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      btn.addEventListener('click', function () {
        const isActive = item.classList.contains('active');
        // Close others
        faqItems.forEach(function (other) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Lead Form Validation and Forwarding
  function initLeadForms() {
    const forms = document.querySelectorAll('.lead-capture-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot spam check
        const honeypot = form.querySelector('input[name="b_company_field"]');
        if (honeypot && honeypot.value.trim() !== '') {
          console.warn('Spam submission detected.');
          return;
        }

        const nameInput = form.querySelector('input[name="full_name"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const bizInput = form.querySelector('input[name="business_name"]');
        const serviceInput = form.querySelector('select[name="service_required"]');
        const msgInput = form.querySelector('textarea[name="message"]');
        const feedback = form.querySelector('.form-feedback');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const biz = bizInput ? bizInput.value.trim() : 'Local Business';
        const service = serviceInput ? serviceInput.value : 'General Enquiry';
        const msg = msgInput ? msgInput.value.trim() : '';

        // Validation
        if (!name) {
          showFeedback(feedback, 'Please enter your name.', 'error');
          if (nameInput) nameInput.focus();
          return;
        }

        // Validate Indian Phone number (10 digits, starting with 6, 7, 8, 9)
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const phoneRegex = /^[6-9]\d{9}$/;
        const isValidPhone = cleanPhone.length === 10 && phoneRegex.test(cleanPhone) ||
                             (cleanPhone.length === 12 && cleanPhone.startsWith('91') && phoneRegex.test(cleanPhone.substring(2)));

        if (!isValidPhone) {
          showFeedback(feedback, 'Please enter a valid 10-digit Indian phone number.', 'error');
          if (phoneInput) phoneInput.focus();
          return;
        }

        // Success state
        showFeedback(feedback, 'Thank you! Redirecting you to WhatsApp to instantly connect with our Kanpur team...', 'success');

        // Track conversion
        window.trackEvent('lead_form_submit', {
          service: service,
          has_business_name: Boolean(biz)
        });

        // WhatsApp redirect with clean business intent
        const formattedMsg = [
          'Hello QasniLab IT Solutions! 🚀',
          '',
          '*New Lead / Consultation Request*',
          '• *Name:* ' + name,
          '• *Phone:* ' + cleanPhone,
          '• *Business:* ' + biz,
          '• *Service Needed:* ' + service,
          msg ? '• *Note:* ' + msg : '',
          '',
          '_Please share consultation details._'
        ].filter(Boolean).join('\n');

        setTimeout(function () {
          const waUrl = 'https://wa.me/' + WHATSAPP_RAW + '?text=' + encodeURIComponent(formattedMsg);
          window.open(waUrl, '_blank');
          form.reset();
        }, 800);
      });
    });
  }

  function showFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-feedback ' + type;
  }

  // 10-Second Dwell / Non-Intrusive Exit-Intent Consultation Modal
  function initDelayedModal() {
    const modalBackdrop = document.getElementById('consultModalBackdrop');
    if (!modalBackdrop) return;

    const DISMISSED_KEY = 'qasnilab_consult_dismissed';
    const dismissedTime = localStorage.getItem(DISMISSED_KEY);
    const now = Date.now();

    // Check if dismissed in last 7 days
    if (dismissedTime && (now - parseInt(dismissedTime, 10)) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    let timer = setTimeout(function () {
      modalBackdrop.classList.add('show');
      window.trackEvent('modal_shown', { type: '10s_dwell_consultation' });
    }, 10000); // 10 seconds dwell time

    // Close logic
    const closeBtn = modalBackdrop.querySelector('.consult-modal-close');
    function closeModal() {
      modalBackdrop.classList.remove('show');
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
      if (timer) clearTimeout(timer);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Track telephone and direct WhatsApp link clicks
  function initLinkTracking() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (telLink) {
      telLink.addEventListener('click', function () {
        window.trackEvent('phone_click', { phone: telLink.getAttribute('href') });
      });
    });

    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (waLink) {
      waLink.addEventListener('click', function () {
        window.trackEvent('whatsapp_click', { url: waLink.getAttribute('href') });
      });
    });
  }
})();
