# docker配置文件 `/etc/docker/daemon.json `

[docker配置文件可配置项](https://docs.docker.com/reference/cli/dockerd/#on-linux)

```json
{
  "allow-direct-routing": false,
  "authorization-plugins": [],
  "bip": "",
  "bip6": "",
  "bridge": "",
  "bridge-accept-fwmark": "",
  "builder": {
    "gc": {
      "enabled": true,
      "defaultReservedSpace": "10GB",
      "policy": [
        { "maxUsedSpace": "512MB", "keepDuration": "48h", "filter": [ "type=source.local" ] },
        { "reservedSpace": "10GB", "maxUsedSpace": "100GB", "keepDuration": "1440h" },
        { "reservedSpace": "50GB", "minFreeSpace": "20GB", "maxUsedSpace": "200GB", "all": true }
      ]
    }
  },
  "cgroup-parent": "",
  "containerd": "/run/containerd/containerd.sock",
  "containerd-namespace": "docker",
  "containerd-plugins-namespace": "docker-plugins",
  "data-root": "",
  "debug": true,
  "default-address-pools": [
    {
      "base": "172.30.0.0/16",
      "size": 24
    },
    {
      "base": "172.31.0.0/16",
      "size": 24
    }
  ],
  "default-cgroupns-mode": "private",
  "default-gateway": "",
  "default-gateway-v6": "",
  "default-network-opts": {},
  "default-runtime": "runc",
  "default-shm-size": "64M",
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  },
  "dns": [],
  "dns-opts": [],
  "dns-search": [],
  "exec-opts": [],
  "exec-root": "",
  "experimental": false,
  "features": {
    "cdi": true,
    "containerd-snapshotter": true
  },
  "firewall-backend": "",
  "fixed-cidr": "",
  "fixed-cidr-v6": "",
  "group": "",
  "host-gateway-ip": "",
  "hosts": [],
  "proxies": {
    "http-proxy": "http://proxy.example.com:80",
    "https-proxy": "https://proxy.example.com:443",
    "no-proxy": "*.test.example.com,.example.org"
  },
  "icc": false,
  "init": false,
  "init-path": "/usr/libexec/docker-init",
  "insecure-registries": [],
  "ip": "0.0.0.0",
  "ip-forward": false,
  "ip-masq": false,
  "iptables": false,
  "ip6tables": false,
  "ipv6": false,
  "labels": [],
  "live-restore": true,
  "log-driver": "json-file",
  "log-format": "text",
  "log-level": "",
  "log-opts": {
    "cache-disabled": "false",
    "cache-max-file": "5",
    "cache-max-size": "20m",
    "cache-compress": "true",
    "env": "os,customer",
    "labels": "somelabel",
    "max-file": "5",
    "max-size": "10m"
  },
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5,
  "max-download-attempts": 5,
  "mtu": 0,
  "no-new-privileges": false,
  "node-generic-resources": [
    "NVIDIA-GPU=UUID1",
    "NVIDIA-GPU=UUID2"
  ],
  "pidfile": "",
  "raw-logs": false,
  "registry-mirrors": [],
  "runtimes": {
    "cc-runtime": {
      "path": "/usr/bin/cc-runtime"
    },
    "custom": {
      "path": "/usr/local/bin/my-runc-replacement",
      "runtimeArgs": [
        "--debug"
      ]
    }
  },
  "seccomp-profile": "",
  "selinux-enabled": false,
  "shutdown-timeout": 15,
  "storage-driver": "",
  "storage-opts": [],
  "swarm-default-advertise-addr": "",
  "tls": true,
  "tlscacert": "",
  "tlscert": "",
  "tlskey": "",
  "tlsverify": true,
  "userland-proxy": false,
  "userland-proxy-path": "/usr/libexec/docker-proxy",
  "userns-remap": ""
}
```



## Builder（BuildKit 构建）

| 字段                              | 说明                                   |
| --------------------------------- | -------------------------------------- |
| `builder.gc.enabled`              | 是否开启 build cache 自动回收          |
| `builder.gc.defaultReservedSpace` | 默认预留空间                           |
| `builder.gc.policy`               | GC策略规则列表（空间、时间、过滤条件） |



## 网络 Network

| 字段                    | 说明                      |
| ----------------------- | ------------------------- |
| `allow-direct-routing`  | 允许直接路由              |
| `bip`                   | docker0 IPv4地址          |
| `bip6`                  | docker0 IPv6地址          |
| `bridge`                | 自定义 bridge 名          |
| `bridge-accept-fwmark`  | bridge 防火墙标记         |
| `default-address-pools` | docker network 默认网段池 |
| `default-gateway`       | 默认网关                  |
| `default-gateway-v6`    | IPv6网关                  |
| `default-network-opts`  | 默认网络选项              |
| `dns`                   | 容器DNS                   |
| `dns-opts`              | DNS选项                   |
| `dns-search`            | DNS search域              |
| `host-gateway-ip`       | host gateway IP           |
| `icc`                   | 容器互通                  |
| `ip`                    | daemon监听IP              |
| `ip-forward`            | IP转发                    |
| `ip-masq`               | IP伪装                    |
| `iptables`              | docker管理iptables        |
| `ip6tables`             | docker管理ip6tables       |
| `ipv6`                  | 启用IPv6                  |
| `mtu`                   | 网络MTU                   |
| `userland-proxy`        | 用户态代理                |
| `userland-proxy-path`   | proxy路径                 |



## 容器运行时 runtime

| 字段                           | 说明                      |
| ------------------------------ | ------------------------- |
| `containerd`                   | containerd socket文件路径 |
| `containerd-namespace`         | containerd namespace      |
| `containerd-plugins-namespace` | plugin namespace          |
| `default-runtime`              | 默认runtime               |
| `runtimes`                     | 自定义runtime列表         |
| `exec-opts`                    | exec选项                  |
| `exec-root`                    | exec目录                  |



## 存储 storage

| 字段             | 说明           |
| ---------------- | -------------- |
| `data-root`      | docker数据目录 |
| `storage-driver` | 存储驱动       |
| `storage-opts`   | 存储选项       |



## 日志 logging

| 字段         | 说明           |
| ------------ | -------------- |
| `log-driver` | 日志驱动       |
| `log-format` | 日志格式       |
| `log-level`  | 日志级别       |
| `log-opts`   | 日志轮转等参数 |
| `raw-logs`   | 原始日志       |



## 安全 security

| 字段                    | 说明                |
| ----------------------- | ------------------- |
| `authorization-plugins` | 授权插件            |
| `group`                 | docker socket group |
| `init`                  | 启用init            |
| `init-path`             | init路径            |
| `no-new-privileges`     | 禁止提权            |
| `seccomp-profile`       | seccomp配置         |
| `selinux-enabled`       | SELinux             |
| `tls`                   | TLS                 |
| `tlscacert`             | CA                  |
| `tlscert`               | cert                |
| `tlskey`                | key                 |
| `tlsverify`             | TLS校验             |
| `userns-remap`          | 用户namespace       |



## 资源限制 resource

| 字段                     | 说明         |
| ------------------------ | ------------ |
| `cgroup-parent`          | cgroup父级   |
| `default-cgroupns-mode`  | 默认cgroupns |
| `default-shm-size`       | 默认shm大小  |
| `default-ulimits`        | 默认ulimit   |
| `node-generic-resources` | 节点资源标签 |



## Registry / Proxy

| 字段                              | 说明                   |
| --------------------------------- | ---------------------- |
| `registry-mirrors`                | 镜像加速               |
| `insecure-registries`             | http registry          |
| `proxies`                         | docker代理             |
| `features.containerd-snapshotter` | containerd snapshotter |
| `features.cdi`                    | CDI设备支持            |



## 性能 performance

| 字段                       | 说明               |
| -------------------------- | ------------------ |
| `max-concurrent-downloads` | 并发pull           |
| `max-concurrent-uploads`   | 并发push           |
| `max-download-attempts`    | pull重试次数       |
| `shutdown-timeout`         | daemon关闭等待时间 |



## Swarm / 集群

| 字段                           | 说明          |
| ------------------------------ | ------------- |
| `swarm-default-advertise-addr` | swarm广播地址 |



## 其他

| 字段               | 说明                 |
| ------------------ | -------------------- |
| `debug`            | debug模式            |
| `experimental`     | 实验功能             |
| `fixed-cidr`       | 固定CIDR             |
| `fixed-cidr-v6`    | IPv6 CIDR            |
| `hosts`            | daemon监听socket     |
| `labels`           | daemon标签           |
| `live-restore`     | daemon重启容器不中断 |
| `pidfile`          | pid文件              |
| `firewall-backend` | 防火墙后端           |



