# kubevela安装

[kubevela github](https://github.com/kubevela/kubevela)

[kubevela官网](https://kubevela.io/)



## 安装KubeVela命令行

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="脚本" label="脚本" default>

```shell
curl -fsSl https://kubevela.io/script/install.sh | bash
```

  </TabItem>
  <TabItem value="homebrew" label="homebrew">

```shell
brew update && brew install kubevela
```

</TabItem>
  <TabItem value="二进制" label="二进制">

通过 [release log](https://github.com/kubevela/kubevela/releases) 下载二进制压缩文件，解压文件并将二进制文件移动到 `$PATH` 路径下

```shell
mv ./vela /usr/local/bin/vela
```

  </TabItem>

  <TabItem value="dcoker" label="docker">

```shell
docker run --rm -it -v ~/.kube:/root/.kube oamdev/vela-cli:version
```

  </TabItem>

</Tabs>



查看版本

```shell
$ vela version     
CLI Version: 1.10.3
Core Version: 
GitRevision: ef9b6f3cc10a4b6871b5698ca41fea3f6b3bcaec
GolangVersion: go1.24.3
```



## 安装KubeVela Core

<Tabs>
  <TabItem value="default" label="default" default>

```shell
vela install
```

  </TabItem>
  <TabItem value="helm" label="helm">

添加仓库

```shell
helm repo add kubevela https://kubevela.github.io/charts && helm repo up
```



下载包

```shell
helm pull kubevela/vela-core
```

  

解压缩

```
tar xf vela-core-1.10.3.tgz 
```



安装

```shell
helm upgrade --install kubevela -n vela-system --create-namespace .
```

</TabItem>
</Tabs>



查看安装

```shell
$ k get all
NAME                                           READY   STATUS    RESTARTS   AGE
pod/kubevela-cluster-gateway-bcb7c475f-tm77h   1/1     Running   0          95s
pod/kubevela-vela-core-6b49cc87b7-nvrf4        1/1     Running   0          95s

NAME                                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/kubevela-cluster-gateway-service   ClusterIP   10.96.243.5     <none>        9443/TCP   95s
service/vela-core-webhook                  ClusterIP   10.96.247.167   <none>        443/TCP    95s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/kubevela-cluster-gateway   1/1     1            1           95s
deployment.apps/kubevela-vela-core         1/1     1            1           95s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/kubevela-cluster-gateway-bcb7c475f   1         1         1       95s
replicaset.apps/kubevela-vela-core-6b49cc87b7        1         1         1       95s
```





## 安装VelaUX

VelaUX 是 KubeVela 的仪表板。 它是在你的集群中运行的 Web 应用程序。 你可以使用浏览器访问它。 如果你不使用 KubeVela 的 UI 控制台，这是可选的



```shell
$ vela addon enable velaux

Addon velaux enabled successfully.
Please access addon-velaux from the following endpoints:
+---------+---------------+-----------------------------------+--------------------------------+-------+
| CLUSTER |   COMPONENT   |     REF(KIND/NAMESPACE/NAME)      |            ENDPOINT            | INNER |
+---------+---------------+-----------------------------------+--------------------------------+-------+
| local   | velaux-server | Service/vela-system/velaux-server | velaux-server.vela-system:8000 | true  |
+---------+---------------+-----------------------------------+--------------------------------+-------+
    To open the dashboard directly by port-forward:

    vela port-forward -n vela-system addon-velaux 8000:8000

    Please refer to https://kubevela.io/docs/reference/addons/velaux for more VelaUX addon installation and visiting method.
```







```shell
$ vela addon enable velaux domain=kubevela.ops.com

Addon velaux enabled successfully.
Please access addon-velaux from the following endpoints:
+---------+---------------+-----------------------------------+--------------------------------+-------+
| CLUSTER |   COMPONENT   |     REF(KIND/NAMESPACE/NAME)      |            ENDPOINT            | INNER |
+---------+---------------+-----------------------------------+--------------------------------+-------+
| local   | velaux-server | Service/vela-system/velaux-server | velaux-server.vela-system:8000 | true  |
| local   | velaux-server | Ingress/vela-system/velaux-server | http://kubevela.ops.com        | false |
+---------+---------------+-----------------------------------+--------------------------------+-------+
    To open the dashboard directly by port-forward:

    vela port-forward -n vela-system addon-velaux 8000:8000

    Please refer to https://kubevela.io/docs/reference/addons/velaux for more VelaUX addon installation and visiting method.
```





用户名是 `admin` ，密码是 `VelaUX12345`

![iShot_2025-05-29_16.44.29](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-29_16.44.29.png)



登录后首页面

![iShot_2025-05-29_16.45.22](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-29_16.45.22.png)