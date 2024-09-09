# jenkins配置git参数化构建

在 `General` 下勾选 `参数化构建过程` ，点击 `添加参数` 然后选择 `Git参数`

![iShot2022-02-10_17.08.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-02-10_17.08.50.png)



在 `名称` 处定义一个名称，名称任意，在 `参数类型` 处选择 `分支或标签` ，可选有 `标签` 、 `分支` 、 `分支或标签` 、 `修定` 、 `Pull Request` ，在 `默认值` 处填写一个默认分支

![iShot2022-02-10_17.22.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-02-10_17.22.34.png)









这里使用 `$` 符号引用变量

![iShot2022-02-10_17.20.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-02-10_17.20.55.png)









然后在构建的时候就可以选择分支或标签进行构建了

![iShot2022-02-10_17.23.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-02-10_17.23.28.png)







