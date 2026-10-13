import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '🎤',
    // Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    // imageUrl: "https://raw.githubusercontent.com/pptfz/piclist-images/master/img/dance-straps1.gif",
    imageUrl: require('@site/static/img/ikun/dance-straps1.gif').default,
    description: (
      <>
        {/* Docusaurus从一开始就被设计成易于安装和使用，让你的网站快速运行。 */}
        <span className={styles.highlightText}>凯迪拉克不拉客～</span>
        {/* <span className={styles.highlightText}>k8s</span> */}
      </>
    ),
  },
  {
    title: '💃',
    // Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    imageUrl: require('@site/static/img/ikun/dance-straps2.gif').default,
    description: (
      <>
        {/* Docusaurus让你专注于你的文档，我们来做事物。并继续将你的文档移到<code>docs</code>目录中。 */}
        <span className={styles.highlightTextBlue}>只拉技师和模特～</span>
        {/* <span className={styles.highlightTextBlue}>p9s</span> */}
      </>
    ),
  }, 
  {
    title: 'rap',
    // Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    imageUrl: require('@site/static/img/ikun/dance-2straps.gif').default,
    description: (
      <>
        {/* Docusaurus让你专注于你的文档，我们来做事物。并继续将你的文档移到<code>docs</code>目录中。 */}
        <span className={styles.highlightTextGreen}>趁着年轻多吃苦～</span>
        {/* <span className={styles.highlightTextGreen}>devops</span> */}
        
      </>
    ),
  },
  {
    title: '🏀',
    // Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    imageUrl: require('@site/static/img/ikun/sing-dance-rap-basketball-transparent.gif').default,
    description: (
      <>
        {/* 通过重用React扩展或自定义你的网站布局。Docusaurus可以在重用相同的页眉和页脚的同时进行扩展。 */}
        <span className={styles.highlightTextPink}>年底提辆CT5～</span>
        {/* <span className={styles.highlightTextPink}>cloud native</span> */}
      </>
    ),
  },
];

// function Feature({Svg, title, description}) {
//   return (
//     <div className={clsx('col col--3')}>
//       <div className="text--center">
//         <Svg className={styles.featureSvg} role="img" />
//       </div>
//       <div className="text--center padding-horiz--md">
//         <h3>{title}</h3>
//         <p>{description}</p>
//       </div>
//     </div>
//   );
// }


// 支持本地图片和网络图片
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


export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
