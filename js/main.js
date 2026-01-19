// -------------------- GLightbox --------------------
// للـ فيديو
const lightboxVideo = GLightbox({
  selector: ".glightbox-video",
  type: "video",
  source: "local",
  width: "80%",
  autoplayVideos: true,
});

// للصور
const lightboxImages = GLightbox({
  selector: ".glightbox-images",
});

// -------------------- DOMContentLoaded --------------------
document.addEventListener("DOMContentLoaded", () => {
  // ------------------ Portfolio Filters ------------------
  const filters = document.querySelectorAll(".portfolio-filters li");
  const descriptions = document.querySelectorAll(".portfolio-description");
  const allGroups = document.querySelectorAll(".portfolio-group");
  const allItems = document.querySelectorAll(".isotope-item");

  // Hide everything initially
  allItems.forEach((item) => (item.style.display = "none"));
  allGroups.forEach((group) => (group.style.display = "none"));
  descriptions.forEach((desc) => (desc.style.display = "none"));

  // Show default Cashew
  const defaultFilter = document.querySelector(".filter-cashew");
  if (defaultFilter) defaultFilter.classList.add("filter-active");

  const firstGroup = document.querySelector(".portfolio-group.filter-cashew");
  if (firstGroup) firstGroup.style.display = "flex";

  const firstDesc = document.querySelector("#desc-cashew");
  if (firstDesc) firstDesc.style.display = "block";

  document.querySelectorAll(".isotope-item.filter-cashew").forEach((item) => {
    item.style.display = "block";
  });

  const iso = new Isotope(".isotope-container", {
    itemSelector: ".isotope-item",
    layoutMode: "masonry",
    filter: ".filter-cashew",
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter
        .getAttribute("data-filter")
        .replace(".filter-", "");
      filters.forEach((f) => f.classList.remove("filter-active"));
      filter.classList.add("filter-active");

      allItems.forEach((item) => (item.style.display = "none"));
      descriptions.forEach((desc) => (desc.style.display = "none"));
      allGroups.forEach((group) => (group.style.display = "none"));

      if (filterValue === "*") {
        document.querySelectorAll(".first-three").forEach((item) => {
          item.style.display = "block";
        });
        iso.arrange({ filter: "*" });
      } else {
        const desc = document.querySelector(`#desc-${filterValue}`);
        if (desc) desc.style.display = "block";

        const activeGroup = document.querySelector(
          `.portfolio-group.filter-${filterValue}`,
        );
        if (activeGroup) activeGroup.style.display = "flex";

        document
          .querySelectorAll(`.isotope-item.filter-${filterValue}`)
          .forEach((item) => {
            item.style.display = "block";
          });

        iso.arrange({ filter: `.filter-${filterValue}` });
      }
    });
  });

  // ------------------ Read More Buttons ------------------
  const readMoreIds = ["Cashew", "Cloves", "Beans", "BlackPepper", "Cardamom"];
  readMoreIds.forEach((id) => {
    const btn = document.getElementById(`readMore${id}`);
    if (btn) {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          const filterBtn = document.querySelector(
            `.portfolio-filters li[data-filter=".filter-${id.toLowerCase()}"]`,
          );
          if (filterBtn) filterBtn.click();
        }, 400);
      });
    }
  });

  // ------------------ Language Dropdown Fix ------------------
  const langDropdown = document.querySelector(".language-dropdown");
  if (langDropdown) {
    langDropdown.classList.remove("show");

    langDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      langDropdown.classList.remove("show");
    });
  }

  // ------------------ Load saved language ------------------
  const savedLang = localStorage.getItem("selectedLang") || "en";
  changeLang(savedLang); // تطبيق اللغة المحفوظة أو الإنجليزية بشكل افتراضي
});

// -------------------- تغيير اللغة + القائمة --------------------
function changeLang(lang) {
  // تخزين اللغة في localStorage
  localStorage.setItem("selectedLang", lang);

  // تغيير اتجاه الصفحة
  if (lang === "ar") {
    document.documentElement.setAttribute("dir", "rtl");
    document.body.classList.add("rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.body.classList.remove("rtl");
  }

  // تحديث أزرار الكاروسيل حسب الاتجاه
  updateCarouselButtons();

  // تحميل نصوص اللغة
  fetch(`assets/i18n/${lang}.json`)
    .then((res) => res.json())
    .then((data) => {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const keyAttr = el.getAttribute("data-i18n");
        let keys = keyAttr.replace("[placeholder]", "").split(".");
        let text = data;
        keys.forEach((k) => {
          if (text && k in text) {
            text = text[k];
          } else {
            text = null;
          }
        });

        if (text !== null && text !== undefined && text !== "") {
          if (keyAttr.startsWith("[placeholder]")) {
            el.setAttribute("placeholder", text);
          } else {
            el.innerText = text;
          }
        }
        // لو الترجمة مش موجودة → سيب النص الأصلي زي ما هو
      });
    })
    .catch((err) => console.error("Error loading language JSON:", err));
}

// -------------------- تحديث أزرار الكاروسيل --------------------
function updateCarouselButtons() {
  const carousel = document.querySelector("#hero-carousel");
  if (!carousel) return;

  const isRTL = document.documentElement.dir === "rtl";
  const prevBtn = carousel.querySelector(".carousel-control-prev");
  const nextBtn = carousel.querySelector(".carousel-control-next");

  if (isRTL) {
    prevBtn.setAttribute("data-bs-slide", "next"); // نقلبهم
    nextBtn.setAttribute("data-bs-slide", "prev");
  } else {
    prevBtn.setAttribute("data-bs-slide", "prev");
    nextBtn.setAttribute("data-bs-slide", "next");
  }
}

// -------------------- Navbar Active --------------------
const navLinks = document.querySelectorAll('.navmenu a[href^="#"]');
const sections = Array.from(navLinks)
  .map((link) =>
    document.getElementById(link.getAttribute("href").substring(1)),
  )
  .filter((sec) => sec !== null);

const observerOptions = {
  root: null,
  rootMargin: "-100px 0px 0px 0px",
  threshold: 0.2,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        if (!link.closest(".portfolio-filters"))
          link.classList.remove("active");
      });
      const id = entry.target.id;
      const activeLink = document.querySelector(`.navmenu a[href="#${id}"]`);
      if (activeLink) activeLink.classList.add("active");
    }
  });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

document.getElementById("current-year").textContent = new Date().getFullYear();

// -------------------- GLightbox إضافي --------------------
const lightbox2 = GLightbox({ selector: ".glightbox" });

// -------------------- Mobile Nav Toggle --------------------
const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
mobileNavToggle.addEventListener("click", () => {
  document.body.classList.toggle("mobile-nav-active");
  mobileNavToggle.classList.toggle("bi-list");
  mobileNavToggle.classList.toggle("bi-x");
});

document.querySelectorAll("#navmenu a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("mobile-nav-active");
    mobileNavToggle.classList.add("bi-list");
    mobileNavToggle.classList.remove("bi-x");
  });
});

// -------------------- Scroll Top Button --------------------
const scrollTopBtn = document.getElementById("scroll-top");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) scrollTopBtn.classList.add("active");
  else scrollTopBtn.classList.remove("active");
});
scrollTopBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// -------------------- QR Popups --------------------
const qrPopup = document.getElementById("qr-popup");
document.querySelectorAll(".cert-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const imgSrc = item.getAttribute("data-qr");
    qrPopup.querySelector("img").src = imgSrc;

    const rect = item.getBoundingClientRect();
    const containerRect = document
      .querySelector(".cert-ticker-container")
      .getBoundingClientRect();

    qrPopup.style.left = `${
      rect.left - containerRect.left + rect.width / 2 - 70
    }px`;
    qrPopup.style.top = `${rect.top - containerRect.top - 150}px`;

    qrPopup.style.opacity = 1;
    qrPopup.style.visibility = "visible";
  });

  item.addEventListener("mouseleave", () => {
    qrPopup.style.opacity = 0;
    qrPopup.style.visibility = "hidden";
  });
});
// -------------------- PDFs --------------------
// -------------------- PDFs --------------------
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadAllPDFs() {
  const pdfFolder = "assets/pdfs/";
  const track = document.querySelector(".pdf-track");
  track.innerHTML = "";

  const pdfFiles = [
    "Black-Pepper&Cloves-Phytosanitary-Certificate.pdf",
    "Cardamom-Phytosanitary-Certificate.pdf",
    "Copra-Certificate.pdf",
    "Fire-Certificate.pdf",
    "Fumigation-Certificate.pdf",
    "Health-Certificate.pdf",
    "Marka-business-license.pdf",
    "Plant-Health-Certificate.pdf",
    "Sisal-Export-license.pdf",
    "Sisal-Trading-License.pdf",
    "Tanzania-Business-Licence.pdf",
    "Tax-clearance-certificate-tanga.pdf",
    "Tax-Clearance-Certificate.pdf",
    "Tax-Identification-Certificate.pdf",
  ];

  const originalItems = [];
  for (let pdfName of pdfFiles) {
    const item = await createPDFItem(pdfFolder + pdfName, pdfName);
    track.appendChild(item);
    originalItems.push(item);
  }

  originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
  console.log(`تم تحميل ${pdfFiles.length} PDF + النسخ للـ infinite loop`);
}

async function createPDFItem(pdfUrl, pdfName) {
  const item = document.createElement("a");

  // ✅ تعديل الروابط الخاصة لبعض PDFs
  const lowerName = pdfName.toLowerCase();
  if (lowerName.includes("black-pepper")) {
    item.href =
      "https://ekilimo.kilimo.go.tz/license-permit-verification/32a5c9d9-cc8e-4024-a489-e3f75c3afb3f";
    item.target = "_blank";
  } else if (lowerName.includes("cardamom")) {
    item.href =
      "https://ekilimo.kilimo.go.tz/license-permit-verification/11881d24-0ace-4633-a399-37c7049f77bf";
    item.target = "_blank";
  } else if (lowerName.includes("copra")) {
    item.href = "https://asds.kilimo.go.tz/qr-info/TZ-TAN-COPRA-913688";
    item.target = "_blank";
  } else if (lowerName.includes("plant-health")) {
    item.href =
      "https://ekilimo.kilimo.go.tz/license-permit-verification/e8ab5f56-1db1-49bc-8207-1922d2d28656";
    item.target = "_blank";
  } else if (lowerName.includes("sisal-export")) {
    item.href =
      "https://ekilimo.kilimo.go.tz/license-permit-verification/ef8b12d6-6edc-4f1f-8fd4-3b7314854d11";
    item.target = "_blank";
  } else if (lowerName.includes("sisal-trading")) {
    item.href =
      "https://ekilimo.kilimo.go.tz/license-permit-verification/19ec2928-12c6-465c-bee6-3d19ce5b9869";
    item.target = "_blank";
  } else {
    // الباقي يفتح PDF كالمعتاد
    item.href = pdfUrl;
    item.target = "_blank";
  }

  item.className = "pdf-item";
  item.title = pdfName;

  const thumb = document.createElement("img");
  thumb.className = "pdf-thumb";
  thumb.src = await generateThumbnail(pdfUrl);
  thumb.alt = pdfName;
  thumb.loading = "lazy";

  const name = document.createElement("span");
  name.className = "pdf-name";
  const cleanName = pdfName.replace(".pdf", "").replace(/[-_]/g, " ");
  name.textContent =
    cleanName.length > 25 ? cleanName.substring(0, 25) + "..." : cleanName;

  item.append(thumb, name);
  return item;
}

async function generateThumbnail(pdfUrl) {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = 0.4;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport })
      .promise;
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return (
      "image/svg+xml;base64," +
      btoa(`
      <svg width="85" height="110" xmlns="http://www.w3.org/2000/svg">
        <rect width="85" height="110" rx="8" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
        <rect x="12" y="20" width="60" height="40" rx="4" fill="#fff"/>
        <text x="42" y="52" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">PDF</text>
        <circle cx="42" cy="75" r="20" fill="#fff" stroke="#1976d2" stroke-width="2"/>
        <path d="M38 72 L46 72 L42 78 Z" fill="#1976d2"/>
      </svg>
    `)
    );
  }
}

document.addEventListener("DOMContentLoaded", loadAllPDFs);

////////////////////////////////////////////////////
// ////////////////////
