# Study Workspace

A simple browser-based study hub for keeping PDFs, useful links, app shortcuts, and notes in one place.

The app is intentionally lightweight: it uses plain HTML, CSS, JavaScript, and a small Node.js backend with no external dependencies.

## Features

- Save PDF files in the browser and reopen them later.
- Create saved study workspaces.
- Save study links and app shortcuts.
- Keep quick study notes with autosave.
- Export a JSON backup of links, apps, notes, and PDF metadata.
- Save data to the local backend so it can be restored after restarting the app.
- Responsive layout for desktop and mobile screens.

## Project Structure

```text
.
├── README.md
├── package.json
├── LICENSE
├── CONTRIBUTING.md
├── docs
│   ├── DEPLOYMENT.md
│   ├── PRIVACY.md
│   └── USAGE.md
├── server
│   ├── server.js
│   └── data
│       ├── workspaces.json
│       └── uploads
└── study-workspace
    ├── app.js
    ├── index.html
    └── styles.css
```

## Run Locally

From the repository root:

```powershell
npm start
```

Then open:

```text
http://127.0.0.1:5180
```

Use the Node server instead of opening `study-workspace/index.html` directly. The frontend now talks to backend API routes such as `/api/workspaces`.

## Important Storage Note

The app stores workspace data on your computer through the backend:

- PDFs are stored in `server/data/uploads`.
- Workspace records, links, app shortcuts, and notes are stored in `server/data/workspaces.json`.

This means your saved materials survive browser restarts and server restarts, but they still do not automatically sync to GitHub or another device. See [docs/PRIVACY.md](docs/PRIVACY.md) for details.

## Documentation

- [Usage Guide](docs/USAGE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Privacy and Storage Notes](docs/PRIVACY.md)
- [Contributing](CONTRIBUTING.md)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
