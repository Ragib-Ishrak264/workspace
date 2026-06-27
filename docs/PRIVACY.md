# Privacy and Storage Notes

Study Workspace uses a local backend server and does not send your saved study data to an external service by itself.

## Where Data Is Stored

The app stores data on your computer:

- PDFs: `server/data/uploads`
- Workspace records: `server/data/workspaces.json`
- Links: `server/data/workspaces.json`
- App shortcuts: `server/data/workspaces.json`
- Study notes: `server/data/workspaces.json`

## What Is Not Synced

Saved PDFs, links, app shortcuts, and notes do not automatically sync to:

- GitHub
- Other computers
- Other browsers
- Cloud storage

If you move computers, you need to copy the project folder, including `server/data`, to keep your saved workspace data.

## Backups

The `Export backup` button downloads a JSON backup of the current workspace record. PDF files remain stored in `server/data/uploads`.

## Sensitive Materials

Avoid storing private or sensitive PDFs if other people can access your browser profile or computer account.

## Future Improvements

Useful privacy and portability improvements could include:

- Import backup support
- Full PDF export support
- Optional cloud sync
- A clear-all-data button
- Per-subject folders
