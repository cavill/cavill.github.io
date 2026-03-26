const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const maxDotHeight = 140;
const placeholderGif =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const defaultImageSizes =
  "(max-width: 785px) calc(100vw - 40px), 66.666vw";
const mediaManifest = window.__MEDIA_MANIFEST__ || { images: {}, videos: {} };

function addDot(colorClass) {
  const left =
    viewportWidth > 784
      ? Math.floor(Math.random() * (viewportWidth * 0.45))
      : Math.floor(Math.random() * (viewportWidth * 0.8));
  const top = Math.floor(Math.random() * (viewportHeight - maxDotHeight));
  const degrees = Math.floor(Math.random() * 360);
  const height = Math.floor(Math.random() * (maxDotHeight - 20 + 1) + 20);

  const dot = document.createElement("div");
  dot.className = `${colorClass} dot`;
  dot.style.top = `${top}px`;
  dot.style.left = `${left}px`;
  dot.style.transform = `rotate(${degrees}deg)`;
  dot.style.height = `${height * 0.15}vw`;
  document.body.appendChild(dot);
}

["alpha", "beta", "gamma", "delta"].forEach(addDot);

function getImageAsset(key) {
  return mediaManifest.images[key];
}

function getVideoAsset(key) {
  return mediaManifest.videos[key];
}

function getPosterSrc(key) {
  const imageAsset = getImageAsset(key);
  if (!imageAsset) {
    return "";
  }

  return (
    imageAsset.sources.find((source) => source.width >= 768)?.src ||
    imageAsset.defaultSrc
  );
}

function configureImage(img) {
  const assetKey = img.dataset.media;
  const imageAsset = getImageAsset(assetKey);
  if (!imageAsset) {
    return;
  }

  img.width = imageAsset.width;
  img.height = imageAsset.height;
  img.decoding = "async";
  img.loading = "lazy";

  if (!img.getAttribute("sizes")) {
    img.setAttribute("sizes", defaultImageSizes);
  }

  img.dataset.src = imageAsset.defaultSrc;
  img.dataset.srcset = imageAsset.sources
    .map((source) => `${source.src} ${source.width}w`)
    .join(", ");
  img.dataset.sizes = img.getAttribute("sizes");
  img.src = placeholderGif;
}

function configureVideo(video) {
  const assetKey = video.dataset.video;
  const videoAsset = getVideoAsset(assetKey);
  if (!videoAsset) {
    return;
  }

  video.width = videoAsset.width;
  video.height = videoAsset.height;
  video.preload = "none";

  if (video.dataset.posterMedia) {
    const posterSrc = getPosterSrc(video.dataset.posterMedia);
    if (posterSrc) {
      video.dataset.poster = posterSrc;
    }
  }

  Array.from(video.querySelectorAll("source")).forEach((source) => {
    const format = source.dataset.format;
    const src = format ? videoAsset.sources[format] : "";
    if (!src) {
      return;
    }

    source.dataset.src = src;
    source.removeAttribute("src");
  });
}

function loadImage(img) {
  if (img.dataset.srcset) {
    img.srcset = img.dataset.srcset;
    img.removeAttribute("data-srcset");
  }

  if (img.dataset.sizes) {
    img.sizes = img.dataset.sizes;
    img.removeAttribute("data-sizes");
  }

  if (img.dataset.src) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  }

  img.removeAttribute("loading");
}

function loadVideo(video) {
  if (video.dataset.poster && !video.poster) {
    video.poster = video.dataset.poster;
  }

  let loaded = false;

  Array.from(video.querySelectorAll("source")).forEach((source) => {
    if (!source.dataset.src) {
      return;
    }

    source.src = source.dataset.src;
    source.removeAttribute("data-src");
    loaded = true;
  });

  if (!loaded) {
    return;
  }

  video.preload = "metadata";

  try {
    video.load();
  } catch (error) {
    return;
  }

  if (video.hasAttribute("autoplay")) {
    video.muted = true;
    const playback = video.play?.();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {});
    }
  }
}

(function initLazyMedia() {
  const imgs = Array.from(document.querySelectorAll(".images .image-container img"));
  const videos = Array.from(
    document.querySelectorAll(".images .image-container video")
  );

  if (!imgs.length && !videos.length) {
    return;
  }

  imgs.forEach(configureImage);
  videos.forEach(configureVideo);

  if (!("IntersectionObserver" in window)) {
    imgs.forEach(loadImage);
    videos.forEach(loadVideo);
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadImage(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "400px 0px", threshold: 0.01 }
  );

  const videoObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadVideo(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "250px 0px", threshold: 0.01 }
  );

  imgs.forEach((img) => imageObserver.observe(img));
  videos.forEach((video) => videoObserver.observe(video));
})();
