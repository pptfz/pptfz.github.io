[toc]



# docker-compose安装

## 1.docker-compose简介

[docker compose github地址](https://github.com/docker/compose)

[docker compose 官方安装地址](https://github.com/docker/docker.github.io/raw/branch/branch/master/compose/install.md)

[官方安装文档](https://docs.docker.com/compose/install/)

**Compose中有两个重要的概念：**

- **服务 (service)：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。**

- **项目 (project)：由一组关联的应用容器组成的一个完整业务单元，在docker-compose.yml文件中定义。**



**Compose的默认管理对象是项目，通过子命令对项目中的一组容器进行便捷地生命周期管理。Compose 项目由 Python 编写，实现上调用了 Docker 服务提供的 API 来对容器进行管理。所以只要所操作的平台支持 Docker API，就可以在其上利用 Compose 来进行编排管理。**



## 2.docker-compose安装

### 2.1 下载安装包

#### 2.1.1 github下载

[docker compose github地址](https://github.com/docker/compose)

```shell
export DOCKER_COMPOSE_VERSION=2.10.2
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSIO}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```



#### 2.1.2 国内源下载

可以使用 [daocloud](https://get.daocloud.io/) 加速下载

```shell
export DOCKER_COMPOSE_VERSION=2.10.2
curl -L https://get.daocloud.io/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSIO}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```





### 2.2 给二进制文件添加可执行权限

```shell
chmod +x /usr/local/bin/docker-compose
```



### 2.3 完成安装，查看版本

```shell
$ docker-compose -v
Docker Compose version v2.10.2
```



# docker-compose工具

## 1.composerize

[composerize github地址](https://github.com/magicmark/composerize)

[composerize官网](https://www.composerize.com/)



### 1.1 简介

composerize是将 `docker run` 命令转换为 `Docker Compose` 文件格式的工具



### 1.2 安装

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="apple"
  values={[
    {label: 'yarn', value: '`yarn global add composerize`'},
    {label: 'npm', value: '`npm install composerize -g`'},
  ]}>





```shell
npm install composerize -g
```



```
yarn global add composerize
```











