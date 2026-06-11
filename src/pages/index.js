import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

/*
 * 「程序员最讨厌的四件事」探照灯互动效果（hero 区域整体改造）
 * 修改日期：2026-06-10
 * 备份位置：.backup-spotlight-hero-20260610_135042/pages/
 *
 * 底层（默认）：绿色 hero--primary 背景 + 嘴上说的版本
 * 探照灯层（鼠标圆形内露出）：深色背景 + 心里想的版本
 */

const SPOTLIGHT_RADIUS = 240;

function HomepageHeaderSurface({ siteConfig }) {
  // 表面层：保留原内容（标题 + tagline + 按钮）
  return (
    <div className={clsx('container', styles.heroInner)}>
      <h1 className="hero__title">{siteConfig.title}</h1>
      <p
        className={clsx('hero__subtitle', styles.hero__subtitle)}
        dangerouslySetInnerHTML={{ __html: siteConfig.tagline }}
      />
      <div className={styles.buttons}>
        <Link className="button button--secondary button--lg" to="/docs">
          我啥也没动啊🤔
        </Link>
      </div>
    </div>
  );
}

function HomepageHeaderInner() {
  // 探照灯层：嘴上说 vs 心里想 的真实版本
  return (
    <div className={clsx('container', styles.heroInner)}>
      <h1 className="hero__title">程序员的真实内心</h1>
      <p className={clsx('hero__subtitle', styles.hero__subtitle)}>
        <span className={styles.line}>
          <span className={styles.alignLeft}>1.代码这么清晰还要注释？</span>
          <span className={styles.alignRight}>2.代码就是最好的文档！</span>
        </span>
        <span className={styles.line}>
          <span className={styles.alignLeft}>3.这写的啥玩意儿？！</span>
          <span className={styles.alignRight}>4.连个文档都没有？！</span>
        </span>
      </p>
      <div className={styles.buttons}>
        <span className={clsx('button button--secondary button--lg', styles.fakeButton)}>
          被你抓包了 🫣
        </span>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const headerRef = useRef(null);
  const layerRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const header = headerRef.current;
    const layer = layerRef.current;
    if (!header || !layer) return;

    // 不支持 hover 的设备（手机/平板）跳过探照灯
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return;

    const updateClip = () => {
      rafRef.current = null;
      const { x, y } = posRef.current;
      const cp = `circle(${SPOTLIGHT_RADIUS}px at ${x}px ${y}px)`;
      layer.style.clipPath = cp;
      layer.style.webkitClipPath = cp;
    };

    const onMove = (e) => {
      const rect = header.getBoundingClientRect();
      posRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateClip);
      }
    };

    const onEnter = (e) => {
      const rect = header.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 瞬移到鼠标位置（去 transition 防闪烁）
      layer.style.transition = 'none';
      const init = `circle(0px at ${x}px ${y}px)`;
      layer.style.clipPath = init;
      layer.style.webkitClipPath = init;
      void layer.offsetWidth;
      layer.style.transition = '';
      const open = `circle(${SPOTLIGHT_RADIUS}px at ${x}px ${y}px)`;
      layer.style.clipPath = open;
      layer.style.webkitClipPath = open;
    };

    const onLeave = () => {
      layer.style.clipPath = 'circle(0px at -300px -300px)';
      layer.style.webkitClipPath = 'circle(0px at -300px -300px)';
    };

    header.addEventListener('mousemove', onMove);
    header.addEventListener('mouseenter', onEnter);
    header.addEventListener('mouseleave', onLeave);

    return () => {
      header.removeEventListener('mousemove', onMove);
      header.removeEventListener('mouseenter', onEnter);
      header.removeEventListener('mouseleave', onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={clsx('hero hero--primary', styles.heroBanner, styles.spotlightHero)}
    >
      {/* 底层：原内容（绿色背景） */}
      <HomepageHeaderSurface siteConfig={siteConfig} />

      {/* 探照灯层：心里想的（深色背景，clip-path 跟随鼠标） */}
      <div className={styles.spotlightLayer} ref={layerRef}>
        <HomepageHeaderInner />
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`我啥也没动啊🤔`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
