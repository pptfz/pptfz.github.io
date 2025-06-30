# tcpdump命令

[tcpdump github](https://github.com/the-tcpdump-group/tcpdump)

[tcpdump官网](https://www.tcpdump.org/)



## 1. 基本介绍

tcpdump 是一个功能强大的命令行网络数据包分析工具，用于捕获和分析网络流量。它可以捕获经过网络接口的数据包，并显示这些包的头部信息或内容



## 2. 基本语法

```shell
tcpdump [选项] [过滤表达式]
```



## 3. 常用选项参数

### 3.1 基本选项

| 选项    | 描述                                            | 示例                    |
| ------- | ----------------------------------------------- | ----------------------- |
| `-i`    | 指定网络接口                                    | `tcpdump -i eth0`       |
| `-n`    | 不解析主机名                                    | `tcpdump -n`            |
| `-nn`   | 不解析主机名和端口                              | `tcpdump -nn`           |
| `-c`    | 指定捕获数据包的数量                            | `tcpdump -c 10`         |
| `-s`    | 指定每个数据包的截断长度                        | `tcpdump -s 0` (不截断) |
| `-X`    | 以十六进制和ASCII格式显示包内容                 | `tcpdump -X`            |
| `-XX`   | 以十六进制和ASCII格式显示包内容（包括以太网头） | `tcpdump -XX`           |
| `-v`    | 详细模式                                        | `tcpdump -v`            |
| `-vv`   | 更详细模式                                      | `tcpdump -vv`           |
| `-vvv`  | 最详细模式                                      | `tcpdump -vvv`          |
| `-S`    | 打印绝对的序列号                                | `tcpdump -S`            |
| `-q`    | 简洁模式，输出较少协议信息                      | `tcpdump -q`            |
| `-t`    | 不显示时间戳                                    | `tcpdump -t`            |
| `-tt`   | 显示无格式的时间戳                              | `tcpdump -tt`           |
| `-ttt`  | 显示相对时间戳                                  | `tcpdump -ttt`          |
| `-tttt` | 显示默认格式的日期和时间                        | `tcpdump -tttt`         |

### 3.2 输出选项

| 选项 | 描述                  | 示例                      |
| ---- | --------------------- | ------------------------- |
| `-w` | 将数据包写入文件      | `tcpdump -w capture.pcap` |
| `-r` | 从文件读取数据包      | `tcpdump -r capture.pcap` |
| `-A` | 以ASCII格式显示包内容 | `tcpdump -A`              |
| `-l` | 行缓冲模式            | `tcpdump -l`              |
| `-D` | 列出可用的网络接口    | `tcpdump -D`              |
| `-e` | 显示链路层头部        | `tcpdump -e`              |
| `-p` | 不进入混杂模式        | `tcpdump -p`              |
| `-K` | 不验证TCP校验和       | `tcpdump -K`              |

### 3.3 BPF过滤选项

| 选项 | 描述                     | 示例                                             |
| ---- | ------------------------ | ------------------------------------------------ |
| `-F` | 从文件读取过滤表达式     | `tcpdump -F filter.txt`                          |
| `-G` | 每N秒轮换一次输出文件    | `tcpdump -G 60 -w file%Y%m%d%H%M%S.pcap`         |
| `-z` | 在轮换输出文件后执行命令 | `tcpdump -z gzip -G 60 -w file%Y%m%d%H%M%S.pcap` |

## 4. 过滤表达式

### 4.1 协议过滤

| 表达式 | 描述       | 示例                  |
| ------ | ---------- | --------------------- |
| `ip`   | 捕获IP包   | `tcpdump ip`          |
| `tcp`  | 捕获TCP包  | `tcpdump tcp`         |
| `udp`  | 捕获UDP包  | `tcpdump udp`         |
| `icmp` | 捕获ICMP包 | `tcpdump icmp`        |
| `arp`  | 捕获ARP包  | `tcpdump arp`         |
| `not`  | 否定表达式 | `tcpdump not arp`     |
| `and`  | 与运算     | `tcpdump tcp and udp` |
| `or`   | 或运算     | `tcpdump tcp or udp`  |

### 4.2 地址与端口过滤

| 表达式      | 描述         | 示例                         |
| ----------- | ------------ | ---------------------------- |
| `host`      | 指定主机     | `tcpdump host 192.168.1.1`   |
| `src`       | 指定源地址   | `tcpdump src 192.168.1.1`    |
| `dst`       | 指定目标地址 | `tcpdump dst 192.168.1.1`    |
| `net`       | 指定网络     | `tcpdump net 192.168.1.0/24` |
| `port`      | 指定端口     | `tcpdump port 80`            |
| `src port`  | 指定源端口   | `tcpdump src port 80`        |
| `dst port`  | 指定目标端口 | `tcpdump dst port 80`        |
| `portrange` | 指定端口范围 | `tcpdump portrange 20-30`    |

### 4.3 包大小过滤

| 表达式    | 描述             | 示例                   |
| --------- | ---------------- | ---------------------- |
| `greater` | 大于指定大小的包 | `tcpdump greater 1000` |
| `less`    | 小于指定大小的包 | `tcpdump less 1000`    |

### 4.4 TCP标志过滤

| 表达式          | 描述        | 示例                                       |
| --------------- | ----------- | ------------------------------------------ |
| `tcp[tcpflags]` | 过滤TCP标志 | `tcpdump 'tcp[tcpflags] & (tcp-syn) != 0'` |
| `tcp-syn`       | SYN标志     | `tcpdump 'tcp[tcpflags] & tcp-syn != 0'`   |
| `tcp-ack`       | ACK标志     | `tcpdump 'tcp[tcpflags] & tcp-ack != 0'`   |
| `tcp-fin`       | FIN标志     | `tcpdump 'tcp[tcpflags] & tcp-fin != 0'`   |
| `tcp-rst`       | RST标志     | `tcpdump 'tcp[tcpflags] & tcp-rst != 0'`   |
| `tcp-psh`       | PSH标志     | `tcpdump 'tcp[tcpflags] & tcp-psh != 0'`   |
| `tcp-urg`       | URG标志     | `tcpdump 'tcp[tcpflags] & tcp-urg != 0'`   |

## 5. 实用示例

### 5.1 基本捕获

```bash
# 捕获所有流量
tcpdump -i eth0

# 捕获10个包
tcpdump -c 10 -i eth0

# 捕获包含完整内容的包
tcpdump -s 0 -i eth0

# 捕获并保存到文件
tcpdump -w capture.pcap -i eth0

# 从文件读取并显示
tcpdump -r capture.pcap
```

### 5.2 过滤特定主机和端口

```bash
# 捕获与特定主机相关的流量
tcpdump host 192.168.1.1

# 捕获特定源主机的流量
tcpdump src host 192.168.1.1

# 捕获特定目标主机的流量
tcpdump dst host 192.168.1.1

# 捕获特定端口的流量
tcpdump port 80

# 捕获特定源端口的流量
tcpdump src port 80

# 捕获特定目标端口的流量
tcpdump dst port 80

# 捕获特定端口范围的流量
tcpdump portrange 20-30
```

### 5.3 复杂过滤条件

```bash
# 捕获特定主机的HTTP流量
tcpdump -i eth0 host 192.168.1.1 and port 80

# 捕获除ARP和ICMP之外的所有流量
tcpdump -i eth0 not arp and not icmp

# 捕获特定网络内的SSH流量
tcpdump -i eth0 net 192.168.1.0/24 and port 22

# 捕获TCP SYN包（TCP连接建立）
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'

# 捕获TCP SYN+ACK包（TCP连接确认）
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-ack) == (tcp-syn|tcp-ack)'

# 捕获具有特定内容的HTTP请求
tcpdump -i eth0 -A 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
```

### 5.4 高级输出选项

```bash
# 显示详细信息
tcpdump -v -i eth0

# 显示十六进制和ASCII格式
tcpdump -X -i eth0

# 显示详细时间戳
tcpdump -tttt -i eth0

# 每60秒创建一个新的捕获文件
tcpdump -G 60 -w file%Y%m%d%H%M%S.pcap -i eth0

# 捕获并实时压缩
tcpdump -z gzip -G 60 -w file%Y%m%d%H%M%S.pcap -i eth0
```

### 5.5 查看特定协议流量

```bash
# 查看DNS流量
tcpdump -i eth0 udp port 53

# 查看HTTP流量
tcpdump -i eth0 -A tcp port 80

# 查看HTTPS流量
tcpdump -i eth0 tcp port 443

# 查看特定VLAN的流量
tcpdump -i eth0 vlan 10

# 查看NTP流量
tcpdump -i eth0 udp port 123
```

### 5.6 混合示例

```bash
# 捕获HTTP GET请求
tcpdump -i eth0 -A 'tcp port 80 and (tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420)'

# 捕获IP分片
tcpdump -i eth0 'ip[6:2] & 0x1fff != 0'

# 捕获特定长度的包
tcpdump -i eth0 'len > 1000'

# 捕获特定MAC地址的包
tcpdump -i eth0 ether host 00:11:22:33:44:55

# 捕获特定网站的流量
tcpdump -i eth0 'host example.com'
```

## 6. 特殊用法

### 6.1 时间戳和轮换

```bash
# 使用UTC时间戳
tcpdump -tttt -i eth0

# 按指定时间轮换文件并压缩
tcpdump -i eth0 -G 3600 -w 'file-%Y-%m-%d-%H.pcap' -z gzip
```

### 6.2 组合过滤器

```bash
# 捕获特定主机的HTTP或HTTPS流量
tcpdump -i eth0 'host 192.168.1.1 and (port 80 or port 443)'

# 捕获除某个主机外的所有ICMP流量
tcpdump -i eth0 'icmp and not host 192.168.1.1'
```

### 6.3 调试和优化

```bash
# 检查不同接口的可用性
tcpdump -D

# 使用行缓冲并通过管道传递给其他命令
tcpdump -l -i eth0 | grep "SYN"

# 仅捕获TCP握手
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0'
```

## 7. 性能考虑

1. 对于高流量环境，使用更精确的过滤器减少CPU负载
2. 使用 `-s 0` 捕获完整包内容可能会影响性能
3. 在高负载环境中，考虑将捕获结果写入文件后再分析
4. 使用 `-B` 选项增加捕获缓冲区大小（例如：`-B 4096`）可减少丢包

## 8. 安全考虑

1. 运行 tcpdump 通常需要 root 权限
2. 在生产环境使用时应谨慎，可能会影响网络性能
3. 捕获的数据可能包含敏感信息，注意文件的安全存储和处理
4. 使用 `-p` 选项可以禁用混杂模式，只捕获发送到本机的数据包