# superset安装



[superset官网](https://superset.apache.org/)

[superset github地址](https://github.com/apache/superset)

[superset 官方文档](https://superset.apache.org/docs/intro)



superset简介

> 





# 一、pip安装

## 1.1 安装依赖包

```sh
yum -y install gcc gcc-c++ libffi-devel python-devel python-pip python-wheel openssl-devel cyrus-sasl-devel openldap-devel
```





```
pip install apache-superset
```











```
(superset) [root@emr-route01 virtualenv]# superset db upgrade
Traceback (most recent call last):
  File "/usr/local/virtualenv/superset/bin/superset", line 5, in <module>
    from superset.cli import superset
  File "/usr/local/virtualenv/superset/lib/python3.6/site-packages/superset/__init__.py", line 21, in <module>
    from superset.app import create_app
  File "/usr/local/virtualenv/superset/lib/python3.6/site-packages/superset/app.py", line 45, in <module>
    from superset.security import SupersetSecurityManager
  File "/usr/local/virtualenv/superset/lib/python3.6/site-packages/superset/security/__init__.py", line 17, in <module>
    from superset.security.manager import SupersetSecurityManager  # noqa: F401
  File "/usr/local/virtualenv/superset/lib/python3.6/site-packages/superset/security/manager.py", line 44, in <module>
    from superset import sql_parse
  File "/usr/local/virtualenv/superset/lib/python3.6/site-packages/superset/sql_parse.py", line 18, in <module>
    from dataclasses import dataclass
ModuleNotFoundError: No module named 'dataclasses'
```





```
pip install dataclasses
```



```
(superset) [root@emr-route01 virtualenv]# superset db upgrade
logging was configured successfully
INFO:superset.utils.logging_configurator:logging was configured successfully
/usr/local/virtualenv/superset/lib/python3.6/site-packages/flask_caching/__init__.py:192: UserWarning: Flask-Caching: CACHE_TYPE is set to null, caching is effectively disabled.
  "Flask-Caching: CACHE_TYPE is set to null, "
No PIL installation found
INFO:superset.utils.screenshots:No PIL installation found
WARNI [alembic.env] SQLite Database support for metadata databases will         be removed in a future version of Superset.
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
```





```
export FLASK_APP=superset
```





```
angj72n2D!l$a
```





```
nohup superset run -p 8088 --with-threads --reload --debugger &
```







安装依赖

```
pip install  pyPhoenix phoenixdb
```













```
'<' not supported between instances of 'str' and 'NoneType'
```

