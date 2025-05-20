# argocd修改用户密码策略

[argocd-cm示例值官方文档](https://argo-cd.readthedocs.io/en/stable/operator-manual/argocd-cm-yaml/)



argocd更新admin密码提示如下

`Unable to update your password.: New password does not match the following expression: ^.{8,32}$.`

![iShot_2025-05-14_15.10.35](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-14_15.10.35.png)



可以在 cm `argocd-cm` 中修改 `data.passwordPattern` 字段来定义用户密码策略，默认是 `^.{8,32}$` ，即密码是以任意字符开头并且长度为8-32位

:::tip 说明

`^.{1,32}$` 是一个标准的正则表达式，含义是

- `^` 表示字符串的开始

- `.` 表示任意单个字符（除了换行符）

- `{8,32}` 是数量限定符，表示前面的模式（任意字符）必须出现至少8次，最多32次

- `$` 表示字符串的结束

还有更复杂的模式 `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$` 

- `^` - 表示字符串的开始

- `(?=.*[a-z])` - 这是一个前瞻断言(lookahead assertion)，要求密码中必须包含至少一个小写字母(a-z)
  - `?=` 是前瞻断言的标志
  - `.*` 表示任意数量的任意字符
  - `[a-z]` 表示任意一个小写字母

- `(?=.*[A-Z])` - 前瞻断言，要求密码中必须包含至少一个大写字母(A-Z)

- `(?=.*\\d)` - 前瞻断言，要求密码中必须包含至少一个数字(0-9)
  - `\\d` 在正则表达式中表示数字

- `(?=.*[@$!%*?&])` - 前瞻断言，要求密码中必须包含至少一个特殊字符(`@`, `$`, `!`, `%`, `*`, `?`, 或 `&`)

- `[A-Za-z\\d@$!%*?&]{8,}` - 定义允许包含的字符和长度:
  - `[A-Za-z\\d@$!%*?&]` 表示允许大小写字母、数字和指定的特殊字符
  - `{8,}` 表示至少8个字符

- `$` - 表示字符串的结束

简单来说，这个密码策略要求

```shell
1.密码长度至少为8个字符
2.必须包含至少一个小写字母
3.必须包含至少一个大写字母
4.必须包含至少一个数字
5.必须包含至少一个特殊字符(@, $, !, %, *, ?, 或 &)
6.只允许使用字母、数字和特定的特殊字符
```

:::

```yaml
$ k get cm argocd-cm -o yaml
apiVersion: v1
data:
  admin.enabled: "true"
  application.instanceLabelKey: argocd.argoproj.io/instance
  application.sync.impersonation.enabled: "false"
  exec.enabled: "false"
  passwordPattern: ^.{1,32}$
......
```



修改完cm后会自动生效