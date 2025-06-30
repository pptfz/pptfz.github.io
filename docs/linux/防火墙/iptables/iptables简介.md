# iptables简介

[iptables维基百科](https://zh.wikipedia.org/wiki/Iptables)

[iptables官网](https://www.netfilter.org/)

[iptables源码库](https://git.netfilter.org/iptables/)

[archlinux iptables文档](https://wiki.archlinux.org/title/Iptables)



## 简介

iptables 是一个配置 Linux 内核防火墙的命令行工具，是 [Netfilter](https://en.wikipedia.org/wiki/Netfilter) 项目的一部分。术语 iptables 也经常代指该内核级防火墙。iptables 可以直接配置，也可以通过许多控制台和图形化前端配置。iptables 用于 ipv4，ip6tables 用于 IPv6。iptables和ip6tables 拥有相同的语法，但是有些特别的选项，对 IPv4 和 IPv6 有些不同的。



## 基本概念

### 概念

iptables 可以检测、修改、转发、重定向和丢弃 IPv4 数据包。过滤 IPv4 数据包的代码已经内置于内核中，并且按照不同的目的被组织成**表**的集合。**表**由一组预先定义的**链**组成，**链**包含遍历顺序规则。每一条规则包含一个谓词的潜在匹配和相应的动作（称为**目标**），如果谓词为真，该动作会被执行。也就是说条件匹配。iptables 是用户工具，允许用户使用**链**和**规则**。很多新手面对复杂的 linux IP 路由时总是感到气馁，但是，实际上最常用的一些应用案例（NAT 或者基本的网络防火墙）并不是很复杂。

理解 iptables 如何工作的关键是这张[图](https://www.frozentux.net/iptables-tutorial/images/tables_traverse.jpg)。图中在上面的小写字母代表**表**，在下面的大写字母代表**链**。**从任何网络端口**进来的每一个 IP 数据包都要从上到下的穿过这张图。一种常见的错误认知是认为 iptables 对从内部端口进入的数据包和从面向互联网端口进入的数据包采取不同的处理方式，相反，iptables 对从任何端口进入的数据包都会采取相同的处理方式。可以定义规则使 iptables 采取不同的方式对待从不同端口进入的数据包。当然一些数据包是用于本地进程的，因此在图中表现为从顶端进入，到 `<Local Process>` 停止，而另一些数据包是由本地进程生成的，因此在图中表现为从 `<Local Process>` 发出，一直向下穿过该流程图。一份关于该流程图如何工作的详细解释请参考[这里](https://www.frozentux.net/iptables-tutorial/iptables-tutorial.html#TRAVERSINGOFTABLES)

![iShot_2025-04-21_15.57.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-21_15.57.01.png)



在大多数使用情况下都不会用到 **raw**，**mangle** 和 **security** 表。下图简要描述了网络数据包通过 **iptables** 的过程：

```shell
                               XXXXXXXXXXXXXXXXXX
                             XXX     Network    XXX
                               XXXXXXXXXXXXXXXXXX
                                       +
                                       |
                                       v
 +-------------+              +------------------+
 |table: filter| <---+        | table: nat       |
 |chain: INPUT |     |        | chain: PREROUTING|
 +-----+-------+     |        +--------+---------+
       |             |                 |
       v             |                 v
 [local process]     |           ****************          +--------------+
       |             +---------+ Routing decision +------> |table: filter |
       v                         ****************          |chain: FORWARD|
****************                                           +------+-------+
Routing decision                                                  |
****************                                                  |
       |                                                          |
       v                        ****************                  |
+-------------+       +------>  Routing decision  <---------------+
|table: nat   |       |         ****************
|chain: OUTPUT|       |               +
+-----+-------+       |               |
      |               |               v
      v               |      +-------------------+
+--------------+      |      | table: nat        |
|table: filter | +----+      | chain: POSTROUTING|
|chain: OUTPUT |             +--------+----------+
+--------------+                      |
                                      v
                               XXXXXXXXXXXXXXXXXX
                             XXX    Network     XXX
                               XXXXXXXXXXXXXXXXXX
```



### 表	Tables

iptables 包含 5 张表（tables）:

- `raw` 用于配置数据包，关闭nat表上启用的连接追踪机制，`raw` 中的数据包不会被系统跟踪。

- `filter` 是用于存放所有与防火墙相关操作的默认表。

- `nat` 用于 [网络地址转换](https://en.wikipedia.org/wiki/Network_address_translation)（例如：端口转发）。

- `mangle` 用于对特定数据包的修改（参考 [损坏数据包](https://en.wikipedia.org/wiki/Mangled_packet)）。

- `security` 用于 [强制访问控制](https://wiki.archlinuxcn.org/wiki/Security#Mandatory_access_control) 网络规则（例如： SELinux -- 详细信息参考 [该文章](https://lwn.net/Articles/267140/)）。

大部分情况仅需要使用 **filter** 和 **nat**。其他表用于更复杂的情况——包括多路由和路由判定——已经超出了本文介绍的范围。



| 表名       | 作用简述                               | 默认加载？ | 常用场景              |
| ---------- | -------------------------------------- | ---------- | --------------------- |
| `filter`   | **默认表**，用于**控制访问（防火墙）** | ✅ 是       | 拒/放行某些 IP/端口   |
| `nat`      | 用于**地址转换（如端口映射）**         | ✅ 是       | DNAT/SNAT             |
| `mangle`   | 修改报文内容（如 TTL、TOS、mark）      | ❌ 否       | QoS、流量标记         |
| `raw`      | 跳过连接跟踪，加速数据包处理           | ❌ 否       | 配合 `conntrack` 使用 |
| `security` | 用于 SELinux 的访问控制                | ❌ 否       | 安全模块控制          |





### 链	Chains

- `INPUT` : 输入链，发往本机的数据包通过此链。

- `OUTPUT` : 输出链，从本机发出的数据包通过此链。

- `FORWARD` :  转发链，本机转发的数据包通过此链。

- `PREROUTING` : 路由前链，在处理路由规则前通过此链，通常用于目的地址转换（DNAT）。

- `POSTROUTING` : 路由后链，完成路由规则后通过此链，通常用于源地址转换（SNAT）。



表包含的链

| 表名       | 包含的链（Chains）                                           |
| ---------- | ------------------------------------------------------------ |
| `filter`   | `INPUT`、`OUTPUT`、`FORWARD`                                 |
| `nat`      | `PREROUTING`、`INPUT`、`OUTPUT`、`POSTROUTING`               |
| `mangle`   | `PREROUTING`、`INPUT`、`FORWARD`、`OUTPUT`、`POSTROUTING`    |
| `raw`      | `PREROUTING`、`OUTPUT`                                       |
| `security` | `INPUT`、`OUTPUT`、`FORWARD`（仅用于与 SELinux 集成的访问控制） |

![iShot_2025-04-24_11.24.00](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-24_11.24.00.png)





链存在于的表

| 链名称        | 所在表（Tables）                             |
| ------------- | -------------------------------------------- |
| `PREROUTING`  | `raw`, `mangle`, `nat`                       |
| `INPUT`       | `mangle`, `filter`, `security`               |
| `FORWARD`     | `mangle`, `filter`, `security`               |
| `OUTPUT`      | `raw`, `mangle`, `nat`, `filter`, `security` |
| `POSTROUTING` | `mangle`, `nat`                              |





### 规则	Rules

数据包的过滤基于**规则**。**规则**由一个*目标*（数据包匹配所有条件后的动作）和很多*匹配*（导致该规则可以应用的数据包所满足的条件）指定。一个规则的典型匹配事项是数据包进入的端口（例如：eth0 或者 eth1）、数据包的类型（ICMP, TCP, 或者 UDP）和数据包的目的端口。

目标使用 `-j` 或者 `--jump` 选项指定。目标可以是用户定义的链（例如，如果条件匹配，跳转到之后的用户定义的链，继续处理）、一个内置的特定目标或者是一个目标扩展。内置目标是 `ACCEPT`， `DROP`， `QUEUE` 和 `RETURN`，目标扩展是 `REJECT` 和  `LOG`。如果目标是内置目标，数据包的命运会立刻被决定并且在当前表的数据包的处理过程会停止。如果目标是用户定义的链，并且数据包成功穿过第二条链，目标将移动到原始链中的下一个规则。目标扩展可以被*终止*（像内置目标一样）或者*不终止*（像用户定义链一样）。详细信息参阅 [iptables-extensions(8)](https://man.archlinux.org/man/iptables-extensions.8)。



#### 常见动作（target）

:::tip 说明

这些是 `-j` 后面的部分，表示 **匹配后该怎么办**

:::

| 动作（target） | 含义                                 |
| -------------- | ------------------------------------ |
| `ACCEPT`       | 允许数据包通过                       |
| `DROP`         | 丢弃数据包，不返回任何信息           |
| `REJECT`       | 拒绝数据包，发送拒绝响应             |
| `SNAT`         | 修改源地址（一般用于出公网）         |
| `DNAT`         | 修改目标地址（一般用于端口映射）     |
| `MASQUERADE`   | 源地址伪装（常用于动态 IP 的 NAT）   |
| `LOG`          | 记录匹配的数据包信息到系统日志       |
| `MARK`         | 给数据包打标记（配合 QoS、路由使用） |
| `RETURN`       | 返回上级链继续处理                   |
| `REDIRECT`     | 重定向到本地端口（如透明代理）       |



#### 常见匹配条件（match）



| 匹配项         | 示例                            | 含义                                |
| -------------- | ------------------------------- | ----------------------------------- |
| `-s`           | `-s 192.168.1.0/24`             | 源 IP 地址                          |
| `-d`           | `-d 8.8.8.8`                    | 目标 IP 地址                        |
| `-p`           | `-p tcp`                        | 协议类型（如 `tcp`, `udp`, `icmp`） |
| `--dport`      | `--dport 80`                    | 目标端口                            |
| `--sport`      | `--sport 53`                    | 源端口                              |
| `-i`           | `-i eth0`                       | 入接口（interface）                 |
| `-o`           | `-o eth1`                       | 出接口                              |
| `-m state`     | `--state ESTABLISHED`           | 连接状态（如 ESTABLISHED、NEW）     |
| `-m conntrack` | `--ctstate RELATED,ESTABLISHED` | 使用 conntrack 跟踪状态             |



### 遍历链

该 [流程图](https://www.frozentux.net/iptables-tutorial/images/tables_traverse.jpg) 描述了链在任何接口上收到的网络数据包是按照怎样的顺序穿过表的交通管制链。第一个路由策略包括决定数据包的目的地是本地主机（这种情况下，数据包穿过 `INPUT` 链），还是其他主机（数据包穿过 `FORWARD` 链）；中间的路由策略包括决定给传出的数据包使用哪个个源地址、分配哪个接口；最后一个路由策略存在是因为先前的 mangle 与 nat 链可能会改变数据包的路由信息。数据包通过路径上的每一条链时，链中的每一条规则按顺序匹配；无论何时匹配了一条规则，相应的 `target` / `jump` 动作将会执行。最常用的3个 target 是 `ACCEPT`, `DROP` ,或者 jump 到用户自定义的链。内置的链有默认的策略，但是用户自定义的链没有默认的策略。在 jump 到的链中，若每一条规则都不能提供完全匹配，那么数据包像[这张图片](https://www.frozentux.net/iptables-tutorial/images/table_subtraverse.jpg)描述的一样返回到调用链。在任何时候，若 `DROP` target 的规则实现完全匹配，那么被匹配的数据包会被丢弃，不会进行进一步处理。如果一个数据包在链中被 `ACCEPT`，那么它也会被所有的父链 `ACCEPT`，并且不再遍历其他父链。然而，要注意的是，数据包还会以正常的方式继续遍历其他表中的其他链。





## 语法

```shell
iptables [-t 表名] 命令 链名 匹配条件 -j 动作
```



| 组件      | 示例                           | 说明                                 |
| --------- | ------------------------------ | ------------------------------------ |
| `-t`      | `-t nat`                       | 指定表（默认是 `filter`）            |
| 命令      | `-A`、`-I`、`-D`、`-L`         | 操作规则，如添加、插入、删除、列出等 |
| 链名      | `INPUT`、`FORWARD`、`OUTPUT`   | 指定在哪条链中操作                   |
| 条件匹配  | `-p tcp --dport 80 -s 1.1.1.1` | 根据 IP、端口、协议等条件匹配数据包  |
| `-j` 动作 | `ACCEPT`、`DROP`、`DNAT` 等    | 匹配后执行的操作                     |



## 命令



| 命令 | 含义                         |
| ---- | ---------------------------- |
| `-A` | 添加规则到链末尾（Append）   |
| `-I` | 插入规则到链开始（Insert）   |
| `-D` | 删除规则（Delete）           |
| `-R` | 替换某条规则（Replace）      |
| `-L` | 显示规则列表（List）         |
| `-F` | 清空某条链的规则（Flush）    |
| `-N` | 创建自定义链（New chain）    |
| `-X` | 删除自定义链（Delete chain） |
| `-P` | 设置默认策略（Policy）       |





