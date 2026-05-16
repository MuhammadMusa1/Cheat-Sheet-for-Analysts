const dataPath = new URL("../data/cheatsheets.json", window.location.href);
const pageSlug = document.body.dataset.slug;
const cardGrid = document.querySelector("[data-card-grid]");
const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-input]");
const resultList = document.querySelector("[data-result-list]");
const detailMount = document.querySelector("[data-cheatsheet-detail]");

function pageHref(slug) {
  const fixedPages = {
    "biznes-analiz": "biznes-analiz.html",
    "sistemny-analiz": "sistemny-analiz.html",
    "product-owner": "product-owner.html"
  };

  return fixedPages[slug] || `cheatsheet.html?slug=${encodeURIComponent(slug)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function matchesCheatsheet(item, query) {
  const term = query.trim().toLowerCase();

  if (!term) {
    return true;
  }

  const text = [
    item.slug,
    item.title,
    item.subtitle,
    item.level,
    ...item.tags,
    ...item.sections.flatMap((section) => [section.title, ...section.items])
  ]
    .join(" ")
    .toLowerCase();

  return text.includes(term);
}

function renderCards(items) {
  if (!cardGrid) {
    return;
  }

  cardGrid.innerHTML = items
    .map((item) => `
      <article class="cheatsheet-card" style="--accent: ${escapeHtml(item.accent)}">
        <div>
          <div class="card-kicker">${escapeHtml(item.level)}</div>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="card-meta">${escapeHtml(item.subtitle)}</p>
          <div class="tags">
            ${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <a class="primary-link" href="${pageHref(item.slug)}">Открыть</a>
      </article>
    `)
    .join("");
}

function renderResults(items, query) {
  if (!resultList) {
    return;
  }

  const filtered = items.filter((item) => matchesCheatsheet(item, query));

  if (!filtered.length) {
    resultList.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
    return;
  }

  resultList.innerHTML = filtered
    .map((item) => `
      <a class="result-item" href="${pageHref(item.slug)}">
        <strong>${escapeHtml(item.title)}</strong><br>
        <span>${escapeHtml(item.tags.join(" / "))}</span>
      </a>
    `)
    .join("");
}

function renderDetail(item) {
  if (!detailMount) {
    return;
  }

  if (!item) {
    detailMount.innerHTML = '<div class="empty-state">Раздел не найден</div>';
    return;
  }

  document.title = `${item.title} | Cheat Sheet for Analysts`;
  document.querySelector("[data-page-title]").textContent = item.title;
  document.querySelector("[data-page-subtitle]").textContent = item.subtitle;

  detailMount.innerHTML = item.sections
    .map((section) => `
      <section class="section-card">
        <h2>${escapeHtml(section.title)}</h2>
        <ul>
          ${section.items.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ul>
      </section>
    `)
    .join("");
}

async function init() {
  const response = await fetch(dataPath);
  const cheatsheets = await response.json();

  renderCards(cheatsheets);
  renderResults(cheatsheets, "");

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderResults(cheatsheets, searchInput.value);
    });

    searchInput.addEventListener("input", () => {
      renderResults(cheatsheets, searchInput.value);
    });
  }

  if (detailMount) {
    const params = new URLSearchParams(window.location.search);
    const slug = pageSlug || params.get("slug");
    renderDetail(cheatsheets.find((item) => item.slug === slug));
  }
}

init().catch((error) => {
  console.error(error);

  if (resultList) {
    resultList.innerHTML = '<div class="empty-state">Не удалось загрузить данные</div>';
  }
});
