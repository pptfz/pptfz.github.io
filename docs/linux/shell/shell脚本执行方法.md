# shell脚本执行方法



**shell脚本5种执行方法**

| **执行方法** | **是否需要执行权限** | **是否在当前进程执行**                |
| ------------ | -------------------- | ------------------------------------- |
| **.**        | **不需要**           | **当前进程**                          |
| **source**   | **不需要**           | **当前进程**                          |
| **./**       | **需要**             | **子进程，不能读取当前shell中的变量** |
| **sh**       | **不需要**           | **子进程，不能读取当前shell中的变量** |
| **bash**     | **不需要**           | **子进程，不能读取当前shell中的变量** |



**脚本内容**

```python
cat >test.sh <<'EOF'
#!/usr/bin/env bash
#
cd /opt
EOF
```



**执行脚本**

```python
$ pwd
/root
$ sh test.sh
$ pwd			#会发现使用sh执行脚本切换路径未生效
/root
```



**问题：执行脚本后，理应切换到/opt，但是实际并没有**



**原因：执行脚本的时候，只是在当前的shell下开了一个子进程，切换目录的操作只对该进程中相关后续指令有效，但改变不了父进程的目录**



**解决方法：使用`.`或者`source`执行脚本**



**脚本的执行方法**

> **.  source 脚本可以没有执行权限，会在当前进程中执行**
>
> **./  sh  bash  执行脚本时，会启动一个子进程来运行脚本，不能读取当前shell中的变量**
>
> **以上五种方法中，只有./需要脚本有执行权限，其他四种不需要**





**测试**

**<span style={{color: 'red'}}>`.`</span>**

切换目录成功

```python
$ pwd
/root
$ . test.sh
$ pwd
/opt
```



**<span style={{color: 'red'}}>`source`</span>**

切换目录成功

```python
$ pwd
/root
$ source test.sh
$ pwd
/opt
```





**<span style={{color: 'red'}}>`./`</span>**

切换目录失败

```python
$ pwd
/root
$ ./test.sh
$ pwd
/root
```





**<span style={{color: 'red'}}>`sh`</span>**

切换目录失败

```python
$ pwd
/root
$ sh test.sh
$ pwd
/root
```



**<span style={{color: 'red'}}>`bash`</span>**

切换目录失败

```python
$ pwd
/root
$ bash test.sh
$ pwd
/root
```

