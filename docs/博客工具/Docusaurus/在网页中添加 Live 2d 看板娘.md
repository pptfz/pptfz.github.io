# 在网页中添加 Live 2d 看板娘

[github地址](https://github.com/stevenjoezhang/live2d-widget)



效果如下

![iShot_2024-10-09_12.12.46](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-10-09_12.12.46.png)



在docusaurus `src` 目录下新建目录 `theme`

```shell
mkdir src/theme
```



在 `theme` 目录下新建文件 `Root.js`

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

  return <>{children}</>;
}
```

