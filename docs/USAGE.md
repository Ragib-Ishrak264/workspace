# Usage Guide

Study Workspace is a personal dashboard for study materials. It now saves data through a local backend.

## Start the App

From the repository root:

```powershell
npm start
```

Then open:

```text
http://127.0.0.1:5180
```

## Create a Workspace

1. Open the app.
2. Use the `Choose or create` section.
3. Enter a workspace name.
4. Select `Create workspace`.

Each workspace has its own PDFs, links, apps, and notes.

## Add PDFs

1. Open the app.
2. Go to the `PDFs` section.
3. Select `Add PDFs`.
4. Choose one or more PDF files from your computer.

The PDFs are stored by the backend in `server/data/uploads`. Use the `Open` button on a saved PDF card to view it in a new browser tab.

## Save Links

Use the `Links` section for articles, videos, course pages, references, or any regular web bookmark.

Each saved link needs:

- A title
- A full URL, such as `https://example.com`

## Save Apps

Use the `Apps` section for tools you open often while studying, such as cloud storage, online classrooms, note apps, coding tools, or flashcard apps.

## Take Notes

Use the `Study notes` section as a scratchpad. Notes are saved automatically as you type.

## Export Backup

Select `Export backup` to download a JSON file containing:

- Saved links
- Saved app shortcuts
- Study notes
- PDF names, sizes, and added dates

The backup includes the workspace record and PDF URLs/metadata. The backend keeps the PDF files in `server/data/uploads`.

## Reset Saved Data

There is no reset button in the app yet. To clear saved backend data, remove the relevant workspace data from `server/data/workspaces.json` and the matching PDF files from `server/data/uploads`.
