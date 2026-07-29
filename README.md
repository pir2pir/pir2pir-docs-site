# pir2pir-docs-site

Docusaurus engine for **https://docs.pir2pir.ru**. This repo holds the build and deploy; the pages
live in [pir2pir-docs](https://github.com/pir2pir/pir2pir-docs) and are cloned in at build time.

## Why two repos

Content changes are frequent, reviewable prose; engine changes are rare and technical. Splitting them
means a typo fix in a legal document never touches build configuration, and writers need no Node
toolchain.

## Locales

`ru` (default, and the legally binding version), `en`, `uz`. A page without a translation falls back
to Russian. Translations live under `i18n/<locale>/docusaurus-plugin-content-docs/current/` **in the
content repo**.

Docs are served at the root (`routeBasePath: '/'`), so legal pages get short URLs:
`docs.pir2pir.ru/legal/consent/`, `/en/legal/consent/`, `/uz/legal/consent/`.

## Local development

```bash
npm ci
git clone https://github.com/pir2pir/pir2pir-docs.git external-docs
rm -rf docs i18n && mv external-docs/docs ./docs && mv external-docs/i18n ./i18n
npm start                 # Russian only, fast refresh
npm start -- --locale uz  # one other locale at a time
npm run build             # all three locales, matches CI
docker build -t docs . && docker run --rm -p 8099:8080 docs
```

`docs/index.md` in this repo is a placeholder so the engine runs standalone; CI always replaces it.

## Pipeline

CI is the only place an image is built; Deploy only ever resolves a sha CI already published.

| Trigger | What happens |
| --- | --- |
| push to engine `develop` | CI builds against docs `develop`, pushes `sha-<commit>` + `latest` |
| push to engine `production` | CI builds against docs `production`, then Deploy ships that sha |
| push to **content** `develop` | content repo dispatches this CI on `develop` — build only |
| push to **content** `production` | content repo dispatches this CI on `production` — build, then deploy |

Content follows the engine branch: a build on `develop` clones docs `develop`, a build on
`production` clones docs `production`. Pull requests build against `production` content, since that
is what is published.

**Promotion is free.** A fast-forward merge from `develop` to `production` keeps the same commit sha,
so the deploy resolves `sha-<commit>` to the image CI already built — the artifact reaching the
server is byte-identical to the one tested on develop.

A content-only change has no new engine commit, so the dispatch re-runs CI on the same engine sha and
republishes that tag with the new content. Deploy then picks it up unchanged.

## Runtime

Multi-stage image: Node builds the static site, `nginx-unprivileged` serves it as uid 101 on port
8080. On the server, `docker-compose` publishes it to `127.0.0.1:8081` and the host nginx terminates
TLS for `docs.pir2pir.ru` — the same shape as the API stack.

Caching is split deliberately: fingerprinted `/assets/` are `immutable` for a year, while HTML is
`must-revalidate` so an updated legal document is never served stale from a cache.

## Required repository configuration

| Kind | Name | Purpose |
| --- | --- | --- |
| Environment `production` secret | `SSH_KEY` | deploy key for the server |
| Variable | `SSH_HOST`, `SSH_PORT`, `SSH_USER` | deploy target |
| Variable | `ENV_PROD` | written to `/opt/pir2pir-docs-site/.env` |
| Secret (optional) | `DOCS_REPO_TOKEN` | only while the content repo is private |
| Secret (optional) | `DOCSEARCH_APP_ID`, `DOCSEARCH_API_KEY`, `DOCSEARCH_INDEX_NAME` | enables Algolia search |

Search is optional by design: without those three variables the site builds and serves normally,
minus the search box.
