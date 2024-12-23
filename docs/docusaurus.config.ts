import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const typedocWatch = false

const config: Config = {
  title: 'React Native document picker & viewer',
  tagline: 'Modules for picking and previewing documents in React Native applications',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,

  url: 'https://react-native-documents.github.io',
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'react-native-documents', // Usually your GitHub org/user name.
  projectName: 'react-native-documents.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        gtag: {
          trackingID: 'G-V1JZZG12TG',
          anonymizeIP: true,
        },
        docs: {
          sidebarPath: './sidebars.ts',

          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // TODO add this
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    // [
    //   'docusaurus-preset-shiki-twoslash',
    //   {
    //     themes: ['min-light', 'nord'],
    //   },
    // ],
    ...(process.env.ENABLE_DOC_GEN === 'true'
      ? [
          [
            'docusaurus-plugin-typedoc',
            {
              // https://typedoc.org/options/input
              id: 'docPickerAPI',
              entryPoints: ['../packages/document-picker/src/index.ts'],
              tsconfig: '../tsconfig.json',
              watch: typedocWatch,
              outputFileStrategy: 'modules',
              out: 'docs/doc-picker-api',
              cleanOutputDir: true,
              disableSources: true,
              expandObjects: true,
              expandParameters: true, // this is nice and doesn't need much space
              readme: 'none',
              name: 'document-picker API',
              parametersFormat: 'table',
              typeDeclarationFormat: 'table',
              classPropertiesFormat: 'table',
            },
          ],
          [
            'docusaurus-plugin-typedoc',
            {
              id: 'docViewerAPI',
              // https://typedoc.org/options/input
              entryPoints: ['../packages/document-viewer/src/index.ts'],
              tsconfig: '../tsconfig.json',
              watch: typedocWatch,
              outputFileStrategy: 'modules',
              out: 'docs/doc-viewer-api',
              cleanOutputDir: true,
              disableSources: true,
              expandObjects: true,
              expandParameters: true, // this is nice and doesn't need much space
              readme: 'none',
              name: 'document-viewer API',
              parametersFormat: 'table',
              typeDeclarationFormat: 'table',
              classPropertiesFormat: 'table',
            },
          ],
        ]
      : []),
    [
      'docusaurus-lunr-search',
      {
        disableVersioning: true,
        excludeRoutes: [
          '/docs/license',
          '/docs/sponsor-only/license',
          'docs/public/document-picker',
        ],
      },
    ],
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 80,
        disableInDev: false,
      },
    ],
  ],

  themeConfig: {
    // announcementBar: {
    //   id: 'announcementBar',
    //   content:
    //     '<a target="_blank" href="https://github.com/reactwg/react-native-new-architecture/discussions/154">Bridgeless mode</a> is now available in the premium module!',
    //   isCloseable: true,
    // },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'RN Document picker & viewer',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        { to: 'docs/doc-picker-api', label: 'Picker API', position: 'left' },
        { to: 'docs/doc-viewer-api', label: 'Viewer API', position: 'left' },
        {
          to: '/example',
          label: 'Example app',
          position: 'left',
        },
        {
          href: '/github-repo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Intro',
        //       to: '/docs/intro',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: '/blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://github.com/vonovak" target=”_blank”>Vojtech Novak</a>. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

console.log({ config: JSON.stringify(config.plugins) })

export default config
