# debian镜像源加速

[阿里云 debian镜像源加速](https://developer.aliyun.com/mirror/debian?spm=a2c6h.13651102.0.0.3e221b11WX2lVz)



以下为debian12镜像源加速配置

```shell
cat > /etc/apt/sources.list << EOF
deb https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
EOF
```







