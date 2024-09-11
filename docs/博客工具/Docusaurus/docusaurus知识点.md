# docusaurus知识点



## 显示目录内容

在笔记目录下新增 `_category_.json` 

```json
{
	"position": "3", // 表示目录的位置
	"link": {
	  "type": "generated-index" // 点击目录名称显示目录下的内容
	}
}
```



效果如下

![iShot_2023-07-03_11.35.46](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2023-07-03_11.35.46.png)







## 顶部增加提示条

```js
announcementBar: {
  id: "support_us",
  content: '在顶部增加内容',
  backgroundColor: "pink",
  textColor: "@091E42",
  isCloseable: false, // 最右边是否显示X号，即提示条是否可以关闭
},
```

效果如下

![iShot_2023-07-03_15.43.25](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2023-07-03_15.43.25.png)















