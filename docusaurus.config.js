// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

//const lightCodeTheme = require('prism-react-renderer/themes/github');
//const darkCodeTheme = require('prism-react-renderer/themes/dracula');

import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';


// 能够读取.env文件中定义的algolia相关变量
require('dotenv').config();

// docusaurus.config.js
/** @type {import('@docusaurus/types').Config} */
const config = {
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  title: '程序员最讨厌的四件事',
  // tagline: '1. 写注释 2. 写文档<br />3. 别人不写注释 4. 别人不写文档',
  tagline: `
    <div class="line">
      <span class="alignLeft">1.自己得写注释</span>
      <span class="alignRight">2.自己得写文档</span>
    </div>
    <div class="line">
      <span class="alignLeft">3.别人不写注释</span>
      <span class="alignRight">4.别人不写文档</span>
    </div>
  `,
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
  // onBrokenMarkdownLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
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
          remarkPlugins: [remarkMath], 
          rehypePlugins: [rehypeKatex],
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
        // style: 'dark', 导航栏样式
        title: '喜欢🎤💃rap🏀',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '你不要过来啊',
          },
          {
            to: '/blog', 
            label: '博客', 
            position: 'left'
          },
          {
            label: 'mac专区',
            items: [
              { label: 'mac专区', to: '/docs/mac专区' },
            ]
          },
          {
            label: 'devops',
            items: [
              { label: 'devops', to: '/docs/devops' },
              { label: 'ansible', to: '/docs/ansible' },
              { label: 'gitea', to: '/docs/gitea' },
              { label: 'gitlab', to: '/docs/gitlab' },
              { label: 'jenkins', to: '/docs/jenkins' },
              { label: 'spug', to: '/docs/spug' },
              { label: 'walle', to: '/docs/walle' },
            ]
          },
          {
            label: 'Linux',
            items: [
              { label: 'Linux服务', to: '/docs/Linux服务' },
              { label: 'Linux命令', to: '/docs/Linux命令' },
              { label: 'Linux系统', to: '/docs/Linux系统' },
            ]
          },
          {
            label: '云原生',
            items: [
              { label: 'k8s', to: '/docs/k8s' }, // 这里的/docs/k8s是文件id，不是目录
              { label: '容器', to: '/docs/容器'},
              { label: '云原生工具', to: '/docs/云原生工具'},
            ]
          }, 
          {
            label: '编程',
            items: [
              { label: 'go', to: '/docs/go' }, 
              { label: 'python', to: '/docs/python' },
              { label: 'shell', to: '/docs/shell' },
              { label: '功能脚本', to: '/docs/功能脚本' },
            ]
          },
          {
            label: '监控',
            items: [
              { label: 'prometheus', to: '/docs/prometheus' },
              { label: 'zabbix', to: '/docs/zabbix' },
              { label: 'grafana', to: '/docs/grafana' },
              { label: 'nightingale', to: '/docs/nightingale' },
            ]
          }, 
          {
            label: '数据库',
            items: [
              { label: 'mongodb', to: '/docs/mongodb' },
              { label: 'mysql', to: '/docs/mysql' },
              { label: 'redis', to: '/docs/redis' },
              { label: 'postgres', to: '/docs/postgres' },
            ]
          }, 
          {
            label: '云厂商知识点',
            items: [
              { label: '阿里云', to: '/docs/阿里云' },
              { label: '腾讯云', to: '/docs/腾讯云' },
              { label: 'aws', to: '/docs/aws' },
            ]
          },
          
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'k8s',
          //   position: 'left',
          //   label: 'k8s',
          // },
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
                label: '你不要过来啊',
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
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 泡泡吐肥皂o`,
        // copyright: `Copyright © ${new Date().getFullYear()} 泡泡吐肥皂o <div id="site-uptime"></div>`,
      },
      prism: {
        // https://prismjs.com/#supported-languages
        additionalLanguages: ['bash','nginx','git','ini','json','docker','yaml','toml'],
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
        apiKey: process.env.ALGOLIA_API_KEY,
        appId: process.env.ALGOLIA_APP_ID,
        indexName: process.env.ALGOLIA_INDEX_NAME,
        contextualSearch: true,
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 6,
    },
    }),
};

module.exports = config;