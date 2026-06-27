# Study Workspace

A simple browser-based study hub for keeping PDFs, useful links, app shortcuts, and notes in one place.

The app is intentionally lightweight: it runs as a static website with plain HTML, CSS, and JavaScript. There is no account system, backend server, build step, or external dependency.

## Features

- Save PDF files in the browser and reopen them later.
- Save study links and app shortcuts.
- Keep quick study notes with autosave.
- Export a JSON backup of links, apps, notes, and PDF metadata.
- Works locally from a small static web server.
- Responsive layout for desktop and mobile screens.

## Project Structure

```text
.
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── docs
│   ├── DEPLOYMENT.md
│   ├── PRIVACY.md
│   └── USAGE.md
└── study-workspace
    ├── app.js
    ├── index.html
    └── styles.css
```

## Run Locally

From the repository root:

```powershell
python -m http.server 5178 --bind 127.0.0.1 --directory study-workspace
```

Then open:

```text
http://127.0.0.1:5178
```

You can also open `study-workspace/index.html` directly, but using a local server is recommended because browser storage features are more reliable from `localhost`.

## Important Storage Note

The app stores data in your current browser on your current device:

- PDFs are stored in IndexedDB.
- Links, app shortcuts, and notes are stored in localStorage.

This means your saved materials do not automatically sync to GitHub or another device. See [docs/PRIVACY.md](docs/PRIVACY.md) for details.

## Documentation

- [Usage Guide](docs/USAGE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Privacy and Storage Notes](docs/PRIVACY.md)
- [Contributing](CONTRIBUTING.md)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
