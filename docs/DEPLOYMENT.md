# Deployment Guide

This project is a static website. It can be hosted by GitHub Pages, Netlify, Vercel, or any static file host.

## GitHub Pages

Because the app files live inside the `study-workspace` folder, GitHub Pages has two common setup options.

## Option 1: Move App Files to the Repository Root

GitHub Pages can publish from the root of a branch. If you want the site at the simplest URL, move these files to the repository root:

- `study-workspace/index.html`
- `study-workspace/styles.css`
- `study-workspace/app.js`

Then configure GitHub Pages to deploy from the root of the `master` branch.

## Option 2: Keep the Current Folder and Use GitHub Actions

Keep the current project structure and add a GitHub Actions workflow that deploys the `study-workspace` folder as the Pages artifact.

High-level steps:

1. Open the GitHub repository.
2. Go to `Settings`.
3. Go to `Pages`.
4. Set the source to GitHub Actions.
5. Add a workflow that uploads `study-workspace` as the static site.

## Local Preview Before Deploying

Run this from the repository root:

```powershell
python -m http.server 5178 --bind 127.0.0.1 --directory study-workspace
```

Then open:

```text
http://127.0.0.1:5178
```

## Storage Warning for Hosted Sites

The app stores saved PDFs and notes in the browser. If you deploy the app to GitHub Pages, each browser still keeps its own local data. GitHub Pages hosts the app code, not your saved PDFs.
