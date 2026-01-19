/*********************************************************
 * GLOBAL STATE
 *********************************************************/
let certImages = [];
let currentCertIndex = 0;
let galleryImages = [];
let currentGalleryIndex = 0;
let langData = {};
let currentLang = localStorage.getItem("selectedLang") || "ar";

/*********************************************************
 * DOM ELEMENTS
 *********************************************************/
const dom = {
  topBar: document.getElementById("topBar"),
  collage: document.getElementById("collage"),
  certSection: document.getElementById("certSection"),
  gallerySection: document.getElementById("gallerySection"),
  certToggle: document.getElementById("certToggle"),
  galleryToggle: document.getElementById("galleryToggle"),
  certModalImage: document.getElementById("certModalImage"),
  galleryModalImage: document.getElementById("galleryModalImage"),
  certCounter: document.getElementById("certCounter"),
  galleryCounter: document.getElementById("galleryCounter"),
};

/*********************************************************
 * LOAD LANGUAGE
 *********************************************************/
async function loadLanguage(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    langData = await res.json();

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    applyI18n();
  } catch (err) {
    console.error("Language load error:", err);
  }
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;

    const keys = key.split(".");
    let text = langData;
    for (let k of keys) {
      if (text && k in text) text = text[k];
      else text = null;
    }
    if (text !== null && text !== undefined) el.textContent = text;
  });
}

/*********************************************************
 * PARTICLES
 *********************************************************/
function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 20 + "s";
    particle.style.animationDuration = 15 + Math.random() * 10 + "s";
    container.appendChild(particle);
  }
}

/*********************************************************
 * CERTIFICATES COLLAGE
 *********************************************************/
function buildCollage() {
  if (!dom.collage) return;
  dom.collage.innerHTML = "";

  const rect = dom.collage.getBoundingClientRect();
  const maxW = rect.width - 120;
  const maxH = rect.height - 160;

  certImages = [];
  for (let i = 1; i <= 50; i++) {
    certImages.push({
      thumb: `images-small/cert${i}.webp`,
      full: `images-full/cert${i}.jpg`,
      x: Math.random() * maxW,
      y: Math.random() * maxH,
      rotate: (Math.random() - 0.5) * 20,
    });
  }

  certImages.forEach((img, index) => {
    const cert = document.createElement("div");
    cert.className = "cert";
    cert.style.left = img.x + "px";
    cert.style.top = img.y + "px";
    cert.style.transform = `rotate(${img.rotate}deg)`;
    cert.innerHTML = `<img src="${img.thumb}" loading="lazy" alt="Certificate ${index + 1}">`;
    cert.onclick = () => openCertModal(index);
    dom.collage.appendChild(cert);
  });
}

/*********************************************************
 * CERT MODAL
 *********************************************************/
function openCertModal(index) {
  currentCertIndex = index;
  updateCertModal();

  const modalEl = document.getElementById("certModal");
  if (!modalEl) return;

  new bootstrap.Modal(modalEl).show();
  dom.topBar?.classList.add("hidden");
}

function updateCertModal() {
  if (!dom.certModalImage) return;
  dom.certModalImage.src = certImages[currentCertIndex].full;
  if (dom.certCounter)
    dom.certCounter.textContent = `${currentCertIndex + 1} / ${certImages.length}`;
}

window.certNextImage = () => {
  currentCertIndex = (currentCertIndex + 1) % certImages.length;
  updateCertModal();
};

window.certPrevImage = () => {
  currentCertIndex =
    (currentCertIndex - 1 + certImages.length) % certImages.length;
  updateCertModal();
};

/*********************************************************
 * SECTION TOGGLE
 *********************************************************/
dom.certToggle?.addEventListener("click", () => {
  dom.certSection.classList.add("active");
  dom.gallerySection.classList.remove("active");
  dom.certToggle.classList.add("active");
  dom.galleryToggle.classList.remove("active");
  buildCollage();
});

dom.galleryToggle?.addEventListener("click", () => {
  dom.gallerySection.classList.add("active");
  dom.certSection.classList.remove("active");
  dom.galleryToggle.classList.add("active");
  dom.certToggle.classList.remove("active");
});

/*********************************************************
 * MODAL CLOSE
 *********************************************************/
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("hidden.bs.modal", () => {
    dom.topBar?.classList.remove("hidden");
  });
});

/*********************************************************
 * MOBILE SCROLL
 *********************************************************/
let lastScroll = 0;
window.addEventListener("scroll", () => {
  if (window.innerWidth > 768) return;
  const current = window.scrollY;
  if (current > lastScroll && current > 80) {
    dom.topBar?.classList.add("hidden");
  } else {
    dom.topBar?.classList.remove("hidden");
  }
  lastScroll = current;
});

/*********************************************************
 * RESIZE
 *********************************************************/
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildCollage, 300);
});

/*********************************************************
 * INIT
 *********************************************************/
window.addEventListener("load", async () => {
  await loadLanguage(currentLang); // هنا بنخلي اللغة متوافقة مع الموقع الأساسي
  createParticles();
  buildCollage();
});

// إضافة تحكم بالكيبورد
window.addEventListener("keydown", (e) => {
  const modalEl = document.getElementById("certModal");
  if (!modalEl.classList.contains("show")) return;

  if (e.key === "ArrowRight") {
    certNextImage();
  } else if (e.key === "ArrowLeft") {
    certPrevImage();
  } else if (e.key === "Escape") {
    bootstrap.Modal.getInstance(modalEl)?.hide();
  }
});
