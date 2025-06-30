[toc]



# Linux用户组管理

## Linux用户管理

### useradd命令创建用户过程

1.检查参数和选项

- `useradd` 解析传入的选项，如 `-u`（UID）、`-g`（主组）、`-G`（附加组）、`-d`（主目录）、`-s`（Shell）、`-c`（用户信息）等



2.选择 `UID` 和 `GID`

- 如果未指定 UID，则系统会从 `/etc/login.defs` 读取 `UID_MIN` 和 `UID_MAX`，自动分配可用的 UID

  ```shell
  $ egrep -v '^$|#' /etc/login.defs
  MAIL_DIR	/var/spool/mail
  UMASK		022
  HOME_MODE	0700
  PASS_MAX_DAYS	99999
  PASS_MIN_DAYS	0
  PASS_WARN_AGE	7
  UID_MIN                  1000
  UID_MAX                 60000
  SYS_UID_MIN               201
  SYS_UID_MAX               999
  SUB_UID_MIN		   100000
  SUB_UID_MAX		600100000
  SUB_UID_COUNT		    65536
  GID_MIN                  1000
  GID_MAX                 60000
  SYS_GID_MIN               201
  SYS_GID_MAX               999
  SUB_GID_MIN		   100000
  SUB_GID_MAX		600100000
  SUB_GID_COUNT		    65536
  ENCRYPT_METHOD YESCRYPT
  USERGROUPS_ENAB yes
  CREATE_HOME	yes
  HMAC_CRYPTO_ALGO SHA512
  ```

  

- 如果未指定主组，则 `useradd` 会创建与用户名相同的组（除非使用 `-N` 选项）



3.更新 `/etc/passwd` 和 `/etc/shadow`

- `useradd` 在 `/etc/passwd` 添加用户记录，例如

  ```shell
  username:x:1001:1001:User Info:/home/username:/bin/bash
  ```

  创建一个 `test` 用户

  ```shell
  $ grep test /etc/passwd
  test:x:1002:1002::/home/test:/bin/bash
  ```

- 在 `/etc/shadow` 添加密码字段（加密存储）

  ```shell
  username:!!:19453:0:99999:7:::
  ```

  查看 `test` 用户

  :::tip 说明

  这里的 `!!` 表示密码未设置，需要 `passwd username` 进行设置

  :::

  ```shell
  $ grep test /etc/shadow
  test:!!:20172:0:99999:7:::
  ```

  

4.更新 `/etc/group`

- 如果指定了附加组（`-G`），`useradd` 会在 `/etc/group` 中更新相关组的成员列表

  ```shell
  $ grep test /etc/group
  test:x:1002:
  ```



5.创建用户主目录（可选）

- 如果使用 `-m`(默认) 选项，`useradd` 会在 `/home` 下创建 `username` 目录，并从 `/etc/skel` 复制默认配置文件（如 `.bashrc`、`.profile`）



6.设置默认 `shell`

- 若未指定 `-s`，默认使用 `/etc/default/useradd` 中的 `SHELL` 配置

  ```shell
  $ cat /etc/default/useradd 
  # useradd defaults file
  GROUP=100
  HOME=/home
  INACTIVE=-1
  EXPIRE=
  SHELL=/bin/bash
  SKEL=/etc/skel
  CREATE_MAIL_SPOOL=yes
  ```

  

7.应用 SELinux/ACL 设置（如适用）

- 在 SELinux 启用的系统上，可能会使用 `restorecon` 设置正确的 SELinux 上下文。
- 若系统启用了 ACL，则会根据 `/etc/login.defs` 进行相关操作



创建完成后，你可以用 `id 用户名` 或 `getent passwd 用户名` 来检查用户信息

`id` 命令

```shell
$ id test
uid=1002(test) gid=1002(test) groups=1002(test)
```



`getent` 命令

```shell
$ getent passwd test
test:x:1002:1002::/home/test:/bin/bash
```





### 用户配置文件

#### `/etc/passwd`

- 作用

  - 存储用户信息文件，每一行表示一个用户信息，有多少行就表示有多少个用户

- 格式

  - `test : x : 1002 : 1002 : : /home/test : /bin/bash`
  
    ```shell
    $ grep test /etc/passwd
    test:x:1002:1002::/home/test:/bin/bash
    ```

- 格式含义(此文件由7个字段的数据组成，字段之间用 `:`分隔)
- `1用户名：2密码：3用户标识号UID：4组标识号GID：5个人资料：6主目录：7命令解释器`



#### `/etc/shadow`

- 作用

  - 存储用户密码信息文件

- 格式

  - `u1 : !! : 17749 : 0 : 99999 : 7 : : :`

- 格式含义(此文件由9个字段的数据组成，字段之间用 `:` 分隔)

  - `1用户名: 2密码 ！！表示没有密码: 3最近改动密码的日期: 4密码不可被更动的天数: 5密码需要重新变更的天数: 6密码需要变更期限前的警告期限: 7密码过期的宽限时间: 8帐号失效日期: 9:保留`
  
  

#### `/etc/skel(目录)`

- 作用

  创建用户相关的目录，此目录用来存放新用户需要的所有基础环境变量文件

  ```shell
  $ ll -a /etc/skel/
  total 28
  drwxr-xr-x  2 root root   76 Nov 10 12:23 .
  drwxr-xr-x 97 root root 8192 Mar 25 18:38 ..
  -rw-r--r--  1 root root   18 May 29  2024 .bash_logout
  -rw-r--r--  1 root root  141 May 29  2024 .bash_profile
  -rw-r--r--  1 root root  376 May 29  2024 .bashrc
  -rw-r--r--  1 root root  188 Jan  8  2024 .zshrc
  ```
  
  

与 `/etc/skel` 有关的问题

用户u1登陆系统后提示符如下

```shell
-bash-4.1$
```



原因

用户家目录下的相关环境配置文件被删除



解决方法

复制 `/etc/skel` 下的 `.bash*` 到用户家目录

```shell
cp /etc/skel/.bash* ~
```



### 组配置文件

#### `/etc/group`

- 作用

  - 存储组相关信息

- 格式

  - `test: x : 500 :`

- 格式含义(此文件由4个字段的数据组成，字段之间用 `:` 分隔)
- `1组名: 2组密码: 3组管理员: 4用户组成员`



#### `/etc/gshadow`

- 作用
  - 存储组密码信息
  
- 格式

  - `test : ! : :`

- 格式含义(此文件由4个字段的数据组成，字段之间用 `:` 分隔)
- `1组名: 2组密码: 3组管理员: 4用户组成员`



### Linux用户分类

#### 管理员用户

- 默认是root用户，`UID` 和 `GID` 均为0，拥有最高的管理权限

#### 普通用户

- 由系统管理员root创建，创建完成后可以登录系统，但默认无法创建、修改和删除任何管理员下的文件；UID范围 `1000-60000`

#### 系统用户(或虚拟用户)

- 安装系统后默认生成的用户，大多数不能登录系统，但它们是系统正常运行不可缺少的，它们的存在主要是为了方便系统管理，满足相应的系统进程对文件所属用户的要求；UID范围 1-999



### 用户相关命令

#### `useradd`	创建用户

语法格式

- `useradd 选项 用户名`

选项

| 选项 | 说明                                       |
| ---- | ------------------------------------------ |
| `-n` | 不创建以用户名为名的组                     |
| `-c` | 创建用户时，添加个人信息                   |
| `-u` | 用户ID值，这个值必须是唯一的               |
| `-s` | 用户登录后使用的shell                      |
| `-g` | 指定用户对应的组，对应的组必须在系统中存在 |
| `-M` | 不创建用户家目录                           |





#### `usermod`	修改用户

语法格式

- `usermod 选项 用户名`



选项

:::tip 说明

`usermod` 只有 `-l` 选项与 `useradd` 不同

:::

| 选项 | 说明                                                     |
| ---- | -------------------------------------------------------- |
| `-c` | 修改用户的个人信息，同 `useradd` 的 `-c` 功能            |
| `-g` | 修改用户对应的用户组，同 `useradd` 的 `-d` 功能          |
| `-s` | 修改用户登录后使用的shell名称，同 `useradd` 的 `-s` 功能 |
| `-u` | 修改用户的uid ，同 `useradd` 的 `-u` 功能                |
| `-l` | 修改用户的名称，`usermod -l  新用户名称  旧用户名称`     |



#### userdel	删除用户

语法格式

- `userdel 选项 用户名`

选项

:::tip 说明

当使用 `-r` 也无法彻底清空用户内容时，把以下两个配置文件中与要删除的用户相关的信息，注释或删除掉

`/etc/passwd `

`/etc/group`

:::

| 选项 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| `-f` | 强制删除用户                                                 |
| `-r` | 删除用户的同时，删除与用户相关的所有文件(包含邮箱信息 `/var/spool/mail`) |





#### passwd	修改用户密码

命令格式

- `passwd 选项 用户名`

选项

| 选项                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `--stdin`                 | 非交互式设置密码                                             |
| `-d`                      | 删除密码                                                     |
| `-l`                      | 锁定密码                                                     |
| `-u`                      | 解锁密码                                                     |
| `-S`                      | 显示账户状态信息                                             |
| `-w,--warndays WARN_DAYS` | 设置密码需要修改前发出警告的天数                             |
| `-x, --maxdays MAX_DAYS`  | 设置密码有效的最大天数                                       |
| `-i, --inactive INACTIVE` | 设置密码过期几天后禁用该账户                                 |
| `-n, --mindays MIN_DAYS`  | 设置密码修改的最小天数间隔为 `MIN_DAYS`                      |
| `-e, --expire`            | 使一个账户的密码立即过期，这实际上强迫用户在下次登录时修改密码 |



- `--stdin` 非交互式设置密码

  ```shell
  $ echo 123abc|passwd --stdin test
  Changing password for user test.
  passwd: all authentication tokens updated successfully.
  ```

  

- `-d` 删除密码

  ```shell
  $ passwd -d test
  Removing password for user test.
  passwd: Success
  ```

  

- `-l` 锁定密码

  锁定用户密码

  ```shell
  $ passwd -l test
  Locking password for user test.
  passwd: Success
  ```

  

  锁定用户的密码后，其他用户就无法登陆用户，会提示认证失败

  ```shell
  [root@rocky1 ~]# passwd -l test
  Locking password for user test.
  passwd: Success
  [root@rocky1 ~]# su - hehe
  Last login: Wed Mar 26 11:01:42 CST 2025 on pts/1
  [hehe@rocky1 ~]$ su - test
  Password: 
  su: Authentication failure
  [hehe@rocky1 ~]$ 
  logout
  [root@rocky1 ~]# passwd -u test
  Unlocking password for user test.
  passwd: Success
  [root@rocky1 ~]# su - hehe
  Last login: Wed Mar 26 11:02:08 CST 2025 on pts/1
  [hehe@rocky1 ~]$ su - test
  Password: 
  Last login: Wed Mar 26 11:01:44 CST 2025 on pts/1
  Last failed login: Wed Mar 26 11:02:12 CST 2025 on pts/1
  There was 1 failed login attempt since the last successful login.
  ```





- `-u` 解锁密码

  ```shell
  $ passwd -u test
  Unlocking password for user test.
  passwd: Success
  ```





- `-S` 显示账户状态信息

  :::tip 说明

  | 字段                            | 说明                                                         |
  | ------------------------------- | ------------------------------------------------------------ |
  | `test`                          | 用户名                                                       |
  | `PS`                            | 用户密码状态<br />P(PS)    密码已设置（Password set）<br />L    密码被锁定（Locked）<br />NP    没有密码（No Password）<br />LK    密码锁定（Locked，和 L 类似）<br />NP LK    既无密码又被锁定（No Password & Locked） |
  | `2025-03-26`                    | 最近一次修改密码的日期（`YYYY-MM-DD` 格式）                  |
  | `0`                             | 最小密码修改天数，即至少等待多少天才能修改密码（0 表示随时可改） |
  | `99999`                         | 密码最大有效期，即密码过期前的最大天数（99999 表示密码永不过期） |
  | `7`                             | 密码过期前的提醒天数，即在密码过期前多少天提醒用户           |
  | `-1`                            | 密码过期后宽限天数，即密码过期后还能用多少天（-1 表示禁用此功能） |
  | `(Password set, SHA512 crypt.)` | 密码已设置并使用 `SHA512` 加密存储                           |

  :::

  ```shell
  $ passwd -S test
  test PS 2025-03-26 0 99999 7 -1 (Password set, SHA512 crypt.)
  ```

  

  

- `-w,--warndays WARN_DAYS` 设置密码需要修改前发出警告的天数

  `WARN_DAYS` 选项是密码过期前的天数，据到期日这些天数时，用户将被警告其密码即将过期



- `-x, --maxdays MAX_DAYS` 设置密码有效的最大天数

  `MAX_DAYS` 天数后，密码需要修改



- `-i, --inactive INACTIVE` 此选项用于在密码过期几天后禁用该账户

  用户账号的密码过期 `INACTIVE` 指定的天数后，该用户将无法再登录此账号

  

- `-n, --mindays MIN_DAYS` 设置密码修改的最小天数间隔为 `MIN_DAYS`

  此字段设为0表示可以随时修改其密码

  

- `-e, --expire` 使一个账户的密码立即过期。这实际上强迫用户在下次登录时修改密码

  

#### `su`	切换用户

不加 `-` 	直接切换到root家目录，环境变量没有改变

```shell
$ su test
$ pwd
/root
$ ls
ls: cannot open directory '.': Permission denied
$ cd /
$ ls
afs           boot  home   Library  opt      root  selinux  tmp    var
Applications  dev   lib    media    private  run   srv      Users  Volumes
bin           etc   lib64  mnt      proc     sbin  sys      usr
```



加 `-` 	切换到自己的家目录，环境变量改变

```shell
$ su - test
$ pwd
/home/test
```



#### `sudo`	用户授权

- 作用

  通过配置文件来限制用户的权限 ，可以让普通用户在执行指定的命令或程序时，拥有超级用户的权限

  

- `sudo` 工作过程

  - `sudo` 读取 `/etc/sudoers` 及 `/etc/sudoers.d/` 目录中的规则，检查当前用户是否有权限执行该命令

  - 询问用户密码（可选），如果 `NOPASSWD` 没有配置，`sudo` 会要求输入用户密码

    ```shell
    [sudo] password for user:
    ```

  - `sudo` 切换到 root 或目标用户
    - `sudo` 通过 `seteuid()` 变更进程的 `UID` 为 `root`（或指定用户）
    - 在 `sudo -u another-user` 情况下，进程 `UID` 切换为 `another-user`

  - `sudo` 设置环境变量

    - 继承或修改部分环境变量

      ```shell
      SUDO_USER：原始用户
      
      SUDO_COMMAND：执行的命令
      
      SUDO_UID / SUDO_GID：用户的 UID/GID
      ```

    - `sudo -i` 或 `sudo -s` 可模拟 root 登录环境

  - `sudo` 执行目标命令
    - `execvp()` 运行目标程序，如 `/usr/bin/some-command`
    - 目标进程以 root 或目标用户身份运行

  - 记录日志

    - `sudo` 记录执行信息到 `/var/log/auth.log`（Ubuntu/Debian）或 `/var/log/secure`（CentOS/Rocky）

    - 也可以使用 `journalctl` 查看

      ```shell
      sudo journalctl -xe | grep sudo
      ```

      

- 选项
  
  | 选项      | 说明                           |
  | --------- | ------------------------------ |
  | `-u user` | 以指定用户执行命令             |
  | `-s`      | 指定shell                      |
  | `-l`      | 查看当前用户可执行的 sudo 命令 |
  | `-E`      | 保留当前的环境变量             |
  
  
  
  
  
- 授权示例

  - 针对用户
  
    - 格式
  
      - `用户名  主机名=(运行身份) 权限  命令列表`
  
    - 示例
  
      - 执行所有权限
  
        ```shell
        # 用户alice可以在所有主机上，以任何用户身份执行任何命令，并需要输入密码
        alice ALL=(ALL) ALL
        ```
  
      - `NOPASSWD`（免密执行）
  
        ```shell
        # 用户alice可以在所有主机上，以任何用户身份执行任何命令，不需要输入密码
        alice ALL=(ALL) NOPASSWD: ALL
        ```
  
      - 限制特定命令
  
        ```shell
        # 用户bob只能运行 /bin/ls 和 /usr/bin/whoami，而不能执行其他 sudo 命令
        bob ALL=(ALL) /bin/ls, /usr/bin/whoami
        ```
  
      - 禁止执行某些命令
  
        ```shell
        # 用户charlie可以执行所有命令，但不能执行 rm -rf
        charlie ALL=(ALL) ALL, !/bin/rm -rf
        ```
  
  
  
  - 针对组
  
    - 格式
  
      - `%组名  主机名=(运行身份) 权限  命令列表`
  
    - 示例
  
      - a
  
        ```shell
        # 所有属于admin组的用户，都可以在所有主机上，以任何用户身份执行任何命令
        %admin ALL=(ALL) ALL
        ```
  
  - 别名
  
    - 用户别名
  
      ```shell
      # alice、bob、charlie 这三个用户都拥有 sudo 权限
      User_Alias ADMINS = alice, bob, charlie
      ADMINS ALL=(ALL) ALL
      ```
  
    - 命令别名
  
      ```shell
      # alice 可以免密运行 systemctl restart nginx 和 service apache2 restart
      Cmnd_Alias RESTART = /usr/bin/systemctl restart nginx, /usr/sbin/service apache2 restart
      alice ALL=(ALL) NOPASSWD: RESTART
      ```
  
  

#### 用户查询命令

##### `w`	显示目前登入系统的用户信息

执行这项指令可得知目前登入系统的用户有哪些人，以及他们正在执行的程序

```shell
$ w
09:09:47 up  6:31,  7 users,  load average: 0.07, 0.06, 0.01
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    192.168.1.6    05:33    2:35m  0.37s  0.37s -bash
root     pts/1    192.168.1.6    05:43    3:07m  0.04s  0.02s bash
root     pts/2    192.168.1.6    05:53    3:07m  0.06s  0.05s bash
root     pts/3    192.168.1.6    05:55    3:13m  0.02s  0.01s bash
root     pts/4    192.168.1.6    06:01    3:07m  0.01s  0.01s -bash
root     pts/5    192.168.1.6    07:46    0.00s  0.14s  0.01s w
root     pts/6    192.168.1.6    08:04    1:04m  0.04s  0.03s -bash
```



##### `id`	查看用户UID、GID

```shell
$ id root
uid=0(root) gid=0(root) groups=0(root)
```



##### `last`	显示用户登录情况

```shell
$ last
u1       pts/7        192.168.1.6    Wed Aug  8 08:05 - 08:35  (00:29)   
root     pts/7        192.168.1.6    Wed Aug  8 08:05 - 08:05  (00:00)   
root     pts/6        192.168.1.6    Wed Aug  8 08:04   still logged in  
root     pts/5        192.168.1.6    Wed Aug  8 07:46   still logged in  
root     pts/4        192.168.1.6    Wed Aug  8 06:01   still logged in  
root     pts/3        192.168.1.6    Wed Aug  8 05:55   still logged in  
root     pts/2        192.168.1.6    Wed Aug  8 05:53   still logged in  
root     pts/1        192.168.1.6    Wed Aug  8 05:43   still logged in  
root     pts/0        192.168.1.6    Wed Aug  8 05:33   still logged in  
user     pts/3        192.168.1.6    Wed Aug  8 03:34 - 05:00  (01:26)   
user     pts/2        192.168.1.6    Wed Aug  8 03:33 - 05:00  (01:27)    
u1       pts/6        192.168.1.6    Wed Aug  8 03:25 - 03:25  (00:00)
```



##### `lastlog`	显示linux中所有用户最近一次远程登录的信息

```shell
$ lastlog
Username         Port     From             Latest
root             pts/7    192.168.1.6    Wed Aug  8 08:05:24 +0800 2018
bin                                        **Never logged in**
daemon                                     **Never logged in**
adm                                        **Never logged in**
lp                                         **Never logged in**
sync                                       **Never logged in**
```



## Linux组管理

#### `groupadd`	创建组

语法格式

- `groupadd 选项 用户组`

选项

- `-g`
  - gid 指定用户组的GID，GID唯一不能为负数，如果不指定GID从500开始
- `-f`
  - 新增一个组，强制覆盖一个已存在的组，GID、组成员不会改变



#### `gpasswd`	将已存在的用户加入到组中

语法格式

- `gpasswd 选项 用户名 组名`



选项

:::tip 说明

- `-a` 只能添加一个用户到组中，批量添加用户到组用 `-M` 选项

- `-M` 选项再次执行添加用户到组会覆盖之前的用户

:::

- `-a`
  - 添加一个用户到组,可以追加到组
- `-M`
  - 添加多个用户到组，覆盖之前的组成员
- `-d`
  - 从组删除用户



#### `groupmod`	修改组信息

语法格式

- `groupmod 选项 组名`

选项

- `-n` 修改组名
- `-g` 修改GID



#### `groupdel`	删除组

语法格式

- `groupdel` 组名



#### `groups`	查看用户属于哪些组

语法格式

- `groups 用户名`

  ```shell
  $ groups root
  root : root
  ```

  
