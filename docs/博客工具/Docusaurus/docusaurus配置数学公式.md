# docusaurus配置数学公式

[docusaurus配置数学公式官方文档](https://docusaurus.io/zh-CN/docs/markdown-features/math-equations)



## 1.安装插件

```shell
npm install --save remark-math@6 rehype-katex@7
```



## 2.修改配置文件

编辑 `docusaurus.config.js` ，新增插件配置

```js
import remarkMath from 'remark-math'; // 新增
import rehypeKatex from 'rehype-katex'; // 新增

presets: [
   ......
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [remarkMath], // 新增
          rehypePlugins: [rehypeKatex], // 新增
        },
   ......
```



编辑 `docusaurus.config.js` ，配置KaTeX CSS 包

```js
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
  ......
```





## 3.示例



行内公式，使用 `$` 包裹

```markdown
$(-2)^7$ 到 $2^7 - 1$
```



块级公式，使用 `$$` 包裹

```markdown
$$
(-2)^7 \text{ 到 } 2^7 - 1
$$
```



效果如下

![iShot_2024-11-21_17.21.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-11-21_17.21.45.png)