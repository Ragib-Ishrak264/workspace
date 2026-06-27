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
const workspaceName = document.querySelector("#workspaceName");
const workspaceSelect = document.querySelector("#workspaceSelect");
const workspaceForm = document.querySelector("#workspaceForm");
const syncStatus = document.querySelector("#syncStatus");

let currentWorkspace = null;
let saveNotesTimer;

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function setStatus(message) {
  syncStatus.textContent = message;
}

function emptyState() {
  return emptyTemplate.content.firstElementChild.cloneNode(true);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderPdfs() {
  pdfList.replaceChildren();
  const pdfs = currentWorkspace?.pdfs || [];

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
        <a class="small-button open" target="_blank" rel="noopener">Open</a>
        <button class="small-button delete" type="button">Delete</button>
      </div>
    `;

    item.querySelector("strong").textContent = pdf.name;
    item.querySelector("span").textContent = `${formatBytes(pdf.size)} - ${new Date(pdf.addedAt).toLocaleDateString()}`;
    item.querySelector(".open").href = pdf.url;
    item.querySelector(".delete").addEventListener("click", async () => {
      setStatus("Deleting PDF...");
      const data = await api(`/api/workspaces/${currentWorkspace.id}/pdfs/${pdf.id}`, {
        method: "DELETE",
      });
      currentWorkspace = data.workspace;
      renderWorkspace();
      setStatus("Saved to backend");
    });

    pdfList.append(item);
  }

  pdfCount.textContent = String(pdfs.length);
}

function renderResources(type, container) {
  const items = currentWorkspace?.[type] || [];
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
    item.querySelector("button").addEventListener("click", async () => {
      currentWorkspace[type] = currentWorkspace[type].filter((entry) => entry.id !== resource.id);
      await saveResources();
    });

    container.append(item);
  });
}

function renderAllResources() {
  renderResources("links", linkList);
  renderResources("apps", appList);
  resourceCount.textContent = String((currentWorkspace?.links.length || 0) + (currentWorkspace?.apps.length || 0));
}

function renderWorkspace() {
  workspaceName.textContent = currentWorkspace?.name || "No workspace selected";
  notesBox.value = currentWorkspace?.notes || "";
  renderPdfs();
  renderAllResources();
}

async function saveResources() {
  setStatus("Saving...");
  const data = await api(`/api/workspaces/${currentWorkspace.id}/resources`, {
    method: "PUT",
    body: JSON.stringify({
      links: currentWorkspace.links,
      apps: currentWorkspace.apps,
    }),
  });
  currentWorkspace = data.workspace;
  renderAllResources();
  setStatus("Saved to backend");
}

async function handleResourceForm(event, type) {
  event.preventDefault();
  const form = event.currentTarget;
  const [titleInput, urlInput] = form.querySelectorAll("input");

  currentWorkspace[type].unshift({
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    url: urlInput.value.trim(),
    addedAt: new Date().toISOString(),
  });

  form.reset();
  await saveResources();
}

async function refreshWorkspaceList(selectedId) {
  const data = await api("/api/workspaces");
  workspaceSelect.replaceChildren();

  data.workspaces.forEach((workspace) => {
    const option = document.createElement("option");
    option.value = workspace.id;
    option.textContent = workspace.name;
    workspaceSelect.append(option);
  });

  if (selectedId) workspaceSelect.value = selectedId;
  return data.workspaces;
}

async function loadWorkspace(id) {
  const data = await api(`/api/workspaces/${id}`);
  currentWorkspace = data.workspace;
  renderWorkspace();
  setStatus("Saved to backend");
}

async function createWorkspace(name) {
  const data = await api("/api/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  currentWorkspace = data.workspace;
  await refreshWorkspaceList(currentWorkspace.id);
  renderWorkspace();
  setStatus("Saved to backend");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

pdfInput.addEventListener("change", async () => {
  const files = [...pdfInput.files];
  for (const file of files) {
    setStatus(`Uploading ${file.name}...`);
    const data = await api(`/api/workspaces/${currentWorkspace.id}/pdfs`, {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        data: await fileToBase64(file),
      }),
    });
    currentWorkspace = data.workspace;
  }
  pdfInput.value = "";
  renderWorkspace();
  setStatus("Saved to backend");
});

linkForm.addEventListener("submit", (event) => handleResourceForm(event, "links"));
appForm.addEventListener("submit", (event) => handleResourceForm(event, "apps"));

notesBox.addEventListener("input", () => {
  savedStatus.textContent = "Saving...";
  setStatus("Saving...");
  window.clearTimeout(saveNotesTimer);
  saveNotesTimer = window.setTimeout(async () => {
    const data = await api(`/api/workspaces/${currentWorkspace.id}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes: notesBox.value }),
    });
    currentWorkspace = data.workspace;
    savedStatus.textContent = "Saved";
    setStatus("Saved to backend");
  }, 350);
});

workspaceSelect.addEventListener("change", () => loadWorkspace(workspaceSelect.value));

workspaceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = workspaceForm.querySelector("input");
  await createWorkspace(input.value.trim());
  workspaceForm.reset();
});

exportButton.addEventListener("click", () => {
  const backup = {
    exportedAt: new Date().toISOString(),
    workspace: currentWorkspace,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "study-workspace-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

async function start() {
  try {
    setStatus("Connecting to backend...");
    const workspaces = await refreshWorkspaceList();

    if (workspaces.length) {
      await loadWorkspace(workspaces[0].id);
    } else {
      await createWorkspace("My Study Workspace");
    }
  } catch (error) {
    setStatus("Backend unavailable");
    pdfList.innerHTML = '<div class="empty-state"><strong>Backend unavailable</strong><span>Start the Node server with npm start.</span></div>';
  }
}

start();
