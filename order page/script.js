// =====================================================
// ORDER FORM - JAVASCRIPT
// Handles: color switching, quantity stepper, wilaya
// delivery pricing, live order summary, validation
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // 0. CONFIGURATION
  // =====================================================

  // Product price - change this single value to update price everywhere
  const PRODUCT_PRICE = 1000; // in DA

  // Delivery prices per Wilaya (home delivery / stop desk)
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
  const productImage = document.getElementById('productImage');
  const selectedColorLabel = document.getElementById('selectedColorLabel');
  const productPriceDisplay = document.getElementById('productPriceDisplay');
  const swatches = document.querySelectorAll('.swatch');

  const formColorRadios = document.querySelectorAll('input[name="formColor"]');
  const wilayaSelect = document.getElementById('wilaya');
  const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');

  const decreaseBtn = document.getElementById('decreaseQty');
  const increaseBtn = document.getElementById('increaseQty');
  const quantityInput = document.getElementById('quantity');

  const orderForm = document.getElementById('orderForm');
  const successMessage = document.getElementById('successMessage');

  // Order summary elements
  const summaryProductPrice = document.getElementById('summaryProductPrice');
  const summaryQuantity = document.getElementById('summaryQuantity');
  const summaryDeliveryCost = document.getElementById('summaryDeliveryCost');
  const summaryTotalPrice = document.getElementById('summaryTotalPrice');

  // Hidden inputs (sent via FormSubmit)
  const hiddenColor = document.getElementById('hiddenColor');
  const hiddenSize = document.getElementById('hiddenSize');
  const hiddenWilaya = document.getElementById('hiddenWilaya');
  const hiddenDeliveryType = document.getElementById('hiddenDeliveryType');
  const hiddenProductPrice = document.getElementById('hiddenProductPrice');
  const hiddenDeliveryCost = document.getElementById('hiddenDeliveryCost');
  const hiddenTotalPrice = document.getElementById('hiddenTotalPrice');

  const MIN_QTY = 1;
  const MAX_QTY = 99;

  // =====================================================
  // 2. POPULATE WILAYA DROPDOWN
  // =====================================================
  function populateWilayaOptions() {
    Object.keys(deliveryPrices).forEach(wilayaName => {
      const option = document.createElement('option');
      option.value = wilayaName;
      option.textContent = wilayaName;
      wilayaSelect.appendChild(option);
    });
  }
  populateWilayaOptions();

  // =====================================================
  // 3. PRODUCT IMAGE COLOR SWITCHING (PREVIEW SIDE)
  // =====================================================
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const newImage = swatch.getAttribute('data-image');
      const colorName = swatch.getAttribute('data-color');

      // Update product image instantly
      productImage.src = newImage;

      // Update active swatch styling
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      // Update label text
      selectedColorLabel.textContent = capitalize(colorName);

      // Sync the form's color radio buttons with the preview selection
      syncFormColorWithSwatch(colorName);
    });
  });

  // Sync preview swatch when the form's color radio is changed manually
  formColorRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const color = radio.value;
      const matchingSwatch = document.querySelector(`.swatch[data-color="${color}"]`);
      if (matchingSwatch) matchingSwatch.click();
    });
  });

  // Helper: keep form color radios in sync with swatch selection
  function syncFormColorWithSwatch(colorName) {
    formColorRadios.forEach(radio => {
      radio.checked = (radio.value === colorName);
    });
  }

  // Helper: capitalize first letter (e.g. "black" -> "Black")
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // =====================================================
  // 4. QUANTITY SELECTOR (+ / - BUTTONS)
  // =====================================================
  decreaseBtn.addEventListener('click', () => {
    let value = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (value > MIN_QTY) {
      quantityInput.value = value - 1;
      updateOrderSummary();
    }
  });

  increaseBtn.addEventListener('click', () => {
    let value = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (value < MAX_QTY) {
      quantityInput.value = value + 1;
      updateOrderSummary();
    }
  });

  // =====================================================
  // 5. LIVE ORDER SUMMARY CALCULATION
  // =====================================================

  // Recalculate and refresh the summary card whenever inputs change
  function updateOrderSummary() {
    const quantity = parseInt(quantityInput.value, 10) || MIN_QTY;
    const selectedWilaya = wilayaSelect.value;
    const selectedDeliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

    // Product price total based on quantity
    const productTotal = PRODUCT_PRICE * quantity;

    // Determine delivery cost based on Wilaya + delivery type
    let deliveryCost = 0;
    let deliveryCostLabel = '--';

    if (selectedWilaya && deliveryPrices[selectedWilaya]) {
      deliveryCost = deliveryPrices[selectedWilaya][selectedDeliveryType];
      deliveryCostLabel = `${deliveryCost} DA`;
    }

    // Grand total
    const totalPrice = productTotal + deliveryCost;

    // ---- Update visible summary card ----
    setValueWithPulse(summaryProductPrice, `${productTotal} DA`);
    setValueWithPulse(summaryQuantity, quantity);
    setValueWithPulse(summaryDeliveryCost, deliveryCostLabel);
    setValueWithPulse(summaryTotalPrice, `${totalPrice} DA`);

    // ---- Update hidden form fields (for FormSubmit) ----
    hiddenColor.value = capitalize(document.querySelector('input[name="formColor"]:checked').value);
    hiddenSize.value = getSelectedSize();
    hiddenWilaya.value = selectedWilaya || '';
    hiddenDeliveryType.value = selectedDeliveryType === 'home' ? 'Home Delivery' : 'Stop Desk (Pickup)';
    hiddenProductPrice.value = productTotal;
    hiddenDeliveryCost.value = deliveryCost;
    hiddenTotalPrice.value = totalPrice;
  }

  // Helper: get currently selected size (or empty string if none)
  function getSelectedSize() {
    const checkedSize = document.querySelector('input[name="size"]:checked');
    return checkedSize ? checkedSize.value : '';
  }

  // Helper: briefly pulse a summary value when it updates (visual feedback)
  function setValueWithPulse(element, newValue) {
    element.textContent = newValue;
    element.classList.remove('updated');
    // Force reflow so the animation can re-trigger
    void element.offsetWidth;
    element.classList.add('updated');
  }

  // ---- Event listeners that trigger live recalculation ----
  wilayaSelect.addEventListener('change', () => {
    wilayaSelect.closest('.form-group').classList.remove('invalid');
    updateOrderSummary();
  });

  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
  });

  formColorRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
  });

  document.querySelectorAll('input[name="size"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('sizeOptions').closest('.form-group').classList.remove('invalid');
      updateOrderSummary();
    });
  });

  // =====================================================
  // 6. FORM VALIDATION & SUBMISSION
  // =====================================================
  orderForm.addEventListener('submit', (e) => {
    let isValid = true;

    // --- Validate Full Name ---
    isValid = validateField('fullName', value => value.trim().length > 0) && isValid;

    // --- Validate Phone Number ---
    isValid = validateField('phone', value => {
      const cleaned = value.trim();
      // Basic check: at least 7 digits, allows +, spaces, dashes, parentheses
      const phonePattern = /^[+]?[\d\s\-().]{7,}$/;
      return cleaned.length > 0 && phonePattern.test(cleaned);
    }) && isValid;

    // --- Validate Address ---
    isValid = validateField('address', value => value.trim().length > 0) && isValid;

    // --- Validate Wilaya ---
    isValid = validateSelect('wilaya', 'wilayaError') && isValid;

    // --- Validate Size Selection ---
    isValid = validateRadioGroup('size', 'sizeOptions', 'sizeError') && isValid;

    // Make sure summary/hidden fields reflect the final values before sending
    updateOrderSummary();

    // If anything failed, stop the FormSubmit POST and scroll to the issue
    if (!isValid) {
      e.preventDefault();
      const firstInvalid = document.querySelector('.form-group.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // If valid: form proceeds to FormSubmit normally (no preventDefault).
    // We show a brief success message in case the user stays on page,
    // and reset local UI state for next time.
    successMessage.classList.add('show');
  });

  // Helper: validate a standard text/textarea field
  function validateField(fieldId, validatorFn) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const value = field.value;

    if (validatorFn(value)) {
      formGroup.classList.remove('invalid');
      return true;
    } else {
      formGroup.classList.add('invalid');
      return false;
    }
  }

  // Helper: validate a <select> dropdown
  function validateSelect(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');

    if (field.value && field.value.trim().length > 0) {
      formGroup.classList.remove('invalid');
      return true;
    } else {
      formGroup.classList.add('invalid');
      return false;
    }
  }

  // Helper: validate a radio button group (e.g. size selection)
  function validateRadioGroup(name, containerId, errorId) {
    const radios = document.getElementsByName(name);
    const formGroup = document.getElementById(containerId).closest('.form-group');
    const isChecked = Array.from(radios).some(radio => radio.checked);

    if (isChecked) {
      formGroup.classList.remove('invalid');
      return true;
    } else {
      formGroup.classList.add('invalid');
      return false;
    }
  }

  // =====================================================
  // 7. LIVE VALIDATION (clears error state as user types)
  // =====================================================
  ['fullName', 'phone', 'address'].forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => {
      field.closest('.form-group').classList.remove('invalid');
    });
  });

  // =====================================================
  // 8. INITIALIZE SUMMARY ON PAGE LOAD
  // =====================================================
  updateOrderSummary();

});