# mac复制app

以 `ZenTermLite` 为例

![iShot_2025-08-21_14.41.28](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_14.41.28.png)



## 复制目录

```shell
cd /Applications
cp -R ZenTermLite.app/ 厚礼蟹.app
```



复制后就会在访达中出现了

![iShot_2025-08-21_14.45.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_14.45.01.png)





## 修改app名字

在 `访达` -> `应用程序` -> 右键显示简介 -> `名称与扩展名`  修改应用程序名字

![iShot_2025-08-21_14.47.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_14.47.45.png)



## 修改应用图标

### 生成新的 `icns` 文件



#### 创建目录

```shell
mkdir ~/Desktop/iconset
```



#### 把原 `icns` 转成 `app.iconset`文件夹

:::caution 注意

`iconutil -c iconset` 的 `-o` 参数必须是一个以 `.iconset` 结尾的文件夹路径

:::

```shell
iconutil -c iconset /Applications/ZenTermLite.app/Contents/Resources/AppIcon.icns -o ~/Desktop/app.iconset
```



#### 查看原 `icns` 的尺寸集合

```shell
ls -lh ~/Desktop/app.iconset/
total 160
-rw-r--r--@ 1 pptfz  staff    15K Aug 21 14:53 icon_128x128.png
-rw-r--r--@ 1 pptfz  staff    54K Aug 21 14:53 icon_128x128@2x.png
-rw-r--r--@ 1 pptfz  staff   668B Aug 21 14:53 icon_16x16.png
-rw-r--r--@ 1 pptfz  staff   1.6K Aug 21 14:53 icon_16x16@2x.png
```



#### 用新图片生成相同尺寸的 `png` 图片

:::caution 注意

这里的尺寸要对应看到的原 `iconset` 文件名和尺寸

:::

```shell
mkdir -p ~/Desktop/newapp.iconset
sips -z 128 128 ~/Desktop/houlixie.png --out ~/Desktop/newapp.iconset/icon_128x128.png
sips -z 256 256 ~/Desktop/houlixie.png --out  ~/Desktop/newapp.iconset/icon_128x128@2x.png
sips -z 16 16 ~/Desktop/houlixie.png --out ~/Desktop/newapp.iconset/icon_16x16.png
sips -z 64 64 ~/Desktop/houlixie.png --out ~/Desktop/newapp.iconset/icon_16x16@2x.png
```



#### 生成新的 `icns` 文件

```
iconutil -c icns ~/Desktop/newapp.iconset
```



#### 替换原APP图标

临时替换

可以拖拽图片到左上角替换

![iShot_2025-08-21_15.22.22](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_15.22.22.png)







永久替换

```
cp ~/Desktop/newapp.icns /Applications/厚礼蟹.app/Contents/Resources/AppIcon.icns
```









## 修改app显示名称

修改 `/Applications/厚礼蟹.app/Contents/Info.plist` 文件





**`CFBundleExecutable`**

- 对应的是真正执行的二进制文件名（通常和 `.app/Contents/MacOS/` 下面的文件名一致）。
- 一般不改，除非你把可执行文件也改了名字。

**`CFBundleIdentifier`**

- 应用的唯一标识符（类似 `com.xxx.xxx`）。
- 如果只是自己本地改图标和名字，可以不用改。
- 如果你要发布签名或上传到 App Store，就必须是唯一的。

**`CFBundleName`**

- 应用在 **Dock 和菜单栏显示的名字**。
- 改这个就能让应用显示为“厚礼蟹”。

```
<key>CFBundleExecutable</key>
<key>CFBundleIdentifier</key>
<key>CFBundleName</key>
```





修改完 `Info.plist` 文件后打开就会报错了

![iShot_2025-08-21_15.48.03](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_15.48.03.png)





```
cd /Applications/厚礼蟹.app/Contents/MacOS
mv ZenTermLite 厚礼蟹
```





清理扩展属性

```shell
sudo xattr -cr "/Applications/厚礼蟹.app"
```



清理 `.DS_Store` 和 `._` 文件

```shell
find "/Applications/厚礼蟹.app" -name ".DS_Store" -delete
find "/Applications/厚礼蟹.app" -name "._*" -delete
```



重新签名

```
sudo codesign --force --deep --sign - "/Applications/厚礼蟹.app"
```



验证签名

```shell
codesign -dv --verbose=4 "/Applications/厚礼蟹.app"
spctl -a -vv "/Applications/厚礼蟹.app"
```









## 









```

```













```
xattr -cr /Applications/Noi.app
```

