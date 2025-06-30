[toc]



# mac使用gitbook记录



## 1.gitbook搭建

### 1.1 安装node.js

[官网](https://nodejs.org/en/)下载mac版本的node.js



### 1.2 检测node.js是否安装成功

```python
npm -v
6.12.1
```



### 1.3 安装gitboot和命令行工具(-g 代表全局安装)

```python
//安装
sudo npm install -g gitbook
sudo npm install -g gitbook-cli

//查看版本
gitbook -V
CLI version: 2.3.2
GitBook version: 3.2.3
  
  
//更新gitbook命令行工具
sudo npm update gitbook-cli -g

//卸载gitbook命令
sudo npm uninstall gitbook-cli -g
```



## 2.gitbook的使用

### 2.1 创建gitbook目录

```python
//创建gitbook目录
sudo mkdir /gitbook 

//初始化gitbook
cd /gitbook && sudo gitbook init

//初始化完成后会生成两个文件
README.md			#项目介绍文件
SUMMARY.md		#gitbook目录结构

```



### 2.2 配置gitbook生成书籍

```python
1.编辑SUMMARY.md，写入以下内容(这里仅做示例)
# Summary
* [Linux](README.md)
    * [Linux基础](README.md)
      * [Linux命令](README.md)
        * [vim命令](README.md)
          * [vim命令](linux/linux命令/vim命令.md)
        
⚠️vim命令.md的路径是/gitbook/linux/linux命令


2.构建书籍(⚠️构建命令必须在SUMMARY.md同路径下)
sudo gitbook build

3.启动gitbook
sudo gitbook serve &

gitbook默认监听4000端口
```





**启动gitbook报错**

```python
//gitbook serve启动gitbook报错如下

Error: ENOENT: no such file or directory, stat '/gitbook/_book/gitbook/gitbook-plugin-livereload/plugin.js',Error: ENOENT: no such file or directory, stat '/gitbook/_book/gitbook/gitbook-plugin-livereload'

        
//解决方法
找到copyPluginAssets.js文件，全部替换
将			 confirm: true
改为	  confirm: false


/Users/baixuebing/.gitbook/versions/3.2.3/lib/output/website/copyPluginAssets.js
```



## 3.修改gitbook代码框字体大小

```python
prismnode_modules/themes/themes/prism-base16-ateliersulphurpool.light.css

13、14行
font-size: 18px;
line-height: 1.6;
```



## 4.设置gitbook开机自启

```python

```

