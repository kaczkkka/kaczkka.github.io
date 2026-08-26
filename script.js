/**
 * script.js
 * Wczytuje grafiki z projekty.json, renderuje galerię w #gallery-grid,
 * generuje filtry kategorii i obsługuje lightbox po kliknięciu w kafelek.
 * Aby dodać nową grafikę, edytuj projekty.json — ten plik nie wymaga zmian.
 */

const DATA_URL = "projekty.json";
const SKELETON_COUNT = 3;
const FILTER_ALL = "Wszystkie";

let allProjects = [];
let activeCategory = FILTER_ALL;

const grid = document.querySelector("#gallery-grid");
const emptyState = document.querySelector("#gallery-empty");
const filtersEl = document.querySelector("#filters");

const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxDesc = document.querySelector("#lightbox-desc");
const lightboxCloseBtn = document.querySelector("#lightbox-close");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  loadProjects();
  setupLightboxEvents();
});

async function loadProjects() {
  renderSkeletons();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać ${DATA_URL}: ${response.status}`);
    }

    const projects = await response.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error("Plik projekty.json jest pusty lub ma zły format.");
    }

    allProjects = projects;
    renderFilters(projects);
    renderGallery(projects);
  } catch (error) {
    console.error(error);
    grid.innerHTML = "";
    emptyState.hidden = false;
  }
}

function renderSkeletons() {
  grid.innerHTML = "";
  for (let i = 0; i < SKELETON_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "skeleton";
    el.setAttribute("aria-hidden", "true");
    grid.appendChild(el);
  }
}

function renderFilters(projects) {
  const categories = [FILTER_ALL, ...new Set(projects.map((p) => p.kategoria).filter(Boolean))];

  filtersEl.innerHTML = "";
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      [...filtersEl.children].forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderGallery(allProjects);
    });
    filtersEl.appendChild(chip);
  });
}

function renderGallery(projects) {
  const filtered =
    activeCategory === FILTER_ALL
      ? projects
      : projects.filter((p) => p.kategoria === activeCategory);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.textContent = "Brak grafik w tej kategorii.";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  filtered.forEach((project) => {
    fragment.appendChild(createGalleryCard(project));
  });
  grid.appendChild(fragment);
}

function createGalleryCard(project) {
  const {
    tytul = "Bez tytułu",
    kategoria = "",
    url_obrazka = "",
    opis = "",
  } = project;

  const card = document.createElement("article");
  card.className = "gallery-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Otwórz podgląd: ${tytul}`);

  const thumbWrap = document.createElement("div");
  thumbWrap.className = "gallery-thumb-wrap";

  const img = document.createElement("img");
  img.className = "gallery-thumb";
  img.src = url_obrazka;
  img.alt = tytul;
  img.loading = "lazy";
  thumbWrap.appendChild(img);

  if (kategoria) {
    const badge = document.createElement("span");
    badge.className = "gallery-category";
    badge.textContent = kategoria;
    thumbWrap.appendChild(badge);
  }

  const body = document.createElement("div");
  body.className = "gallery-body";

  const title = document.createElement("h3");
  title.className = "gallery-title";
  title.textContent = tytul;
  body.appendChild(title);

  if (opis) {
    const desc = document.createElement("p");
    desc.className = "gallery-desc";
    desc.textContent = opis;
    body.appendChild(desc);
  }

  card.appendChild(thumbWrap);
  card.appendChild(body);

  const openHandler = () => openLightbox(project);
  card.addEventListener("click", openHandler);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openHandler();
    }
  });

  return card;
}

/* ============== LIGHTBOX ============== */

function openLightbox(project) {
  const { tytul = "", kategoria = "", url_obrazka = "", opis = "" } = project;

  lightboxImg.src = url_obrazka;
  lightboxImg.alt = tytul;
  lightboxTitle.textContent = tytul;
  lightboxCategory.textContent = kategoria;
  lightboxDesc.textContent = opis;

  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxCloseBtn.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

function setupLightboxEvents() {
  lightboxCloseBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}
