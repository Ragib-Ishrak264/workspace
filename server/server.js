const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 5180;
const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "study-workspace");
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DATA_FILE = path.join(DATA_DIR, "workspaces.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
};

async function ensureStorage() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ workspaces: [] }, null, 2));
  }
}

async function readStore() {
  await ensureStorage();
  const content = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(content);
}

async function writeStore(store) {
  await ensureStorage();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

async function parseJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function createWorkspace(name) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name || "My Study Workspace",
    links: [],
    apps: [],
    notes: "",
    pdfs: [],
    createdAt: now,
    updatedAt: now,
  };
}

function findWorkspace(store, id) {
  return store.workspaces.find((workspace) => workspace.id === id);
}

function publicWorkspace(workspace) {
  return {
    ...workspace,
    pdfs: workspace.pdfs.map((pdf) => ({
      ...pdf,
      url: `/uploads/${workspace.id}/${pdf.fileName}`,
    })),
  };
}

async function handleApi(request, response, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const store = await readStore();

  if (request.method === "GET" && url.pathname === "/api/workspaces") {
    const workspaces = store.workspaces.map(({ id, name, createdAt, updatedAt }) => ({
      id,
      name,
      createdAt,
      updatedAt,
    }));
    return sendJson(response, 200, { workspaces });
  }

  if (request.method === "POST" && url.pathname === "/api/workspaces") {
    const body = await parseJson(request);
    const workspace = createWorkspace(String(body.name || "").trim());
    store.workspaces.unshift(workspace);
    await writeStore(store);
    return sendJson(response, 201, { workspace: publicWorkspace(workspace) });
  }

  if (parts[0] !== "api" || parts[1] !== "workspaces" || !parts[2]) {
    return sendError(response, 404, "API route not found.");
  }

  const workspace = findWorkspace(store, parts[2]);
  if (!workspace) return sendError(response, 404, "Workspace not found.");

  if (request.method === "GET" && parts.length === 3) {
    return sendJson(response, 200, { workspace: publicWorkspace(workspace) });
  }

  if (request.method === "PUT" && parts[3] === "resources") {
    const body = await parseJson(request);
    workspace.links = Array.isArray(body.links) ? body.links : [];
    workspace.apps = Array.isArray(body.apps) ? body.apps : [];
    workspace.updatedAt = new Date().toISOString();
    await writeStore(store);
    return sendJson(response, 200, { workspace: publicWorkspace(workspace) });
  }

  if (request.method === "PUT" && parts[3] === "notes") {
    const body = await parseJson(request);
    workspace.notes = String(body.notes || "");
    workspace.updatedAt = new Date().toISOString();
    await writeStore(store);
    return sendJson(response, 200, { workspace: publicWorkspace(workspace) });
  }

  if (request.method === "POST" && parts[3] === "pdfs") {
    const body = await parseJson(request);
    const data = String(body.data || "");
    const buffer = Buffer.from(data, "base64");

    if (!body.name || !buffer.length) {
      return sendError(response, 400, "PDF name and data are required.");
    }

    const pdfId = crypto.randomUUID();
    const safeName = path.basename(String(body.name)).replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${pdfId}-${safeName}`;
    const workspaceUploadDir = path.join(UPLOAD_DIR, workspace.id);
    await fs.mkdir(workspaceUploadDir, { recursive: true });
    await fs.writeFile(path.join(workspaceUploadDir, fileName), buffer);

    workspace.pdfs.unshift({
      id: pdfId,
      name: String(body.name),
      fileName,
      size: buffer.length,
      addedAt: new Date().toISOString(),
    });
    workspace.updatedAt = new Date().toISOString();
    await writeStore(store);
    return sendJson(response, 201, { workspace: publicWorkspace(workspace) });
  }

  if (request.method === "DELETE" && parts[3] === "pdfs" && parts[4]) {
    const pdf = workspace.pdfs.find((item) => item.id === parts[4]);
    workspace.pdfs = workspace.pdfs.filter((item) => item.id !== parts[4]);
    workspace.updatedAt = new Date().toISOString();
    await writeStore(store);

    if (pdf) {
      await fs.rm(path.join(UPLOAD_DIR, workspace.id, pdf.fileName), { force: true });
    }

    return sendJson(response, 200, { workspace: publicWorkspace(workspace) });
  }

  return sendError(response, 404, "API route not found.");
}

async function serveFile(response, requestedPath, baseDir) {
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const resolvedPath = path.resolve(baseDir, relativePath);
  const resolvedBase = path.resolve(baseDir);

  if (!resolvedPath.startsWith(resolvedBase)) {
    return sendError(response, 403, "Forbidden.");
  }

  const filePath = resolvedPath;
  const extension = path.extname(filePath);

  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    response.end(content);
  } catch {
    sendError(response, 404, "File not found.");
  }
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      return await handleApi(request, response, url);
    }

    if (url.pathname.startsWith("/uploads/")) {
      const uploadPath = url.pathname.replace("/uploads/", "");
      return await serveFile(response, uploadPath, UPLOAD_DIR);
    }

    return await serveFile(response, url.pathname, PUBLIC_DIR);
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Something went wrong.");
  }
}

ensureStorage().then(() => {
  http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Study Workspace running at http://127.0.0.1:${PORT}`);
  });
});
