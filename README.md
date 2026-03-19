# 3D-Pixelated-Filters

## Deploying to GitHub Pages

This project is configured to deploy automatically with GitHub Actions.

### One-time repository setup

1. Open repository Settings -> Pages.
2. Under Build and deployment, set Source to GitHub Actions.

### How deployment works

- Push to main triggers the workflow at .github/workflows/deploy-pages.yml.
- Next.js builds a static export to out/.
- The workflow uploads out/ and deploys it to GitHub Pages.

### Local production check

Run:

```bash
npm run build
```

For a repo-scoped Pages URL locally (like /3D-Pixelated-Filters), simulate GitHub Actions env vars before building.
