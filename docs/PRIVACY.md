# Privacy and Storage Notes

Study Workspace has no backend server and does not send your saved study data anywhere by itself.

## Where Data Is Stored

The app stores data in your browser:

- PDFs: IndexedDB
- Links: localStorage
- App shortcuts: localStorage
- Study notes: localStorage

## What Is Not Synced

Saved PDFs, links, app shortcuts, and notes do not automatically sync to:

- GitHub
- Other computers
- Other browsers
- Cloud storage

If you clear browser data, use a different browser, or open the app from a different domain, your saved items may not appear.

## Backups

The `Export backup` button downloads a JSON backup of text-based data and PDF metadata. It does not export the actual PDF file contents.

## Sensitive Materials

Avoid storing private or sensitive PDFs if other people can access your browser profile or computer account.

## Future Improvements

Useful privacy and portability improvements could include:

- Import backup support
- Full PDF export support
- Optional cloud sync
- A clear-all-data button
- Per-subject folders
