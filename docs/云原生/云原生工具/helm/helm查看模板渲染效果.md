# helm查看模板渲染效果

看渲染结果（不安装）

```shell
helm template chat .
```



指定 values

```shell
helm template chat . -f values.yaml
```



覆盖值

```shell
helm template chat . --set image.tag=v1.2.3
```



只看某一个模板文件

```shell
helm template chat . -s templates/deployment.yaml
```



校验模板是否有问题

```shell
helm lint .
```



模拟安装

```shell
helm install chat . --dry-run --debug
```



