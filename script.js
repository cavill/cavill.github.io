var w = window.innerWidth;
var h = window.innerHeight;

var hgtmax = 140;

function addDot(c) {

  if (w > 784) {
    tLeft = Math.floor(Math.random()*(w*0.45))
  } else {
    tLeft = Math.floor(Math.random()*(w*0.8))
  }
  var tTop  = Math.floor(Math.random()*(h-hgtmax)),
      deg = Math.floor(Math.random() * 360),
      hgt = Math.floor(Math.random() * (hgtmax - 20 + 1) + 20);
  
  var dot = document.createElement('div');
  dot.className = c + " dot";
  dot.style.top = tTop + "px";
  dot.style.left = tLeft + "px";
  dot.style.transform = `rotate(${deg}deg)`;
  dot.style.height = (hgt * 0.15) + "vw";
  document.body.appendChild(dot);
}

window.addEventListener("load", function() {
  const rgb = ["alpha", "beta", "gamma", "delta"];

  let dots = "";
  for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
  }
});

/* Lazy-load implementation
  - Defers images by moving `src` -> `data-src` and inserting a tiny placeholder
  - Uses IntersectionObserver with a configurable `rootMargin` to load images when near viewport
  - Relies on offset (rootMargin) alone; no special-casing of the first images
  - Safe fallback for browsers without IntersectionObserver
*/
(function() {
  function initLazyImages() {
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const imgs = Array.from(document.querySelectorAll('.images .image-container img'));
    if (!imgs.length) return;

    // Convert all images to deferred placeholders (no special-casing)
    imgs.forEach((img) => {
      // if already handled (data-src present) skip
      if (img.dataset.src) return;

      const src = img.getAttribute('src');
      if (src) {
        img.dataset.src = src;
        img.setAttribute('src', placeholder);
        // hint to browsers (optional) — native lazy can be used alongside our script
        img.setAttribute('loading', 'lazy');
      }
    });

    function loadImage(img) {
      const real = img.dataset.src;
      if (!real) return;
      img.src = real;
      img.removeAttribute('data-src');
      img.removeAttribute('loading');
    }

    if ('IntersectionObserver' in window) {
      const rootMargin = '1000px 0px'; // adjust to control how early images start loading
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin, threshold: 0.01 });

      // Observe all images; loading will be controlled by the IntersectionObserver offset
      imgs.forEach((img) => io.observe(img));
    } else {
      // Fallback: load all deferred images immediately
      imgs.forEach((img) => loadImage(img));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyImages);
  } else {
    initLazyImages();
  }
})();