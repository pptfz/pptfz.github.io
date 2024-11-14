import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

// function HomepageHeader() {
//   const {siteConfig} = useDocusaurusContext();
//   return (
//     <header className={clsx('hero hero--primary', styles.heroBanner)}>
//       <div className="container">
//         <h1 className="hero__title">{siteConfig.title}</h1>
//         <p className="hero__subtitle">{siteConfig.tagline}</p>
//         <div className={styles.buttons}>
//           <Link
//             className="button button--secondary button--lg"
//             to="/docs">
//             我啥也没动啊🤔
//             {/* 十年舔狗一场空 包厢500是老公 ~ */}
//             {/* 凯迪拉克不拉客，只拉技师和模特 ～ <br/>
//             趁着年轻多吃苦，年底提辆CT5 ~ */}
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        {/* 使用 dangerouslySetInnerHTML 渲染 tagline */}
        <p className={clsx("hero__subtitle", styles.hero__subtitle)} dangerouslySetInnerHTML={{ __html: siteConfig.tagline }} />
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            我啥也没动啊🤔
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
