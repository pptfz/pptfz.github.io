[toc]



# HTTP 协议

[本文严重抄袭至互联网](https://www.jianshu.com/p/6e9e4156ece3)

**总纲**

![iShot2020-04-0721.07.34](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0721.07.34.png)

## 1.概述

### 1.1 计算机网络体系结构分层

![iShot_2024-08-22_16.53.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_16.53.45.png)



### 1.2 TCP/IP 通信传输流

利用 TCP/IP 协议族进行网络通信时，会通过分层顺序与对方进行通信。发送端从应用层往下走，接收端则从链路层往上走。如下：

**TCP/IP 通信传输流**

![iShot2020-04-0721.10.34](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0721.10.34.png)



- 首先作为发送端的客户端在应用层（HTTP 协议）发出一个想看某个 Web 页面的 HTTP 请求。
- 接着，为了传输方便，在传输层（TCP 协议）把从应用层处收到的数据（HTTP 请求报文）进行分割，并在各个报文上打上标记序号及端口号后转发给网络层。
- 在网络层（IP 协议），增加作为通信目的地的 MAC 地址后转发给链路层。这样一来，发往网络的通信请求就准备齐全了。
- 接收端的服务器在链路层接收到数据，按序往上层发送，一直到应用层。当传输到应用层，才能算真正接收到由客户端发送过来的 HTTP请求。

**HTTP请求如下图所示：**

![iShot2020-04-0721.15.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0721.15.37.png)

在网络体系结构中，包含了众多的网络协议，这篇文章主要围绕 HTTP 协议（HTTP/1.1版本）展开。

> **HTTP协议（HyperText Transfer Protocol，超文本传输协议）是用于从WWW服务器传输超文本到本地浏览器的传输协议。它可以使浏览器更加高效，使网络传输减少。它不仅保证计算机正确快速地传输超文本文档，还确定传输文档中的哪一部分，以及哪部分内容首先显示(如文本先于图形)等。**
>  **HTTP是客户端浏览器或其他程序与Web服务器之间的应用层通信协议。在Internet上的Web服务器上存放的都是超文本信息，客户机需要通过HTTP协议传输所要访问的超文本信息。HTTP包含命令和传输信息，不仅可用于Web访问，也可以用于其他因特网/内联网应用系统之间的通信，从而实现各类应用资源超媒体访问的集成。**
>  **我们在浏览器的地址栏里输入的网站地址叫做URL (Uniform Resource Locator，统一资源定位符)。就像每家每户都有一个门牌地址一样，每个网页也都有一个Internet地址。当你在浏览器的地址框中输入一个URL或是单击一个超级链接时，URL就确定了要浏览的地址。浏览器通过超文本传输协议(HTTP)，将Web服务器上站点的网页代码提取出来，并翻译成漂亮的网页。**



## 2.HTTP 工作过程

**HTTP请求响应模型**

![iShot2020-04-0722.07.56](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.07.56.png)

HTTP通信机制是在一次完整的 HTTP 通信过程中，客户端与服务器之间将完成下列7个步骤：

### 2.1 建立 TCP 连接

 在HTTP工作开始之前，客户端首先要通过网络与服务器建立连接，该连接是通过 TCP 来完成的，该协议与 IP 协议共同构建 Internet，即著名的 TCP/IP 协议族，因此 Internet 又被称作是 TCP/IP 网络。HTTP 是比 TCP 更高层次的应用层协议，根据规则，只有低层协议建立之后，才能进行高层协议的连接，因此，首先要建立 TCP 连接，一般 TCP 连接的端口号是80；

### 2.2 客户端向服务器发送请求命令

 一旦建立了TCP连接，客户端就会向服务器发送请求命令；
 例如：`GET/sample/hello.jsp HTTP/1.1`

### 2.3 客户端发送请求头信息

 客户端发送其请求命令之后，还要以头信息的形式向服务器发送一些别的信息，之后客户端发送了一空白行来通知服务器，它已经结束了该头信息的发送；

### 2.4 服务器应答

 客户端向服务器发出请求后，服务器会客户端返回响应；
 例如： `HTTP/1.1 200 OK`
 响应的第一部分是协议的版本号和响应状态码

### 2.5 服务器返回响应头信息

 正如客户端会随同请求发送关于自身的信息一样，服务器也会随同响应向用户发送关于它自己的数据及被请求的文档；

### 2.6 服务器向客户端发送数据

 服务器向客户端发送头信息后，它会发送一个空白行来表示头信息的发送到此为结束，接着，它就以 Content-Type 响应头信息所描述的格式发送用户所请求的实际数据；

### 2.7 服务器关闭 TCP 连接

 一般情况下，一旦服务器向客户端返回了请求数据，它就要关闭 TCP 连接，然后如果客户端或者服务器在其头信息加入了这行代码 `Connection:keep-alive` ，TCP 连接在发送后将仍然保持打开状态，于是，客户端可以继续通过相同的连接发送请求。保持连接节省了为每个请求建立新连接所需的时间，还节约了网络带宽。

## 3.HTTP 协议基础

### 3.1 通过请求和响应的交换达成通信

应用 HTTP 协议时，必定是一端担任客户端角色，另一端担任服务器端角色。仅从一条通信线路来说，服务器端和客服端的角色是确定的。HTTP 协议规定，请求从客户端发出，最后服务器端响应该请求并返回。**换句话说，肯定是先从客户端开始建立通信的，服务器端在没有接收到请求之前不会发送响应。**

### 3.2 HTTP 是不保存状态的协议

HTTP 是一种无状态协议。协议自身不对请求和响应之间的通信状态进行保存。也就是说在 HTTP 这个级别，协议对于发送过的请求或响应都不做持久化处理。这是为了更快地处理大量事务，确保协议的可伸缩性，而特意把 HTTP 协议设计成如此简单的。
 可是随着 Web 的不断发展，我们的很多业务都需要对通信状态进行保存。于是我们引入了 Cookie 技术。有了 Cookie 再用 HTTP 协议通信，就可以管理状态了。

### 3.3 使用 Cookie 的状态管理

Cookie 技术通过在请求和响应报文中写入 Cookie 信息来控制客户端的状态。Cookie 会根据从服务器端发送的响应报文内的一个叫做 Set-Cookie 的首部字段信息，通知客户端保存Cookie。当下次客户端再往该服务器发送请求时，客户端会自动在请求报文中加入 Cookie 值后发送出去。服务器端发现客户端发送过来的 Cookie 后，会去检查究竟是从哪一个客户端发来的连接请求，然后对比服务器上的记录，最后得到之前的状态信息。

**Cookie 的流程**

![iShot2020-04-0721.11.26](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0721.11.26.png)



### 3.4 请求 URI 定位资源

HTTP 协议使用 URI 定位互联网上的资源。正是因为 URI 的特定功能，在互联网上任意位置的资源都能访问到。

### 3.5 告知服务器意图的 HTTP 方法（HTTP/1.1）

![iShot2020-04-0722.10.52](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.10.52.png)



![iShot_2022-09-03_14.17.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-09-03_14.17.01.png)





### 3.6 持久连接

HTTP 协议的初始版本中，每进行一个 HTTP 通信都要断开一次 TCP 连接。比如使用浏览器浏览一个包含多张图片的 HTML 页面时，在发送请求访问 HTML 页面资源的同时，也会请求该 HTML 页面里包含的其他资源。因此，每次的请求都会造成无畏的 TCP 连接建立和断开，增加通信量的开销。
 为了解决上述 TCP 连接的问题，HTTP/1.1 和部分 HTTP/1.0 想出了持久连接的方法。**其特点是，只要任意一端没有明确提出断开连接，则保持 TCP 连接状态。旨在建立一次 TCP 连接后进行多次请求和响应的交互。**在 HTTP/1.1 中，所有的连接默认都是持久连接。

### 3.7 管线化

持久连接使得多数请求以管线化方式发送成为可能。以前发送请求后需等待并接收到响应，才能发送下一个请求。管线化技术出现后，不用等待亦可发送下一个请求。这样就能做到同时并行发送多个请求，而不需要一个接一个地等待响应了。
 比如，当请求一个包含多张图片的 HTML 页面时，与挨个连接相比，用持久连接可以让请求更快结束。而管线化技术要比持久连接速度更快。请求数越多，时间差就越明显。

## 4.HTTP 协议报文结构

### 4.1 HTTP 报文

用于 HTTP 协议交互的信息被称为 HTTP 报文。请求端（客户端）的 HTTP 报文叫做请求报文；响应端（服务器端）的叫做响应报文。HTTP 报文本身是由多行（用 CR+LF 作换行符）数据构成的字符串文本。

### 4.2 HTTP 报文结构

HTTP 报文大致可分为报文首部和报文主体两部分。两者由最初出现的空行（CR+LF）来划分。通常，并不一定有报文主体。如下：

**HTTP 报文结构**

![iShot2020-04-0722.11.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.11.45.png)





#### 4.2.1 请求报文结构

**请求报文结构**



![iShot2020-04-0722.12.19](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.12.19.png)

请求报文的首部内容由以下数据组成：

- **请求行** —— 包含用于请求的方法、请求 URI 和 HTTP 版本。
- **首部字段** —— 包含表示请求的各种条件和属性的各类首部。（通用首部、请求首部、实体首部以及RFC里未定义的首部如 Cookie 等）

请求报文的示例，如下：

![iShot2020-04-0722.12.49](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.12.49.png)

#### 4.2.2 响应报文结构

![iShot2020-04-0722.13.22](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.13.22.png)

响应报文的首部内容由以下数据组成：

- **状态行** —— 包含表明响应结果的状态码、原因短语和 HTTP 版本。
- **首部字段** —— 包含表示请求的各种条件和属性的各类首部。（通用首部、响应首部、实体首部以及RFC里未定义的首部如 Cookie 等）

响应报文的示例，如下：

![iShot2020-04-0722.27.26](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.27.26.png)



## 5.HTTP 报文首部之请求行、状态行

### 5.1 请求行

举个栗子，下面是一个 HTTP 请求的报文：

```python
GET  /index.htm  HTTP/1.1
Host: sample.com
```

其中，下面的这行就是请求行，

```python
GET  /index.htm  HTTP/1.1
```

- 开头的 GET 表示请求访问服务器的类型，称为方法；
- 随后的字符串  `/index.htm` 指明了请求访问的资源对象，也叫做请求 URI；
- 最后的 `HTTP/1.1`，即 HTTP 的版本号，用来提示客户端使用的 HTTP 协议功能。

综合来看，大意是请求访问某台 HTTP 服务器上的 `/index.htm` 页面资源。

### 5.2 状态行

同样举个栗子，下面是一个 HTTP 响应的报文：

```dart
HTTP/1.1  200  OK
Date: Mon, 10 Jul 2017 15:50:06 GMT
Content-Length: 256
Content-Type: text/html
    
<html>
...
```

其中，下面的这行就是状态行，

```python
HTTP/1.1  200  OK
```

- 开头的 `HTTP/1.1` 表示服务器对应的 HTTP 版本；
- 紧挨着的 `200 OK` 表示请求的处理结果的状态码和原因短语。



## 6.HTTP 报文首部之首部字段（重点分析）

### 6.1 首部字段概述

先来回顾一下首部字段在报文的位置，HTTP 报文包含报文首部和报文主体，报文首部包含请求行（或状态行）和首部字段。
 在报文众多的字段当中，HTTP 首部字段包含的信息最为丰富。首部字段同时存在于请求和响应报文内，并涵盖 HTTP 报文相关的内容信息。使用首部字段是为了给客服端和服务器端提供报文主体大小、所使用的语言、认证信息等内容。

### 6.2 首部字段结构

- HTTP 首部字段是由首部字段名和字段值构成的，中间用冒号“：”分隔。
- 另外，字段值对应单个 HTTP 首部字段可以有多个值。
- 当 HTTP 报文首部中出现了两个或以上具有相同首部字段名的首部字段时，这种情况在规范内尚未明确，根据浏览器内部处理逻辑的不同，优先处理的顺序可能不同，结果可能并不一致。

|  首部字段名  | 冒号 |       字段值        |
| :----------: | :--: | :-----------------: |
| Content-Type |  ：  |      text/html      |
|  Keep-Alive  |  ：  | timeout=30, max=120 |

### 6.3 首部字段类型

首部字段根据实际用途被分为以下4种类型：

|     类型     |                             描述                             |
| :----------: | :----------------------------------------------------------: |
| 通用首部字段 |             请求报文和响应报文两方都会使用的首部             |
| 请求首部字段 | 从客户端向服务器端发送请求报文时使用的首部。补充了请求的附加内容、客户端信息、响应内容相关优先级等信息 |
| 响应首部字段 | 从服务器端向客户端返回响应报文时使用的首部。补充了响应的附加内容，也会要求客户端附加额外的内容信息。 |
| 实体首部字段 | 针对请求报文和响应报文的实体部分使用的首部。补充了资源内容更新时间等与实体有关的的信息。 |

### 6.4 通用首部字段（HTTP/1.1）

|    首部字段名     |            说明            |
| :---------------: | :------------------------: |
|   Cache-Control   |       控制缓存的行为       |
|    Connection     |    逐挑首部、连接的管理    |
|       Date        |     创建报文的日期时间     |
|      Pragma       |          报文指令          |
|      Trailer      |     报文末端的首部一览     |
| Transfer-Encoding | 指定报文主体的传输编码方式 |
|      Upgrade      |       升级为其他协议       |
|        Via        |    代理服务器的相关信息    |
|      Warning      |          错误通知          |

#### 6.4.1 Cache-Control

通过指定首部字段 Cache-Control 的指令，就能操作缓存的工作机制。

##### 6.4.1.1 可用的指令一览

可用的指令按请求和响应分类如下：
 **缓存请求指令**

|       指令        |  参数  |             说明             |
| :---------------: | :----: | :--------------------------: |
|     no-cache      |   无   |     强制向服务器再次验证     |
|     no-store      |   无   |  不缓存请求或响应的任何内容  |
|  max-age = [秒]   |  必需  |       响应的最大Age值        |
| max-stale( =[秒]) | 可省略 |       接收已过期的响应       |
| min-fresh = [秒]  |  必需  | 期望在指定时间内的响应仍有效 |
|   no-transform    |   无   |     代理不可更改媒体类型     |
|  only-if-cached   |   无   |        从缓存获取资源        |
|  cache-extension  |   -    |     新指令标记（token）      |

**缓存响应指令**

|       指令       |  参数  |                      说明                      |
| :--------------: | :----: | :--------------------------------------------: |
|      public      |   无   |            可向任意方提供响应的缓存            |
|     private      | 可省略 |              仅向特定用户返回响应              |
|     no-cache     | 可省略 |            缓存前必须先确认其有效性            |
|     no-store     |   无   |           不缓存请求或响应的任何内容           |
|   no-transform   |   无   |              代理不可更改媒体类型              |
| must-revalidate  |   无   |        可缓存但必须再向源服务器进行确认        |
| proxy-revalidate |   无   | 要求中间缓存服务器对缓存的响应有效性再进行确认 |
|  max-age = [秒]  |  必需  |                响应的最大Age值                 |
| s-maxage = [秒]  |  必需  |         公共缓存服务器响应的最大Age值          |
| cache-extension  |   -    |              新指令标记（token）               |

##### 6.4.1.2 表示能否缓存的指令

**public 指令**
 `Cache-Control: public`
 当指定使用 public 指令时，则明确表明其他用户也可利用缓存。

**private 指令**
 `Cache-Control: private`
 当指定 private 指令后，响应只以特定的用户作为对象，这与 public 指令的行为相反。缓存服务器会对该特定用户提供资源缓存的服务，对于其他用户发送过来的请求，代理服务器则不会返回缓存。

**no-cache 指令**
 `Cache-Control: no-cache`

- 使用 no-cache 指令是为了防止从缓存中返回过期的资源。
- 客户端发送的请求中如果包含 no-cache 指令，则表示客户端将不会接收缓存过的响应。于是，“中间”的缓存服务器必须把客户端请求转发给源服务器。
- 如果服务器中返回的响应包含 no-cache 指令，那么缓存服务器不能对资源进行缓存。源服务器以后也将不再对缓存服务器请求中提出的资源有效性进行确认，且禁止其对响应资源进行缓存操作。

`Cache-Control: no-cache=Location`
 由服务器返回的响应中，若报文首部字段 Cache-Control 中对 no-cache 字段名具体指定参数值，那么客户端在接收到这个被指定参数值的首部字段对应的响应报文后，就不能使用缓存。换言之，无参数值的首部字段可以使用缓存。只能在响应指令中指定该参数。

**no-store 指令**
 `Cache-Control: no-store`
 当使用 no-store 指令时，暗示请求（和对应的响应）或响应中包含机密信息。因此，该指令规定缓存不能在本地存储请求或响应的任一部分。
 注意：no-cache 指令代表不缓存过期的指令，缓存会向源服务器进行有效期确认后处理资源；no-store 指令才是真正的不进行缓存。

##### 6.4.1.3 指定缓存期限和认证的指令

**s-maxage 指令**
 `Cache-Control: s-maxage=604800（单位：秒）`

- s-maxage 指令的功能和 max-age 指令的相同，它们的不同点是 s-maxage 指令只适用于供多位用户使用的公共缓存服务器（一般指代理）。也就是说，对于向同一用户重复返回响应的服务器来说，这个指令没有任何作用。
- 另外，当使用 s-maxage 指令后，则直接忽略对 Expires 首部字段及 max-age 指令的处理。

**max-age 指令**
 `Cache-Control: max-age=604800（单位：秒）`

- 当客户端发送的请求中包含 max-age 指令时，如果判定缓存资源的缓存时间数值比指定的时间更小，那么客户端就接收缓存的资源。另外，当指定 max-age 的值为0，那么缓存服务器通常需要将请求转发给源服务器。
- 当服务器返回的响应中包含 max-age 指令时，缓存服务器将不对资源的有效性再作确认，而 max-age 数值代表资源保存为缓存的最长时间。
- 应用 HTTP/1.1 版本的缓存服务器遇到同时存在 Expires 首部字段的情况时，会优先处理 max-age 指令，并忽略掉 Expires 首部字段；而 HTTP/1.0 版本的缓存服务器则相反。

**min-fresh 指令**
 `Cache-Control: min-fresh=60（单位：秒）`
 min-fresh 指令要求缓存服务器返回至少还未过指定时间的缓存资源。

**max-stale 指令**
 `Cache-Control: max-stale=3600（单位：秒）`

- 使用 max-stale 可指示缓存资源，即使过期也照常接收。
- 如果指令未指定参数值，那么无论经过多久，客户端都会接收响应；如果指定了具体参数值，那么即使过期，只要仍处于 max-stale 指定的时间内，仍旧会被客户端接收。

**only-if-cached 指令**
 `Cache-Control: only-if-cached`
 表示客户端仅在缓存服务器本地缓存目标资源的情况下才会要求其返回。换言之，该指令要求缓存服务器不重新加载响应，也不会再次确认资源的有效性。

**must-revalidate 指令**
 `Cache-Control: must-revalidate`
 使用 must-revalidate 指令，代理会向源服务器再次验证即将返回的响应缓存目前是否仍有效。另外，使用 must-revalidate 指令会忽略请求的 max-stale 指令。

**proxy-revalidate 指令**
 `Cache-Control: proxy-revalidate`
 proxy-revalidate 指令要求所有的缓存服务器在接收到客户端带有该指令的请求返回响应之前，必须再次验证缓存的有效性。

**no-transform 指令**
 `Cache-Control: no-transform`
 使用 no-transform 指令规定无论是在请求还是响应中，缓存都不能改变实体主体的媒体类型。这样做可防止缓存或代理压缩图片等类似操作。

##### 6.4.1.4 Cache-Control 扩展

`Cache-Control: private, community="UCI"`
 通过 cache-extension 标记（token），可以扩展 Cache-Control 首部字段内的指令。上述 community 指令即扩展的指令，如果缓存服务器不能理解这个新指令，就会直接忽略掉。

#### 6.4.2 Connection

Connection 首部字段具备以下两个作用：

**控制不再转发的首部字段**
 `Connection: Upgrade`
 在客户端发送请求和服务器返回响应中，使用 Connection 首部字段，可控制不再转发给代理的首部字段，即删除后再转发（即Hop-by-hop首部）。

**管理持久连接**
 `Connection: close`
 HTTP/1.1 版本的默认连接都是持久连接。当服务器端想明确断开连接时，则指定 Connection 首部字段的值为 close。
 `Connection: Keep-Alive`
 HTTP/1.1 之前的 HTTP 版本的默认连接都是非持久连接。为此，如果想在旧版本的 HTTP 协议上维持持续连接，则需要指定 Connection 首部字段的值为 Keep-Alive。

#### 6.4.3 Date

表明创建 HTTP 报文的日期和时间。
 `Date: Mon, 10 Jul 2017 15:50:06 GMT`
 HTTP/1.1 协议使用在 RFC1123 中规定的日期时间的格式。

#### 6.4.4 Pragma

Pragma 首部字段是 HTTP/1.1 版本之前的历史遗留字段，仅作为与 HTTP/1.0 的向后兼容而定义。
 `Pragma: no-cache`

- 该首部字段属于通用首部字段，但只用在客户端发送的请求中，要求所有的中间服务器不返回缓存的资源。
- 所有的中间服务器如果都能以 HTTP/1.1 为基准，那直接采用 `Cache-Control: no-cache` 指定缓存的处理方式最为理想。但是要整体掌握所有中间服务器使用的 HTTP 协议版本却是不现实的，所以，发送的请求会同时包含下面两个首部字段：

```python
Cache-Control: no-cache
Pragma: no-cache
```

#### 6.4.5 Trailer

`Trailer: Expires`
 首部字段 Trailer 会事先说明在报文主体后记录了哪些首部字段。可应用在 HTTP/1.1 版本分块传输编码时。

#### 6.4.6 Transfer-Encoding

```python
Transfer-Encoding: chunked
```

- 规定了传输报文主体时采用的编码方式。
- HTTP/1.1 的传输编码方式仅对分块传输编码有效。

#### 6.4.7 Upgrade

`Upgrade: TSL/1.0`
 用于检测 HTTP 协议及其他协议是否可使用更高的版本进行通信，其参数值可以用来指定一个完全不同的通信协议。

#### 6.4.8 Via

```python
Via: 1.1 a1.sample.com(Squid/2.7)
```

- 为了追踪客户端和服务器端之间的请求和响应报文的传输路径。
- 报文经过代理或网关时，会现在首部字段 Via 中附加该服务器的信息，然后再进行转发。
- 首部字段 Via 不仅用于追踪报文的转发，还可避免请求回环的发生。

#### 6.4.9 Warning

该首部字段通常会告知用户一些与缓存相关的问题的警告。
 Warning 首部字段的格式如下：
 `Warning：[警告码][警告的主机:端口号] "[警告内容]"([日期时间])`
 最后的日期时间可省略。
 HTTP/1.1 中定义了7种警告，警告码对应的警告内容仅推荐参考，另外，警告码具备扩展性，今后有可能追加新的警告码。

| 警告码 |                    警告内容                    |                             说明                             |
| :----: | :--------------------------------------------: | :----------------------------------------------------------: |
|  110   |         Response is stale(响应已过期)          |                     代理返回已过期的资源                     |
|  111   |        Revalidation failed(再验证失败)         |      代理再验证资源有效性时失败（服务器无法到达等原因）      |
|  112   |     Disconnection operation(断开连接操作)      |                  代理与互联网连接被故意切断                  |
|  113   |        Heuristic expiration(试探性过期)        | 响应的试用期超过24小时(有效缓存的设定时间大于24小时的情况下) |
|  199   |        Miscellaneous warning(杂项警告)         |                        任意的警告内容                        |
|  214   |       Transformation applied(使用了转换)       |          代理对内容编码或媒体类型等执行了某些处理时          |
|  299   | Miscellaneous persistent warning(持久杂项警告) |                        任意的警告内容                        |

### 6.5 请求首部字段（HTTP/1.1）

|     首部字段名      |                     说明                      |
| :-----------------: | :-------------------------------------------: |
|       Accept        |           用户代理可处理的媒体类型            |
|   Accept-Charset    |                 优先的字符集                  |
|   Accept-Encoding   |                优先的内容编码                 |
|   Accept-Language   |            优先的语言（自然语言）             |
|    Authorization    |                  Web认证信息                  |
|       Expect        |             期待服务器的特定行为              |
|        From         |              用户的电子邮箱地址               |
|        Host         |              请求资源所在服务器               |
|      If-Match       |             比较实体标记（ETag）              |
|  If-Modified-Since  |              比较资源的更新时间               |
|    If-None-Match    |       比较实体标记（与 If-Macth 相反）        |
|      If-Range       |     资源未更新时发送实体 Byte 的范围请求      |
| If-Unmodified-Since | 比较资源的更新时间(与 If-Modified-Since 相反) |
|    Max-Forwards     |                最大传输逐跳数                 |
| Proxy-Authorization |        代理服务器要求客户端的认证信息         |
|        Range        |              实体的字节范围请求               |
|       Referer       |           对请求中 URI 的原始获取方           |
|         TE          |               传输编码的优先级                |
|     User-Agent      |             HTTP 客户端程序的信息             |

#### 6.5.1 Accept

```python
Accept: text/html, application/xhtml+xml, application/xml; q=0.5
```

- Accept 首部字段可通知服务器，用户代理能够处理的媒体类型及媒体类型的相对优先级。可使用 type/subtype 这种形式，一次指定多种媒体类型。
- 若想要给显示的媒体类型增加优先级，则使用 `q=[数值]` 来表示权重值，用分号（;）进行分隔。权重值的范围 0~1（可精确到小数点后三位），且 1 为最大值。不指定权重值时，默认为 1。

#### 6.5.2 Accept-Charset

`Accept-Charset: iso-8859-5, unicode-1-1; q=0.8`
 Accept-Charset 首部字段可用来通知服务器用户代理支持的字符集及字符集的相对优先顺序。另外，可一次性指定多种字符集。同样使用 `q=[数值]` 来表示相对优先级。

#### 6.5.3 Accept-Encoding

`Accept-Encoding: gzip, deflate`
 Accept-Encoding 首部字段用来告知服务器用户代理支持的内容编码及内容编码的优先顺序，并可一次性指定多种内容编码。同样使用 `q=[数值]` 来表示相对优先级。也可使用星号（*）作为通配符，指定任意的编码格式。

#### 6.5.4 Accept-Language

`Accept-Lanuage: zh-cn,zh;q=0.7,en=us,en;q=0.3`
 告知服务器用户代理能够处理的自然语言集（指中文或英文等），以及自然语言集的相对优先级，可一次性指定多种自然语言集。同样使用 `q=[数值]` 来表示相对优先级。

#### 6.5.5 Authorization

`Authorization: Basic ldfKDHKfkDdasSAEdasd==`
 告知服务器用户代理的认证信息（证书值）。通常，想要通过服务器认证的用户代理会在接收到返回的 401 状态码响应后，把首部字段 Authorization 加入请求中。共用缓存在接收到含有 Authorization 首部字段的请求时的操作处理会略有差异。

#### 6.5.6 Expect

`Expect: 100-continue`
 告知服务器客户端期望出现的某种特定行为。

#### 6.5.7 From

`From: Deeson_Woo@163.com`
 告知服务器使用用户代理的电子邮件地址。

#### 6.5.8 Host

```python
Host: www.jianshu.com
```

- 告知服务器，请求的资源所处的互联网主机和端口号。
- **Host 首部字段是 HTTP/1.1 规范内唯一一个必须被包含在请求内的首部字段。**
- 若服务器未设定主机名，那直接发送一个空值即可  `Host:` 。

#### 6.5.9 If-Match

形如 If-xxx 这种样式的请求首部字段，都可称为条件请求。服务器接收到附带条件的请求后，只有判断指定条件为真时，才会执行请求。

```python
If-Match: "123456"
```

- 首部字段 If-Match，属附带条件之一，它会告知服务器匹配资源所用的实体标记（ETag）值。这时的服务器无法使用弱 ETag 值。
- 服务器会比对 If-Match 的字段值和资源的 ETag 值，仅当两者一致时，才会执行请求。反之，则返回状态码 `412 Precondition Failed` 的响应。
- 还可以使用星号（*）指定 If-Match 的字段值。针对这种情况，服务器将会忽略 ETag 的值，只要资源存在就处理请求。

#### 6.5.10 If-Modified-Since

```python
If-Modified-Since: Mon, 10 Jul 2017 15:50:06 GMT
```

- 首部字段 If-Modified-Since，属附带条件之一，用于确认代理或客户端拥有的本地资源的有效性。
- 它会告知服务器若 If-Modified-Since 字段值早于资源的更新时间，则希望能处理该请求。而在指定 If-Modified-Since 字段值的日期时间之后，如果请求的资源都没有过更新，则返回状态码 `304 Not Modified` 的响应。

#### 6.5.11 If-None-Match

`If-None-Match: "123456"`
 首部字段 If-None-Match 属于附带条件之一。它和首部字段 If-Match 作用相反。用于指定 If-None-Match 字段值的实体标记（ETag）值与请求资源的 ETag 不一致时，它就告知服务器处理该请求。

#### 6.5.12 If-Range

```python
If-Range: "123456"
```

- 首部字段 If-Range 属于附带条件之一。它告知服务器若指定的 If-Range 字段值（ETag 值或者时间）和请求资源的 ETag 值或时间相一致时，则作为范围请求处理。反之，则返回全体资源。
- 下面我们思考一下不使用首部字段 If-Range 发送请求的情况。服务器端的资源如果更新，那客户端持有资源中的一部分也会随之无效，当然，范围请求作为前提是无效的。这时，服务器会暂且以状态码 `412 Precondition Failed` 作为响应返回，其目的是催促客户端再次发送请求。这样一来，与使用首部字段 If-Range 比起来，就需要花费两倍的功夫。

#### 6.5.13 If-Unmodified-Since

`If-Unmodified-Since: Mon, 10 Jul 2017 15:50:06 GMT`
 首部字段 If-Unmodified-Since 和首部字段 If-Modified-Since 的作用相反。它的作用的是告知服务器，指定的请求资源只有在字段值内指定的日期时间之后，未发生更新的情况下，才能处理请求。如果在指定日期时间后发生了更新，则以状态码 `412 Precondition Failed` 作为响应返回。

#### 6.5.14 Max-Forwards

`Max-Forwards: 10`
 通过 TRACE 方法或 OPTIONS 方法，发送包含首部字段 Max-Forwards 的请求时，该字段以十进制整数形式指定可经过的服务器最大数目。服务器在往下一个服务器转发请求之前，Max-Forwards 的值减 1 后重新赋值。当服务器接收到 Max-Forwards 值为 0 的请求时，则不再进行转发，而是直接返回响应。

#### 6.5.15 Proxy-Authorization

```python
Proxy-Authorization: Basic dGlwOjkpNLAGfFY5
```

- 接收到从代理服务器发来的认证质询时，客户端会发送包含首部字段 Proxy-Authorization 的请求，以告知服务器认证所需要的信息。
- 这个行为是与客户端和服务器之间的 HTTP 访问认证相类似的，不同之处在于，认证行为发生在客户端与代理之间。

#### 6.5.16 Range

```python
Range: bytes=5001-10000
```

- 对于只需获取部分资源的范围请求，包含首部字段 Range 即可告知服务器资源的指定范围。
- 接收到附带 Range 首部字段请求的服务器，会在处理请求之后返回状态码为 `206 Partial Content` 的响应。无法处理该范围请求时，则会返回状态码 `200 OK` 的响应及全部资源。

#### 6.5.17 Referer

`Referer: http://www.sample.com/index.html`
 首部字段 Referer 会告知服务器请求的原始资源的 URI。

#### 6.5.18 TE

```python
TE: gzip, deflate; q=0.5
```

- 首部字段 TE 会告知服务器客户端能够处理响应的传输编码方式及相对优先级。它和首部字段 Accept-Encoding 的功能很相像，但是用于传输编码。
- 首部字段 TE 除指定传输编码之外，还可以指定伴随 trailer 字段的分块传输编码的方式。应用后者时，只需把 trailers 赋值给该字段值。`TE: trailers`

#### 6.5.19 User-Agent

```python
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:13.0) Gecko/20100101
```

- 首部字段 User-Agent 会将创建请求的浏览器和用户代理名称等信息传达给服务器。
- 由网络爬虫发起请求时，有可能会在字段内添加爬虫作者的电子邮件地址。此外，如果请求经过代理，那么中间也很可能被添加上代理服务器的名称。

### 6.6 响应首部字段（HTTP/1.1）

|     首部字段名     |             说明             |
| :----------------: | :--------------------------: |
|   Accept-Ranges    |     是否接受字节范围请求     |
|        Age         |     推算资源创建经过时间     |
|        ETag        |        资源的匹配信息        |
|      Location      |   令客户端重定向至指定 URI   |
| Proxy-Authenticate | 代理服务器对客户端的认证信息 |
|    Retry-After     |   对再次发起请求的时机要求   |
|       Server       |    HTTP 服务器的安装信息     |
|        Vary        |   代理服务器缓存的管理信息   |
|  WWW-Authenticate  |   服务器对客户端的认证信息   |

#### 6.6.1 Accept-Ranges

```python
Accept-Ranges: bytes
```

- 首部字段 Accept-Ranges 是用来告知客户端服务器是否能处理范围请求，以指定获取服务器端某个部分的资源。
- 可指定的字段值有两种，可处理范围请求时指定其为 bytes，反之则指定其为 none。

#### 6.6.2 Age

```python
Age: 1200
```

- 首部字段 Age 能告知客户端，源服务器在多久前创建了响应。字段值的单位为秒。
- 若创建该响应的服务器是缓存服务器，Age 值是指缓存后的响应再次发起认证到认证完成的时间值。代理创建响应时必须加上首部字段 Age。

#### 6.6.3 ETag

```python
ETag: "usagi-1234"
```

- 首部字段 ETag 能告知客户端实体标识。它是一种可将资源以字符串形式做唯一性标识的方式。服务器会为每份资源分配对应的 ETag 值。
- 另外，当资源更新时，ETag 值也需要更新。生成 ETag 值时，并没有统一的算法规则，而仅仅是由服务器来分配。
- ETag 中有强 ETag 值和弱 ETag 值之分。强 ETag 值，不论实体发生多么细微的变化都会改变其值；弱 ETag 值只用于提示资源是否相同。只有资源发生了根本改变，产生差异时才会改变 ETag 值。这时，会在字段值最开始处附加 W/： `ETag: W/"usagi-1234"`。

#### 6.6.4 Location

```python
Location: http://www.sample.com/sample.html
```

- 使用首部字段 Location 可以将响应接收方引导至某个与请求 URI 位置不同的资源。
- 基本上，该字段会配合 3xx ：Redirection 的响应，提供重定向的 URI。
- 几乎所有的浏览器在接收到包含首部字段 Location 的响应后，都会强制性地尝试对已提示的重定向资源的访问。

#### 6.6.5 Proxy-Authenticate

```python
Proxy-Authenticate: Basic realm="Usagidesign Auth"
```

- 首部字段 Proxy-Authenticate 会把由代理服务器所要求的认证信息发送给客户端。
- 它与客户端和服务器之间的 HTTP 访问认证的行为相似，不同之处在于其认证行为是在客户端与代理之间进行的。

#### 6.6.6 Retry-After

```python
Retry-After: 180
```

- 首部字段 Retry-After 告知客户端应该在多久之后再次发送请求。主要配合状态码 `503 Service Unavailable` 响应，或 3xx Redirect 响应一起使用。
- 字段值可以指定为具体的日期时间（Mon, 10 Jul 2017 15:50:06 GMT 等格式），也可以是创建响应后的秒数。

#### 6.6.7 Server

`Server: Apache/2.2.6 (Unix) PHP/5.2.5`
 首部字段 Server 告知客户端当前服务器上安装的 HTTP 服务器应用程序的信息。不单单会标出服务器上的软件应用名称，还有可能包括版本号和安装时启用的可选项。

#### 6.6.8 Vary

```python
Vary: Accept-Language
```

- 首部字段 Vary 可对缓存进行控制。源服务器会向代理服务器传达关于本地缓存使用方法的命令。
- 从代理服务器接收到源服务器返回包含 Vary 指定项的响应之后，若再要进行缓存，仅对请求中含有相同 Vary 指定首部字段的请求返回缓存。即使对相同资源发起请求，但由于 Vary 指定的首部字段不相同，因此必须要从源服务器重新获取资源。

#### 6.6.9 WWW-Authenticate

`WWW-Authenticate: Basic realm="Usagidesign Auth"`
 首部字段 WWW-Authenticate 用于 HTTP 访问认证。它会告知客户端适用于访问请求 URI 所指定资源的认证方案（Basic 或是 Digest）和带参数提示的质询（challenge）。

### 6.7 实体首部字段（HTTP/1.1）

|    首部字段名    |             说明             |
| :--------------: | :--------------------------: |
|      Allow       |    资源可支持的 HTTP 方法    |
| Content-Encoding |    实体主体适用的编码方式    |
| Content-Language |      实体主体的自然语言      |
|  Content-Length  | 实体主体的大小（单位：字节） |
| Content-Location |      替代对应资源的 URI      |
|   Content-MD5    |      实体主体的报文摘要      |
|  Content-Range   |      实体主体的位置范围      |
|   Content-Type   |      实体主体的媒体类型      |
|     Expires      |    实体主体过期的日期时间    |
|  Last-Modified   |    资源的最后修改日期时间    |

#### 6.7.1 Allow

```python
Allow: GET, HEAD
```

- 首部字段 Allow 用于通知客户端能够支持 Request-URI 指定资源的所有 HTTP 方法。
- 当服务器接收到不支持的 HTTP 方法时，会以状态码 `405 Method Not Allowed` 作为响应返回。与此同时，还会把所有能支持的 HTTP 方法写入首部字段 Allow 后返回。

#### 6.7.2 Content-Encoding

```python
Content-Encoding: gzip
```

- 首部字段 Content-Encoding 会告知客户端服务器对实体的主体部分选用的内容编码方式。内容编码是指在不丢失实体信息的前提下所进行的压缩。
- 主要采用这 4 种内容编码的方式（gzip、compress、deflate、identity）。

#### 6.7.3 Content-Language

`Content-Language: zh-CN`
 首部字段 Content-Language 会告知客户端，实体主体使用的自然语言（指中文或英文等语言）。

#### 6.7.4 Content-Length

`Content-Length: 15000`
 首部字段 Content-Length 表明了实体主体部分的大小（单位是字节）。对实体主体进行内容编码传输时，不能再使用 Content-Length首部字段。

#### 6.7.5 Content-Location

`Content-Location: http://www.sample.com/index.html`
 首部字段 Content-Location 给出与报文主体部分相对应的 URI。和首部字段 Location 不同，Content-Location 表示的是报文主体返回资源对应的 URI。

#### 6.7.6 Content-MD5

`Content-MD5: OGFkZDUwNGVhNGY3N2MxMDIwZmQ4NTBmY2IyTY==`
 首部字段 Content-MD5 是一串由 MD5 算法生成的值，其目的在于检查报文主体在传输过程中是否保持完整，以及确认传输到达。

#### 6.7.7 Content-Range

`Content-Range: bytes 5001-10000/10000`
 针对范围请求，返回响应时使用的首部字段 Content-Range，能告知客户端作为响应返回的实体的哪个部分符合范围请求。字段值以字节为单位，表示当前发送部分及整个实体大小。

#### 6.7.8 Content-Type

`Content-Type: text/html; charset=UTF-8`
 首部字段 Content-Type 说明了实体主体内对象的媒体类型。和首部字段 Accept 一样，字段值用 type/subtype 形式赋值。参数 charset 使用 iso-8859-1 或 euc-jp 等字符集进行赋值。

#### 6.7.9 Expires

```python
Expires: Mon, 10 Jul 2017 15:50:06 GMT
```

- 首部字段 Expires 会将资源失效的日期告知客户端。
- 缓存服务器在接收到含有首部字段 Expires 的响应后，会以缓存来应答请求，在 Expires 字段值指定的时间之前，响应的副本会一直被保存。当超过指定的时间后，缓存服务器在请求发送过来时，会转向源服务器请求资源。
- 源服务器不希望缓存服务器对资源缓存时，最好在 Expires 字段内写入与首部字段 Date 相同的时间值。

#### 6.7.10 Last-Modified

`Last-Modified: Mon, 10 Jul 2017 15:50:06 GMT`
 首部字段 Last-Modified 指明资源最终修改的时间。一般来说，这个值就是 Request-URI 指定资源被修改的时间。但类似使用 CGI 脚本进行动态数据处理时，该值有可能会变成数据最终修改时的时间。

### 6.8 为 Cookie 服务的首部字段

| 首部字段名 |               说明               |   首部类型   |
| :--------: | :------------------------------: | :----------: |
| Set-Cookie | 开始状态管理所使用的 Cookie 信息 | 响应首部字段 |
|   Cookie   |    服务器接收到的 Cookie 信息    | 请求首部字段 |

#### 6.8.1 Set-Cookie

```python
Set-Cookie: status=enable; expires=Mon, 10 Jul 2017 15:50:06 GMT; path=/;
```

下面的表格列举了 Set-Cookie 的字段值。

|     属性     |                             说明                             |
| :----------: | :----------------------------------------------------------: |
|  NAME=VALUE  |              赋予 Cookie 的名称和其值（必需项）              |
| expires=DATE |   Cookie 的有效期（若不明确指定则默认为浏览器关闭前为止）    |
|  path=PATH   | 将服务器上的文件目录作为Cookie的适用对象（若不指定则默认为文档所在的文件目录） |
| domain=域名  | 作为 Cookie 适用对象的域名 （若不指定则默认为创建 Cookie的服务器的域名） |
|    Secure    |             仅在 HTTPS 安全通信时才会发送 Cookie             |
|   HttpOnly   |        加以限制，使 Cookie 不能被 JavaScript 脚本访问        |

##### 6.8.1.1 expires 属性

- Cookie 的 expires 属性指定浏览器可发送 Cookie 的有效期。
- 当省略 expires 属性时，其有效期仅限于维持浏览器会话（Session）时间段内。这通常限于浏览器应用程序被关闭之前。
- 另外，一旦 Cookie 从服务器端发送至客户端，服务器端就不存在可以显式删除 Cookie 的方法。但可通过覆盖已过期的 Cookie，实现对客户端 Cookie 的实质性删除操作。

##### 6.8.1.2 path 属性

Cookie 的 path 属性可用于限制指定 Cookie 的发送范围的文件目录。

##### 6.8.1.3 domain 属性

- 通过 Cookie 的 domain 属性指定的域名可做到与结尾匹配一致。比如，当指定 [example.com](https://links.jianshu.com/go?to=http%3A%2F%2Fexample.com) 后，除[example.com](https://links.jianshu.com/go?to=http%3A%2F%2Fexample.com) 以外，[www.example.com](https://links.jianshu.com/go?to=http%3A%2F%2Fwww.example.com) 或 [www2.example.com](https://links.jianshu.com/go?to=http%3A%2F%2Fwww2.example.com) 等都可以发送 Cookie。
- 因此，除了针对具体指定的多个域名发送 Cookie 之 外，不指定 domain 属性显得更安全。

##### 6.8.1.4 secure 属性

Cookie 的 secure 属性用于限制 Web 页面仅在 HTTPS 安全连接时，才可以发送 Cookie。

##### 6.8.1.5 HttpOnly 属性

- Cookie 的 HttpOnly 属性是 Cookie 的扩展功能，它使 JavaScript 脚本无法获得 Cookie。其主要目的为防止跨站脚本攻击（Cross-site scripting，XSS）对 Cookie 的信息窃取。
- 通过上述设置，通常从 Web 页面内还可以对 Cookie 进行读取操作。但使用 JavaScript 的 document.cookie 就无法读取附加 HttpOnly 属性后的 Cookie 的内容了。因此，也就无法在 XSS 中利用 JavaScript 劫持 Cookie 了。

#### 6.8.2 Cookie

`Cookie: status=enable`
 首部字段 Cookie 会告知服务器，当客户端想获得 HTTP 状态管理支持时，就会在请求中包含从服务器接收到的 Cookie。接收到多个 Cookie 时，同样可以以多个 Cookie 形式发送。

### 6.9 其他首部字段

HTTP 首部字段是可以自行扩展的。所以在 Web 服务器和浏览器的应用上，会出现各种非标准的首部字段。
 以下是最为常用的首部字段。

#### 6.9.1 X-Frame-Options

`X-Frame-Options: DENY`
 首部字段 X-Frame-Options 属于 HTTP 响应首部，用于控制网站内容在其他 Web 网站的 Frame 标签内的显示问题。其主要目的是为了防止点击劫持（clickjacking）攻击。首部字段 X-Frame-Options 有以下两个可指定的字段值：

- DENY：拒绝
- SAMEORIGIN：仅同源域名下的页面（Top-level-browsing-context）匹配时许可。（比如，当指定 [http://sample.com/sample.html](https://links.jianshu.com/go?to=http%3A%2F%2Fsample.com%2Fsample.html) 页面为 SAMEORIGIN 时，那么 [sample.com](https://links.jianshu.com/go?to=http%3A%2F%2Fsample.com) 上所有页面的 frame 都被允许可加载该页面，而 [example.com](https://links.jianshu.com/go?to=http%3A%2F%2Fexample.com) 等其他域名的页面就不行了）

#### 6.9.2 X-XSS-Protection

`X-XSS-Protection: 1`
 首部字段 X-XSS-Protection 属于 HTTP 响应首部，它是针对跨站脚本攻击（XSS）的一种对策，用于控制浏览器 XSS 防护机制的开关。首部字段 X-XSS-Protection 可指定的字段值如下:

- 0 ：将 XSS 过滤设置成无效状态
- 1 ：将 XSS 过滤设置成有效状态

#### 6.9.3 DNT

`DNT: 1`
 首部字段 DNT 属于 HTTP 请求首部，其中 DNT 是 Do Not Track 的简称，意为拒绝个人信息被收集，是表示拒绝被精准广告追踪的一种方法。首部字段 DNT 可指定的字段值如下：

- 0 ：同意被追踪
- 1 ：拒绝被追踪

由于首部字段 DNT 的功能具备有效性，所以 Web 服务器需要对 DNT做对应的支持。

#### 6.9.4 P3P

`P3P: CP="CAO DSP LAW CURa ADMa DEVa TAIa PSAa PSDa IVAa IVDa OUR BUS IND`
 首部字段 P3P 属于 HTTP 响应首部，通过利用 P3P（The Platform for Privacy Preferences，在线隐私偏好平台）技术，可以让 Web 网站上的个人隐私变成一种仅供程序可理解的形式，以达到保护用户隐私的目的。
 要进行 P3P 的设定，需按以下操作步骤进行：

- 步骤 1：创建 P3P 隐私
- 步骤 2：创建 P3P 隐私对照文件后，保存命名在 /w3c/p3p.xml
- 步骤 3：从 P3P 隐私中新建 Compact policies 后，输出到 HTTP 响应中

## 7.HTTP 响应状态码（重点分析）

### 7.1 状态码概述

- HTTP 状态码负责表示客户端 HTTP 请求的返回结果、标记服务器端的处理是否正常、通知出现的错误等工作。
- HTTP 状态码如 `200 OK` ，以 3 位数字和原因短语组成。数字中的第一位指定了响应类别，后两位无分类。
- 不少返回的响应状态码都是错误的，但是用户可能察觉不到这点。比如 Web 应用程序内部发生错误，状态码依然返回 `200 OK`。

### 7.2 状态码类别

|      |              类别              |          原因短语          |
| :--: | :----------------------------: | :------------------------: |
| 1xx  |  Informational(信息性状态码)   |     接收的请求正在处理     |
| 2xx  |      Success(成功状态码)       |      请求正常处理完毕      |
| 3xx  |   Redirection(重定向状态码)    | 需要进行附加操作以完成请求 |
| 4xx  | Client Error(客户端错误状态码) |     服务器无法处理请求     |
| 5xx  | Server Error(服务器错误状态码) |     服务器处理请求出错     |

我们可以自行改变 RFC2616 中定义的状态码或者服务器端自行创建状态码，只要遵守状态码的类别定义就可以了。

### 7.3 常用状态码解析

HTTP 状态码种类繁多，数量达几十种。其中最常用的有以下 14 种，一起来看看。

#### 7.3.1 200 OK

表示从客户端发来的请求在服务器端被正常处理了。

#### 7.3.2 204 No Content

- 代表服务器接收的请求已成功处理，但在返回的响应报文中不含实体的主体部分。另外，也不允许返回任何实体的主体。
- 一般在只需要从客户端向服务器端发送消息，而服务器端不需要向客户端发送新消息内容的情况下使用。

#### 7.3.3 206 Partial Content

表示客户端进行了范围请求，而服务器成功执行了这部分的 GET 请求。响应报文中包含由 Content-Range 首部字段指定范围的实体内容。

#### 7.3.4 301 Moved Permanently

永久性重定向。表示请求的资源已被分配了新的 URI。以后应使用资源现在所指的 URI。也就是说，如果已经把资源对应的 URI 保存为书签了，这时应该按 Location 首部字段提示的 URI 重新保存。

#### 7.3.5 302 Found

- 临时性重定向。表示请求的资源已被分配了新的 URI，希望用户（本次）能使用新的 URI 访问。
- 和 `301 Moved Permanently` 状态码相似，但 `302 Found` 状态码代表资源不是被永久移动，只是临时性质的。换句话说，已移动的资源对应的 URI 将来还有可能发生改变。

#### 7.3.6 303 See Other

- 表示由于请求的资源存在着另一个 URI，应使用 GET 方法定向获取请求的资源。
- `303 See Othe`r 和 `302 Found` 状态码有着相同的功能，但 `303 See Other` 状态码明确表示客户端应采用 GET 方法获取资源，这点与 `302 Found` 状态码有区别。

#### 7.3.7 304 Not Modified

- 表示客户端发送附带条件的请求时，服务器端允许请求访问的资源，但未满足条件的情况。
- `304 Not Modified` 状态码返回时，不包含任何响应的主体部分。
- `304 Not Modified` 虽然被划分到 3xx 类别中，但和重定向没有关系。

#### 7.3.8 307 Temporary Redirect

临时重定向。该状态码与 `302 Found` 有着相同的含义。

#### 7.3.9 400 Bad Request

- 表示请求报文中存在语法错误。当错误发生时，需修改请求的内容后再次发送请求。
- 另外，浏览器会像 `200 OK` 一样对待该状态码。

#### 7.3.10 401 Unauthorized

- 表示发送的请求需要有通过 HTTP 认证（BASIC 认证、DIGEST 认证）的认证信息。
- 另外，若之前已进行过 1 次请求，则表示用户认证失败。
- 返回含有 `401 Unauthorized` 的响应必须包含一个适用于被请求资源的 WWW-Authenticate 首部用以质询（challenge）用户信息。

#### 7.3.11 403 Forbidden

表明对请求资源的访问被服务器拒绝了。服务器端没有必要给出详细的拒绝理由，当然也可以在响应报文的实体主体部分对原因进行描述。

#### 7.3.12 404 Not Found

表明服务器上无法找到请求的资源。除此之外，也可以在服务器端拒绝请求且不想说明理由的时候使用。

#### 7.3.13 500 Internal Server Error

表明服务器端在执行请求时发生了错误。也可能是 Web 应用存在的 bug 或某些临时的故障。

#### 7.3.14 503 Service Unavailable

表明服务器暂时处于超负载或正在进行停机维护，现在无法处理请求。如果事先得知解除以上状况需要的时间，最好写入 Retry-After 首部字段再返回给客户端。

## 8.HTTP 报文实体

### 8.1 HTTP 报文实体概述

**HTTP 报文结构**

![iShot2020-04-0722.28.35](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.28.35.png)

大家请仔细看看上面示例中，各个组成部分对应的内容。
 接着，我们来看看报文和实体的概念。如果把 HTTP 报文想象成因特网货运系统中的箱子，那么 HTTP 实体就是报文中实际的货物。

- 报文：是网络中交换和传输的数据单元，即站点一次性要发送的数据块。报文包含了将要发送的完整的数据信息，其长短很不一致，长度不限且可变。
- 实体：作为请求或响应的有效载荷数据（补充项）被传输，其内容由实体首部和实体主体组成。（实体首部相关内容在上面第六点中已有阐述。）

我们可以看到，上面示例右图中深红色框的内容就是报文的实体部分，而蓝色框的两部分内容分别就是实体首部和实体主体。而左图中粉红框内容就是报文主体。
 **通常，报文主体等于实体主体。只有当传输中进行编码操作时，实体主体的内容发生变化，才导致它和报文主体产生差异。**

### 8.2 内容编码

- HTTP 应用程序有时在发送之前需要对内容进行编码。例如，在把很大的 HTML 文档发送给通过慢速连接上来的客户端之前，服务器可能会对其进行压缩，这样有助于减少传输实体的时间。服务器还可以把内容搅乱或加密，以此来防止未授权的第三方看到文档的内容。
- 这种类型的编码是在发送方应用到内容之上的。当内容经过内容编码后，编好码的数据就放在实体主体中，像往常一样发送给接收方。

内容编码类型：

| 编码方式 |                             描述                             |
| :------: | :----------------------------------------------------------: |
|   gzip   |                  表明实体采用 GNU zip 编码                   |
| compress |               表明实体采用 Unix 的文件压缩程序               |
| deflate  |                表明实体采用 zlib 的格式压缩的                |
| identity | 表明没有对实体进行编码，当没有 Content-Encoding 首部字段时，默认采用此编码方式 |

### 8.3 传输编码

内容编码是对报文的主体进行的可逆变换，是和内容的具体格式细节紧密相关的。
 传输编码也是作用在实体主体上的可逆变换，但使用它们是由于架构方面的原因，同内容的格式无关。使用传输编码是为了改变报文中的数据在网络上传输的方式。

**内容编码和传输编码的对比**

![iShot2020-04-0722.29.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.29.18.png)



### 8.4 分块编码

分块编码把报文分割成若干已知大小的块。块之间是紧挨着发送的，这样就不需要在发送之前知道整个报文的大小了。分块编码是一种传输编码，是报文的属性。

**分块编码与持久连接**
 若客户端与服务器端之间不是持久连接，客户端就不需要知道它在读取的主体的长度，而只需要读取到服务器关闭主体连接为止。
 当使用持久连接时，在服务器写主体之前，必须知道它的大小并在 Content-Length 首部中发送。如果服务器动态创建内容，就可能在发送之前无法知道主体的长度。
 分块编码为这种困难提供了解决方案，只要允许服务器把主体分块发送，说明每块的大小就可以了。因为主体是动态创建的，服务器可以缓冲它的一部分，发送其大小和相应的块，然后在主体发送完之前重复这个过程。服务器可以用大小为 0 的块作为主体结束的信号，这样就可以继续保持连接，为下一个响应做准备。
来看看一个分块编码的报文示例：

**分块编码的报文**

![iShot2020-04-0722.32.04](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.32.04.png)

### 8.5 多部分媒体类型

MIME 中的 multipart（多部分）电子邮件报文中包含多个报文，它们合在一起作为单一的复杂报文发送。每一部分都是独立的，有各自的描述其内容的集，不同部分之间用分界字符串连接在一起。
 相应得，HTTP 协议中也采纳了多部分对象集合，发送的一份报文主体内可包含多种类型实体。
 多部分对象集合包含的对象如下：

- multipart/form-data：在 Web 表单文件上传时使用。
- multipart/byteranges：状态码 `206 Partial Content` 响应报文包含了多个范围的内容时使用。

### 8.6 范围请求

假设你正在下载一个很大的文件，已经下了四分之三，忽然网络中断了，那下载就必须重头再来一遍。为了解决这个问题，需要一种可恢复的机制，即能从之前下载中断处恢复下载。要实现该功能，这就要用到范围请求。
 有了范围请求， HTTP 客户端可以通过请求曾获取失败的实体的一个范围（或者说一部分），来恢复下载该实体。当然这有一个前提，那就是从客户端上一次请求该实体到这一次发出范围请求的时间段内，该对象没有改变过。例如：

```python
GET  /bigfile.html  HTTP/1.1
Host: www.sample.com
Range: bytes=20224-
···
```

**实体范围请求示例**

![iShot2020-04-0722.30.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.30.39.png)

上面示例中，客户端请求的是文档开头20224字节之后的部分。

## 9.与 HTTP 协作的 Web 服务器

HTTP 通信时，除客户端和服务器外，还有一些用于协助通信的应用程序。如下列出比较重要的几个：**代理、缓存、网关、隧道、Agent 代理**。

### 9.1 代理

![iShot2022-03-28_17.50.02](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-03-28_17.50.02.png)



HTTP 代理服务器是 Web 安全、应用集成以及性能优化的重要组成模块。代理位于客户端和服务器端之间，接收客户端所有的 HTTP 请求，并将这些请求转发给服务器（可能会对请求进行修改之后再进行转发）。对用户来说，这些应用程序就是一个代理，代表用户访问服务器。
 出于安全考虑，通常会将代理作为转发所有 Web 流量的可信任中间节点使用。代理还可以对请求和响应进行过滤，安全上网或绿色上网。

### 9.2 缓存

**浏览器第一次请求：**

![iShot2020-04-0722.32.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.32.37.png)

**浏览器再次请求：**

![iShot2020-04-0722.34.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.34.39.png)



Web 缓存或代理缓存是一种特殊的 HTTP 代理服务器，可以将经过代理传输的常用文档复制保存起来。下一个请求同一文档的客户端就可以享受缓存的私有副本所提供的服务了。客户端从附近的缓存下载文档会比从远程 Web 服务器下载快得多。

### 9.3 网关

**HTTP / FTP 网关**

![iShot2022-03-28_17.51.52](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-03-28_17.51.52.png)



网关是一种特殊的服务器，作为其他服务器的中间实体使用。通常用于将 HTTP 流量转换成其他的协议。网关接收请求时就好像自己是资源的源服务器一样。客户端可能并不知道自己正在跟一个网关进行通信。

### 9.4 隧道

**HTTP/SSL 隧道**

![iShot2020-04-0722.35.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0722.35.44.png)



隧道是会在建立起来之后，就会在两条连接之间对原始数据进行盲转发的 HTTP 应用程序。HTTP 隧道通常用来在一条或多条 HTTP 连接上转发非 HTTP 数据，转发时不会窥探数据。 

HTTP 隧道的一种常见用途就是通过 HTTP 连接承载加密的安全套接字层（SSL）流量，这样 SSL 流量就可以穿过只允许 Web 流量通过的防火墙了。

### 9.5 Agent 代理

**自动搜索引擎“网络蜘蛛”**

![iShot2020-04-0721.05.23](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-04-0721.05.23.png)



Agent 代理是代表用户发起 HTTP 请求的客户端应用程序。所有发布 Web 请求的应用程序都是 HTTP Agent 代理。