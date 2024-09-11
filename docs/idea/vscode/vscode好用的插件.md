# vscode好用的插件

## 主题

### [Dracula Official](https://draculatheme.com/visual-studio-code)

安装完成后效果如下

![iShot_2024-05-28_20.12.02](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-05-28_20.12.02.png)





## 图标主题

### [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme)

主要是给左侧目录以及文件显示不同的图标

![iShot_2024-05-28_20.13.21](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-05-28_20.13.21.png)



## 特效

### [Power Mode](https://marketplace.visualstudio.com/items?itemName=hoovercj.vscode-power-mode)



以下为插件的基本配置，其中特效包含如下

- particles(粒子，默认)
- simple-rift(闪电)

- exploding-rift(爆炸闪电)
- fireworks(烟花)
- flames(火焰)
- magic(魔法)
- clippy(奇怪的飞毯)

```json
  "powermode.enabled": true, // 启动
  "explorer.confirmDelete": false, // 禁用文件删除时的确认提示
  "powermode.presets": "flames", // 火花效果 particles(粒子，默认)、simple-rift(闪电)、exploding-rift(爆炸闪电)、fireworks(烟花)、flames(火焰)、magic(魔法)、clippy(会眨眼睛的回形针)
  "powermode.shake.enabled": false, // 取消屏幕代码抖动
  "powermode.combo.counterEnabled": "hide", // 隐藏连击计数器
  "powermode.combo.timerEnabled": "hide" // 隐藏连击计时器
```





在这个 [issue](https://github.com/hoovercj/vscode-power-mode/issues/1) 中可以查看使用gif动图的配置

在 `settings.json` 中加入以下配置就可以使用自定义gif动图效果了

```json
  // 皮卡丘动画效果  
  "powermode.enabled": true,                    // 启用 Power Mode 功能
  "powermode.combo.location": "statusbar",      // 设置连击计数器显示在状态栏
  "powermode.combo.timerEnabled": "show",       // 禁用连击计时器显示
  "powermode.shake.enabled": false,             // 禁用编辑器的抖动效果
  "powermode.explosions.customExplosions": [    // 设置自定义爆炸效果
    "https://i.imgur.com/iDcBoNm.gif"
  ],
  "powermode.explosions.explosionOrder": "sequential", // 爆炸效果按顺序播放
  "powermode.explosions.size": 12,              // 设置爆炸效果大小
  "powermode.explosions.frequency": 1,          // 设置爆炸效果频率
  "powermode.explosions.maxExplosions": 1,      // 最大同时显示的爆炸效果数量
  "powermode.explosions.offset": 0.315,         // 爆炸效果的偏移量
  "powermode.explosions.gifMode": "continue",   // GIF 爆炸效果持续播放
  "powermode.explosions.duration": 1000,        // 爆炸效果持续时间（毫秒）
  "powermode.explosions.backgroundMode": "image" // 爆炸效果背景模式为图片
}
```



效果如下

![IMG_1763](https://github.com/pptfz/picgo-images/blob/master/img/IMG_1763.gif)



















