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
    const vids = Array.from(document.querySelectorAll('.images .image-container video'));
    if (!imgs.length && !vids.length) return;

    // Convert images to deferred placeholders (no special-casing)
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

    // Convert videos: move <source src> -> data-src and prevent preloading
    vids.forEach((video) => {
      const sources = Array.from(video.querySelectorAll('source'));
      if (!sources.length) return;
      sources.forEach((source) => {
        if (source.dataset.src) return;
        const src = source.getAttribute('src');
        if (src) {
          source.dataset.src = src;
          source.removeAttribute('src');
        }
      });
      // Stop the browser from eager-loading
      try { video.preload = 'none'; } catch (e) {}
      video.setAttribute('data-lazy', 'true');
    });

    function loadImage(img) {
      const real = img.dataset.src;
      if (!real) return;
      img.src = real;
      img.removeAttribute('data-src');
      img.removeAttribute('loading');
    }

    function loadVideo(video) {
      const sources = Array.from(video.querySelectorAll('source'));
      let loaded = false;
      sources.forEach((source) => {
        const real = source.dataset.src;
        if (!real) return;
        source.src = real;
        source.removeAttribute('data-src');
        loaded = true;
      });
      if (!loaded) return;
      video.removeAttribute('data-lazy');
      try { video.preload = 'auto'; } catch (e) {}
      // load new sources
      try { video.load(); } catch (e) {}
      // retain autoplay behaviour — ensure muted so autoplay is allowed by browsers
      if (video.hasAttribute('autoplay')) {
        try { video.muted = true; } catch (e) {}
        const p = video.play && video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    }

    if ('IntersectionObserver' in window) {
      const rootMargin = '1000px 0px'; // adjust to control how early media starts loading
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const tgt = entry.target;
          if (tgt.tagName === 'IMG') {
            loadImage(tgt);
          } else if (tgt.tagName === 'VIDEO') {
            loadVideo(tgt);
          }
          observer.unobserve(tgt);
        });
      }, { rootMargin, threshold: 0.01 });

      // Observe all images and videos; loading will be controlled by the IntersectionObserver offset
      imgs.forEach((img) => io.observe(img));
      vids.forEach((video) => io.observe(video));
    } else {
      // Fallback: load all deferred images and videos immediately
      imgs.forEach((img) => loadImage(img));
      vids.forEach((video) => loadVideo(video));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyImages);
  } else {
    initLazyImages();
  }
})();