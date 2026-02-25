# AGENTS.md

## Cursor Cloud specific instructions

This is a static HTML/CSS portfolio website with no build tools, package manager, or dependencies.

### Running the dev server

Serve the site locally with Python's built-in HTTP server:

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/` in Chrome.

### Lint / Test / Build

- **No linter, test framework, or build step** is configured in this project.
- To validate HTML/CSS correctness, open the site in Chrome and check the DevTools console for errors.
- There is no `package.json`, `Makefile`, or CI configuration.

### Project structure

- `index.html` — single-page portfolio (header, about, skills, projects, footer)
- `styles.css` — responsive stylesheet with GitHub-inspired dark theme
- External CDN resources: Google Fonts (Roboto), Font Awesome 5.15.3, Twitter widget JS
