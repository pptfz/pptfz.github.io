[toc]



# MHA基于普通主从复制高可用

[MHA gIthub地址](https://github.com/yoshinorim/mha4mysql-manager)

[MHA github wiki地址](https://github.com/yoshinorim/mha4mysql-manager/wiki)



## 1.MHA简介

MHA通常在10到30秒内以最少的停机时间执行自动的主故障转移和从升级。MHA可以防止复制一致性问题，并节省了必须购买其他服务器的费用。所有这些都具有零性能下降，无复杂性（易于安装）并且无需更改现有部署的情况。

MHA还提供了计划的在线主设备切换，可以在停机（仅阻止写入）的几秒钟（0.5-2秒）内将当前正在运行的主设备安全地更改为新的主设备。

MHA提供以下功能，在需要高可用性，数据完整性和近乎不间断的主维护的许多部署中很有用。

- 自动化的主站监视和故障转移
  - MHA可以监视现有复制环境中的MySQL主服务器，并在检测到主服务器故障时执行自动主服务器故障转移。MHA通过识别来自最新从站的差分中继日志事件并将其应用于所有其他从站，包括那些尚未收到最新中继日志事件的从站，来保证所有从站的一致性。MHA通常可以在几秒钟内执行故障转移：9到12秒钟用于检测主设备故障，可选地7到10秒钟用于关闭主计算机电源，以避免脑部分裂；几秒钟的时间将差分中继日志应用于新的主设备。总停机时间通常为10-30秒。可以在配置文件中将特定从站指定为候选主站（设置优先级）。由于MHA维护从站之间的一致性，任何奴隶都可以晋升为新主人。通常不会导致突然的复制失败的一致性问题将不会发生。

- 交互式（手动启动）主故障转移
  - 可以将MHA配置为手动启动（非自动），交互式故障转移，而无需监视主服务器。

- 非交互式主服务器故障转移
  - 还支持不监视主服务器的非交互式自动主服务器故障转移。当已经使用MySQL主软件监视时，此功能特别有用。例如，您可以使用[Pacemaker（Heartbeat）](http://www.linux-ha.org/wiki/Pacemaker)检测主服务器故障和虚拟IP地址接管，而使用MHA进行主服务器故障转移和从属升级。

- 在线将主服务器切换到其他主机
  - 通常有必要将现有的主服务器迁移到另一台计算机上，例如当前主服务器存在硬件RAID控制器或RAM问题，或者要用速度更快的计算机替换它等时，这不是主服务器崩溃，但需要定期进行主维护。计划的主机维护应尽快完成，因为这会导致部分停机（禁用主机写入）。另一方面，您应该非常仔细地阻止/杀死当前正在运行的会话，因为不同的master之间可能会发生一致性问题（即“更新master1，更新master 2，提交master1，在提交master 2时出错”会导致数据不一致）。快速主开关和平稳阻止写入都是必需的。

MHA在写入器阻塞后的0.5-2秒内提供正常的主设备切换。通常可以接受0.5-2秒的写入器停机时间，因此即使不分配计划的维护时段，您也可以切换主机。升级到更高版本，更快的计算机等操作变得更加容易。





## 2.MHA架构

[MHA架构官方文档](https://raw/branch.githubusercontent.com/wiki/yoshinorim/mha4mysql-manager/Architecture.md)

**正常工作时架构**

![iShot2020-06-0517.48.35](https://github.com/pptfz/picgo-images/blob/master/img/iShot2020-06-0517.48.35.png)

**主库down机时架构**

![iShot2020-06-0517.49.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot2020-06-0517.49.03.png)



该软件由两部分组成：**MHA Manager（管理节点）**和**MHA Node（数据节点）**。

**MHA Manager**可以单独部署在一台独立的机器上管理多个master-slave集群，也可以部署在一台slave节点上。

**MHA Node**运行在每台MySQL服务器上，MHA Manager会定时探测集群中的master节点，当master出现故障时，它可以自动将最新数据的slave提升为新的master，然后将所有其他的slave重新指向新的master。整个故障转移过程对应用程序完全透明。

在MHA自动故障切换过程中，MHA试图从宕机的主服务器上保存二进制日志，最大程度的保证数据的不丢失(配合mysql半同步复制效果更佳)，但这并不总是可行的。例如，如果主服务器硬件故障或无法通过ssh访问，MHA没法保存二进制日志，只进行故障转移而丢失了最新的数据。使用MySQL 5.5的半同步复制，可以大大降低数据丢失的风险。MHA可以与半同步复制结合起来。如果只有一个slave已经收到了最新的二进制日志，MHA可以将最新的二进制日志应用于其他所有的slave服务器上，因此可以保证所有节点的数据一致性。

注意：目前MHA主要支持一主多从的架构，要搭建MHA,要求一个复制集群中必须最少有三台数据库服务器，一主二从，即一台充当master，一台充当备用master，另外一台充当从库，因为至少需要三台服务器。



**<span style={{color: 'red'}}>工作过程：manager节点定时检测复制集群中的每一个node,如果master宕机会选出数据与master最接近的一台slave来作为新master，去到旧master中拷贝binlog到新master中并应用binlog以保证新master与旧master数据一致，然后将剩余的slave重新changer master to,将slave的主切换为新master</span>**



## 3.部署过程

**实验环境**

| 角色             | IP             | 主机名      | 系统          | 机器配置 | mysql版本  |
| ---------------- | -------------- | ----------- | ------------- | -------- | ---------- |
| **manager**      | **10.0.0.130** | **mha**     | **centos7.8** | **2c4g** | **5.7.28** |
| **mysql-master** | **10.0.0.133** | **mysql01** | **centos7.8** | **2c4g** | **5.7.28** |
| **mysql-slave1** | **10.0.0.134** | **mysql02** | **centos7.8** | **2c4g** | **5.7.28** |
| **mysql-slave2** | **10.0.0.135** | **mysql03** | **centos7.8** | **2c4g** | **5.7.28** |





### 3.1 下载安装包

[MHA manager0.58下载地址](https://github.com/yoshinorim/mha4mysql-manager/releases)

[MHA node0.58下载地址](https://github.com/yoshinorim/mha4mysql-node/releases)

[MHA 0.56 下载地址](https://github.com/yoshinorim/mha4mysql-manager/wiki/Downloads)



**Manager工具包主要包括以下几个工具：**

| 名称                        | 含义                             |
| --------------------------- | -------------------------------- |
| **masterha_check_ssh**      | **检查MHA的SSH配置状况**         |
| **masterha_check_repl**     | **检查MySQL复制状况**            |
| **masterha_manger**         | **启动MHA**                      |
| **masterha_check_status**   | **检测当前MHA运行状态**          |
| **masterha_master_monitor** | **检测master是否宕机**           |
| **masterha_master_switch**  | **控制故障转移（自动或者手动）** |
| **masterha_conf_host**      | **添加或删除配置的server信息**   |



**Node工具包（这些工具通常由MHA Manager的脚本触发，无需人为操作）主要包括以下几个工具：**

| 名称                      | 含义                                                        |
| ------------------------- | ----------------------------------------------------------- |
| **save_binary_logs**      | **保存和复制master的二进制日志**                            |
| **apply_diff_relay_logs** | **识别差异的中继日志事件并将其差异的事件应用于其他的slave** |
| **filter_mysqlbinlog**    | **去除不必要的ROLLBACK事件（MHA已不再使用这个工具）**       |
| **purge_relay_logs**      | **清除中继日志（不会阻塞SQL线程）**                         |



### 3.2 所有机器做相互免密钥配置

**<span style={{color: 'red'}}>⚠️复制集群中的每个节点都有可能成为master，都得开启binlog和ssh密钥认证，因为当旧master宕机后，mha要拷贝binlog到所有node节点上，而且所有节点都有可能成为master，故每个节点都要彼此密钥认证</span>**

lowB脚本运行一下

```python
#!/bin/bash
file_path=/root
file_name=host.txt
file=$file_path/$file_name
user=root
pwd=1
ssh_file=~/.ssh/id_rsa

yum -y install expect &> /dev/null

# 生成密钥
[ -f "$ssh_file" ] || ssh-keygen -q -N "" -f ~/.ssh/id_rsa

read -p "请输入开始数值: " start_num
read -p "请输入结束数值: " end_num
read -p "请输入网段(类似格式：10.0.0.)：" sub_net
seq $start_num $end_num >$file

# 在文件开头加上网段，在文件末尾加上用户名和密码
sed -i 's/^/'$sub_net'/g' $file
sed -i 's/$/ '$user' '$pwd'/g' $file

echo -e "执行成功，文件内容如下:\n`cat $file`"

while read line;do
    ip=`echo $line | awk '{print $1}'`
    username=`echo $line | awk '{print $2}'`
    password=`echo $line | awk '{print $3}'`
expect <<EOF
    spawn ssh-copy-id -i $username@$ip
    expect {
        "yes/no" {send "yes\n";exp_continue}
        "password" {send "$password\n"}
        }
    expect eof
EOF
done < $file
```



**<span style={{color: 'red'}}>master操作(mysql01 10.0.0.133)</span>**

### 3.3 mysql主从配置

>  **这里是把10.0.0.133(mysql01)、10.0.0.134(mysql02)、10.0.0.135(mysql03)搭建为ABB，即一主两从，其中mysql01是主库，其余两个节点是从库**



#### 3.3.1 编辑`/etc/my.cnf`

> **指定`serverid`，并开启`binlog`**

```python
# 指定serverid，越小优先级越大
server_id=1

# 开启binlog日志，位置在mysql数据目录data下
log_bin=binlog

# 开启binlog日志索引，位置在mysql数据目录data下
log_bin_index=binlog.index	

# 开启半同步复制
log_slave_updates=1
```



**重启mysql**

```python
systemctl restart mysqld
```



#### 3.3.2 创建专用复制用户和设置监控用户

**<span style={{color: 'red'}}>允许从slave上连接过来的复制用户，3台mysql服务器都要创建复制用户和监控用户！！！</span>**

**⚠️复制用户名称为repl，否在在后续检测mysql集群连接情况会报错，也可以在配置文件中修改复制用户**

**创建专用复制用户**

```python
mysql> grant replication slave on *.* to 'repl'@'10.0.0.%' identified by 'Bxb123.com';
Query OK, 0 rows affected, 1 warning (0.00 sec)
```



**设置监控用户**

**<span style={{color: 'red'}}>⚠️所有节点进行授权</span>**

```python
mysql> grant all privileges on *.* to 'mha'@'10.0.0.%' identified by 'Bxb123.com';
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

**mysql5.7会默认加载validate_password 模块，是来控制密码长度和规则的，可以在配置文件里面关闭该模块加上`validate_password = off `，或者在mysql命令行执行`set global validate_password_policy=0;`来临时取消密码规则**



**禁用自动删除relay log功能**

```python
set global relay_log_purge=0;
```



**查看master当前的binlog日志及位置信息**

```mysql
mysql> show master status;
```



**<span style={{color: 'red'}}>slave操作(mysql02、03 10.0.0.134、135)</span>**

#### 3.3.3 配置文件 `/etc/my.cnf`

> `指定serverid，并开启binlog日志`

```python
# 指定serverid，要比mysql-master大，slave1设置为2，slave2设置为3
server_id=2

# 开启binlog日志，位置在mysql数据目录data下
log_bin=binlog

#  开启binlog日志索引，位置在mysql数据目录data下
log_bin_index=binlog.index	

# 开启半同步复制  否则自动切换主从的时候会报主键错误
log_slave_updates = 1
```



**重启mysql**

```python
systemctl restart mysqld
```



#### 3.3.4 设置slave从master拉取binlog，及拉取的位置

```python
# 设置只读，不要在配置文件里写
mysql> set global read_only=1;
Query OK, 0 rows affected (0.00 sec)

# 禁用自动删除relay log
set global relay_log_purge=0;

# 拉取binlog
change master to master_host='10.0.0.133', \
master_port=3306, \
master_user='repl', \
master_password='Bxb123.com', \
master_log_file='binlog.000001', \
master_log_pos=155;
Query OK, 0 rows affected, 2 warnings (0.01 sec)
```



**启动slave并查看slave状态**

```python
# 启动slave
mysql> start slave;
Query OK, 0 rows affected (0.00 sec)

#  查看slave状态，SQL和IO线程都为Yes即为正确
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
  
# 这个值是主从延迟，即slave落后master的秒数，也是一个比较重要的查看主从是否正常的标准值  
Seconds_Behind_Master: 0  
```





#### 3.3.5 验证主从同步

**master操作**

```python
# 在主库上创建一个数据库db1
mysql> create database db1;
Query OK, 1 row affected (0.00 sec)
```



**slave操作**

查看主库上创建的数据库是否已经同步过来，同步完成即为成功

```python
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| db1                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.00 sec)
```



### 3.4 部署MHA node

**所有节点执行**

```python
# 下载包
wget https://github.com/yoshinorim/mha4mysql-node/releases/download/v0.58/mha4mysql-node-0.58.tar.gz
  
# 编译安装
$ cd mha4mysql-node-0.58
$ ls
AUTHORS  bin  COPYING  debian  inc  lib  Makefile.PL  MANIFEST  META.yml  README  rpm  t

$ perl Makefile.PL
$ make && make install
```



**安装完成后拷贝`mha4mysql-node-0.58/bin`下的所有可执行文件到`/usr/local/bin`**

> **apply_diff_relay_logs			#识别差异日志并应用于其他slave**
> **save_binary_logs				   #保存和复制二进制日志**
> **filter_mysqlbinlog			     #去除不必要的ROLLBACK事件（MHA已不再使用这个工具）**
> **purge_relay_logs			       #清除中继日志**



---

**<span style={{color: 'red'}}>manager操作(mha 10.0.0.130)</span>**

### 3.5 部署MHA Manager

#### 3.5.1 增加epel源

```python
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```



#### 3.5.2 安装依赖包

```python
yum -y install perl-DBD-MySQL perl-Config-Tiny perl-Log-Dispatch perl-Parallel-ForkManager perl-ExtUtils-CBuilder perl-ExtUtils-MakeMaker perl-ExtUtils-Embed perl-CPAN
```



#### 3.5.3 安装manager

```python
# 下载包
wget https://github.com/yoshinorim/mha4mysql-manager/releases/download/v0.58/mha4mysql-manager-0.58.tar.gz

# 编译安装
$ cd cd mha4mysql-manager-0.58
$ ls
AUTHORS  bin  COPYING  debian  inc  lib  Makefile.PL  MANIFEST  META.yml  README  rpm  samples  t  tests

$ perl Makefile.PL
$ make && make install
```



**安装完成后会拷贝`mha4mysql-manager-0.58/bin`下的所有可执行文件到`/usr/local/bin`**

| **可执行文件**               | **含义**                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| **masterha_manager**         | **在主服务器关闭的情况下，主服务器自动监视和运行故障转移** |
| **masterha_master_switch**   | **手动或非交互式主故障转移或在线主库**                     |
| **masterha_master_monitor**  | **MHA Manager监控程序**                                    |
| **masterha_stop**            | **停止MHA Manager**                                        |
| **masterha_check_repl**      | **检查MySQL复制运行状况**                                  |
| **masterha_check_status**    | **检查Manager是否正确监视MySQL master**                    |
| **masterha_check_ssh**       | **检查ssh配置**                                            |
| **masterha_conf_host**       | **一个帮助程序脚本，用于从配置文件添加/删除主机条目**      |
| **masterha_secondary_check** | **MHA Manager二次检查**                                    |





#### 3.5.4 mysql主库节点配置eth0:0网卡，用作VIP，这里设置为10.0.0.200

**<span style={{color: 'red'}}>这一步在mysql主库上(10.0.0.133)执行</span>**

```python
$ ifconfig eth0:0 10.0.0.200
$ ip a s eth0    
eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:1c:42:62:a8:c1 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.133/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 10.0.0.200/8 brd 10.255.255.255 scope global eth0:0
       valid_lft forever preferred_lft forever
    inet6 fe80::21c:42ff:fe62:a8c1/64 scope link 
       valid_lft forever preferred_lft forever    
```



#### 3.5.5 使用脚本管理vip 

**⚠️需要修改的是VIP的地址和网卡的名称**

**<span style={{color: 'red'}}>VIP是绑定在主库上的，这样当主库宕机后VIP才会漂移到新主库上</span>**

```python
cat > /usr/local/bin/master_ip_failover <<'EOF'
#!/usr/bin/env perl

use strict;
use warnings FATAL => 'all';

use Getopt::Long;

my (
    $command,          $ssh_user,        $orig_master_host, $orig_master_ip,
    $orig_master_port, $new_master_host, $new_master_ip,    $new_master_port
);

# 这里需要注意一下 eth1:$key的意思是 vip必须绑定在 eth0:0上
my $vip = '10.0.0.200/24';  #此处为你要设置的虚拟ip
my $key = '0';
my $ssh_start_vip = "/usr//sbin/ifconfig eth0:$key $vip"; #此处改为你的网卡名称
my $ssh_stop_vip = "/usr/sbin/ifconfig eth0:$key down";

GetOptions(
    'command=s'          => \$command,
    'ssh_user=s'         => \$ssh_user,
    'orig_master_host=s' => \$orig_master_host,
    'orig_master_ip=s'   => \$orig_master_ip,
    'orig_master_port=i' => \$orig_master_port,
    'new_master_host=s'  => \$new_master_host,
    'new_master_ip=s'    => \$new_master_ip,
    'new_master_port=i'  => \$new_master_port,
);

exit &main();

sub main {

    print "\n\nIN SCRIPT TEST====$ssh_stop_vip==$ssh_start_vip===\n\n";

    if ( $command eq "stop" || $command eq "stopssh" ) {

        my $exit_code = 1;
        eval {
            print "Disabling the VIP on old master: $orig_master_host \n";
            &stop_vip();
            $exit_code = 0;
        };
        if ($@) {
            warn "Got Error: $@\n";
            exit $exit_code;
        }
        exit $exit_code;
    }
    elsif ( $command eq "start" ) {

        my $exit_code = 10;
        eval {
            print "Enabling the VIP - $vip on the new master - $new_master_host \n";
            &start_vip();
            $exit_code = 0;
        };
        if ($@) {
            warn $@;
            exit $exit_code;
        }
        exit $exit_code;
    }
    elsif ( $command eq "status" ) {
        print "Checking the Status of the script.. OK \n";
        exit 0;
    }
    else {
        &usage();
        exit 1;
    }
}

sub start_vip() {
    `ssh $ssh_user\@$new_master_host \" $ssh_start_vip \"`;
}
sub stop_vip() {
     return 0  unless  ($ssh_user);
    `ssh $ssh_user\@$orig_master_host \" $ssh_stop_vip \"`;
}

sub usage {
    print
    "Usage: master_ip_failover --command=start|stop|stopssh|status --orig_master_host=host --orig_master_ip=ip --orig_master_port=port --new_master_host=host --new_master_ip=ip --new_master_port=port\n";
}
EOF
```



**给脚本赋予执行权限**

```python
chmod +x /usr/local/bin/master_ip_failover
```



#### 3.5.6 配置mha配置文件

**创建mha配置文件目录及日志目录**

```python
mkdir /etc/masterha
mkdir -p /var/log/masterha/app1
```



**编辑mha配置文件`/etc/masterha/app1.conf`**

**<span style={{color: 'red'}}>`mha4mysql-manager-0.58/samples/conf/app1.conf`是mha的默认配置文件</span>**

```python
cat > /etc/masterha/app1.cnf <<EOF
[server default]
# 设置manager的工作目录
manager_workdir=/var/log/masterha/app1  

# 设置manager的日志
manager_log=/var/log/masterha/app1/manager.log   

# 设置master保存binlog的位置，以便MHA可以找到master的日志，我这里的也就是mysql的数据目录
master_binlog_dir=/usr/local/mysql/data         

# 设置自动failover时候的切换脚本，也就是3.5.5步骤中的那个脚本
master_ip_failover_script=/usr/local/bin/master_ip_failover 

# 设置手动切换时候的切换脚本
master_ip_online_change_script=/usr/local/bin/master_ip_online_change

# 设置mysql中mha用户的密码，这个密码是前文中创建监控用户的密码
password=Bxb123.com         

# 设置监控用户mha
user=mha    

# 设置监控主库，发送ping包的时间间隔，默认是3秒，尝试三次没有回应的时候自动进行railover
ping_interval=1   

# 设置远端mysql在发生切换时binlog的保存位置
remote_workdir=/tmp    

# 设置复制用户的密码
repl_password=Bxb123.com    

# 设置复制环境中的复制用户名
repl_user=repl          

# 设置发生切换后发送的报警的脚本
report_script=/etc/mha/send_report

# 检测两个从库
secondary_check_script=/usr/local/bin/masterha_secondary_check -s 10.0.0.134 -s 10.0.0.135

# 设置故障发生后关闭故障主机脚本（该脚本的主要作用是关闭主机放在发生脑裂,这里没有使用）
shutdown_script=""      

# 设置ssh的登录用户名
ssh_user=root           

# server1是主库
[server1]
hostname=10.0.0.133
port=3306

# server2和server3是从库
[server2]
hostname=10.0.0.134
port=3306

# 设置为候选master，如果设置该参数以后，发生主从切换以后将会将此从库提升为主库，即使这个主库不是集群中事件最新的slave
candidate_master=1   

# 默认情况下如果一个slave落后master 100M的relay logs的话，MHA将不会选择该slave作为一个新的master，因为对于这个slave的恢复需要花费很长时间，通过设置check_repl_delay=0,MHA触发切换在选择一个新的master的时候将会忽略复制延时，这个参数对于设置了candidate_master=1的主机非常有用，因为这个候选主在切换的过程中一定是新的master
check_repl_delay=0   

[server3]
hostname=10.0.0.135
port=3306
EOF
```



**编辑发生切换后发送报警的脚本，需要自行配置邮箱设置**

```python
cat > /etc/mha/send_report <<'EOF'
#!/usr/bin/perl
  
use strict;
use warnings FATAL => 'all';
use Mail::Sender;
use Getopt::Long;
  
#new_master_host and new_slave_hosts are set only when recovering master succeeded
my ( $dead_master_host, $new_master_host, $new_slave_hosts, $subject, $body );
my $smtp='smtp服务器地址';
my $mail_from='发件人邮箱';
my $mail_user='邮箱登陆用户名';
my $mail_pass='邮箱登陆密码';
my $mail_to=['收件人地址'];
GetOptions(
  'orig_master_host=s' => \$dead_master_host,
  'new_master_host=s'  => \$new_master_host,
  'new_slave_hosts=s'  => \$new_slave_hosts,
  'subject=s'          => \$subject,
  'body=s'             => \$body,
);
  
mailToContacts($smtp,$mail_from,$mail_user,$mail_pass,$mail_to,$subject,$body);
  
sub mailToContacts {
    my ( $smtp, $mail_from, $user, $passwd, $mail_to, $subject, $msg ) = @_;
    open my $DEBUG, "> /tmp/monitormail.log"
        or die "Can't open the debug      file:$!\n";
    my $sender = new Mail::Sender {
        ctype       => 'text/plain; charset=utf-8',
        encoding    => 'utf-8',
        smtp        => $smtp,
        from        => $mail_from,
        auth        => 'LOGIN',
        TLS_allowed => '0',
        authid      => $user,
        authpwd     => $passwd,
        to          => $mail_to,
        subject     => $subject,
        debug       => $DEBUG
    };
  
    $sender->MailMsg(
        {   msg   => $msg,
            debug => $DEBUG
        }
    ) or print $Mail::Sender::Error;
    return 1;
}
  
# Do whatever you want here
  
exit 0;
EOF
```



#### 3.5.7 测试MHA Manager

##### 3.5.7.1 测试ssh连接

```python
$ masterha_check_ssh --conf=/etc/masterha/app1.cnf
Sat Jun  6 10:27:32 2020 - [warning] Global configuration file /etc/masterha_default.cnf not found. Skipping.
Sat Jun  6 10:27:32 2020 - [info] Reading application default configuration from /etc/mha/mha.conf..
Sat Jun  6 10:27:32 2020 - [info] Reading server configuration from /etc/mha/mha.conf..
Sat Jun  6 10:27:32 2020 - [info] Starting SSH connection tests..
Sat Jun  6 10:27:33 2020 - [debug] 
Sat Jun  6 10:27:32 2020 - [debug]  Connecting via SSH from root@10.0.0.133(10.0.0.133:22) to root@10.0.0.134(10.0.0.134:22)..
Sat Jun  6 10:27:32 2020 - [debug]   ok.
Sat Jun  6 10:27:32 2020 - [debug]  Connecting via SSH from root@10.0.0.133(10.0.0.133:22) to root@10.0.0.135(10.0.0.135:22)..
Sat Jun  6 10:27:33 2020 - [debug]   ok.
Sat Jun  6 10:27:33 2020 - [debug] 
Sat Jun  6 10:27:32 2020 - [debug]  Connecting via SSH from root@10.0.0.134(10.0.0.134:22) to root@10.0.0.133(10.0.0.133:22)..
Sat Jun  6 10:27:33 2020 - [debug]   ok.
Sat Jun  6 10:27:33 2020 - [debug]  Connecting via SSH from root@10.0.0.134(10.0.0.134:22) to root@10.0.0.135(10.0.0.135:22)..
Sat Jun  6 10:27:33 2020 - [debug]   ok.
Sat Jun  6 10:27:34 2020 - [debug] 
Sat Jun  6 10:27:33 2020 - [debug]  Connecting via SSH from root@10.0.0.135(10.0.0.135:22) to root@10.0.0.133(10.0.0.133:22)..
Sat Jun  6 10:27:33 2020 - [debug]   ok.
Sat Jun  6 10:27:33 2020 - [debug]  Connecting via SSH from root@10.0.0.135(10.0.0.135:22) to root@10.0.0.134(10.0.0.134:22)..
Sat Jun  6 10:27:33 2020 - [debug]   ok.
Sat Jun  6 10:27:34 2020 - [info] All SSH connection tests passed successfully.
```



##### 3.5.7.2 测试mysql集群连接情况

```python
$ masterha_check_repl --conf=/etc/masterha/app1.cnf
Sat Jun  6 12:45:42 2020 - [warning] Global configuration file /etc/masterha_default.cnf not found. Skipping.
Sat Jun  6 12:45:42 2020 - [info] Reading application default configuration from /etc/masterha/app1.cnf..
Sat Jun  6 12:45:42 2020 - [info] Reading server configuration from /etc/masterha/app1.cnf..
Sat Jun  6 12:45:42 2020 - [info] MHA::MasterMonitor version 0.58.
Sat Jun  6 12:45:43 2020 - [info] GTID failover mode = 0
Sat Jun  6 12:45:43 2020 - [info] Dead Servers:
Sat Jun  6 12:45:43 2020 - [info] Alive Servers:
Sat Jun  6 12:45:43 2020 - [info]   10.0.0.133(10.0.0.133:3306)
Sat Jun  6 12:45:43 2020 - [info]   10.0.0.134(10.0.0.134:3306)
Sat Jun  6 12:45:43 2020 - [info]   10.0.0.135(10.0.0.135:3306)
Sat Jun  6 12:45:43 2020 - [info] Alive Slaves:
Sat Jun  6 12:45:43 2020 - [info]   10.0.0.134(10.0.0.134:3306)  Version=5.7.28-log (oldest major version between slaves) log-bin:enabled
Sat Jun  6 12:45:43 2020 - [info]     Replicating from 10.0.0.133(10.0.0.133:3306)
Sat Jun  6 12:45:43 2020 - [info]     Primary candidate for the new Master (candidate_master is set)
Sat Jun  6 12:45:43 2020 - [info]   10.0.0.135(10.0.0.135:3306)  Version=5.7.28-log (oldest major version between slaves) log-bin:enabled
Sat Jun  6 12:45:43 2020 - [info]     Replicating from 10.0.0.133(10.0.0.133:3306)
Sat Jun  6 12:45:43 2020 - [info] Current Alive Master: 10.0.0.133(10.0.0.133:3306)
Sat Jun  6 12:45:43 2020 - [info] Checking slave configurations..
Sat Jun  6 12:45:43 2020 - [info]  read_only=1 is not set on slave 10.0.0.134(10.0.0.134:3306).
Sat Jun  6 12:45:43 2020 - [warning]  relay_log_purge=0 is not set on slave 10.0.0.134(10.0.0.134:3306).
Sat Jun  6 12:45:43 2020 - [info]  read_only=1 is not set on slave 10.0.0.135(10.0.0.135:3306).
Sat Jun  6 12:45:43 2020 - [warning]  relay_log_purge=0 is not set on slave 10.0.0.135(10.0.0.135:3306).
Sat Jun  6 12:45:43 2020 - [info] Checking replication filtering settings..
Sat Jun  6 12:45:43 2020 - [info]  binlog_do_db= , binlog_ignore_db= 
Sat Jun  6 12:45:43 2020 - [info]  Replication filtering check ok.
Sat Jun  6 12:45:43 2020 - [info] GTID (with auto-pos) is not supported
Sat Jun  6 12:45:43 2020 - [info] Starting SSH connection tests..
Sat Jun  6 12:45:50 2020 - [info] All SSH connection tests passed successfully.
Sat Jun  6 12:45:50 2020 - [info] Checking MHA Node version..
Sat Jun  6 12:45:51 2020 - [info]  Version check ok.
Sat Jun  6 12:45:51 2020 - [info] Checking SSH publickey authentication settings on the current master..
Sat Jun  6 12:45:51 2020 - [info] HealthCheck: SSH to 10.0.0.133 is reachable.
Sat Jun  6 12:45:51 2020 - [info] Master MHA Node version is 0.58.
Sat Jun  6 12:45:51 2020 - [info] Checking recovery script configurations on 10.0.0.133(10.0.0.133:3306)..
Sat Jun  6 12:45:51 2020 - [info]   Executing command: save_binary_logs --command=test --start_pos=4 --binlog_dir=/usr/local/mysql/data --output_file=/tmp/save_binary_logs_test --manager_version=0.58 --start_file=binlog.000001 
Sat Jun  6 12:45:51 2020 - [info]   Connecting to root@10.0.0.133(10.0.0.133:22).. 
  Creating /tmp if not exists..    ok.
  Checking output directory is accessible or not..
   ok.
  Binlog found at /usr/local/mysql/data, up to binlog.000001
Sat Jun  6 12:45:51 2020 - [info] Binlog setting check done.
Sat Jun  6 12:45:51 2020 - [info] Checking SSH publickey authentication and checking recovery script configurations on all alive slave servers..
Sat Jun  6 12:45:51 2020 - [info]   Executing command : apply_diff_relay_logs --command=test --slave_user='root' --slave_host=10.0.0.134 --slave_ip=10.0.0.134 --slave_port=3306 --workdir=/tmp --target_version=5.7.28-log --manager_version=0.58 --relay_log_info=/usr/local/mysql/data/relay-log.info  --relay_dir=/usr/local/mysql/data/  --slave_pass=xxx
Sat Jun  6 12:45:51 2020 - [info]   Connecting to root@10.0.0.134(10.0.0.134:22).. 
  Checking slave recovery environment settings..
    Opening /usr/local/mysql/data/relay-log.info ... ok.
    Relay log found at /usr/local/mysql/data, up to mysql02-relay-bin.000002
    Temporary relay log file is /usr/local/mysql/data/mysql02-relay-bin.000002
    Checking if super_read_only is defined and turned on.. not present or turned off, ignoring.
    Testing mysql connection and privileges..
mysql: [Warning] Using a password on the command line interface can be insecure.
 done.
    Testing mysqlbinlog output.. done.
    Cleaning up test file(s).. done.
Sat Jun  6 12:45:51 2020 - [info]   Executing command : apply_diff_relay_logs --command=test --slave_user='root' --slave_host=10.0.0.135 --slave_ip=10.0.0.135 --slave_port=3306 --workdir=/tmp --target_version=5.7.28-log --manager_version=0.58 --relay_log_info=/usr/local/mysql/data/relay-log.info  --relay_dir=/usr/local/mysql/data/  --slave_pass=xxx
Sat Jun  6 12:45:51 2020 - [info]   Connecting to root@10.0.0.135(10.0.0.135:22).. 
  Checking slave recovery environment settings..
    Opening /usr/local/mysql/data/relay-log.info ... ok.
    Relay log found at /usr/local/mysql/data, up to mysql03-relay-bin.000002
    Temporary relay log file is /usr/local/mysql/data/mysql03-relay-bin.000002
    Checking if super_read_only is defined and turned on.. not present or turned off, ignoring.
    Testing mysql connection and privileges..
mysql: [Warning] Using a password on the command line interface can be insecure.
 done.
    Testing mysqlbinlog output.. done.
    Cleaning up test file(s).. done.
Sat Jun  6 12:45:52 2020 - [info] Slaves settings check done.
Sat Jun  6 12:45:52 2020 - [info] 
10.0.0.133(10.0.0.133:3306) (current master)
 +--10.0.0.134(10.0.0.134:3306)
 +--10.0.0.135(10.0.0.135:3306)

Sat Jun  6 12:45:52 2020 - [info] Checking replication health on 10.0.0.134..
Sat Jun  6 12:45:52 2020 - [info]  ok.
Sat Jun  6 12:45:52 2020 - [info] Checking replication health on 10.0.0.135..
Sat Jun  6 12:45:52 2020 - [info]  ok.
Sat Jun  6 12:45:52 2020 - [info] Checking master_ip_failover_script status:
Sat Jun  6 12:45:52 2020 - [info]   /usr/local/bin/master_ip_failover --command=status --ssh_user=root --orig_master_host=10.0.0.133 --orig_master_ip=10.0.0.133 --orig_master_port=3306 


IN SCRIPT TEST====/usr/sbin/ifconfig eth1:1 down==/usr//sbin/ifconfig eth1:1 10.0.0.200/24===

Checking the Status of the script.. OK 
Sat Jun  6 12:45:52 2020 - [info]  OK.
Sat Jun  6 12:45:52 2020 - [warning] shutdown_script is not defined.
Sat Jun  6 12:45:52 2020 - [info] Got exit code 0 (Not master dead).

MySQL Replication Health is OK.
```



#### 3.5.8 启动mha

**启动mha**

```python
nohup masterha_manager --conf=/etc/masterha/app1.cnf --remove_dead_master_conf --ignore_last_failover < /dev/null > /var/log/masterha/app1/manager.log 2>&1 &
```



**启动参数说明**

> **--remove_dead_master_conf** 	该参数代表当发生主从切换后，老的主库的ip将会从配置文件中移除。 
> **--manger_log** 	日志存放位置 
> **--ignore_last_failover** 	在缺省情况下，如果MHA检测到连续发生宕机，且两次宕机间隔不足8小时的话，则不会进行Failover，之所以这样限制是为了避免ping-pong效应。该参数代表忽略上次MHA触发切换产生的文件，默认情况下，MHA发生切换后会在日志目录，也就是上面我设置的/data产生app1.failover.complete文件，下次再次切换的时候如果发现该目录下存在该文件将不允许触发切换，除非在第一次切换后收到删除该文件，为了方便，这里设置为--ignore_last_failover



**测试mha状态**

```python
$ masterha_check_status --conf=/etc/masterha/app1.cnf
app1 (pid:2262) is running(0:PING_OK), master:10.0.0.133
```



**停止mha**

```python
$ masterha_stop --conf=/etc/masterha/app1.cnf
Stopped app1 successfully.
[1]+  Exit 1                  nohup masterha_manager --conf=/etc/masterha/app1.cnf --remove_dead_master_conf --ignore_last_failover < /dev/null > /var/log/masterha/app1/manager.log 2>&1
```



**重启mha**

```python
masterha_stop --conf=/etc/masterha/app1.cnf  &&  nohup masterha_manager --conf=/etc/masterha/app1.cnf --remove_dead_master_conf --ignore_last_failover < /dev/null > /var/log/masterha/app1/manager.log 2>&1 &
```



**<span style={{color: 'red'}}>到此，MHA部署完成！</span>**



### 3.6 测试MHA

#### 3.6.1 手动关闭主库，模拟宕机

**<span style={{color: 'red'}}>10.0.0.133 mysql01操作</span>**

```python
systemctl stop mysqld
```



#### 3.6.2 验证slave1，即10.0.0.134

**因为在mha配置文件`/etc/masterha/app1.conf`中定义了参数`candidate_master=1`，即设置为候选master，如果设置该参数以后，发生主从切换以后将会将此从库提升为主库，即使这个主库不是集群中事件最新的slave，因此，当主库挂掉时，slave1 10.0.0.134会成为新的主库**



**<span style={{color: 'red'}}>10.0.0.135 mysql02操作</span>**

**可以看到，当主库10.0.0.133宕机后，10.0.0.134成为了新的主库**

```python
$ show slave status\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 10.0.0.134
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: binlog.000002
          Read_Master_Log_Pos: 1331
               Relay_Log_File: mysql03-relay-bin.000002
                Relay_Log_Pos: 317
        Relay_Master_Log_File: binlog.000002
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。                        
```



**验证VIP是否已经漂移**

在新主库上能够看到VIP即为成功

```python
$ ip a s eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:1c:42:09:c2:b1 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.134/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 10.0.0.200/24 brd 10.0.0.255 scope global secondary eth0:0
       valid_lft forever preferred_lft forever
    inet6 fe80::21c:42ff:fe09:c2b1/64 scope link 
       valid_lft forever preferred_lft forever
```



## 4.MHA常用命令总结

**1、检查mha的ssh免密登录状态**

```python
masterha_check_ssh --conf=/etc/masterha/app1.cnf
```

**2、检查mha的运行状态**

```python
masterha_check_status --conf=/etc/masterha/app1.cnf
```

**3、检查主备库的复制情况**

```python
masterha_check_repl --conf=/etc/masterha/app1.cnf
```

**4、停止mha**

```python
masterha_stop --conf=/etc/masterha/app1.cnf
```

**5、启动mha**

```python
nohup masterha_manager --conf=/etc/masterha/app1.cnf --remove_dead_master_conf --ignore_last_failover < /dev/null > /var/log/masterha/app1/manager.log 2>&1 &
```

**6、mha手动切换主库**

```python
masterha_master_switch --conf=/etc/masterha/app1.cnf --master_state=alive --new_master_host=10.0.0.135 --new_master_port=3106 --orig_master_is_new_slave
```

**7、mha重新绑定数据库实例**

```python
master_ip_failover --command=status --ssh_user=root --orig_master_host=10.0.0.133 --orig_master_ip=10.0.0.200 --orig_master_port=3306
```

