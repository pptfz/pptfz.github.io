# mac同时安装docker desktop和orbstack的问题

## 问题说明

在mac上先安装了 [docker desktop](https://docs.docker.com/desktop/install/mac-install/) ，然后在安装 [orbstack](https://github.com/orbstack/orbstack) ，就会涉及到上下文的问题，可以查看 [orbstack](https://docs.orbstack.dev/install#docker-context) 的官方说明



## docker上下文

查看docker上下文

```shell
$ docker context list
NAME                TYPE                DESCRIPTION                               DOCKER ENDPOINT                                 KUBERNETES ENDPOINT   ORCHESTRATOR
default             moby                Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                                           
desktop-linux *     moby                Docker Desktop                            unix:///Users/pptfz/.docker/run/docker.sock                           
orbstack            moby                OrbStack                                  unix:///Users/pptfz/.orbstack/run/docker.sock       
```



切换docker上下文

```shell
$ docker context use orbstack
orbstack
Current context is now "orbstack"
```



查看当前使用的上下文

```shell
$ docker context show
orbstack
```



## k8s上下文

查看k8s上下文

```shell
$ kubectl config get-contexts
CURRENT   NAME               CLUSTER            AUTHINFO           NAMESPACE
*         kind-ops-ingress   kind-ops-ingress   kind-ops-ingress   
          orbstack           orbstack           orbstack           
```



切换k8s上下文

```shell
$ kubectl config use-context orbstack
Switched to context "orbstack".
```



