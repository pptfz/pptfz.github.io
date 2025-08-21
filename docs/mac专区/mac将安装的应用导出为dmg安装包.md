# mac将安装的应用导出为dmg安装包

### 创建一个临时目录存放应用

```shell
mkdir -p ~/Desktop/TempApp
cp -R "/Applications/厚礼蟹.app" ~/Desktop/TempApp/
```



### 使用 `hdiutil` 创建 dmg

:::tip 说明

使用 `hdiutil` 创建的dmg包，里边只有 `.app` 文件

:::

```shell
hdiutil create -volname "厚礼蟹" -srcfolder ~/Desktop/TempApp -ov -format UDZO ~/Desktop/HouliXie.dmg
```





