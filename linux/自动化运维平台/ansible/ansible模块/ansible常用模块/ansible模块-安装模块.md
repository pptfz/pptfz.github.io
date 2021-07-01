# ansible模块-安装模块

## 1 yum安装软件模块

```python
ansible all -m yum -a "name=httpd state=installed"
```



| 参数               | 说明                   |
| ------------------ | ---------------------- |
| name               | 指定要安装的软件包名称 |
| state              | 关键字，指定使用的方法 |
| installed，present | 安装软件包             |
| removed，absent    | 移除软件包             |
| latest             | 安装最新软件包         |

