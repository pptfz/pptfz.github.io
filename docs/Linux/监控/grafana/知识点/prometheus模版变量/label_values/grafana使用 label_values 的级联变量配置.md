# grafana使用 `label_values` 的级联变量配置

grafana面板中当有如下配置时，选择不同的app后，相对应的pod是不能自动刷新的



| Variable     | Definition                       | 说明                                                      |
| ------------ | -------------------------------- | --------------------------------------------------------- |
| `datasource` | `prometheus`                     | prometheus数据源                                          |
| `app`        | `label_values(active_users,app)` | 从 `active_users` 这个指标中，提取所有不同的 `app` 标签值 |
| `pod`        | `label_values(active_users,pod)` | 从 `active_users` 这个指标中，提取所有不同的 `pod` 标签值 |



![iShot_2025-11-20_10.27.41](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-11-20_10.27.41.png)



可以在这个图中看到，当选择app  `python-demo` 后，显示的pod还是 `go-demo`

![iShot_2025-11-20_10.25.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-11-20_10.25.33.png)





需要在metric后增加 `{app="$app"}` 

`label_values(active_users,pod)` -> `label_values(active_users{app="$app"},pod)`



这里的 `app` 名称是metric指标中定义的名称

![iShot_2025-11-21_15.00.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-11-21_15.00.12.png)



| Variable     | Definition                                   | 说明                                                      |
| ------------ | -------------------------------------------- | --------------------------------------------------------- |
| `datasource` | `prometheus`                                 | prometheus数据源                                          |
| `app`        | `label_values(active_users,app)`             | 从 `active_users` 这个指标中，提取所有不同的 `app` 标签值 |
| `pod`        | `label_values(active_users{app="$app"},pod)` | 从 `active_users` 这个指标中，提取所有不同的 `pod` 标签值 |





![iShot_2025-11-21_14.08.14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-11-21_14.08.14.png)



配置完成后，选择不同的app右边的pod就会自动刷新了

![iShot_2025-11-21_14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-11-21_14.gif)