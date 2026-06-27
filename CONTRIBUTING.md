# Contributing

Thanks for improving Study Workspace.

## Development

Run the app locally from the repository root:

```powershell
python -m http.server 5178 --bind 127.0.0.1 --directory study-workspace
```

Open:

```text
http://127.0.0.1:5178
```

## Code Style

- Keep the app dependency-free unless a dependency clearly adds value.
- Prefer readable HTML, CSS, and JavaScript over clever abstractions.
- Keep browser storage behavior understandable and documented.
- Test changes manually in a browser before committing.

## Suggested Manual Checks

- The page loads without console errors.
- PDFs can be added and opened.
- Links and app shortcuts can be saved and deleted.
- Notes autosave.
- The layout works on desktop and mobile widths.

## Commit Messages

Use short, descriptive commit messages, such as:

```text
Add import backup support
Improve mobile layout
Fix PDF delete behavior
```
