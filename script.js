// ===== Partials loader =====
async function loadPartial(mountSelector, url) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kan partial niet laden: ${url} (${res.status})`);
  mount.innerHTML = await res.text();
}

// ===== Helpers =====
function isInHtmlFolder() {
  return location.pathname.includes("/html/");
}

// assets zitten in hushbb.nl/img
function getAssetBase() {
  return isInHtmlFolder() ? ".." : ".";
}

// partials zitten in Website/partials (boven hushbb.nl)
function getPartialBase() {
  return isInHtmlFolder() ? "../.." : "..";
}

// Fix paths inside injected header/footer (img + inline background-image + links)
function fixAssetPaths(base) {
  // IMG src
  document.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    // skip absolute / data / already prefixed
    if (
      src.startsWith("http") ||
      src.startsWith("data:") ||
      src.startsWith("/") ||
      src.startsWith(`${base}/`)
    ) return;

    if (src.startsWith("img/") || src.startsWith("html/") || src.startsWith("partials/")) {
      img.setAttribute("src", `${base}/${src}`);
    }
  });

  // A href (voor als je ooit links naar img/html in partials hebt)
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#") ||
      href.startsWith("/") ||
      href.startsWith(`${base}/`)
    ) return;

    if (href.startsWith("img/") || href.startsWith("html/") || href.startsWith("partials/")) {
      a.setAttribute("href", `${base}/${href}`);
    }
  });

  // inline background-image:url('img/...')
  document.querySelectorAll("[style*='background-image']").forEach((el) => {
    const style = el.getAttribute("style") || "";
    const fixed = style.replace(/url\((['"]?)img\//g, `url($1${base}/img/`);
    el.setAttribute("style", fixed);
  });
}

function fixHeaderLinksForHtmlPages() {
  if (!isInHtmlFolder()) return;

  // #anchors in menu moeten naar ../index.html#...
  document.querySelectorAll(".overlay-menu a.overlay-link").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) a.setAttribute("href", `../index.html${href}`);
  });

  const brand = document.querySelector(".brand");
  if (brand) brand.setAttribute("href", "../index.html#top");
}

// ===== Init header/menu logic (moet NA inject) =====
function initMenu() {
  const body = document.body;
  const burger = document.getElementById("burger");
  const overlayMenu = document.getElementById("overlayMenu");
  const dropdown = document.querySelector(".overlay-dropdown");
  const dropdownBtn = dropdown?.querySelector(".overlay-link-btn");

  if (!burger || !overlayMenu) return;

  // voorkom dubbele listeners (handig bij hot reload)
  burger.onclick = null;
  if (dropdownBtn) dropdownBtn.onclick = null;

  burger.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", String(isOpen));

    if (!isOpen) {
      dropdown?.classList.remove("open");
      dropdownBtn?.setAttribute("aria-expanded", "false");
    }
  });

  dropdownBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const open = dropdown.classList.toggle("open");
    dropdownBtn.setAttribute("aria-expanded", String(open));
  });

  overlayMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    dropdown?.classList.remove("open");
    dropdownBtn?.setAttribute("aria-expanded", "false");
  });
}

function initHeaderScrollEffect() {
  // zet maar 1x
  if (window.__hushScrollInit) return;
  window.__hushScrollInit = true;

  window.addEventListener("scroll", () => {
    const header = document.getElementById("siteHeader");
    const overlayMenu = document.getElementById("overlayMenu");
    const scrolled = window.scrollY > 40;

    header?.classList.toggle("scrolled", scrolled);
    overlayMenu?.classList.toggle("scrolled", scrolled);
  });
}

// ===== Layout loader =====
async function loadLayout() {
  const assetBase = getAssetBase();
  const partialBase = getPartialBase();

  await loadPartial("#siteHeaderMount", `${partialBase}/partials/header.html`);
  await loadPartial("#siteFooterMount", `${partialBase}/partials/footer.html`);

  // na inject
  fixAssetPaths(assetBase);
  fixHeaderLinksForHtmlPages();

  initMenu();
  initHeaderScrollEffect();
}

// ===== Reveal =====
function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => {
    if (!el.classList.contains("is-visible")) io.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // bestaande content meteen observeren
  initReveal();

  try {
    await loadLayout();
    // opnieuw draaien voor geïnjecteerde header/footer .reveal elementen
    initReveal();
  } catch (err) {
    console.error(err);
  }
});