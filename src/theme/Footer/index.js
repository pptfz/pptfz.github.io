import React, {useState, useEffect} from 'react';
import Footer from '@theme-original/Footer';
import styles from './styles.module.css';

// 建站起始时间（git 首次提交：2020-06-15）
const SITE_START_DATE = new Date('2020-06-15T09:25:04+08:00');

function getRunTime() {
  const diff = new Date().getTime() - SITE_START_DATE.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return {days, hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds)};
}

export default function FooterWrapper(props) {
  const [runTime, setRunTime] = useState(getRunTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setRunTime(getRunTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className={styles.statsBar}>
        <div className={styles.statsInner}>
          <div className={styles.runDaysItem}>
            <span className={styles.statIcon}>🛡️</span>
            <span className={styles.statLabel}>本站已安全运行</span>
            <span className={styles.runDaysValue}>{runTime.days}</span>
            <span className={styles.statLabel}>天</span>
            <span className={styles.runTimeValue}>{runTime.hours}</span>
            <span className={styles.statLabel}>时</span>
            <span className={styles.runTimeValue}>{runTime.minutes}</span>
            <span className={styles.statLabel}>分</span>
            <span className={styles.runTimeValue}>{runTime.seconds}</span>
            <span className={styles.statLabel}>秒</span>
          </div>
        </div>
      </div>

      <Footer {...props} />
    </>
  );
}
