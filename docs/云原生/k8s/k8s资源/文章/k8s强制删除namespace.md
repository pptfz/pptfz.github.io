# k8s强制删除namespace

## 背景说明

k8s1.22.2，安装 [kubespheres](https://github.com/kubesphere/kubesphere) 后，通过官方提供的yaml文件删除，结果发现有一部分的命名空间无法删除，一直处于 `Terminating` 状态，无法通过 

![iShot_2022-06-28_10.48.35](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-06-28_10.48.35.png)



## 1.启动proxy

> 使用 `--port` 参数指定端口，默认8001

```shell
kubectl proxy
```



## 2.导出json格式到文件

```shell
export MYNS=xxx
kubectl get namespace ${MYNS} -o json >tmp.json
```



## 3.编辑 `tmp.josn`，删除 `finalizers` 字段的值

> 删除以下内容

```json
"finalizers": [
            "finalizers.kubesphere.io/namespaces"
        ],
```



## 4.删除命名空间

```shell
curl -k -H "Content-Type: application/json" -X PUT --data-binary @tmp.json http://127.0.0.1:8001/api/v1/namespaces/${MYNS}/finalize
```



## 5.验证

![iShot_2022-06-28_13.01.58](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-06-28_13.01.58.png)