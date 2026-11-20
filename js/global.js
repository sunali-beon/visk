/* ============================================================
   VISK Farm — global.js
   Mobile menu, smooth scroll, header scroll, form interactions
   ============================================================ */

(function () {
  'use strict';

  /* --- Mobile Menu Toggle --- */
  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('mobile-menu--open');
      toggle.classList.toggle('menu-toggle--active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close menu when a link is clicked */
    var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('mobile-menu--open');
        toggle.classList.remove('menu-toggle--active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = document.querySelector('.site-header')
          ? document.querySelector('.site-header').offsetHeight
          : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* --- Header shadow on scroll --- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      var scrollY = window.pageYOffset;
      if (scrollY > 10) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }
    }, { passive: true });
  }


  /* --- Application filter chips --- */
  var filterChips = document.querySelectorAll('.applications__chip');
  var appCards = document.querySelectorAll('.app-card');

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      // Update active state
      filterChips.forEach(function (c) {
        c.classList.remove('applications__chip--active');
        c.setAttribute('aria-selected', 'false');
      });
      this.classList.add('applications__chip--active');
      this.setAttribute('aria-selected', 'true');

      var filter = this.getAttribute('data-filter');

      appCards.forEach(function (card) {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          card.style.display = card.getAttribute('data-type') === filter ? '' : 'none';
        }
      });
    });
  });


  /* --- Pack size pill selection --- */
  var pills = document.querySelectorAll('.form-field__pill input[type="radio"]');
  pills.forEach(function (radio) {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.form-field__pill').forEach(function (pill) {
        pill.classList.remove('form-field__pill--active');
      });
      if (this.checked) {
        this.parentElement.classList.add('form-field__pill--active');
      }
    });
  });

  // Set initial active pill
  var checkedPill = document.querySelector('.form-field__pill input[type="radio"]:checked');
  if (checkedPill) {
    checkedPill.parentElement.classList.add('form-field__pill--active');
  }


  /* --- Mobile form peek-and-expand --- */
  var orderForm = document.querySelector('.order-form');
  var peekTrigger = document.querySelector('.order-form__peek-trigger');

  if (orderForm && peekTrigger) {
    peekTrigger.addEventListener('click', function () {
      orderForm.classList.remove('order-form--collapsed');
      orderForm.classList.add('order-form--expanded');
    });
  }


  /* --- Enquiry form → Google Sheet + WhatsApp --- */
  var FORM_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

  var enquiryForm = document.getElementById('enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('form-name').value.trim();
      var phone = document.getElementById('form-phone').value.trim();
      var farmType = document.getElementById('form-farm-type').value;
      var location = document.getElementById('form-location').value.trim();
      var message = document.getElementById('form-message').value.trim();
      var consent = document.getElementById('form-consent').checked;

      var packSize = '';
      var selectedPack = document.querySelector('input[name="pack_size"]:checked');
      if (selectedPack) packSize = selectedPack.value;

      var ppm = '';
      var ppmSelect = document.getElementById('form-ppm');
      if (ppmSelect) ppm = ppmSelect.value;

      if (!name || !phone || !farmType) {
        alert('Please fill in your name, phone number, and farm type.');
        return;
      }

      if (!consent) {
        alert('Please agree to be contacted before submitting.');
        return;
      }

      var submitBtn = enquiryForm.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
      }

      var formData = {
        name: name,
        phone: phone,
        farm_type: farmType,
        location: location,
        pack_size: packSize,
        ppm: ppm,
        message: message,
        page: window.location.pathname
      };

      /* Send to Google Sheet */
      fetch(FORM_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(function () {
        /* Open WhatsApp */
        var waMessage = 'Hi, I\'d like to enquire about VISK Kavach.\n\n';
        waMessage += 'Name: ' + name + '\n';
        waMessage += 'Phone: ' + phone + '\n';
        waMessage += 'Farm type: ' + farmType + '\n';
        if (location) waMessage += 'Location: ' + location + '\n';
        if (packSize) waMessage += 'Pack size: ' + packSize + '\n';
        if (ppm) waMessage += 'PPM: ' + ppm + '\n';
        if (message) waMessage += 'Message: ' + message + '\n';

        var waUrl = 'https://wa.me/917743027145?text=' + encodeURIComponent(waMessage);
        window.open(waUrl, '_blank');

        /* Reset form */
        enquiryForm.reset();
        document.querySelectorAll('.form-field__pill').forEach(function (pill) {
          pill.classList.remove('form-field__pill--active');
        });

        if (submitBtn) {
          submitBtn.textContent = 'Sent ✓';
          setTimeout(function () {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
        }
      }).catch(function () {
        /* If Sheet save fails, still open WhatsApp */
        var waMessage = 'Hi, I\'d like to enquire about VISK Kavach.\n\n';
        waMessage += 'Name: ' + name + '\n';
        waMessage += 'Phone: ' + phone + '\n';
        waMessage += 'Farm type: ' + farmType + '\n';
        if (location) waMessage += 'Location: ' + location + '\n';
        if (packSize) waMessage += 'Pack size: ' + packSize + '\n';
        if (ppm) waMessage += 'PPM: ' + ppm + '\n';
        if (message) waMessage += 'Message: ' + message + '\n';

        var waUrl = 'https://wa.me/917743027145?text=' + encodeURIComponent(waMessage);
        window.open(waUrl, '_blank');

        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
    });
  }


  /* --- Dilution Calculator --- */
  var CALC_DATA = {
    'irrigation':      { ppmMin: 2,  ppmMax: 10,  ppmDefault: 5,   time: 'Continuous flow',      freq: 'Every irrigation cycle',   label: 'Irrigation water dosing' },
    'lineflush':       { ppmMin: 50, ppmMax: 100, ppmDefault: 75,  time: '15–30 minutes',        freq: 'Weekly or as needed',      label: 'Line flush / biofilm clearing' },
    'hydro-reservoir': { ppmMin: 2,  ppmMax: 5,   ppmDefault: 3,   time: 'Continuous',           freq: 'Every reservoir change',   label: 'Hydroponic reservoir' },
    'root-rejuv':      { ppmMin: 5,  ppmMax: 10,  ppmDefault: 7,   time: '30–60 min soak',       freq: 'As symptoms appear',       label: 'Root zone rejuvenation' },
    'foliar':          { ppmMin: 50, ppmMax: 100, ppmDefault: 75,  time: 'Until surface wet',    freq: 'Weekly or bi-weekly',      label: 'Foliar spray / misting' },
    'seed-soak':       { ppmMin: 50, ppmMax: 200, ppmDefault: 100, time: '5–15 minutes',         freq: 'Before planting',          label: 'Seed / cutting soak' },
    'harvest-wash':    { ppmMin: 50, ppmMax: 100, ppmDefault: 75,  time: '1–3 min dip',          freq: 'At harvest / packing',     label: 'Post-harvest produce wash' },
    'surface':         { ppmMin: 100, ppmMax: 200, ppmDefault: 150, time: '5–10 minutes',        freq: 'Daily / between shifts',   label: 'Surface sanitation' },
    'fogging':         { ppmMin: 100, ppmMax: 200, ppmDefault: 150, time: '15–20 minutes',       freq: 'Daily or as needed',       label: 'Fogging / air sanitation' }
  };

  var calcApp = document.getElementById('calc-application');
  var calcWater = document.getElementById('calc-water');
  var calcSlider = document.getElementById('calc-ppm-slider');
  var calcPpmField = document.getElementById('calc-ppm-field');
  var calcResult = document.getElementById('calc-result');

  if (calcApp) {
    var concPills = document.querySelectorAll('#calc-concentrate-pills .dilution-calc__pill input');
    var quickBtns = document.querySelectorAll('.dilution-calc__quick');

    /* Concentrate pill toggle */
    concPills.forEach(function (radio) {
      radio.addEventListener('change', function () {
        document.querySelectorAll('#calc-concentrate-pills .dilution-calc__pill').forEach(function (p) {
          p.classList.remove('dilution-calc__pill--active');
        });
        if (this.checked) this.parentElement.classList.add('dilution-calc__pill--active');
        calcUpdate();
      });
    });

    /* Quick-fill buttons */
    quickBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        calcWater.value = this.getAttribute('data-litres');
        calcUpdate();
      });
    });

    calcApp.addEventListener('change', function () {
      var d = CALC_DATA[this.value];
      if (!d) return;
      calcSlider.min = d.ppmMin;
      calcSlider.max = d.ppmMax;
      calcSlider.value = d.ppmDefault;
      document.getElementById('calc-ppm-min').textContent = d.ppmMin;
      document.getElementById('calc-ppm-max').textContent = d.ppmMax;
      document.getElementById('calc-ppm-rec').textContent = 'Recommended: ' + d.ppmMin + '–' + d.ppmMax + ' PPM';
      document.getElementById('calc-ppm-display').textContent = d.ppmDefault + ' PPM';
      calcPpmField.style.display = '';
      calcUpdate();
    });

    calcSlider.addEventListener('input', function () {
      document.getElementById('calc-ppm-display').textContent = this.value + ' PPM';
      calcUpdate();
    });

    calcWater.addEventListener('input', calcUpdate);

    function calcUpdate() {
      var appKey = calcApp.value;
      if (!appKey || !CALC_DATA[appKey]) {
        calcResult.style.display = 'none';
        return;
      }

      var d = CALC_DATA[appKey];
      var targetPPM = parseFloat(calcSlider.value);
      var waterL = parseFloat(calcWater.value);
      var concPPM = 200;
      var checkedConc = document.querySelector('#calc-concentrate-pills input:checked');
      if (checkedConc) concPPM = parseFloat(checkedConc.value);

      if (!waterL || waterL <= 0 || !concPPM) {
        calcResult.style.display = 'none';
        return;
      }

      /* Formula: mL of concentrate = (targetPPM × waterL) / concPPM */
      var mlNeeded = (targetPPM * waterL) / concPPM;
      var mlRounded = Math.round(mlNeeded * 10) / 10;

      /* Display */
      var mlStr;
      if (mlRounded >= 1000) {
        mlStr = (mlRounded / 1000).toFixed(1) + ' litres';
      } else {
        mlStr = mlRounded + ' mL';
      }

      document.getElementById('calc-ml').textContent = mlStr;

      /* Alt display */
      var altStr = '';
      if (mlRounded < 5) {
        altStr = '≈ ' + Math.round(mlRounded * 20) + ' drops (using a dropper)';
      } else if (mlRounded < 15) {
        altStr = '≈ ' + Math.round(mlRounded / 5) + ' teaspoons';
      } else if (mlRounded < 1000) {
        altStr = '≈ ' + (mlRounded / 1000).toFixed(2) + ' litres';
      } else {
        altStr = '= ' + mlRounded + ' mL';
      }
      document.getElementById('calc-ml-alt').textContent = altStr;

      document.getElementById('calc-out-app').textContent = d.label;
      document.getElementById('calc-out-ppm').textContent = targetPPM + ' PPM';
      document.getElementById('calc-out-time').textContent = d.time;
      document.getElementById('calc-out-freq').textContent = d.freq;

      calcResult.style.display = '';
    }
  }

})();
