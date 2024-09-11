[toc]



# docker数据卷

## 1.docker挂载卷的方式

**方式一：宿主机创建一个卷，然后挂载到容器某一个路径下，适合做持久化**

**此方式将容器中的数据拷贝到宿主机的卷中，此时容器中的目录内容是什么决定了宿主机中的目录内容**



**方式二：直接将宿主机的某一个目录挂载到容器某一个路径下**

**此方式将宿主机的目录拷贝到容器的目录中，此时宿主机中的目录内容是什么决定了容器中的目录内容**



## 2.docker创建数据卷示例

### 2.1 创建一个名为 `docker-volume` 数据卷

```python
[root@docker1 ~]# docker volume create docker-volume
docker-volume
```



### 2.2 查看创建的数据卷

```python
[root@docker1 ~]# docker volume ls
DRIVER              VOLUME NAME
local               docker-volume
```



### 2.3 查看数据卷具体信息，存放的位置等

**默认存放于 `/var/lib/docker/volumes/docker-volume/_data`**

```python
[root@docker1 ~]# docker volume inspect docker-volume 
[
    {
        "CreatedAt": "2019-06-24T22:39:03+08:00",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/docker-volume/_data",
        "Name": "docker-volume",
        "Options": {},
        "Scope": "local"
    }
]
```



### 2.4 启动一个nginx容器，并将刚才创建的数据卷挂载到容器的 `/usr/share/nginx/html`

```python
[root@docker1 ~]# docker run -d -p 80:80 -v docker-volume:/usr/share/nginx/html nginx:latest 
36d6db627b83638ac9a03025c3f7b7b7fd0688ae4a8d3bf75b422ade4016c0a2

#参数说明
-d   后台运行
-p   端口映射
-v   卷名称:要挂载到容器的路径
```



### 2.5 浏览器访问刚启动的容器

![iShot_2024-08-23_11.00.12](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_11.00.12.png)





### 2.6  将nginx容器的默认显示界面重写

```python
[root@docker1 ~]# echo hehe > /var/lib/docker/volumes/docker-volume/_data/index.html 
```



### 2.7 再次访问容器，可以看到，内容已经变化

![iShot_2024-08-23_11.01.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_11.01.03.png)
