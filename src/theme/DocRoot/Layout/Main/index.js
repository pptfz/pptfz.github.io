import React, {useState, useEffect, useRef} from 'react';
import DocRootLayoutMain from '@theme-original/DocRoot/Layout/Main';
import styles from './styles.module.css';

// 预置时区列表
const TIMEZONES = [
  {id: 'Asia/Shanghai', label: '北京', offset: 'UTC+8', flag: '🇨🇳'},
  {id: 'Europe/London', label: '伦敦', offset: 'UTC+0', flag: '🇬🇧'},
  {id: 'America/New_York', label: '纽约', offset: 'UTC-5', flag: '🇺🇸'},
  {id: 'Asia/Tokyo', label: '东京', offset: 'UTC+9', flag: '🇯🇵'},
  {id: 'America/Los_Angeles', label: '洛杉矶', offset: 'UTC-8', flag: '🇺🇸'},
  {id: 'Europe/Paris', label: '巴黎', offset: 'UTC+1', flag: '🇫🇷'},
];

function getTimeParts(timeZone) {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = fmt.formatToParts(new Date());
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  return `${map.hour}:${map.minute}:${map.second}`;
}

export default function DocRootLayoutMainWrapper(props) {
  const [currentTz, setCurrentTz] = useState(TIMEZONES[0]);
  const [timeStr, setTimeStr] = useState(() => getTimeParts(TIMEZONES[0].id));
  const [showTzList, setShowTzList] = useState(false);
  const [opacity, setOpacity] = useState(() => {
    if (typeof window === 'undefined') return 0.85;
    return parseFloat(localStorage.getItem('sidebarClockOpacity')) || 0.85;
  });
  const tzRowRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebarClockOpacity', String(opacity));
  }, [opacity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(getTimeParts(currentTz.id));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTz]);

  useEffect(() => {
    if (!showTzList) return;
    const handler = (e) => {
      if (tzRowRef.current && !tzRowRef.current.contains(e.target)) {
        setShowTzList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTzList]);

  const selectTz = (tz) => {
    setCurrentTz(tz);
    setTimeStr(getTimeParts(tz.id));
    setShowTzList(false);
  };

  return (
    <DocRootLayoutMain {...props}>
      {/* 内容区顶部时钟条（靠右） */}
      <div className={styles.clockBar}>
        <div className={styles.clockItem} ref={tzRowRef} style={{'--clock-bg-opacity': opacity}}>
          <div className={styles.clockTopRow}>
            <button
              className={styles.tzToggle}
              onClick={() => setShowTzList((s) => !s)}
              aria-label="切换时区"
            >
              <span className={styles.tzFlag}>{currentTz.flag}</span>
            </button>
            <span className={styles.clockTime}>{timeStr}</span>
          </div>

          {/* 透明度调节滑块（时间下方） */}
          <div className={styles.opacityRow}>
            <span className={styles.opacityIcon}>🔅</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className={styles.opacitySlider}
              aria-label="透明度"
            />
            <span className={styles.opacityIcon}>🔆</span>
          </div>

          {showTzList && (
            <div className={styles.tzList}>
              {TIMEZONES.map((tz) => (
                <button
                  key={tz.id}
                  className={
                    styles.tzOption +
                    (tz.id === currentTz.id ? ' ' + styles.tzOptionActive : '')
                  }
                  onClick={() => selectTz(tz)}
                >
                  <span className={styles.tzOptionFlag}>{tz.flag}</span>
                  <span className={styles.tzOptionName}>{tz.label}</span>
                  <span className={styles.tzOptionOffset}>{tz.offset}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {props.children}
    </DocRootLayoutMain>
  );
}
