# jenkins用户权限管理

[Jenkins Role-Strategy plugin github地址](https://github.com/jenkinsci/role-strategy-plugin)

[Role-based Authorization Strategy jenkins地址](https://plugins.jenkins.io/role-strategy/)



## 安装插件 `Role-based Authorization Strategy`

在jenkins插件中心搜索 `Role-based Authorization Strategy`

![iShot_2025-10-14_10.47.43](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-14_10.47.43.png)



## 开启插件

`系统管理` -> `安全` -> `全局安全配置` -> `授权策略` -> 选择 `Role-Based Strategy`



授权策略选择  `Role-Based Strategy` 后就会在 `系统管理` -> `安全` 下出现 `Manage and Assign Roles`

![iShot_2025-10-15_19.20.38](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-15_19.20.38.png)





### `Manage Roles` 配置页面

![iShot_2025-10-15_19.25.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-15_19.25.54.png)



## 环境准备

### 新建项目

新建2个项目 `prod-project` 和 `test-project` ，分别模拟生产环境和测试环境

![iShot_2025-10-17_16.06.10](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.06.10.png)





`prod-project` 下有2个项目 `prod-project-1` 和 `prod-project-2`

![iShot_2025-10-17_16.09.05](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.09.05.png)







`test-project` 下有2个项目 `test-project-1` 和 `test-project-2`

![iShot_2025-10-17_16.13.15](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.13.15.png)





### 新建用户

新建 `prod-user` 和 `test-user` 2个用户

![iShot_2025-10-17_16.16.27](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.16.27.png)







## 用户权限配置

### `Role-based Authorization Strategy` 插件授权步骤

进入 `Manage and Assign Roles`

- 首先在 `Manage Roles` 中新建角色，必须创建全局角色设置可读，然后在角色下边利用正则匹配项目

- 然后在 `Assign Roles` 中分配角色，是针对 `Manage Roles` 中设置的角色，在 `Assign Roles` 设置哪个用户对 `Manage Roles` 中设置的角色有什么权限




### 管理角色

#### 新建角色

新建2个角色 `prod-role` 和 `test-role` ，必须勾选  `Read` 选项，表示角色对全局可读，否则用户登陆后无任何查看权限

![iShot_2025-10-17_16.22.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.22.07.png)







#### 给角色匹配项目

新建角色之后，开始给角色匹配项目，在 `Item roles` 中匹配项目，主要用到的就是正则表达式，例如在 `Pattern` 中填写 `prod-project.*` 表示的就是对 `prod-project` 目录(项目)下的所有项目有权限

:::tip 说明

这里给角色 `prod-role` 匹配 `prod-project.*` ，表色角色 `prod-role` 对 `prod-project.*` 下所有的项目有相应的权限

给角色 `test-role` 匹配 `test-project.*` ，表色角色 `test-role` 对 `test-project.*` 下所有的项目有相应的权限

:::

![iShot_2025-10-17_16.25.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.25.07.png)





### 分配角色

进入 `Assign Roles` ，在 `Global roles` 和 `Item roles` 下配置用户有哪些角色的权限



![iShot_2025-10-17_16.30.08](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.30.08.png)





### 测试验证

`prod-user` 只能看到 `prod-project` 下的项目

![iShot_2025-10-17_16.33.09](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.33.09.png)

并且有之前设置的构建权限

![iShot_2025-10-17_16.34.51](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.34.51.png)







`test-user` 只能看到 `test-project` 下的项目

![iShot_2025-10-17_16.36.02](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.36.02.png)

并且有之前设置的构建权限

![iShot_2025-10-17_16.36.57](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-17_16.36.57.png)
