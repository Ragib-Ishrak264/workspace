const DB_NAME = "study-workspace";
const DB_VERSION = 1;
const STORE_NAME = "pdfs";
const RESOURCE_KEY = "study-workspace-resources";
const NOTES_KEY = "study-workspace-notes";

const pdfInput = document.querySelector("#pdfInput");
const pdfList = document.querySelector("#pdfList");
const linkForm = document.querySelector("#linkForm");
const appForm = document.querySelector("#appForm");
const linkList = document.querySelector("#linkList");
const appList = document.querySelector("#appList");
const notesBox = document.querySelector("#notesBox");
const savedStatus = document.querySelector("#savedStatus");
const exportButton = document.querySelector("#exportButton");
const pdfCount = document.querySelector("#pdfCount");
const resourceCount = document.querySelector("#resourceCount");
const emptyTemplate = document.querySelector("#emptyTemplate");

let db;
let resources = loadResources();

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(storeMode = "readonly") {
  return db.transaction(STORE_NAME, storeMode).objectStore(STORE_NAME);
}

function getAllPdfs() {
  return new Promise((resolve, reject) => {
    const request = transaction().getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.addedAt - a.addedAt));
    request.onerror = () => reject(request.error);
  });
}

function savePdf(record) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deletePdf(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function loadResources() {
  try {
    return JSON.parse(localStorage.getItem(RESOURCE_KEY)) ?? { links: [], apps: [] };
  } catch {
    return { links: [], apps: [] };
  }
}

function persistResources() {
  localStorage.setItem(RESOURCE_KEY, JSON.stringify(resources));
}

function emptyState() {
  return emptyTemplate.content.firstElementChild.cloneNode(true);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function renderPdfs() {
  const pdfs = await getAllPdfs();
  pdfList.replaceChildren();

  if (!pdfs.length) {
    pdfList.append(emptyState());
  }

  for (const pdf of pdfs) {
    const item = document.createElement("article");
    item.className = "item";
    item.innerHTML = `
      <div class="item-row">
        <div>
          <strong></strong>
          <span></span>
        </div>
      </div>
      <div class="item-actions">
        <button class="small-button open" type="button">Open</button>
        <button class="small-button delete" type="button">Delete</button>
      </div>
    `;

    item.querySelector("strong").textContent = pdf.name;
    item.querySelector("span").textContent = `${formatBytes(pdf.size)} - ${new Date(pdf.addedAt).toLocaleDateString()}`;
    item.querySelector(".open").addEventListener("click", () => {
      const url = URL.createObjectURL(pdf.file);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });
    item.querySelector(".delete").addEventListener("click", async () => {
      await deletePdf(pdf.id);
      await renderPdfs();
    });

    pdfList.append(item);
  }

  pdfCount.textContent = String(pdfs.length);
}

function renderResources(type, container) {
  const items = resources[type];
  container.replaceChildren();

  if (!items.length) {
    container.append(emptyState());
  }

  items.forEach((resource) => {
    const item = document.createElement("article");
    item.className = "item";
    item.innerHTML = `
      <div class="item-row">
        <div>
          <strong></strong>
          <a target="_blank" rel="noopener"></a>
        </div>
        <button class="small-button delete" type="button">Delete</button>
      </div>
    `;

    item.querySelector("strong").textContent = resource.title;
    const anchor = item.querySelector("a");
    anchor.href = resource.url;
    anchor.textContent = resource.url;
    item.querySelector("button").addEventListener("click", () => {
      resources[type] = resources[type].filter((entry) => entry.id !== resource.id);
      persistResources();
      renderAllResources();
    });

    container.append(item);
  });
}

function renderAllResources() {
  renderResources("links", linkList);
  renderResources("apps", appList);
  resourceCount.textContent = String(resources.links.length + resources.apps.length);
}

function handleResourceForm(event, type) {
  event.preventDefault();
  const form = event.currentTarget;
  const [titleInput, urlInput] = form.querySelectorAll("input");

  resources[type].unshift({
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    url: urlInput.value.trim(),
    addedAt: Date.now(),
  });

  persistResources();
  form.reset();
  renderAllResources();
}

pdfInput.addEventListener("change", async () => {
  const files = [...pdfInput.files];
  for (const file of files) {
    await savePdf({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      addedAt: Date.now(),
      file,
    });
  }
  pdfInput.value = "";
  await renderPdfs();
});

linkForm.addEventListener("submit", (event) => handleResourceForm(event, "links"));
appForm.addEventListener("submit", (event) => handleResourceForm(event, "apps"));

notesBox.value = localStorage.getItem(NOTES_KEY) ?? "";
notesBox.addEventListener("input", () => {
  savedStatus.textContent = "Saving...";
  localStorage.setItem(NOTES_KEY, notesBox.value);
  window.clearTimeout(notesBox.saveTimer);
  notesBox.saveTimer = window.setTimeout(() => {
    savedStatus.textContent = "Saved";
  }, 350);
});

exportButton.addEventListener("click", async () => {
  const backup = {
    exportedAt: new Date().toISOString(),
    resources,
    notes: notesBox.value,
    pdfs: (await getAllPdfs()).map(({ name, size, addedAt }) => ({ name, size, addedAt })),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "study-workspace-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

openDatabase()
  .then((database) => {
    db = database;
    renderPdfs();
    renderAllResources();
  })
  .catch(() => {
    pdfList.innerHTML = '<div class="empty-state"><strong>PDF storage is unavailable</strong><span>Your browser blocked local database access.</span></div>';
    renderAllResources();
  });
