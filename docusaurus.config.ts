import type * as Preset from '@docusaurus/preset-classic';
import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

// Runs in Node.js — no browser APIs or JSX here.

const DOCS_REPO = 'https://github.com/pir2pir/pir2pir-docs';
const DOCS_BRANCH = 'production';

// Algolia stays optional: the site must build without credentials so forks, previews and local runs
// work unchanged. Search simply disappears when the variables are absent.
const algoliaAppId = process.env.DOCSEARCH_APP_ID;
const algoliaApiKey = process.env.DOCSEARCH_API_KEY;
const algoliaIndexName = process.env.DOCSEARCH_INDEX_NAME;
const hasAlgolia = Boolean(algoliaAppId && algoliaApiKey && algoliaIndexName);

/**
 * Content lives in a separate repository, so "edit this page" has to point there rather than at this
 * engine repo. Translations sit under a different path from the Russian source.
 */
function editUrl({locale, docPath}: {locale: string; docPath: string}): string {
  return locale === 'ru'
    ? `${DOCS_REPO}/edit/${DOCS_BRANCH}/docs/${docPath}`
    : `${DOCS_REPO}/edit/${DOCS_BRANCH}/i18n/${locale}/docusaurus-plugin-content-docs/current/${docPath}`;
}

const config: Config = {
  title: 'Pir2Pir',
  tagline: 'Документация Pir2Pir',
  // .ico is the legacy fallback; the SVG and the rest of the icon set are declared in headTags
  // below, and browsers that understand image/svg+xml prefer that one.
  favicon: 'favicon.ico',

  url: 'https://docs.pir2pir.ru',
  baseUrl: '/',
  trailingSlash: true,

  organizationName: 'pir2pir',
  projectName: 'pir2pir-docs-site',

  // Paths here are root-absolute and therefore tied to baseUrl staying '/'. Docusaurus does not
  // rewrite headTags hrefs the way it does for the favicon field.
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/svg+xml', href: '/img/favicon.svg'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'}},
    {tagName: 'link', attributes: {rel: 'manifest', href: '/site.webmanifest'}},
    // Tints the mobile browser chrome to match the navbar in each theme.
    {tagName: 'meta', attributes: {name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff'}},
    {tagName: 'meta', attributes: {name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#242526'}},
  ],

  // Legal pages must not silently rot into 404s.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  future: {
    v4: true,
    // rspack-based build; worth having with three locales to compile.
    faster: true,
  },

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en', 'uz'],
    localeConfigs: {
      ru: {label: 'Русский', htmlLang: 'ru-RU'},
      en: {label: 'English', htmlLang: 'en-US'},
      uz: {label: "O'zbekcha", htmlLang: 'uz-UZ'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // Docs-only site: serve them at the root rather than under /docs, so the legal pages get
          // short, quotable URLs (docs.pir2pir.ru/legal/consent/).
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl,
          // Deliberately no showLastUpdateTime: pages are copied in from the content repo during the
          // build, so git here would report when CI moved the file, not when the text changed. Legal
          // documents carry their own effective date in the body, which is the date that counts.
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'monthly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Pir2Pir',
      // Mark only — the wordmark beside it is the `title` above, set in Space Grotesk by
      // custom.css. One gradient serves both themes: rose and amber each clear 3:1 against the
      // light and the dark navbar, so there is no srcDark variant to keep in sync.
      // alt is empty because "Pir2Pir" is already adjacent as real text; naming the logo too would
      // make screen readers announce the brand twice.
      logo: {
        alt: '',
        src: 'img/mark-gradient.svg',
        width: 59,
        height: 32,
      },
      items: [
        {
          href: 'https://t.me/pir2pirbot',
          position: 'right',
          label: 'Telegram',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        ...(hasAlgolia ? [{type: 'search' as const, position: 'right' as const}] : []),
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Юридические документы',
          items: [
            {label: 'Согласие на обработку ПД', to: '/legal/consent/'},
            {label: 'Политика конфиденциальности', to: '/legal/privacy_policy/'},
            {label: 'Пользовательское соглашение', to: '/legal/terms/'},
          ],
        },
        {
          title: 'Сервис',
          items: [
            {label: 'Telegram-бот', href: 'https://t.me/pir2pirbot'},
            {label: 'legal@pir2pir.ru', href: 'mailto:legal@pir2pir.ru'},
          ],
        },
        {
          title: 'Репозитории',
          items: [
            {label: 'Контент документации', href: DOCS_REPO},
            {label: 'Сайт документации', href: 'https://github.com/pir2pir/pir2pir-docs-site'},
          ],
        },
      ],
      // The operator must be identifiable from any page carrying legal text.
      copyright: `ИП Искужин Айгиз · ИНН 024803896842 · ОГРНИП 326028000044859 · <a href="https://pd.rkn.gov.ru/operators-registry/operators-list/?id=2-26-056967" target="_blank" rel="noopener noreferrer">Оператор ПД в реестре РКН № 2-26-056967</a><br/>© ${new Date().getFullYear()} Pir2Pir`,
    },
    algolia: hasAlgolia
      ? {
          appId: algoliaAppId!,
          apiKey: algoliaApiKey!,
          indexName: algoliaIndexName!,
          contextualSearch: true,
          searchPagePath: 'search',
        }
      : undefined,
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
