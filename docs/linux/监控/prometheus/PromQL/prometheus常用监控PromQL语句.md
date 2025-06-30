# prometheus常用监控PromQL语句

## node节点

相关指标说明

| 指标                         | 说明                                               |
| ---------------------------- | -------------------------------------------------- |
| `node_memory_MemTotal_bytes` | 表示系统的总内存大小，单位为字节                   |
| `node_memory_MemFree_bytes`  | 表示系统当前空闲的内存大小，单位为字节             |
| `node_memory_Buffers_bytes`  | 表示用于块设备 I/O 缓存的内存大小，单位为字节      |
| `node_memory_Cached_bytes`   | 表示页面缓存和 Slab 缓存使用的内存大小，单位为字节 |



### 内存

#### 包含缓存和缓冲区

```q
100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))
```

默认显示如下，会把所有标签全部显示

![iShot_2025-02-08_16.22.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-08_16.22.44.png)



如果只想要显示节点名称、节点ip则可以使用 `avg`

```q
avg by (node, instance) (100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)))
```

这样就会显示 `node(节点名称)` 和 `instance(节点ip)`

![iShot_2025-02-08_16.26.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-02-08_16.26.01.png)



#### 不包含缓存和缓冲区

```q
avg by (node, instance) (100 * (1 - ((node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes) / node_memory_MemTotal_bytes)))
```





内存使用率  
$$
\displaystyle
\text{内存使用率} = \frac{\text{总内存} - (\text{空闲内存} + \text{缓冲区内存} + \text{缓存内存})}{\text{总内存}} \times 100\%
$$














