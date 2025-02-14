# grafana图形显示配置记录

## Gauge

### 颜色

没有显示颜色

![iShot_2025-02-10_18.56.49](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-10_18.56.49.png)



在 `Standard options` -> `MIn` 处把 `auto` 修改为0即可

![iShot_2025-02-10_19.00.05](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-10_19.00.05.png)



### 显示

当有多个标签的时候，这里显示是不全的

![iShot_2025-02-11_16.48.20](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-11_16.48.20.png)



将 `Options` -> `Legend` 处选择 `Custom` 然后写入 `{{node}} {{instance}}` 即可

![iShot_2025-02-11_16.53.53](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-11_16.53.53.png)



鼠标悬浮



在 `Data links` 处，`Title` 填写 `${__field.labels.node} ${__field.labels.instance}` ，URL填写当前面板的id，可以在浏览器中查看到

![iShot_2025-02-11_16.58.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-11_16.58.44.png)

当鼠标悬浮到图形上的时候就会显示标签了

![iShot_2025-02-11_17.03.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-11_17.03.06.png)