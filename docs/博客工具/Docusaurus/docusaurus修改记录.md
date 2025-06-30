# docusaurus修改记录



## docusaurus修改首页显示图片

`docusaurus/src/components/HomepageFeatures/index.js` 文件中有关于首页图片显示的配置

```js
  {
    title: 'rap',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Docusaurus让你专注于你的文档，我们来做事物。并继续将你的文档移到<code>docs</code>目录中。
      </>
    ),
  },
```



其中引入的图片是本地的svg格式的，如果想要引入网络图片，则需要进行如下修改

注释以下内容

```js
Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default
```



修改为如下

```js
imageUrl: "https://xxx",
```



注释以下内容

```js
function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
```



修改为如下

代码中的 `Svg` 属性期望的是一个组件或 SVG 文件引用，在不修改代码的情况如果传入了一个 GIF 图片的路径会报错。Docusaurus 会尝试将 `Svg` 当作一个组件来渲染，从而导致错误。要解决这个问题，可以新增根据文件类型来动态渲染 `<img>` 标签以加载非 SVG 格式的图片

```js
function Feature({ imageUrl, title, description }) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        {typeof imageUrl === 'string' ? (
          // 网络图片直接作为字符串传入
          <img src={imageUrl} className={styles.featureSvg} alt={title} />
        ) : (
          // 本地图片使用 require，返回的是一个对象，直接取出默认值
          <img src={imageUrl.default || imageUrl} className={styles.featureSvg} alt={title} />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
```



## docusaurus配置拐角显示gif

`src/css/custom.css` 

```css
/* 右下角 GIF 图片 */
.gifImageBottom {
  position: fixed;
  bottom: 20px; /* 距离底部 */
  right: 20px;  /* 距离右侧 */
  z-index: 9999; /* 确保 GIF 在最上面 */
  max-width: 100px; /* 设置合适的尺寸 */
  max-height: 100px;
}

/* 右上角 GIF 图片 */
.gifImageTop {
  position: fixed;
  top: 20px; /* 距离顶部 */
  right: 20px; /* 距离右侧 */
  z-index: 9999; /* 确保 GIF 在最上面 */
  max-width: 100px; /* 设置合适的尺寸 */
  max-height: 100px;
}
```



`src/theme/Root.js`

```js
import React, { useEffect } from 'react';

export default function Root({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {children}

      {/* 右下角的 GIF 图片 */}
      <div className="gifImageBottom">
        <img 
          src="https://raw.githubusercontent.com/pptfz/picgo-images/master/img/dance-2straps.gif" 
          alt="Right Bottom Gif" 
          className="gifImage"
        />
      </div>
      {/* 右上角 GIF 图片 */}
      <div className="gifImageTop"></div>
        <img 
          src="https://raw.githubusercontent.com/pptfz/picgo-images/master/img/sing-dance-rap-basketball.gif" 
          className="gifImageTop" 
          alt="Right Top GIF" 
        />
      </div>
  );
}
```

