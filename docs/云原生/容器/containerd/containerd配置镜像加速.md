# containerd配置镜像加速

[containerd2.x版本镜像仓库配置官方文档](https://github.com/containerd/containerd/blob/main/docs/cri/registry.md)



## 编辑主配置文件

编辑 `/etc/containerd/config.toml` ，找到 `plugins.'io.containerd.cri.v1.images'.registry` ，修改 `config_path`

:::tip 说明

官方文档中写的内容是双引号，但是实际配置文件中是单引号

```yaml
[plugins."io.containerd.cri.v1.images".registry]
   config_path = "/etc/containerd/certs.d"
```

:::

```yaml
[plugins.'io.containerd.cri.v1.images'.registry]
  config_path = '/etc/containerd/certs.d'
```



用以下命令修改

```shell
sed -i "s|config_path = ''|config_path = '/etc/containerd/certs.d'|" /etc/containerd/config.toml
```



重启containerd

```shell
systemctl restart containerd
```



查看配置

```shell
$ containerd config dump | grep -A5 -B2 cri.v1.images

[plugins]
  [plugins.'io.containerd.cri.v1.images']
    snapshotter = 'overlayfs'
    disable_snapshot_annotations = true
    discard_unpacked_layers = false
    max_concurrent_downloads = 3
    concurrent_layer_fetch_buffer = 0
--
    use_local_image_pull = false

    [plugins.'io.containerd.cri.v1.images'.pinned_images]
      sandbox = 'registry.aliyuncs.com/google_containers/pause:3.10'

    [plugins.'io.containerd.cri.v1.images'.registry]
      config_path = '/etc/containerd/certs.d'

    [plugins.'io.containerd.cri.v1.images'.image_decryption]
      key_model = 'node'

  [plugins.'io.containerd.cri.v1.runtime']
    enable_selinux = false
    selinux_category_range = 1024
```





## 配置镜像仓库

创建目录

:::tip 说明

如果要配置多个镜像仓库，则创建相应的目录即可，如 `docker.io` 、`registry.k8s.io` 等

:::

```shell
[ -d /etc/containerd/certs.d/docker.io ] || mkdir -p /etc/containerd/certs.d/docker.io
[ -d /etc/containerd/certs.d/registry.k8s.io ] || mkdir -p /etc/containerd/certs.d/registry.k8s.io
```



创建 `hosts.toml`

`docker.io`

```yaml
tee /etc/containerd/certs.d/docker.io/hosts.toml >/dev/null <<'EOF'
server = "https://docker.io"

[host."https://docker.m.daocloud.io"]
  capabilities = ["pull", "resolve"]

[host."https://mirror.baidubce.com"]
  capabilities = ["pull", "resolve"]

[host."https://dockerproxy.com"]
  capabilities = ["pull", "resolve"]

[host."https://mirror.iscas.ac.cn"]
  capabilities = ["pull", "resolve"]

[host."https://huecker.io"]
  capabilities = ["pull", "resolve"]

[host."https://dockerhub.timeweb.cloud"]
  capabilities = ["pull", "resolve"]

[host."https://noohub.ru"]
  capabilities = ["pull", "resolve"]

[host."https://vlgh0kqj.mirror.aliyuncs.com"]
  capabilities = ["pull", "resolve"]
EOF
```



`registry.k8s.io`

```yaml
tee /etc/containerd/certs.d/registry.k8s.io/hosts.toml >/dev/null <<'EOF'
server = "https://registry.k8s.io"

[host."https://docker.m.daocloud.io"]
  capabilities = ["pull", "resolve"]

[host."https://mirror.baidubce.com"]
  capabilities = ["pull", "resolve"]

[host."https://dockerproxy.com"]
  capabilities = ["pull", "resolve"]

[host."https://mirror.iscas.ac.cn"]
  capabilities = ["pull", "resolve"]

[host."https://huecker.io"]
  capabilities = ["pull", "resolve"]

[host."https://dockerhub.timeweb.cloud"]
  capabilities = ["pull", "resolve"]

[host."https://noohub.ru"]
  capabilities = ["pull", "resolve"]

[host."https://vlgh0kqj.mirror.aliyuncs.com"]
  capabilities = ["pull", "resolve"]
EOF
```









