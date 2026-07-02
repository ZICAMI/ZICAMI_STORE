// =====================================================
// ORDER FORM — SCRIPT
// Handles: model switching, color switching,
//          quantity stepper, Wilaya dropdown,
//          live order summary, validation, FormSubmit
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // 0. CONFIGURATION
  // =====================================================

  // Single source of truth for product price (in DA)
  const PRODUCT_PRICE = 3500;

  // Model definitions — rename labels and swap image paths here
  const MODELS = {
    'Model 1': { image: 'images/model-a.jpeg' },
    'Model 2': { image: 'images/model-b.jpeg' },
    'Model 3': { image: 'images/model-c.jpeg' }
  };

  // Delivery prices per Wilaya
  const deliveryPrices = {
    "Alger": { home: 500, desk: 300 },
    "Boumerdes": { home: 600, desk: 400 },
    "Blida": { home: 600, desk: 400 },
    "Tipaza": { home: 600, desk: 400 },
    "Tizi Ouzou": { home: 700, desk: 450 },
    "Bouira": { home: 700, desk: 450 },
    "Medea": { home: 700, desk: 450 },
    "Bejaia": { home: 800, desk: 500 },
    "Bordj Bou Arreridj": { home: 800, desk: 500 },
    "Ain Defla": { home: 800, desk: 500 },
    "Ain Temouchent": { home: 800, desk: 500 },
    "Annaba": { home: 800, desk: 500 },
    "Batna": { home: 800, desk: 500 },
    "Chlef": { home: 800, desk: 500 },
    "Constantine": { home: 800, desk: 500 },
    "Mascara": { home: 800, desk: 500 },
    "Mila": { home: 800, desk: 500 },
    "Mostaganem": { home: 800, desk: 500 },
    "M'Sila": { home: 800, desk: 500 },
    "Oran": { home: 800, desk: 500 },
    "Oum El Bouaghi": { home: 800, desk: 500 },
    "Relizane": { home: 800, desk: 500 },
    "Tissemsilt": { home: 800, desk: 500 },
    "Tlemcen": { home: 800, desk: 500 },
    "Setif": { home: 800, desk: 500 },
    "Sidi Bel Abbes": { home: 800, desk: 500 },
    "Skikda": { home: 800, desk: 500 },
    "Jijel": { home: 800, desk: 500 },
    "El Tarf": { home: 900, desk: 600 },
    "Guelma": { home: 900, desk: 600 },
    "Khenchela": { home: 900, desk: 600 },
    "Saida": { home: 900, desk: 600 },
    "Souk Ahras": { home: 900, desk: 600 },
    "Tebessa": { home: 900, desk: 600 },
    "Tiaret": { home: 1000, desk: 600 },
    "Oued Djellal": { home: 1000, desk: 600 },
    "Djelfa": { home: 1000, desk: 600 },
    "Laghouat": { home: 1000, desk: 600 },
    "Biskra": { home: 1000, desk: 600 },
    "Ghardaia": { home: 1100, desk: 700 },
    "El Oued": { home: 1100, desk: 700 },
    "El M'Ghair": { home: 1100, desk: 700 },
    "Ouargla": { home: 1100, desk: 700 },
    "Touggourt": { home: 1100, desk: 700 },
    "El Meniaa": { home: 1100, desk: 800 },
    "El Bayadh": { home: 1200, desk: 800 },
    "Naama": { home: 1200, desk: 800 },
    "Bechar": { home: 1200, desk: 800 },
    "Beni Abbes": { home: 1500, desk: 1000 },
    "Adrar": { home: 1500, desk: 1000 },
    "Timimoun": { home: 1500, desk: 1000 },
    "Tindouf": { home: 1700, desk: 1000 },
    "In Salah": { home: 1800, desk: 1200 },
    "Illizi": { home: 1900, desk: 1500 },
    "Tamanrasset": { home: 2000, desk: 1500 }
  };

  // =====================================================
  // 1. ELEMENT REFERENCES
  // =====================================================
  const productImage       = document.getElementById('productImage');
  const selectedModelLabel = document.getElementById('selectedModelLabel');
  const selectedColorLabel = document.getElementById('selectedColorLabel');

  const previewModelSwatches = document.querySelectorAll('.model-swatch');
  const colorSwatches        = document.querySelectorAll('.swatch');
  const formModelRadios      = document.querySelectorAll('input[name="formModel"]');
  const formColorRadios      = document.querySelectorAll('input[name="formColor"]');
  const deliveryRadios       = document.querySelectorAll('input[name="deliveryType"]');

  const wilayaSelect  = document.getElementById('wilaya');
  const quantityInput = document.getElementById('quantity');
  const decreaseBtn   = document.getElementById('decreaseQty');
  const increaseBtn   = document.getElementById('increaseQty');
  const orderForm     = document.getElementById('orderForm');
  const successMessage = document.getElementById('successMessage');

  // Summary display elements
  const summaryProductPrice  = document.getElementById('summaryProductPrice');
  const summaryQuantity      = document.getElementById('summaryQuantity');
  const summaryDeliveryCost  = document.getElementById('summaryDeliveryCost');
  const summaryTotalPrice    = document.getElementById('summaryTotalPrice');

  // Hidden FormSubmit fields
  const hiddenModel        = document.getElementById('hiddenModel');
  const hiddenColor        = document.getElementById('hiddenColor');
  const hiddenSize         = document.getElementById('hiddenSize');
  const hiddenWilaya       = document.getElementById('hiddenWilaya');
  const hiddenDeliveryType = document.getElementById('hiddenDeliveryType');
  const hiddenProductPrice = document.getElementById('hiddenProductPrice');
  const hiddenDeliveryCost = document.getElementById('hiddenDeliveryCost');
  const hiddenTotalPrice   = document.getElementById('hiddenTotalPrice');

  const MIN_QTY = 1;
  const MAX_QTY = 99;

  // =====================================================
  // 2. POPULATE WILAYA DROPDOWN
  // =====================================================
  Object.keys(deliveryPrices).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    wilayaSelect.appendChild(opt);
  });

  // =====================================================
  // 3. MODEL SWITCHING
  // Clicking a preview swatch or a form card both do the
  // same thing: swap the hero image and sync everything.
  // =====================================================
  function switchModel(modelName) {
    const model = MODELS[modelName];
    if (!model) return;

    // Animate the hero image out, swap src, animate back in
    productImage.classList.add('switching');
    setTimeout(() => {
      productImage.src = model.image;
      productImage.alt = modelName;
      productImage.classList.remove('switching');
    }, 250);

    // Update the preview label
    selectedModelLabel.textContent = modelName;

    // Sync preview swatches
    previewModelSwatches.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.model === modelName);
    });

    // Sync form model radio cards
    formModelRadios.forEach(radio => {
      radio.checked = (radio.value === modelName);
    });

    // Update hidden field and summary
    hiddenModel.value = modelName;
    updateOrderSummary();
  }

  // Preview swatch clicks → switch model
  previewModelSwatches.forEach(btn => {
    btn.addEventListener('click', () => switchModel(btn.dataset.model));
  });

  // Form card radio clicks → switch model
  formModelRadios.forEach(radio => {
    radio.addEventListener('change', () => switchModel(radio.value));
  });

  // =====================================================
  // 4. COLOR SWITCHING (independent from model)
  // =====================================================
  function switchColor(colorName) {
    // Update preview label
    selectedColorLabel.textContent = colorName;

    // Update preview swatches active state
    colorSwatches.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === colorName);
    });

    // Sync form color radios
    formColorRadios.forEach(radio => {
      radio.checked = (radio.value === colorName);
    });

    // Update hidden field
    hiddenColor.value = colorName;
    updateOrderSummary();
  }

  // Preview color swatch clicks
  colorSwatches.forEach(btn => {
    btn.addEventListener('click', () => switchColor(btn.dataset.color));
  });

  // Form color radio changes
  formColorRadios.forEach(radio => {
    radio.addEventListener('change', () => switchColor(radio.value));
  });

  // =====================================================
  // 5. QUANTITY STEPPER
  // =====================================================
  decreaseBtn.addEventListener('click', () => {
    const val = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (val > MIN_QTY) { quantityInput.value = val - 1; updateOrderSummary(); }
  });

  increaseBtn.addEventListener('click', () => {
    const val = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (val < MAX_QTY) { quantityInput.value = val + 1; updateOrderSummary(); }
  });

  // =====================================================
  // 6. LIVE ORDER SUMMARY CALCULATION
  // =====================================================
  function updateOrderSummary() {
    const quantity     = parseInt(quantityInput.value, 10) || MIN_QTY;
    const wilaya       = wilayaSelect.value;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const productTotal = PRODUCT_PRICE * quantity;

    let deliveryCost      = 0;
    let deliveryCostLabel = '--';

    if (wilaya && deliveryPrices[wilaya]) {
      deliveryCost      = deliveryPrices[wilaya][deliveryType];
      deliveryCostLabel = `${deliveryCost} DA`;
    }

    const total = productTotal + deliveryCost;

    // Update visible summary with pulse animation
    setWithPulse(summaryProductPrice, `${productTotal} DA`);
    setWithPulse(summaryQuantity,     quantity);
    setWithPulse(summaryDeliveryCost, deliveryCostLabel);
    setWithPulse(summaryTotalPrice,   `${total} DA`);

    // Sync all hidden FormSubmit fields
    hiddenModel.value        = document.querySelector('input[name="formModel"]:checked')?.value || '';
    hiddenColor.value        = document.querySelector('input[name="formColor"]:checked')?.value || '';
    hiddenSize.value         = document.querySelector('input[name="size"]:checked')?.value || '';
    hiddenWilaya.value       = wilaya;
    hiddenDeliveryType.value = deliveryType === 'home' ? 'Home Delivery' : 'Stop Desk (Pickup)';
    hiddenProductPrice.value = productTotal;
    hiddenDeliveryCost.value = deliveryCost;
    hiddenTotalPrice.value   = total;
  }

  // Triggers summary refresh on Wilaya / delivery type change
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

  // Helper: update a summary element text and trigger pulse animation
  function setWithPulse(el, value) {
    el.textContent = value;
    el.classList.remove('updated');
    void el.offsetWidth; // force reflow so animation re-fires
    el.classList.add('updated');
  }

  // =====================================================
  // 7. FORM VALIDATION & SUBMISSION
  // =====================================================
  orderForm.addEventListener('submit', (e) => {
    let valid = true;

    valid = validateTextField('fullName',  v => v.trim().length > 0)            && valid;
    valid = validateTextField('phone',     v => /^[+]?[\d\s\-().]{7,}$/.test(v.trim())) && valid;
    valid = validateTextField('address',   v => v.trim().length > 0)            && valid;
    valid = validateSelect('wilaya')                                             && valid;
    valid = validateRadio('formModel', 'formModelOptions')                      && valid;
    valid = validateRadio('size', 'sizeOptions')                                && valid;

    // Sync hidden fields one final time before the POST
    updateOrderSummary();

    if (!valid) {
      e.preventDefault();
      document.querySelector('.form-group.invalid')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Form is valid — let FormSubmit POST proceed naturally.
      // Show success message for users with JS-enhanced flows.
      successMessage.classList.add('show');
    }
  });

  // Validate a text / textarea field
  function validateTextField(id, fn) {
    const el = document.getElementById(id);
    const ok = fn(el.value);
    el.closest('.form-group').classList.toggle('invalid', !ok);
    return ok;
  }

  // Validate a <select> element
  function validateSelect(id) {
    const el = document.getElementById(id);
    const ok = el.value.trim().length > 0;
    el.closest('.form-group').classList.toggle('invalid', !ok);
    return ok;
  }

  // Validate a radio group by container ID
  function validateRadio(name, containerId) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    const group   = document.getElementById(containerId).closest('.form-group');
    group.classList.toggle('invalid', !checked);
    return !!checked;
  }

  // =====================================================
  // 8. LIVE ERROR CLEARING (clears as user corrects)
  // =====================================================
  ['fullName', 'phone', 'address'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById(id).closest('.form-group').classList.remove('invalid');
    });
  });

  // =====================================================
  // 9. INITIALISE ON PAGE LOAD
  // =====================================================
  updateOrderSummary();

});