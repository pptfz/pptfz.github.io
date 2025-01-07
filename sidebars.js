/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */


/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // mac专区
  mac专区: [{ type:'autogenerated', dirName: 'mac专区'}],

  // 云原生
  云原生: [{ type: 'autogenerated', dirName: '云原生/k8s'}],
  容器: [{ type: 'autogenerated', dirName: '云原生/容器'}],
  云原生工具: [{ type: 'autogenerated', dirName: '云原生/云原生工具'}],
  
  // 编程
  go: [{ type: 'autogenerated', dirName: '编程/go'}],
  python: [{ type: 'autogenerated', dirName: '编程/python'}],
  shell: [{type: 'autogenerated', dirName: 'Linux/shell'}],
  script: [{type: 'autogenerated', dirName: '编程/script'}],

  // Linux
  Linux服务: [{ type: 'autogenerated', dirName: 'Linux/Linux服务'}],
  Linux命令: [{ type: 'autogenerated', dirName: 'Linux/Linux命令'}],

  // 监控
  prometheus: [{ type: 'autogenerated', dirName: 'Linux/监控/prometheus'}],
  zabbix: [{ type: 'autogenerated', dirName: 'Linux/监控/zabbix'}],
  grafana: [{ type: 'autogenerated', dirName: 'Linux/监控/grafana'}],

  // 数据库
  mongodb: [{ type: 'autogenerated', dirName: '数据库/mongodb'}],
  mysql: [{ type: 'autogenerated', dirName: '数据库/mysql'}],
  redis: [{ type: 'autogenerated', dirName: '数据库/redis'}],

};

module.exports = sidebars;