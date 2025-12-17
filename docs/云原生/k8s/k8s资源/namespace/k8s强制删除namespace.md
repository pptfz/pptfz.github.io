# k8s强制删除namespace

## 背景说明

手动删除ns后发现一直处于 `Terminating` 状态，无法删除

```shell
$ k get ns
NAME                    STATUS        AGE
apisix                  Active        25d
calico-apiserver        Active        116d
calico-system           Active        116d
default                 Active        116d
devops                  Active        101d
envoy-gateway-system    Active        4d
envoygateway            Terminating   21m
gitea                   Active        24d
```



## 启动proxy

:::tip 说明

可以使用 `--port` 参数指定端口，不指定默认8001

:::

```shell
kubectl proxy
```



## 导出json格式到文件

```shell
export MYNS=envoygateway
kubectl get namespace ${MYNS} -o json > tmp.json
```



## 编辑 `tmp.josn`，删除 `finalizers` 字段的值

:::tip 说明

删除 `finalizers` 字段

:::

```json
"finalizers": [
            "xxx"
        ],
```



## 删除命名空间

```shell
curl -k -H "Content-Type: application/json" -X PUT --data-binary @tmp.json http://127.0.0.1:8001/api/v1/namespaces/${MYNS}/finalize
```





## 验证

```
$ k get ns
NAME                    STATUS   AGE
apisix                  Active   25d
calico-apiserver        Active   116d
calico-system           Active   116d
default                 Active   116d
devops                  Active   101d
envoy-gateway-system    Active   4d
gitea                   Active   24d
harbor                  Active   106d
```



## 也可以使用如下命令进行删除

```shell
export NS=xxx
kubectl get namespace $NS -o json \
  | jq 'del(.spec.finalizers)' \
  | kubectl replace --raw "/api/v1/namespaces/$NS/finalize" -f -
```

