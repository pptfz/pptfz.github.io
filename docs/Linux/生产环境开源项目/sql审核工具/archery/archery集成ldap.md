# archery集成ldap

[archery集成ldap](https://github.com/hhyo/archery/wiki/auth#%E9%9B%86%E6%88%90ldap)



编辑 `.env` 文件，写入以下内容

```shell
ENABLE_LDAP=True
AUTH_LDAP_SERVER_URI='ldap://10.31.0.17:389'
AUTH_LDAP_BIND_DN='cn=xxx,dc=xxx,dc=xxx'
AUTH_LDAP_BIND_PASSWORD='xxx'
#AUTH_LDAP_USER_DN_TEMPLATE='uid=%(user)s,ou=people,dc=xxx,dc=xxx'
AUTH_LDAP_ALWAYS_UPDATE_USER=True
AUTH_LDAP_USER_ATTR_MAP={'username'='uid','name'='sn','email'='mail'}
AUTH_LDAP_USER_SEARCH_BASE='dc=xxx,dc=xxx'
```





配置完成后重启 `archery` 容器，日志输出如下 

```shell
2026-01-15 10:12:26,670 - archery.settings - INFO - 当前生效的外部认证方式：LDAP
2026-01-15 10:12:26,671 - archery.settings - INFO - 认证后端：('django_auth_ldap.backend.LDAPBackend', 'django.contrib.auth.backends.ModelBackend')
```





最好 [设置默认资源组和默认权限组](https://archerydms.com/home/#_15) ，新用户第一次登陆时会自动关联，可避免用户登陆后出现的无权限报错问题



![iShot_2026-01-15_17.22.20](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-15_17.22.20.png)



 `archery` 容器日志报错如下

```shell
[2026-01-15 10:16:47,934][MainThread:140663319430976][task_id:default][exception_logging_middleware.py:12][ERROR]- Traceback (most recent call last):
  File "/opt/venv4archery/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 22, in _wrapped_view
    if test_func(request.user):
       ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 78, in check_perms
    raise PermissionDenied
django.core.exceptions.PermissionDenied

2026-01-15 10:16:47,934 - default - ERROR - Traceback (most recent call last):
  File "/opt/venv4archery/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 22, in _wrapped_view
    if test_func(request.user):
       ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 78, in check_perms
    raise PermissionDenied
django.core.exceptions.PermissionDenied

2026-01-15 10:16:47,969 - django.request - WARNING - Forbidden (Permission denied): /sqlworkflow_list/
Traceback (most recent call last):
  File "/opt/venv4archery/lib/python3.11/site-packages/django/core/handlers/exception.py", line 56, in inner
    response = get_response(request)
               ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 22, in _wrapped_view
    if test_func(request.user):
       ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/contrib/auth/decorators.py", line 78, in check_perms
    raise PermissionDenied
django.core.exceptions.PermissionDenied
```













