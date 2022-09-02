[toc]



# mysql5.7半同步复制

# 1.复制架构衍生史

**在谈这个特性之前，我们先来看看MySQL的复制架构衍生史。**

**在2000年，MySQL 3.23.15版本引入了Replication。Replication作为一种准实时同步方式，得到广泛应用。这个时候的Replicaton的实现涉及到两个线程，一个在Master，一个在Slave。Slave的I/O和SQL功能是作为一个线程，从Master获取到event后直接apply，没有relay log。这种方式使得读取event的速度会被Slave replay速度拖慢，当主备存在较大延迟时候，会导致大量binary log没有备份到Slave端。**

**在2002年，MySQL 4.0.2版本将Slave端event读取和执行独立成两个线程（IO线程和SQL线程），同时引入了relay log。IO线程读取event后写入relay log，SQL线程从relay log中读取event然后执行。这样即使SQL线程执行慢，Master的binary log也会尽可能的同步到Slave。当Master宕机，切换到Slave，不会出现大量数据丢失。**

**在2010年MySQL 5.5版本之前，一直采用的是这种异步复制的方式。主库的事务执行不会管备库的同步进度，如果备库落后，主库不幸crash，那么就会导致数据丢失。于是在MySQL在5.5中就顺其自然地引入了半同步复制，主库在应答客户端提交的事务前需要保证至少一个从库接收并写到relay log中。那么半同步复制是否可以做到不丢失数据呢？下面分析。**

**在2016年，MySQL在5.7.17中引入了一个全新的技术，称之为InnoDB Group Replication。目前官方MySQL 5.7.17基于Group replication的全同步技术已经问世，全同步技术带来了更多的数据一致性保障。相信是未来同步技术一个重要方向，值得期待。[MySQL 5.7 Group Replication](https://dev.mysql.com/doc/refman/5.7/en/group-replication.html)**

**根据上面提到的这几种复制协议，分别对应MySQL几种复制类型，分别是异步、半同步、全同步。**

![iShot2020-10-14 13.48.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.48.24.png)

- **对于异步复制，主库将事务Binlog事件写入到Binlog文件中，此时主库只会通知一下Dump线程发送这些新的Binlog，然后主库就会继续处理提交操作，而此时不会保证这些Binlog传到任何一个从库节点上。**
- **对于全同步复制，当主库提交事务之后，所有的从库节点必须收到，APPLY并且提交这些事务，然后主库线程才能继续做后续操作。这里面有一个很明显的缺点就是，主库完成一个事务的时间被拉长，性能降低。**
- **对于半同步复制，是介于全同步复制和异步复制之间的一种，主库只需要等待至少一个从库节点收到并且Flush Binlog到Relay Log文件即可，主库不需要等待所有从库给主库反馈。同时，这里只是一个收到的反馈，而不是已经完全执行并且提交的反馈，这样就节省了很多时间。**



# 2.半同步复制技术

**我们今天谈论第二种架构。我们知道，普通的replication，即MySQL的异步复制，依靠MySQL二进制日志也即binary log进行数据复制。比如两台机器，一台主机（master），另外一台是从机（slave）。**

**1）正常的复制为：事务一（t1）写入binlog buffer；dumper线程通知slave有新的事务t1；binlog buffer进行checkpoint；slave的io线程接收到t1并写入到自己的的relay log；slave的sql线程写入到本地数据库。 这时，master和slave都能看到这条新的事务，即使master挂了，slave可以提升为新的master。**

**2）异常的复制为：事务一（t1）写入binlog buffer；dumper线程通知slave有新的事务t1；binlog buffer进行checkpoint；slave因为网络不稳定，一直没有收到t1；master挂掉，slave提升为新的master，t1丢失。**

**3）很大的问题是：主机和从机事务更新的不同步，就算是没有网络或者其他系统的异常，当业务并发上来时，slave因为要顺序执行master批量事务，导致很大的延迟。**

**为了弥补以上几种场景的不足，MySQL从5.5开始推出了半同步复制。相比异步复制，半同步复制提高了数据完整性，因为很明确知道，在一个事务提交成功之后，这个事务就至少会存在于两个地方。即在master的dumper线程通知slave后，增加了一个ack（消息确认），即是否成功收到t1的标志码，也就是dumper线程除了发送t1到slave，还承担了接收slave的ack工作。如果出现异常，没有收到ack，那么将自动降级为普通的复制，直到异常修复后又会自动变为半同步复制。**

**半同步复制具体特性：**

- **从库会在连接到主库时告诉主库，它是不是配置了半同步。**
- **如果半同步复制在主库端是开启了的，并且至少有一个半同步复制的从库节点，那么此时主库的事务线程在提交时会被阻塞并等待，结果有两种可能，要么至少一个从库节点通知它已经收到了所有这个事务的Binlog事件，要么一直等待直到超过配置的某一个时间点为止，而此时，半同步复制将自动关闭，转换为异步复制。**
- **从库节点只有在接收到某一个事务的所有Binlog，将其写入并Flush到Relay Log文件之后，才会通知对应主库上面的等待线程。**
- **如果在等待过程中，等待时间已经超过了配置的超时时间，没有任何一个从节点通知当前事务，那么此时主库会自动转换为异步复制，当至少一个半同步从节点赶上来时，主库便会自动转换为半同步方式的复制。**
- **半同步复制必须是在主库和从库两端都开启时才行，如果在主库上没打开，或者在主库上开启了而在从库上没有开启，主库都会使用异步方式复制。**

**半同步复制潜在问题：**

**先看一下半同步复制原理图，如下：**

![iShot2020-10-14 13.48.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.48.56.png)

**master将每个事务写入binlog（sync_binlog=1），传递到slave刷新到磁盘(sync_relay=1)，同时主库提交事务（commit）。master等待slave反馈收到relay log，只有收到ACK后master才将commit OK结果反馈给客户端。**

**在MySQL 5.5~5.6使用after_commit的模式下，客户端事务在存储引擎层提交后，在得到从库确认的过程中，主库宕机了。此时，即主库在等待Slave ACK的时候，虽然没有返回当前客户端，但事务已经提交，其他客户端会读取到已提交事务。如果Slave端还没有读到该事务的events，同时主库发生了crash，然后切换到备库。那么之前读到的事务就不见了，出现了幻读。如下图所示，图片引自[Loss-less Semi-Synchronous Replication on MySQL 5.7.2](http://my-replication-life.blogspot.com/2013/09/loss-less-semi-synchronous-replication.html)。**

![iShot2020-10-14 13.49.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.49.22.png)

**如果主库永远启动不了，那么实际上在主库已经成功提交的事务，在从库上是找不到的，也就是数据丢失了，这是MySQL不愿意看到的。所以在MySQL 5.7版本中增加了after_sync（无损复制）参数，并将其设置为默认半同步方式，解决了数据丢失的问题**



# 3.MySQL 5.6半同步复制配置

<h2 style={{color: 'red'}}>半同步复制的前提是已经做好了普通的主从复制</h2>

<h3 style={{color: 'hotpink'}}>Master配置</h3>

## 3.1 master安装半同步模块并启动

**此模块就在/usr/local/mysql/lib/plugin/semisync_master.so**

```python
1.安装半同步模块
mysql> install plugin rpl_semi_sync_master soname 'semisync_master.so';
Query OK, 0 rows affected (0.00 sec)

2.启动插件
mysql> set global rpl_semi_sync_master_enabled = 1;
Query OK, 0 rows affected (0.00 sec)

3.设置超时时间，单位是毫秒，默认为10000毫秒即10秒
mysql> set global rpl_semi_sync_master_timeout = 2000;
Query OK, 0 rows affected (0.00 sec)

4.查看配置
mysql> show global variables like '%semi%';
+------------------------------------+-------+
| Variable_name                      | Value |
+------------------------------------+-------+
| rpl_semi_sync_master_enabled       | ON    |	#半同步开启
| rpl_semi_sync_master_timeout       | 2000  |	#超时时间为2秒
| rpl_semi_sync_master_trace_level   | 32    |
| rpl_semi_sync_master_wait_no_slave | ON    |
+------------------------------------+-------+
4 rows in set (0.00 sec)

5.写入mysql配置文件，永久生效，在[mysqld]下写入以下两行内容
rpl_semi_sync_master_enabled = 1;
rpl_semi_sync_master_timeout = 2000;
```

<h4 style={{color: 'red'}}>安装后启动和定制主从连接错误的超时时间默认是10s，可改为2s，一旦有一次超时自动降级为异步</h4>

---

<h3 style={{color: 'green'}}>slave配置</h3>

## 3.2 slave安装半同步模块并启动

```python
1.安装半同步模块
mysql> install plugin rpl_semi_sync_slave soname 'semisync_slave.so';
Query OK, 0 rows affected (0.01 sec)

2.启动插件
mysql> set global rpl_semi_sync_slave_enabled = 1;
Query OK, 0 rows affected (0.00 sec)

3.重启IO线程
mysql> stop slave io_thread;
Query OK, 0 rows affected (0.00 sec)

mysql> start slave io_thread;
Query OK, 0 rows affected (0.00 sec)

4.在master上查看是否启用了半同步
mysql> show global status like 'rpl%';
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 1     |	#为1表明开启
| Rpl_semi_sync_master_net_avg_wait_time     | 0     |
| Rpl_semi_sync_master_net_wait_time         | 0     |
| Rpl_semi_sync_master_net_waits             | 0     |
| Rpl_semi_sync_master_no_times              | 0     |
| Rpl_semi_sync_master_no_tx                 | 0     |
| Rpl_semi_sync_master_status                | ON    |	#为ON表明开启
| Rpl_semi_sync_master_timefunc_failures     | 0     |
| Rpl_semi_sync_master_tx_avg_wait_time      | 0     |
| Rpl_semi_sync_master_tx_wait_time          | 0     |
| Rpl_semi_sync_master_tx_waits              | 0     |
| Rpl_semi_sync_master_wait_pos_backtraverse | 0     |
| Rpl_semi_sync_master_wait_sessions         | 0     |
| Rpl_semi_sync_master_yes_tx                | 0     |
+--------------------------------------------+-------+
14 rows in set (0.00 sec)

现在半同步已经正常工作了，主要看Rpl_semi_sync_master_clients是否不为0，Rpl_semi_sync_master_status是否为ON。如果Rpl_semi_sync_master_status为OFF，说明出现了网络延迟或Slave IO线程延迟。
```



## 3.3 验证半同步超时

**slave上关闭半同步并重启IO线程**

```python
mysql> set global rpl_semi_sync_slave_enabled = 0 ;
Query OK, 0 rows affected (0.00 sec)

mysql> stop slave io_thread;
Query OK, 0 rows affected (0.00 sec)

mysql>  start slave io_thread;
Query OK, 0 rows affected (0.00 sec)
```



**master上创建数据库验证**

```python
//master创建数据库
mysql> create database dbtest;
Query OK, 1 row affected (2.00 sec)

mysql> create database dbtest01;
Query OK, 1 row affected (0.00 sec)
```

**创建第一个数据库花了2.00秒，而我们前面设置的超时时间是2秒，而创建第二个数据库花了0.00秒，由此得出结论是超时转换为异步传送。**



**可以在Master上查看半同步相关的参数值Rpl_semi_sync_master_clients和Rpl_semi_sync_master_status是否正常。**

```python
mysql> show global status like '%semi%'; 
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 0     |	#为0表示关闭半同步
| Rpl_semi_sync_master_net_avg_wait_time     | 0     |
| Rpl_semi_sync_master_net_wait_time         | 0     |
| Rpl_semi_sync_master_net_waits             | 0     |
| Rpl_semi_sync_master_no_times              | 1     |
| Rpl_semi_sync_master_no_tx                 | 2     |
| Rpl_semi_sync_master_status                | OFF   |	#OFF表示关闭半同步
| Rpl_semi_sync_master_timefunc_failures     | 0     |
| Rpl_semi_sync_master_tx_avg_wait_time      | 0     |
| Rpl_semi_sync_master_tx_wait_time          | 0     |
| Rpl_semi_sync_master_tx_waits              | 0     |
| Rpl_semi_sync_master_wait_pos_backtraverse | 0     |
| Rpl_semi_sync_master_wait_sessions         | 0     |
| Rpl_semi_sync_master_yes_tx                | 0     |
+--------------------------------------------+-------+
14 rows in set (0.00 sec)

```

**可以看到都自动关闭了，需要注意一点的是，当Slave开启半同步后，或者当主从之间网络延迟恢复正常的时候，半同步复制会自动从异步复制又转为半同步复制，还是相当智能的。**



**另外个人在实际使用中还碰到一种情况从库IO线程有延迟时，主库会自动把半同步复制降为异步复制；当从库IO延迟没有时，主库又会把异步复制升级为半同步复制。可以进行压测模拟，但是此时查看Master的状态跟上面直接关闭Slave半同步有些不同，会发现Rpl_semi_sync_master_clients仍然等于1，而Rpl_semi_sync_master_status等于OFF。**

**随着MySQL 5.7版本的发布，半同步复制技术升级为全新的Loss-less Semi-Synchronous Replication架构，其成熟度、数据一致性与执行效率得到显著的提升。**



# 4.MySQL 5.7半同步复制的改进

**现在我们已经知道，在半同步环境下，主库是在事务提交之后等待Slave ACK，所以才会有数据不一致问题。所以这个Slave ACK在什么时间去等待，也是一个很关键的问题了。因此MySQL针对半同步复制的问题，在5.7.2引入了Loss-less Semi-Synchronous，在调用binlog sync之后，engine层commit之前等待Slave ACK。这样只有在确认Slave收到事务events后，事务才会提交。在commit之前等待Slave ACK，同时可以堆积事务，利于group commit，有利于提升性能。**

## 4.1 master安装半同步模块并启动

**master配置**

```python
1.安装插件
mysql> install plugin rpl_semi_sync_master soname 'semisync_master.so';
Query OK, 0 rows affected (0.00 sec)

2.查看半同步信息，可以看到默认为10000毫秒即10秒
mysql> show global variables like '%semi%';
+-------------------------------------------+------------+
| Variable_name                             | Value      |
+-------------------------------------------+------------+
| rpl_semi_sync_master_enabled              | OFF        |
| rpl_semi_sync_master_timeout              | 10000      |
| rpl_semi_sync_master_trace_level          | 32         |
| rpl_semi_sync_master_wait_for_slave_count | 1          |
| rpl_semi_sync_master_wait_no_slave        | ON         |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC |
+-------------------------------------------+------------+
6 rows in set (0.00 sec)

3.启动插件
mysql> set global rpl_semi_sync_master_enabled = 1;
Query OK, 0 rows affected (0.00 sec)

4.设置超时时间为1秒
mysql> set global rpl_semi_sync_master_timeout = 1000;
Query OK, 0 rows affected (0.00 sec)


5.查看配置
mysql> show global variables like '%semi%';
+-------------------------------------------+------------+
| Variable_name                             | Value      |
+-------------------------------------------+------------+
| rpl_semi_sync_master_enabled              | ON         |
| rpl_semi_sync_master_timeout              | 1000       |
| rpl_semi_sync_master_trace_level          | 32         |
| rpl_semi_sync_master_wait_for_slave_count | 1          |
| rpl_semi_sync_master_wait_no_slave        | ON         |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC |
+-------------------------------------------+------------+
6 rows in set (0.00 sec)


6.写入mysql配置文件，永久生效，在[mysqld]下写入以下两行内容
rpl_semi_sync_master_enabled = 1;
rpl_semi_sync_master_timeout = 1000;
```



## 4.2 slave安装半同步模块并启动

```python
1.安装半同步模块
mysql> install plugin rpl_semi_sync_slave soname 'semisync_slave.so';
Query OK, 0 rows affected (0.01 sec)

2.启动插件
mysql> set global rpl_semi_sync_slave_enabled = 1;
Query OK, 0 rows affected (0.00 sec)

3.重启IO线程
mysql> stop slave io_thread;
Query OK, 0 rows affected (0.00 sec)

mysql> start slave io_thread;
Query OK, 0 rows affected (0.00 sec)

4.在master上查看是否启用了半同步
mysql> show global status like 'rpl%';
+----------------------------+-------+
| Variable_name              | Value |
+----------------------------+-------+
| Rpl_semi_sync_slave_status | ON    |
+----------------------------+-------+
1 row in set (0.00 sec)

```



## 4.3 验证半同步超时

**slave上关闭半同步并重启IO线程**

```python
mysql> set global rpl_semi_sync_slave_enabled = 0 ;
Query OK, 0 rows affected (0.00 sec)

mysql> stop slave io_thread;
Query OK, 0 rows affected (0.00 sec)

mysql> start slave io_thread;
Query OK, 0 rows affected (0.00 sec)
```



**master上创建数据库验证**

```python
//master创建数据库
mysql> create database dbtest;
Query OK, 1 row affected (1.00 sec)

mysql> create database dbtest01;
Query OK, 1 row affected (0.00 sec)
```

**创建第一个数据库花了1.00秒，而我们前面设置的超时时间是1秒，而创建第二个数据库花了0.00秒，由此得出结论是超时转换为异步传送。**



**可以在Master上查看半同步相关的参数值Rpl_semi_sync_master_clients和Rpl_semi_sync_master_status是否正常。**

```python
mysql> show global status like '%semi%'; 
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 0     |	#为0表示关闭半同步
| Rpl_semi_sync_master_net_avg_wait_time     | 0     |
| Rpl_semi_sync_master_net_wait_time         | 0     |
| Rpl_semi_sync_master_net_waits             | 0     |
| Rpl_semi_sync_master_no_times              | 1     |
| Rpl_semi_sync_master_no_tx                 | 2     |
| Rpl_semi_sync_master_status                | OFF   |	#OFF表示关闭半同步
| Rpl_semi_sync_master_timefunc_failures     | 0     |
| Rpl_semi_sync_master_tx_avg_wait_time      | 0     |
| Rpl_semi_sync_master_tx_wait_time          | 0     |
| Rpl_semi_sync_master_tx_waits              | 0     |
| Rpl_semi_sync_master_wait_pos_backtraverse | 0     |
| Rpl_semi_sync_master_wait_sessions         | 0     |
| Rpl_semi_sync_master_yes_tx                | 0     |
+--------------------------------------------+-------+
14 rows in set (0.00 sec)

```

**可以看到都自动关闭了**

## 4.4 支持无损复制(Loss-less Semi-Synchronous)

**在Loss-less Semi-Synchronous模式下，master在调用binlog sync之后，engine层commit之前等待Slave ACK（需要收到至少一个Slave节点回复的ACK后）。这样只有在确认Slave收到事务events后，master事务才会提交，然后把结果返回给客户端。此时此事务才对其他事务可见。在这种模式下解决了after_commit模式带来的幻读和数据丢失问题，因为主库没有提交事务。但也会有个问题，假设主库在存储引擎提交之前挂了，那么很明显这个事务是不成功的，但由于对应的Binlog已经做了Sync操作，从库已经收到了这些Binlog，并且执行成功，相当于在从库上多了数据，也算是有问题的，但多了数据，问题一般不算严重。这个问题可以这样理解，作为MySQL，在没办法解决分布式数据一致性问题的情况下，它能保证的是不丢数据，多了数据总比丢数据要好。**

**无损复制其实就是对semi sync增加了rpl_semi_sync_master_wait_point参数，来控制半同步模式下主库在返回给会话事务成功之前提交事务的方式。rpl_semi_sync_master_wait_point该参数有两个值：AFTER_COMMIT和AFTER_SYNC**

### 4.4.1 第一个值：AFTER_COMMIT（5.6默认值）

**master将每个事务写入binlog（sync_binlog=1），传递到slave刷新到磁盘(sync_relay=1)，同时主库提交事务。master等待slave反馈收到relay log，只有收到ACK后master才将commit OK结果反馈给客户端。**

![iShot2020-10-14 13.50.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.50.06.png)

### 4.4.2 第二个值：AFTER_SYNC（5.7默认值，但5.6中无此模式）

**master将每个事务写入binlog , 传递到slave刷新到磁盘(relay log)。master等待slave反馈接收到relay log的ack之后，再提交事务并且返回commit OK结果给客户端。 即使主库crash，所有在主库上已经提交的事务都能保证已经同步到slave的relay log中。**

![iShot2020-10-14 13.50.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.50.31.png)

## 4.5 半同步复制与无损复制的对比

### 4.5.1 ACK的时间点不同

- **半同步复制在InnoDB层的Commit Log后等待ACK，主从切换会有数据丢失风险。**
- **无损复制在MySQL Server层的Write binlog后等待ACK，主从切换会有数据变多风险。**

### 4.5.2 主从数据一致性

- **半同步复制意味着在Master节点上，这个刚刚提交的事物对数据库的修改，对其他事物是可见的。因此，如果在等待Slave ACK的时候crash了，那么会对其他事务出现幻读，数据丢失。**
- **无损复制在write binlog完成后，就传输binlog，但还没有去写commit log，意味着当前这个事物对数据库的修改，其他事物也是不可见的。因此，不会出现幻读，数据丢失风险。**

**因此5.7引入了无损复制（after_sync）模式，带来的主要收益是解决after_commit导致的master crash后数据丢失问题，因此在引入after_sync模式后，所有提交的数据已经都被复制，故障切换时数据一致性将得到提升。**

- **性能提升，支持发送binlog和接受ack的异步化**

**旧版本的semi sync受限于dump thread ，原因是dump thread承担了两份不同且又十分频繁的任务：传送binlog给slave ，还需要等待slave反馈信息，而且这两个任务是串行的，dump thread必须等待slave返回之后才会传送下一个events事务。dump thread已然成为整个半同步提高性能的瓶颈。在高并发业务场景下，这样的机制会影响数据库整体的TPS 。**

![iShot2020-10-14 13.50.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.50.58.png)

**为了解决上述问题，在5.7版本的semi sync框架中，独立出一个Ack Receiver线程 ，专门用于接收slave返回的ack请求，这将之前dump线程的发送和接受工作分为了两个线程来处理。这样master上有两个线程独立工作，可以同时发送binlog到slave，和接收slave的ack信息。因此半同步复制得到了极大的性能提升。这也是MySQL 5.7发布时号称的Faster semi-sync replication。**

![iShot2020-10-14 13.51.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.51.25.png)

**但是在MySQL 5.7.17之前，这个Ack Receiver线程采用了select机制来监听slave返回的结果，然而select机制监控的文件句柄只能是0-1024，当超过1024时，用户在MySQL的错误日志中或许会收到类似如下的报错，更有甚者会导致MySQL发生宕机。**

**semi-sync master failed on net_flush() before waiting for slave reply.**

**MySQL 5.7.17版本开始，官方修复了这个bug，开始使用poll机制来替换原来的select机制，从而可以避免上面的问题。其实poll调用本质上和select没有区别，只是在I/O句柄数理论上没有上限了，原因是它是基于链表来存储的。但是同样有缺点：比如大量的fd的数组被整体复制于用户态和内核地址空间之间，而不管这样的复制是不是有意义。poll还有一个特点是“水平触发”，如果报告了fd后，没有被处理，那么下次poll时会再次报告该fd。**

**其实在高性能软件中都是用另外一种调用机制，名为epoll，高性能的代表，比如Nginx，haproxy等都是使用epoll。可能poll的复杂性比epoll低，另外对于ack receiver线程来说可能poll足矣。**

- **性能提升，控制主库接收slave写事务成功反馈数量**

**MySQL 5.7新增了rpl_semi_sync_master_wait_slave_count参数，可以用来控制主库接受多少个slave写事务成功反馈，给高可用架构切换提供了灵活性。如图所示，当count值为2时，master需等待两个slave的ack。**

![iShot2020-10-14 13.51.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.51.46.png)

- **性能提升，Binlog互斥锁改进**

**旧版本半同步复制在主提交binlog的写会话和dump thread读binlog的操作都会对binlog添加互斥锁，导致binlog文件的读写是串行化的，存在并发度的问题。**

![iShot2020-10-14 13.52.08](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.52.08.png)



**MySQL 5.7对binlog lock进行了以下两方面优化:**

**1.移除了dump thread对binlog的互斥锁。**

**2.加入了安全边际保证binlog的读安全。**

![iShot2020-10-14 13.52.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.52.37.png)

**可以看到从replication功能引入后，官方MySQL一直在不停的完善，前进。同时我们可以发现当前原生的MySQL主备复制实现实际上很难在满足数据一致性的前提下做到高可用、高性能。**

