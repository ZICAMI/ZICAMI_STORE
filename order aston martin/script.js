// =====================================================
// T-SHIRT ORDER FORM — SCRIPT
// 5 models × 3 views (Front / Side / Back)
// Thumbnail strip + prev/next arrow navigation
// Live order summary, Wilaya pricing, FormSubmit
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // 0. CONFIGURATION
  //    To rename a model: change the key name AND update
  //    the matching radio value + label in index.html.
  //    Image paths follow the pattern:
  //      images/<model-key>-front.png
  //      images/<model-key>-side.png
  //      images/<model-key>-back.png
  // =====================================================

  const PRODUCT_PRICE = 3500; // DA — single source of truth

  // 5 models, each with 3 ordered views
  const MODELS = {
    'Model A': {
      views: [
        { label: 'Front', src: 'images/model-a-front.png.jpeg' },
        { label: 'Side',  src: 'images/model-a-side.png.jpeg'  },
        { label: 'Back',  src: 'images/model-a-back.png.jpeg'  }
      ]
    },
    'Model B': {
      views: [
        { label: 'Front', src: 'images/model-b-front.png.jpeg' },
        { label: 'Side',  src: 'images/model-b-side.png.jpeg'  },
        { label: 'Back',  src: 'images/model-b-back.png.jpeg'  }
      ]
    },
    'Model C': {
      views: [
        { label: 'Front', src: 'images/model-c-front.png.jpeg' },
        { label: 'Side',  src: 'images/model-c-side.png.jpeg'  },
        { label: 'Back',  src: 'images/model-c-back.png.jpeg'  }
      ]
    },
    'Model D': {
      views: [
        { label: 'Front', src: 'images/model-d-front.png.jpeg' },
        { label: 'Side',  src: 'images/model-d-side.png.jpeg'  },
        { label: 'Back',  src: 'images/model-d-back.png.jpeg'  }
      ]
    },
    'Model E': {
      views: [
        { label: 'Front', src: 'images/model-e-front.png.jpeg' },
        { label: 'Side',  src: 'images/model-e-side.png.jpeg'  },
        { label: 'Back',  src: 'images/model-e-back.png.jpeg' }
      ]
    }
  };

  // Delivery prices per Wilaya
  const deliveryPrices = {
    "Alger":              { home: 500,  desk: 300  },
    "Boumerdes":          { home: 600,  desk: 400  },
    "Blida":              { home: 600,  desk: 400  },
    "Tipaza":             { home: 600,  desk: 400  },
    "Tizi Ouzou":         { home: 700,  desk: 450  },
    "Bouira":             { home: 700,  desk: 450  },
    "Medea":              { home: 700,  desk: 450  },
    "Bejaia":             { home: 800,  desk: 500  },
    "Bordj Bou Arreridj": { home: 800,  desk: 500  },
    "Ain Defla":          { home: 800,  desk: 500  },
    "Ain Temouchent":     { home: 800,  desk: 500  },
    "Annaba":             { home: 800,  desk: 500  },
    "Batna":              { home: 800,  desk: 500  },
    "Chlef":              { home: 800,  desk: 500  },
    "Constantine":        { home: 800,  desk: 500  },
    "Mascara":            { home: 800,  desk: 500  },
    "Mila":               { home: 800,  desk: 500  },
    "Mostaganem":         { home: 800,  desk: 500  },
    "M'Sila":             { home: 800,  desk: 500  },
    "Oran":               { home: 800,  desk: 500  },
    "Oum El Bouaghi":     { home: 800,  desk: 500  },
    "Relizane":           { home: 800,  desk: 500  },
    "Tissemsilt":         { home: 800,  desk: 500  },
    "Tlemcen":            { home: 800,  desk: 500  },
    "Setif":              { home: 800,  desk: 500  },
    "Sidi Bel Abbes":     { home: 800,  desk: 500  },
    "Skikda":             { home: 800,  desk: 500  },
    "Jijel":              { home: 800,  desk: 500  },
    "El Tarf":            { home: 900,  desk: 600  },
    "Guelma":             { home: 900,  desk: 600  },
    "Khenchela":          { home: 900,  desk: 600  },
    "Saida":              { home: 900,  desk: 600  },
    "Souk Ahras":         { home: 900,  desk: 600  },
    "Tebessa":            { home: 900,  desk: 600  },
    "Tiaret":             { home: 1000, desk: 600  },
    "Oued Djellal":       { home: 1000, desk: 600  },
    "Djelfa":             { home: 1000, desk: 600  },
    "Laghouat":           { home: 1000, desk: 600  },
    "Biskra":             { home: 1000, desk: 600  },
    "Ghardaia":           { home: 1100, desk: 700  },
    "El Oued":            { home: 1100, desk: 700  },
    "El M'Ghair":         { home: 1100, desk: 700  },
    "Ouargla":            { home: 1100, desk: 700  },
    "Touggourt":          { home: 1100, desk: 700  },
    "El Meniaa":          { home: 1100, desk: 800  },
    "El Bayadh":          { home: 1200, desk: 800  },
    "Naama":              { home: 1200, desk: 800  },
    "Bechar":             { home: 1200, desk: 800  },
    "Beni Abbes":         { home: 1500, desk: 1000 },
    "Adrar":              { home: 1500, desk: 1000 },
    "Timimoun":           { home: 1500, desk: 1000 },
    "Tindouf":            { home: 1700, desk: 1000 },
    "In Salah":           { home: 1800, desk: 1200 },
    "Illizi":             { home: 1900, desk: 1500 },
    "Tamanrasset":        { home: 2000, desk: 1500 }
  };

  // =====================================================
  // 1. ELEMENT REFERENCES
  // =====================================================
  const productImage       = document.getElementById('productImage');
  const viewBadge          = document.getElementById('viewBadge');
  const arrowPrev          = document.getElementById('arrowPrev');
  const arrowNext          = document.getElementById('arrowNext');
  const thumbnailStrip     = document.getElementById('thumbnailStrip');
  const thumbBtns          = thumbnailStrip.querySelectorAll('.thumb-btn');
  const thumbImgs          = thumbnailStrip.querySelectorAll('.thumb-img');

  const selectedModelLabel = document.getElementById('selectedModelLabel');
  const selectedColorLabel = document.getElementById('selectedColorLabel');
  const previewModelSwatches = document.querySelectorAll('.model-swatch');
  const colorSwatches      = document.querySelectorAll('.swatch');
  const formModelRadios    = document.querySelectorAll('input[name="formModel"]');
  const formColorRadios    = document.querySelectorAll('input[name="formColor"]');
  const deliveryRadios     = document.querySelectorAll('input[name="deliveryType"]');
  const wilayaSelect       = document.getElementById('wilaya');
  const quantityInput      = document.getElementById('quantity');
  const decreaseBtn        = document.getElementById('decreaseQty');
  const increaseBtn        = document.getElementById('increaseQty');
  const orderForm          = document.getElementById('orderForm');
  const successMessage     = document.getElementById('successMessage');

  // Summary elements
  const summaryProductPrice = document.getElementById('summaryProductPrice');
  const summaryQuantity     = document.getElementById('summaryQuantity');
  const summaryDeliveryCost = document.getElementById('summaryDeliveryCost');
  const summaryTotalPrice   = document.getElementById('summaryTotalPrice');

  // Hidden FormSubmit fields
  const hiddenModel        = document.getElementById('hiddenModel');
  const hiddenColor        = document.getElementById('hiddenColor');
  const hiddenSize         = document.getElementById('hiddenSize');
  const hiddenWilaya       = document.getElementById('hiddenWilaya');
  const hiddenDeliveryType = document.getElementById('hiddenDeliveryType');
  const hiddenProductPrice = document.getElementById('hiddenProductPrice');
  const hiddenDeliveryCost = document.getElementById('hiddenDeliveryCost');
  const hiddenTotalPrice   = document.getElementById('hiddenTotalPrice');

  // =====================================================
  // 2. STATE
  // =====================================================
  let activeModel   = 'Model A'; // currently selected model name
  let activeViewIdx = 0;         // 0 = Front, 1 = Side, 2 = Back
  const MIN_QTY = 1;
  const MAX_QTY = 99;

  // =====================================================
  // 3. POPULATE WILAYA DROPDOWN
  // =====================================================
  Object.keys(deliveryPrices).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    wilayaSelect.appendChild(opt);
  });

  // =====================================================
  // 4. VIEW SWITCHER
  //    Updates the hero image, badge, thumbnails and
  //    arrow disabled states for a given view index.
  // =====================================================
  function switchView(idx, animate = true) {
    const views = MODELS[activeModel].views;
    // Clamp index within bounds
    idx = Math.max(0, Math.min(idx, views.length - 1));
    activeViewIdx = idx;

    const view = views[idx];

    // Animate hero image
    if (animate) {
      productImage.classList.add('switching');
      setTimeout(() => {
        productImage.src = view.src;
        productImage.alt = activeModel + ' — ' + view.label;
        productImage.classList.remove('switching');
      }, 220);
    } else {
      productImage.src = view.src;
      productImage.alt = activeModel + ' — ' + view.label;
    }

    // Update view badge
    viewBadge.textContent = view.label;

    // Update thumbnail active state
    thumbBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });

    // Update arrow disabled state
    arrowPrev.disabled = (idx === 0);
    arrowNext.disabled = (idx === views.length - 1);
  }

  // =====================================================
  // 5. MODEL SWITCHER
  //    Switches active model, refreshes thumbnails,
  //    resets to the Front view, syncs all controls.
  // =====================================================
  function switchModel(modelName) {
    if (!MODELS[modelName]) return;
    activeModel = modelName;

    // Refresh thumbnail images to match the new model
    const views = MODELS[modelName].views;
    thumbBtns.forEach((btn, i) => {
      thumbImgs[i].src = views[i].src;
      thumbImgs[i].alt = views[i].label;
    });

    // Reset to Front view (index 0)
    switchView(0, true);

    // Update preview label
    selectedModelLabel.textContent = modelName;

    // Sync preview model swatches
    previewModelSwatches.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.model === modelName);
    });

    // Sync form model radio cards
    formModelRadios.forEach(radio => {
      radio.checked = (radio.value === modelName);
    });

    hiddenModel.value = modelName;
    updateOrderSummary();
  }

  // =====================================================
  // 6. EVENT LISTENERS — image navigation
  // =====================================================

  // Arrow buttons
  arrowPrev.addEventListener('click', () => switchView(activeViewIdx - 1));
  arrowNext.addEventListener('click', () => switchView(activeViewIdx + 1));

  // Thumbnail clicks
  thumbBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => switchView(i));
  });

  // Preview model swatch clicks
  previewModelSwatches.forEach(btn => {
    btn.addEventListener('click', () => switchModel(btn.dataset.model));
  });

  // Form model radio card changes
  formModelRadios.forEach(radio => {
    radio.addEventListener('change', () => switchModel(radio.value));
  });

  // =====================================================
  // 7. COLOR SWITCHING (independent from model/view)
  // =====================================================
  function switchColor(colorName) {
    selectedColorLabel.textContent = colorName;
    colorSwatches.forEach(btn => btn.classList.toggle('active', btn.dataset.color === colorName));
    formColorRadios.forEach(r  => { r.checked = (r.value === colorName); });
    hiddenColor.value = colorName;
    updateOrderSummary();
  }

  colorSwatches.forEach(btn => btn.addEventListener('click', () => switchColor(btn.dataset.color)));
  formColorRadios.forEach(r  => r.addEventListener('change', () => switchColor(r.value)));

  // =====================================================
  // 8. QUANTITY STEPPER
  // =====================================================
  decreaseBtn.addEventListener('click', () => {
    const v = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (v > MIN_QTY) { quantityInput.value = v - 1; updateOrderSummary(); }
  });

  increaseBtn.addEventListener('click', () => {
    const v = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (v < MAX_QTY) { quantityInput.value = v + 1; updateOrderSummary(); }
  });

  // =====================================================
  // 9. LIVE ORDER SUMMARY
  // =====================================================
  function updateOrderSummary() {
    const qty          = parseInt(quantityInput.value, 10) || MIN_QTY;
    const wilaya       = wilayaSelect.value;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const productTotal = PRODUCT_PRICE * qty;

    let cost      = 0;
    let costLabel = '--';

    if (wilaya && deliveryPrices[wilaya]) {
      cost      = deliveryPrices[wilaya][deliveryType];
      costLabel = cost + ' DA';
    }

    const total = productTotal + cost;

    setWithPulse(summaryProductPrice, productTotal + ' DA');
    setWithPulse(summaryQuantity,     qty);
    setWithPulse(summaryDeliveryCost, costLabel);
    setWithPulse(summaryTotalPrice,   total + ' DA');

    // Keep hidden FormSubmit fields in sync
    hiddenModel.value        = activeModel;
    hiddenColor.value        = document.querySelector('input[name="formColor"]:checked')?.value || '';
    hiddenSize.value         = document.querySelector('input[name="size"]:checked')?.value || '';
    hiddenWilaya.value       = wilaya;
    hiddenDeliveryType.value = deliveryType === 'home' ? 'Home Delivery' : 'Stop Desk (Pickup)';
    hiddenProductPrice.value = productTotal;
    hiddenDeliveryCost.value = cost;
    hiddenTotalPrice.value   = total;
  }

  wilayaSelect.addEventListener('change', () => {
    wilayaSelect.closest('.form-group').classList.remove('invalid');
    updateOrderSummary();
  });

  deliveryRadios.forEach(r => r.addEventListener('change', updateOrderSummary));

  document.querySelectorAll('input[name="size"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('sizeOptions').closest('.form-group').classList.remove('invalid');
      updateOrderSummary();
    });
  });

  // Pulse animation helper
  function setWithPulse(el, value) {
    el.textContent = value;
    el.classList.remove('updated');
    void el.offsetWidth; // force reflow
    el.classList.add('updated');
  }

  // =====================================================
  // 10. FORM VALIDATION & SUBMISSION
  // =====================================================
  orderForm.addEventListener('submit', e => {
    let valid = true;

    valid = validateText('fullName', v => v.trim().length > 0)                       && valid;
    valid = validateText('phone',    v => /^[+]?[\d\s\-().]{7,}$/.test(v.trim()))   && valid;
    valid = validateText('address',  v => v.trim().length > 0)                       && valid;
    valid = validateSelect('wilaya')                                                  && valid;
    valid = validateRadio('formModel', 'formModelOptions')                            && valid;
    valid = validateRadio('size',      'sizeOptions')                                 && valid;

    updateOrderSummary(); // final sync before POST

    if (!valid) {
      e.preventDefault();
      document.querySelector('.form-group.invalid')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      successMessage.classList.add('show');
    }
  });

  function validateText(id, fn) {
    const el = document.getElementById(id);
    const ok = fn(el.value);
    el.closest('.form-group').classList.toggle('invalid', !ok);
    return ok;
  }

  function validateSelect(id) {
    const el = document.getElementById(id);
    const ok = el.value.trim().length > 0;
    el.closest('.form-group').classList.toggle('invalid', !ok);
    return ok;
  }

  function validateRadio(name, containerId) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    document.getElementById(containerId)
            .closest('.form-group')
            .classList.toggle('invalid', !checked);
    return !!checked;
  }

  // Live error clearing while user types
  ['fullName', 'phone', 'address'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById(id).closest('.form-group').classList.remove('invalid');
    });
  });

  // =====================================================
  // 11. INITIALISE
  // =====================================================
  switchModel('Model A'); // sets up thumbnails, arrows, hero image
  updateOrderSummary();

});
