# docusaurus配置代码块下载按钮

[download-button插件](https://prismjs.com/plugins/download-button/)

编辑 `src/theme/Root.js` 新增如下内容

:::tip 说明

主要实现了以下功能

- 通过 `querySelectorAll('pre:not(.pre-wrapper)')` 找到页面中的所有 `<pre>` 代码块；

- 为每个代码块动态添加一个“下载”按钮；

- 鼠标悬停时按钮显示，移开后自动隐藏；

- 自动识别代码语言（如 `language-js`），并根据语言类型生成对应后缀；

- 使用 `Blob` + `a.download` 实现前端文件下载；

- 通过 `MutationObserver` 确保在 Docusaurus 页面切换后仍能自动生效；

- 保持与原生“复制代码”按钮的样式风格一致，不会遮挡或干扰。

:::

```js
export default function Root({ children }) {
  useEffect(() => {
  ......
  
      // -------------------------------
    // 添加下载按钮逻辑（核心部分）
    // -------------------------------
    function addDownloadButtons() {
      // 选中页面上所有 <pre> 元素（代码块），排除已经包裹过的 .pre-wrapper
      const pres = document.querySelectorAll('pre:not(.pre-wrapper)');

      pres.forEach(pre => {
        // 防止重复包裹
        if (pre.classList.contains('pre-wrapper')) return;
        pre.classList.add('pre-wrapper');
        pre.style.position = 'relative'; // 让绝对定位的按钮能相对代码块定位

        const codeEl = pre.querySelector('code');
        if (!codeEl) return; // 没有 code 标签就跳过

        // 防止重复添加按钮
        if (pre.querySelector('.custom-download-btn')) return;

        // 创建一个新的按钮元素
        const btn = document.createElement('button');
        btn.className = 'custom-download-btn';
        btn.textContent = '下载'; // 按钮文字

        // 按钮的样式
        Object.assign(btn.style, {
          position: 'absolute',     // 绝对定位，放在代码块右上角
          top: '8px',               // 距离上方 8px
          right: '80px',            // 距离右侧 80px（避免和复制按钮重叠）
          zIndex: 20,               // 层级比代码高
          padding: '2px 6px',       // 按钮内边距
          fontSize: '12px',         // 字体大小
          borderRadius: '4px',      // 圆角
          border: 'none',           // 去掉边框
          background: 'rgba(0,0,0,0.6)', // 半透明背景
          color: '#fff',            // 白色文字
          cursor: 'pointer',        // 鼠标悬停显示小手
          opacity: '0',             // 默认隐藏（hover 时再显示）
          transition: 'opacity 0.2s ease, background 0.2s', // 平滑过渡动画
        });

        // 当鼠标移入代码块时显示按钮
        pre.addEventListener('mouseenter', () => {
          btn.style.opacity = '1';
        });

        // 当鼠标移出代码块时隐藏按钮
        pre.addEventListener('mouseleave', () => {
          btn.style.opacity = '0';
        });

        // 鼠标移入按钮时加深背景色
        btn.onmouseover = () => {
          btn.style.background = 'rgba(0,0,0,0.8)';
        };

        // 鼠标移出按钮时恢复背景色
        btn.onmouseout = () => {
          btn.style.background = 'rgba(0,0,0,0.6)';
        };

        // 点击下载按钮的逻辑
        btn.onclick = (e) => {
          e.stopPropagation(); // 阻止事件冒泡，避免干扰其它组件
          const codeText = codeEl.innerText; // 获取代码内容

          // 提取代码块语言（如 language-js、language-python）
          let langClass = codeEl.className.match(/language-(\w+)/);
          if (!langClass || !langClass[1]) {
            langClass = pre.className.match(/language-(\w+)/);
          }
          const lang = langClass ? langClass[1].toLowerCase() : '';

          // 语言后缀映射表，用于生成合适的文件名
          const extMap = {
            javascript: 'js', js: 'js',
            typescript: 'ts', ts: 'ts',
            jsx: 'jsx', tsx: 'tsx',
            bash: 'sh', sh: 'sh', shell: 'sh',
            yaml: 'yaml', yml: 'yml',
            json: 'json', go: 'go',
            python: 'py', py: 'py',
            java: 'java', c: 'c', cpp: 'cpp',
            html: 'html', css: 'css',
            dockerfile: 'dockerfile', sql: 'sql',
          };

          // 根据语言选择文件后缀（默认为 .txt）
          const ext = extMap[lang] || 'txt';
          const filename = `code.${ext}`; // 下载的文件名

          // 创建 Blob 对象（文本内容转为文件流）
          const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8' });

          // 动态创建 <a> 标签触发下载
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();   // 模拟点击下载
          a.remove();  // 下载完成后移除链接
        };

        // 把按钮插入到代码块中
        pre.appendChild(btn);
      });
    }

    // 初始执行一次
    addDownloadButtons();

    // 监听页面变化（Docusaurus 是单页应用，切换时需重新绑定）
    const observer = new MutationObserver(addDownloadButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    // 清理函数：卸载脚本 & 停止监听
    return () => {
      try { document.body.removeChild(live2dScript); } catch {}
      observer.disconnect();
    };
  }, []);
```





效果如下

![iShot_2025-10-11_10.27.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-11_10.27.21.png)