# docker跨平台构建镜像

[docker跨平台构建镜像官方文档](https://docs.docker.com/build/building/multi-platform/)



## 启用跨平台构建功能

使用 **Docker Buildx** 来构建跨平台镜像，否则本地 Docker 默认只支持你当前机器的架构



### 创建Docker Buildx 构建器（builder）

:::tip 说明

作用：

- 创建一个新的 Buildx 构建器，名字叫 `mybuilder`
- `--use` 表示：创建完之后立即设为默认使用的构建器（后续 `docker buildx build` 会使用它）

结果：

- 实际上会自动创建一个叫 `buildx_buildkit_mybuilder` 的容器，用作隔离的构建环境
- 默认 driver 是 `docker-container`（支持多平台）

:::

```shell
docker buildx create --use --name mybuilder
```



查看创建的构建器，默认是有一个名为 `default` 的构建器

```shell
$ docker buildx ls
NAME/NODE    DRIVER/ENDPOINT             STATUS   PLATFORMS
mybuilder *  docker-container                     
  mybuilder0 unix:///var/run/docker.sock inactive 
default      docker                               
  default    default                     running  linux/amd64, linux/386
```





| 构建器名称  | 驱动类型           | 节点状态               | 平台支持                   |
| ----------- | ------------------ | ---------------------- | -------------------------- |
| `mybuilder` | `docker-container` | ❌ `inactive`（未启动） | *未列出平台*（未初始化）   |
| `default`   | `docker`           | ✅ `running`            | `linux/amd64`, `linux/386` |



### 初始化Docker BuildKit 构建器

```shell
$ docker buildx inspect mybuilder --bootstrap
[+] Building 15.9s (1/1) FINISHED                                                             
 => [internal] booting buildkit                                                                         15.9s
 => => pulling image moby/buildkit:buildx-stable-1                                                      13.7s
 => => creating container buildx_buildkit_mybuilder0                                                     2.2s
Name:   mybuilder
Driver: docker-container

Nodes:
Name:      mybuilder0
Endpoint:  unix:///var/run/docker.sock
Status:    running
Platforms: linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/amd64/v4, linux/386
```



初始化构建器会启动一个容器

```shell
$ docker ps -a
CONTAINER ID   IMAGE                                  COMMAND                  CREATED         STATUS                   PORTS                       NAMES
0e7398f34933   moby/buildkit:buildx-stable-1          "buildkitd"              4 minutes ago   Up 4 minutes                                         buildx_buildkit_mybuilder0
```



再次查看构建器

```shell
$ docker buildx ls
NAME/NODE    DRIVER/ENDPOINT             STATUS  PLATFORMS
mybuilder *  docker-container                    
  mybuilder0 unix:///var/run/docker.sock running linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/amd64/v4, linux/386
default      docker                              
  default    default                     running linux/amd64, linux/386
```



## 构建镜像

### 构建单平台镜像

`--load` 添加与否的区别如下

| 构建命令                                                | 构建结果保存在哪里       | 是否支持多平台     | 是否可本地 `docker run` |
| ------------------------------------------------------- | ------------------------ | ------------------ | ----------------------- |
| `docker buildx build --platform linux/arm64 ...`        | ❌ **不保存**（仅缓存中） | ✅ 是               | ❌ 否                    |
| `docker buildx build --platform linux/arm64 ... --load` | ✅ 本地 Docker 镜像中     | ❌ 否（仅当前平台） | ✅ 是                    |

详细解释：

🚫 不加 `--load`：

- 构建产物只存在于 BuildKit 的**临时缓存中**
- **不会导入到本地镜像库**，你在 `docker images` 里看不到
- 如果没加 `--push`，你根本无法用 `docker run` 启动它
- 通常用于 **CI 构建+推送的中间步骤**

✅ 加了 `--load`：

- 构建好的镜像会被**加载进本地 `docker images` 仓库**

- 可以马上运行：

  ```shell
  docker run -it pptfz/phpldapadmin:1.2.5
  ```

- ⚠️ **只能构建单平台**（不能和 `--platform linux/amd64,linux/arm64` 一起用）



#### 构建x86架构

```shell
docker buildx build --platform linux/amd64 -t pptfz/phpldapadmin:1.2.5 . --load
```



#### 构建arm架构

```shell
docker buildx build --platform linux/arm64 -t pptfz/phpldapadmin:1.2.5 . --load
```





### 构建多平台镜像

执行构建命令并推送到远程仓库

:::tip 说明

如果在构建的时候不指定 `--push` 参数，则会有如下警告

因此**必须显式指定输出方式**，否则构建结果不会保存，也不会导入到本地 Docker 镜像库，因为 `buildx` 构建多平台镜像时，默认是运行在**独立容器**里（不是 `docker` 驱动），镜像并不会自动回到宿主机

```shell
$ docker buildx build --platform linux/amd64,linux/arm64 -t pptfz/phpldapadmin:1.2.5 . 
WARN[0000] No output specified for docker-container driver. Build result will only remain in the build cache. To push result image into registry use --push or to load image into docker use --load 
```

:::

```
docker buildx build --platform linux/amd64,linux/arm64 -t pptfz/phpldapadmin:1.2.5 . --push
```

