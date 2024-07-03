// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

//const lightCodeTheme = require('prism-react-renderer/themes/github');
//const darkCodeTheme = require('prism-react-renderer/themes/dracula');

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '我得发！',
  tagline: '厚礼蟹！',
  favicon: 'img/favicon.ico',

  
  // Set the production url of your site here
  url: 'https://pptfz.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pptfz', // Usually your GitHub org/user name.
  projectName: 'pptfz.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        // Debug defaults to true in dev, false in prod
        debug: undefined,
        // Will be passed to @docusaurus/theme-classic.
        theme: {
          customCss: [require.resolve('./src/css/custom.css')],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        // Will be passed to @docusaurus/plugin-content-docs (false to disable)
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        // Will be passed to @docusaurus/plugin-content-blog (false to disable)
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        // Will be passed to @docusaurus/plugin-content-pages (false to disable)
        pages: {},
        // Will be passed to @docusaurus/plugin-content-sitemap (false to disable)
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        // Will be passed to @docusaurus/plugin-google-gtag (only enabled when explicitly specified)
        //gtag: {},
        // Will be passed to @docusaurus/plugin-google-tag-manager (only enabled when explicitly specified)
        //googleTagManager: {},
        // DEPRECATED: Will be passed to @docusaurus/plugin-google-analytics (only enabled when explicitly specified)
        //googleAnalytics: {},
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '我的站点',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '笔记',
          },
          //{to: '/blog', label: 'Blog', position: 'left'},
          //{to: '/linux', label: 'Linux', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: '笔记',
                to: '/docs',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 泡泡吐肥皂o`,
      },
      prism: {
        additionalLanguages: ['Bash','nginx','Git'],
        theme: prismThemes.dracula, // 亮色模式下的样式
        darkTheme: prismThemes.dracula, // 暗色模式下的样式
      },
    announcementBar: {
      id: "support_zh",
      content: `
        <div class="scroll-container">
          <span class="scrolling-text">
            一名运维，两台电脑，三餐不定，只为设备工作四平八稳，拼得五脏俱损，六神无主，仍然七点起床，八点出发，晚上九点不返，十分辛苦！😂
            十年运维，九转功成，八面张罗，忙得七窍流血，换得六神不宁，五体欠安，仍然四处奔波，三更不眠，只为两个铜板，一生拼搏！
          </span>
        </div>
      `,
      backgroundColor: "rgba(255, 105, 180, 0.3)",
      textColor: "@091E42",
      isCloseable: false,
    },
    algolia: {
        apiKey: "c6a8a8dadfe45989253d3d675a6107fe",
        appId: "1RH59US6FR",
        indexName: "pptfzio",
        contextualSearch: true,
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 6,
    },
    scripts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@docsearch/js@3',
      async: true,
      defer: true
    },
  ]
    }),
};

module.exports = config;
