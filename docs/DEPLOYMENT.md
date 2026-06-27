# Deployment Guide

This project now includes a Node.js backend. It cannot be fully hosted on GitHub Pages because GitHub Pages only serves static files.

## Local Deployment

Run this from the repository root:

```powershell
npm start
```

Then open:

```text
http://127.0.0.1:5180
```

## Hosting Options

You need a host that supports a persistent Node.js server and file storage.

Possible options:

- Render
- Railway
- Fly.io
- A VPS
- Your own computer on a local network

## Storage Warning

The backend stores saved workspace data in `server/data`. If a hosting platform deletes local files between deploys, you need a real database and persistent file storage.
