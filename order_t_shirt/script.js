// =====================================================
// SCRIPT.JS  —  Product page only.
// Handles: model switching, 3-view image gallery,
//          color switching, quantity stepper.
//
// Exposes window.CART_PRODUCT so cart.js can read
// the current selection when "Add to Cart" is clicked.
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('backBtn').addEventListener('click', () => {
  window.history.back();
});
  // =====================================================
  // 0. CONFIGURATION
  // =====================================================
  const PRODUCT_PRICE = 3500; // DA
  const MODEL_SIZES = {
  'Model A': ['L', 'XL'],
  'Model B': ['S','M', 'XXL'],
  'Model C': ['S','XXL'],
  'Model D': ['S', 'XL', 'XXL'],
  'Model E': ['S', 'M']
};

  // 5 models × 3 views
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
        { label: 'Back',  src: 'images/model-e-back.png.jpeg'  }
      ]
    }
  };

  // =====================================================
  // 1. ELEMENT REFERENCES
  // =====================================================
  const productImage         = document.getElementById('productImage');
  const viewBadge            = document.getElementById('viewBadge');
  const arrowPrev            = document.getElementById('arrowPrev');
  const arrowNext            = document.getElementById('arrowNext');
  const thumbnailStrip       = document.getElementById('thumbnailStrip');
  const thumbBtns            = thumbnailStrip.querySelectorAll('.thumb-btn');
  const thumbImgs            = thumbnailStrip.querySelectorAll('.thumb-img');
  const selectedModelLabel   = document.getElementById('selectedModelLabel');
  const selectedColorLabel   = document.getElementById('selectedColorLabel');
  const previewModelSwatches = document.querySelectorAll('.model-swatch');
  const colorSwatches        = document.querySelectorAll('.swatch');
  const formModelRadios      = document.querySelectorAll('input[name="formModel"]');
  const formColorRadios      = document.querySelectorAll('input[name="formColor"]');
  const quantityInput        = document.getElementById('quantity');
  const decreaseBtn          = document.getElementById('decreaseQty');
  const increaseBtn          = document.getElementById('increaseQty');

  // =====================================================
  // 2. STATE
  // =====================================================
  let activeModel   = 'Model A';
  let activeViewIdx = 0;
  const MIN_QTY = 1;
  const MAX_QTY = 99;

  // =====================================================
  // 3. VIEW SWITCHER
  // =====================================================
  function switchView(idx, animate = true) {
    const views = MODELS[activeModel].views;
    idx = Math.max(0, Math.min(idx, views.length - 1));
    activeViewIdx = idx;

    const view = views[idx];

    if (animate) {
      productImage.classList.add('switching');
      setTimeout(() => {
        productImage.src = view.src;
        productImage.alt = activeModel + ' — ' + view.label;
        productImage.classList.remove('switching');
        syncCartProduct(); // keep cart reference fresh after image loads
      }, 250);
    } else {
      productImage.src = view.src;
      productImage.alt = activeModel + ' — ' + view.label;
      syncCartProduct();
    }

    viewBadge.textContent = view.label;

    thumbBtns.forEach((btn, i) => btn.classList.toggle('active', i === idx));

    arrowPrev.disabled = (idx === 0);
    arrowNext.disabled = (idx === views.length - 1);
  }

  // =====================================================
  // 4. MODEL SWITCHER
  // =====================================================
  function switchModel(modelName) {
    if (!MODELS[modelName]) return;
    activeModel = modelName;

    // Update thumbnail images
    const views = MODELS[modelName].views;
    thumbBtns.forEach((btn, i) => {
      thumbImgs[i].src = views[i].src;
      thumbImgs[i].alt = views[i].label;
    });

    // Reset to Front view
    switchView(0, true);

    // Sync preview label and swatches
    selectedModelLabel.textContent = modelName;
    previewModelSwatches.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.model === modelName);
    });
    updateAvailableSizes(modelName); 
  syncCartProduct();

    // Sync form radio cards
    formModelRadios.forEach(r => { r.checked = (r.value === modelName); });

    syncCartProduct();
  }

  // =====================================================
  // 5. COLOR SWITCHER
  // =====================================================
  function switchColor(colorName) {
    selectedColorLabel.textContent = colorName;
    colorSwatches.forEach(btn => btn.classList.toggle('active', btn.dataset.color === colorName));
    formColorRadios.forEach(r   => { r.checked = (r.value === colorName); });
    syncCartProduct();
  }

  // =====================================================
  // 6. QUANTITY STEPPER
  // =====================================================
  decreaseBtn.addEventListener('click', () => {
    const v = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (v > MIN_QTY) { quantityInput.value = v - 1; syncCartProduct(); }
  });

  increaseBtn.addEventListener('click', () => {
    const v = parseInt(quantityInput.value, 10) || MIN_QTY;
    if (v < MAX_QTY) { quantityInput.value = v + 1; syncCartProduct(); }
  });

  // =====================================================
  // 7. EVENT LISTENERS
  // =====================================================
  arrowPrev.addEventListener('click', () => switchView(activeViewIdx - 1));
  arrowNext.addEventListener('click', () => switchView(activeViewIdx + 1));

  thumbBtns.forEach((btn, i) => btn.addEventListener('click', () => switchView(i)));

  previewModelSwatches.forEach(btn => {
    btn.addEventListener('click', () => switchModel(btn.dataset.model));
  });

  formModelRadios.forEach(r => {
    r.addEventListener('change', () => switchModel(r.value));
  });

  colorSwatches.forEach(btn => {
    btn.addEventListener('click', () => switchColor(btn.dataset.color));
  });

  formColorRadios.forEach(r => {
    r.addEventListener('change', () => switchColor(r.value));
  });

  // Clear size error when user picks a size
  document.querySelectorAll('input[name="size"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('sizeOptions')
              ?.closest('.form-group')
              ?.classList.remove('invalid');
      syncCartProduct();
    });
  });

  // =====================================================
  // 8. EXPOSE window.CART_PRODUCT
  //    cart.js reads this object when "Add to Cart" fires.
  //    It always reflects the current selections on the page.
  // =====================================================
  function syncCartProduct() {
    window.CART_PRODUCT = {
      productName: 'T-SHIRT BMW ',
      model:       activeModel,
      // Use the current hero image as the cart thumbnail
      image:       productImage.src,
      unitPrice:   PRODUCT_PRICE
    };
  }
  // =====================================================
// AVAILABLE SIZES
// Shows only the sizes available for the selected model.
// Hides unavailable sizes and resets any checked size
// that is no longer valid for the new model.
// =====================================================
function updateAvailableSizes(modelName) {
  const available = MODEL_SIZES[modelName] || [];

  document.querySelectorAll('.size-radio').forEach(radio => {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    const isAvailable = available.includes(radio.value);

    // Show or hide the radio + its label
    radio.style.display = isAvailable ? '' : 'none';
    if (label) label.style.display = isAvailable ? '' : 'none';

    // Uncheck if this size is no longer available
    if (!isAvailable && radio.checked) {
      radio.checked = false;
    }
  });

  // Clear any lingering size error
  document.getElementById('sizeOptions')
          ?.closest('.form-group')
          ?.classList.remove('invalid');
}

  // =====================================================
  // 9. INIT
  // =====================================================
  switchModel('Model B');
  syncCartProduct();

});
