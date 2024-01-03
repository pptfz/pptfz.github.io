# docusaurus配置algolia搜索

[这个文章写的很不错](https://blog.7wate.com/?p=75)

[algolia官网](https://www.algolia.com/)





## 1.前期准备

### 1.1 注册algolia账号

自行登陆 [algolia官网](https://www.algolia.com/) 注册账号



### 1.2 创建索引

注册完并且完成邮件验证后会默认创建一个 `My First Application` 程序

![iShot_2023-08-10_11.17.21](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_11.17.21.png)



在这个 `My First Application` 程序下创建一个索引

![iShot_2023-08-10_11.21.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_11.21.28.png)





这里创建一个名为 `docusaurus` 的索引

![iShot_2023-08-10_11.23.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_11.23.23.png)





### 1.3 获取API Key

点击左下角的 `Settings` ，在右上角的 `Team and Access` 处点击下边的 `API Keys`

![iShot_2023-08-10_11.26.01](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_11.26.01.png)







需要获取 `Application ID` 、`Search-Only API Key` 和 `Admin API Key`

![iShot_2023-08-10_11.28.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_11.28.14.png)





## 2.安装插件

### 2.1 安装 [algolia docsearch](https://docusaurus.io/zh-CN/docs/api/themes/@docusaurus/theme-search-algolia) 插件

```shell
npm install --save @docusaurus/theme-search-algolia
```



### 2.2 安装 [sitemap](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-sitemap) 插件

```shell
npm install --save @docusaurus/plugin-sitemap
```



## 3.配置 docusaurus

### 3.1 配置 [algolia docsearch](https://docusaurus.io/zh-CN/docs/api/themes/@docusaurus/theme-search-algolia) 插件

编辑 `docusaurus.config.js` ，填写如下配置

```js
themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
    ......
    algolia: {
        apiKey: "Search-Only API Key",
        appId: "Application ID",
        indexName: "索引名称",
    },
  ......    
  }),
};      
```



完成配置后刷新浏览器，就会看到在最右上角会出现一个搜索框

![iShot_2023-08-10_12.32.04](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_12.32.04.png)



打开后效果如下

![iShot_2023-08-10_12.33.20](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_12.33.20.png)



### 3.2 配置 [sitemap](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-sitemap) 插件

编辑 `docusaurus.config.js` ，填写如下配置

```js
presets: [
    [
    ...
    sitemap: {
      changefreq: 'weekly',
      priority: 0.5,
      ignorePatterns: ['/tags/**'],
      filename: 'sitemap.xml',
    },
    ...
   ],
  ],
```



## 4.推送数据

algolia官方提供2种方式

- 由algolia官方爬取你的网站，可以参考 [官方文档](https://docsearch.algolia.com/docs/what-is-docsearch)
- 自行运行爬虫程序，可以参考 [官方文档](https://docsearch.algolia.com/docs/legacy/run-your-own)

这里我们选择自行运行爬虫程序



### 4.1 安装依赖环境

安装docker

```shell
# 阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum -y install docker-ce

systemctl start docker && systemctl enable docker  

# 配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```



安装jq

[jq是一个轻量级命令行json处理器](https://github.com/stedolan/jq/wiki/Installation)

```shell
yum -y install jq
```



### 4.2 编辑配置文件

编辑 `.env` 文件

```sh
APPLICATION_ID=Application ID
API_KEY=Admin API Key
```



编辑 `config.json` 文件

:::tip说明

需要将 `start_urls` 和 `sitemap_urls` 中的 `xxx.com` 替换为自己的域名

需要将 `index_name` 中的 `xxx` 替换为自己的索引名称

:::

```json
{
  "index_name": "xxx",
  "start_urls": [
    "https://xxx.com/"					
  ],
  "sitemap_urls": [
    "https://xxx.com/sitemap.xml"		
  ],
  "stop_urls": [
    "/search",
    "/v3me",
    "/playground",
    "/inspector"
  ],
  "sitemap_alternate_links": true,
  "selectors": {
    "lvl0": {
      "selector": "(//ul[contains(@class,'menu__list')]//a[contains(@class, 'menu__link menu__link--sublist menu__link--active')]/text() | //nav[contains(@class, 'navbar')]//a[contains(@class, 'navbar__link--active')]/text())[last()]",
      "type": "xpath",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": "header h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "lvl4": "article h4",
    "lvl5": "article h5, article td:first-child",
    "lvl6": "article h6",
    "text": "article p, article li, article td:last-child"
  },
  "strip_chars": " .,;:#",
  "custom_settings": {
    "separatorsToIndex": "_",
    "attributesForFaceting": [
      "language",
      "version",
      "type",
      "docusaurus_tag"
    ],
    "attributesToRetrieve": [
      "hierarchy",
      "content",
      "anchor",
      "url",
      "url_without_anchor",
      "type"
    ]
  },
  "js_render": true,
  "nb_hits": 856
}
```





### 4.3 运行爬虫

```shell
docker run \
  --rm \
  -it \
  --env-file=.env \
  -e "CONFIG=$(cat config.json | jq -r tostring)" \
  algolia/docsearch-scraper
```



如果返回如下，说明已经爬取到记录

```shell
> DocSearch: http://xxx.com/ 1 records)

Nb hits: 1
```



在algolia官网中可以看到爬取的记录

![iShot_2023-08-10_12.59.48](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-08-10_12.59.48.png)

