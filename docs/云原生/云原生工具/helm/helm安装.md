# helm安装

[helm github](https://github.com/helm/helm)

[helm官网](https://helm.sh/)



## 使用二进制安装

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="v4" label="v4" default>

<Tabs>
  <TabItem value="amd64" label="amd64" default>

```shell
export HELM_VERSION=4.1.0
export MACHINE=amd64
wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-${MACHINE}.tar.gz
```

  </TabItem>
  <TabItem value="arm64" label="arm64">

```shell
export HELM_VERSION=4.1.0
export MACHINE=arm64
wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-${MACHINE}.tar.gz
```

  </TabItem>
</Tabs>

  

</TabItem>
  <TabItem value="v3" label="v3">

<Tabs>
  <TabItem value="amd64" label="amd64" default>

```shell
export HELM_VERSION=3.20.0
export MACHINE=amd64
wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-${MACHINE}.tar.gz
```

  </TabItem>
  <TabItem value="arm64" label="arm64">

```shell
export HELM_VERSION=3.20.0
export MACHINE=arm64
wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-${MACHINE}.tar.gz
```

  </TabItem>
</Tabs>

  </TabItem>
</Tabs>





## 使用脚本安装

<Tabs>
  <TabItem value="v4" label="v4" default>

Helm现在有个安装脚本可以自动拉取最新的Helm版本并在 [本地安装](https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4)

```shell
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

  </TabItem>
  <TabItem value="v3" label="v3">

Helm现在有个安装脚本可以自动拉取最新的Helm版本并在 [本地安装](https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3)

```shell
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

  </TabItem>
</Tabs>

