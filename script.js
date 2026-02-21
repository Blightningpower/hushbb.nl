// ===== Header "scrolled" effect (smooth like original) =====
window.addEventListener("scroll", () => {
  const header = document.getElementById("siteHeader");
  const overlayMenu = document.getElementById("overlayMenu");

  const scrolled = window.scrollY > 40;

  if (scrolled) {
    header?.classList.add("scrolled");
    overlayMenu?.classList.add("scrolled");
  } else {
    header?.classList.remove("scrolled");
    overlayMenu?.classList.remove("scrolled");
  }
});

// ===== Burger menu =====
const body = document.body;
const burger = document.getElementById("burger");
const overlayMenu = document.getElementById("overlayMenu");

burger.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", String(isOpen));

  // als menu dichtgaat: dropdown ook dicht
  if (!isOpen) {
    dropdown?.classList.remove("open");
    dropdownBtn?.setAttribute("aria-expanded", "false");
  }
});


// dropdown in overlay
const dropdown = document.querySelector(".overlay-dropdown");
const dropdownBtn = dropdown?.querySelector(".overlay-link-btn");

dropdownBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  const open = dropdown.classList.toggle("open");
  dropdownBtn.setAttribute("aria-expanded", String(open));
});

// close menu when clicking a link
overlayMenu.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;

  body.classList.remove("menu-open");
  burger.setAttribute("aria-expanded", "false");
  dropdown?.classList.remove("open");
  dropdownBtn?.setAttribute("aria-expanded", "false");
});

// ===== Scroll reveal (smooth in-view animations) =====
const revealEls = document.querySelectorAll(".reveal");

// Hero-content staat al op is-visible, die skippen we
// (maar observeren is ook oké)
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target); // 1x animeren
      }
    }
  },
  {
    root: null,
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px", // net iets eerder starten = smoother
  }
);

revealEls.forEach((el) => {
  if (el.classList.contains("is-visible")) return;
  io.observe(el);
});