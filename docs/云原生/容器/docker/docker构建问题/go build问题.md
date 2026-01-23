# go build问题

## 构建过程

执行构建命令

```shell
go build -o rpc
```



`Dockerfile` 内容

```dockerfile
FROM alpine:3.20

WORKDIR /app

# 时区、证书等基础环境
RUN apk add --no-cache ca-certificates tzdata && \
    update-ca-certificates

# 拷贝可执行文件
COPY rpc /app/rpc

# 拷贝配置文件
COPY etc ./etc

# 暴露端口
EXPOSE 8080

# 运行命令
ENTRYPOINT ["/app/rpc"]
```



## 报错

发布到k8s中后pod报错

```shell
$ k logs -f demo-rpc-7bd9d76d7f-2fbf9
exec /app/rpc: no such file or directory
```



## 原因

`go build -o rpc` 这会导致：

- **CGO 默认开启**

- 二进制 **动态链接 glibc**

- 生成的 ELF 需要：

  ```shell
  /lib64/ld-linux-x86-64.so.2
  ```

但运行镜像是

```
FROM alpine:3.20
```



Alpine 用的是 **musl libc**，它只有：

```
/lib/ld-musl-x86_64.so.1
```



❌ **glibc 的动态链接器根本不存在**

所以内核在 exec 时直接失败

```
no such file or directory
```



正确构建命令

:::tip 说明

以下命令效果是：

- 禁用 CGO
- 生成 **纯 Go 静态二进制**
- 不依赖 glibc / musl / 动态链接器

:::

```shell
CGO_ENABLED=0 \
GOOS=linux \
GOARCH=amd64 \
go build -o rpc
```


## 总结

### Go 二进制 × libc × 镜像 关系对照图

```shell
ASCII┌──────────────────────────────────────────────────────────────┐
│                     Go 编译产物类型                           │
├───────────────┬──────────────────┬───────────────────────────┤
│ 编译方式      │ 二进制类型        │ 关键依赖                  │
├───────────────┼──────────────────┼───────────────────────────┤
│ CGO_ENABLED=1 │ 动态链接 ELF     │ glibc / musl + ld.so       │
│ CGO_ENABLED=0 │ 静态链接 ELF     │ ❌ 无 libc 依赖            │
└───────────────┴──────────────────┴───────────────────────────┘
```



### libc 与 Linux 发行版关系

```shell
┌───────────────┬────────────────────┬─────────────────────────┐
│ 发行版        │ 使用的 libc        │ 动态链接器路径          │
├───────────────┼────────────────────┼─────────────────────────┤
│ Debian / Ubuntu│ glibc              │ /lib64/ld-linux-x86-64… │
│ CentOS / RHEL │ glibc              │ /lib64/ld-linux-x86-64… │
│ Alpine        │ musl               │ /lib/ld-musl-x86_64.so.1│
│ scratch       │ ❌ 无 libc          │ ❌ 无                   │
└───────────────┴────────────────────┴─────────────────────────┘
```



### 为什么 Alpine 常见 `no such file or directory`

```shell
你在 Ubuntu 上编译：
┌──────────────────────────┐
│ rpc (ELF)                │
│ 需要:                    │
│ /lib64/ld-linux-x86-64…  │ ← glibc
└──────────┬───────────────┘
           │ COPY
           ▼
┌──────────────────────────┐
│ Alpine 容器              │
│ /lib/ld-musl-x86_64.so.1 │
│ ❌ 没有 glibc             │
└──────────┬───────────────┘
           ▼
      exec 失败
      ❌ no such file or directory
```

⚠️ **报错不是“文件不存在”，而是“解释器不存在”**



### 镜像 × Go 编译方式推荐矩阵（重点）

```shell
┌───────────────┬──────────────┬────────────────────────────┐
│ 镜像          │ Go 编译方式  │ 是否推荐                   │
├───────────────┼──────────────┼────────────────────────────┤
│ Ubuntu        │ CGO=1        │ ✅ 可用（镜像大）           │
│ Ubuntu        │ CGO=0        │ ✅ 推荐                     │
│ Alpine        │ CGO=1        │ ⚠️ 极易踩坑                 │
│ Alpine        │ CGO=0        │ ✅ 强烈推荐                 │
│ scratch       │ CGO=1        │ ❌ 绝对不行                 │
│ scratch       │ CGO=0        │ ✅ 最优（最小镜像）         │
└───────────────┴──────────────┴────────────────────────────┘
```







