import React, {useState, useEffect} from 'react';
import {useHistory} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const COUNTDOWN_SECONDS = 5;

export default function NotFoundDesign() {
  const history = useHistory();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          history.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [history]);

  return (
    <div className={styles.notFoundContainer}>
      {/* 背景流动光斑 */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.content}>
        <div className={styles.errorCode}>
          <span className={styles.digit}>4</span>
          <span className={styles.digit + ' ' + styles.zero}>0</span>
          <span className={styles.digit}>4</span>
        </div>

        <h1 className={styles.title}>特么有这个页面么？</h1>
        <p className={styles.subtitle}>
          就瞎几吧点？这页面根本不存在！老老实实回首页待着去
        </p>

        <div className={styles.countdownBox}>
          <span className={styles.countdownText}>
            <span className={styles.countdownNum}>{countdown}</span>
            秒后自动返回首页
          </span>
          {/* 进度条 */}
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{animationDuration: `${COUNTDOWN_SECONDS}s`}}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            to="/"
            className={styles.primaryBtn}
            onClick={(e) => {
              e.preventDefault();
              history.push('/');
            }}
          >
            立即返回首页
          </Link>
          <button
            className={styles.secondaryBtn}
            onClick={() => history.goBack()}
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
