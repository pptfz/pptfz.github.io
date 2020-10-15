# HTTPS协议

[本文严重抄袭至互联网](https://zhuanlan.zhihu.com/p/75461564)

> 本篇将讨论 HTTPS 的加解密原理，很多人都知道 RSA，以为 HTTPS=RSA，使用 RSA 加解密数据，实际上这是不对的。

HTTPS 是使用 RSA 进行身份验证和交换密钥，然后再使用交换的密钥进行加解密数据。

身份验证是使用 RSA 的非对称加密，而数据传输是双方使用相同的密钥进行的对称加密。那么，什么是对称加密和非对称[加密](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651233982&idx=2&sn=a9c823721a9f758dfafe904fbcc0413a&chksm=bd49473a8a3ece2ca3775aa2c0821081d35f46bf8908a550cc300311858cc8b8f8f60ad72833&scene=21#wechat_redirect)？

## 对称加密和非对称加密

假设隔壁小王想要约小红出来，但是他不想让小明知道，于是他想用对称加密给小红传了个小纸条。

如下图所示：

![iShot2020-04-0821.05.28](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.05.28.png)

他想发送的数据是"Meet at 5:00 PM"（5 点见面，如果是中文的话可以使用 UTF-8 编码），加密方式是直接在 ASCII 表进行左移或右移。

他的密钥是 3，表示在 ASCII 表往后移 3 位，就会变成"Phhw#dw#8=33#SP"，这样一般人如果截获了不知道是什么意思的。

但是我们可以想一下，如果既然他可以截获你的数据，自然也可以截获你的密钥，进而进行解密。

如下图所示：

![iShot2020-04-0821.06.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.06.21.png)

所以小王打算用非对称加密，非对称加密的特点是双方都有自己的公钥和私钥对，其中公钥发给对方，密钥不交换自己保管不泄漏。

如下图所示：

![iShot2020-04-0821.06.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.09.05.png)



**其中小红的公钥为：**

```python
public_key = (N, e) = (3233, 17)
```

她把公钥发给了小明，她自己的私钥为：

```python
private_key = (N, e) = (3233, 2753)
```

这里注意公钥和私钥都是两个数，N 通常是一个大整数，e 表示一个幂指数。现在小王想给小红发消息，于是他用小红的公钥进行加密，怎么加密呢？

他要发送的第一个字母为 t=“M”，“M”的 ASCII 编码为 77，77 的加密过程如下计算：

```python
T = 77 ^ e  % N = 77 ^ 17 % 3233 = 3123
```

把 77 做 e 次幂然后模以 N，便得到了 T=3123，然后把这个数发给小红（其他字母按同样方式处理）。



**小红收到 T 之后便用她的私钥进行解密，计算如下：**

```python
t = T ^ e % N = 3123 ^ 2753 % 3233 = 77
```

计算方法是一样的，这样便把 T 还原成了 t，只要公私钥配对，便可通过一些数学公式证明上面的推算是成立的。这个就是 RSA 的加解密原理，如果无法知道私钥便无法进行正确解密。

反过来，使用私钥进行加密，公钥进行解密也是可行的。那么 [HTTPS](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=402262329&idx=1&sn=80e7a4c2024841eed9c1e76750b7eeca&chksm=34b5d0bd03c259ab3f23bcb28b4f8110f2a33cec237ff880be31b79bce763bc5f55c85291170&scene=21#wechat_redirect) 是怎么利用 RSA 进行加解密的呢，我们从 HTTPS 连接建立过程说起。



## HTTPS 连接建立过程

**HTTPS 主要有以下作用：**

- 验证服务方身份，如我访问 google.com 的时候连的确实就是谷歌服务器
- 防止数据被劫持，例如有些运营商会给 http 的页面插入广告
- 防止敏感数据被窃取篡改等

正如 openssl 的注释所说，这是防止中间人攻击的唯一方法：

![iShot2020-04-0821.09.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.06.54.png)

我们以 MDN（https://developer.mozilla.org）的网站为例，然后用 wireshark 抓包，观察 HTTPS 连接建立的过程。

如下图所示：

![iShot2020-04-0821.09.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.10.57.png)

首先是 TCP 三次握手，然后客户端（浏览器）发起一个 HTTPS 连接建立请求，客户端先发一个 Client Hello 的包，然后[服务端](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651233590&idx=1&sn=73d7fe9a02252b0c73494f5618f5ad62&chksm=bd4944b28a3ecda49ffcc366c6309862a7fe3be35f6e9921c237a5be60641e66ea6a7df1eb5d&scene=21#wechat_redirect)响应一个 Server Hello。

接着再给客户端发送它的证书，然后双方经过密钥交换，最后使用交换的密钥加行加解密数据。

在 Client Hello 里面客户端会告知服务端自己当前的一些信息，如下图所示：

![iShot2020-04-0821.10.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.09.35.png)

包括客户端要使用的 TLS 版本，支持的加密套装，要访问的域名，给服务端生成的一个随机数（Nonce）等。

需要提前告知服务器想要访问的域名以便服务器发送相应的域名的证书过来，因为此时还没有发生 HTTP 请求。



**服务端在 Server Hello 里面会做一些响应：**

![iShot2020-04-0821.10.57](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.10.11.png)

服务端选中的加密套装叫 TLSECDHERSAWITHAES128GCM_SHA256，这一串的意思是：

- 密钥交换使用 ECDHE
- 证书签名算法 RSA
- 数据加密使用 AES 128 GCM
- 签名校验使用 SHA256



**接着服务给客户端发来了 4 个证书：**

![iShot2020-04-0821.11.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.12.10.png)



第一个证书的公用名（common name）就是我们当前访问的域名 developer.mozilla.org。

如果公用名是 *.mozilla.org 的话那么这个证书便能给 mozilla.org 的所有二级子域名使用。

第二个证书是第一个证书的签发机构（CA）的证书，它是 Amazon，也就是说 Amazon 会用它的私钥给 developer.mozilla.org 进行签名。

依此类推，第三个证书会给第二个证书签名，第四个证书会给第三个证书签名，并且我们可以看到第四个证书是一个根（Root）证书。

**一个证书里面会有什么东西呢，我们可以展开第一个证书看一下，如下图所示：**

![iShot2020-04-0821.12.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.13.11.png)

**证书包含三部分内容：**

- **tbsCertificate（to be signed certificate）待签名证书内容**
- **证书签名算法**
- **CA 给的签名**



也就是说 CA 会用它的私钥对 tbsCertificate 进行签名，并放在签名部分。为什么证书要签名呢？签名是为了验证身份。

## 身份验证

我们先来看一下 tbsCertificate 里面有什么内容，如下图所示：

![iShot2020-04-0821.13.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.11.35.png)

它里面包括了证书的公钥、证书的适用公用名、证书的有效期还有它的签发者等信息。

Amazon 的证书也具备上述结构，我们可以把 Amazon 证书的公钥拷出来，如下图所示：

![iShot2020-04-0821.14.08](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.14.38.png)

中间有一些填充的数字，用灰色字表示。可以看到N通常是一个很大的整数（二进制 2048 位），而 e 通常为 65537。

然后我们用这个 CA 的公钥对 mozilla.org 的证书签名进行解密，方法和上面的类似：

![iShot2020-04-0821.14.38](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.16.24.png)

取解密后的数字 decrypted 的十六进制的末 64 位，即为二进制 256 位的 SHA 哈希签名。

接下来我们手动计算一下 tbsCertificate 的 SHA256 哈希值，方法是在 wireshark 里面把 tbsCertificate 导出一个原始二进制文件：

![iShot2020-04-0821.15.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.14.08.png)

然后再使用 openssl 计算它的哈希值，如下所示：

```python
liyinchengs-MBP:https liyincheng$ openssl dgst -sha256 ~/tbsCertificate.binSHA256(/Users/liyincheng/tbsCertificate.bin)= 5e300091593a10b944051512d39114d56909dc9a504e55cfa2e2984a883a827d
```

我们发现手动计算的哈希值和加密后的证书里的哈希值一致！说明只有知道了 Amazon 私钥的人才能正确地对 mozilla.org 的证书签名，因为公私钥是唯一匹配的。

因此我们验证了第一个证书 mozilla.org 确实是由第二个证书 Amazon 签发的，使用同样的方式，我们可以验证 Amazon 是由第三个签发的，第三个是由第四个根证书签发。

并且第四个证书是根证书，它是内置于操作系统的（通过 Mac 的 keychain 工具可以查看）：

![iShot2020-04-0821.15.49](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.15.49.png)

假如 Hacker 通过 DNS 欺骗之类的方式把你访问的域名指向了他的机器，然后他再伪造一个证书。

但是由于根证书都是内置于操作系统的，所以它改不了签名的公钥，并且它没有正确的私钥，只能用自己的私钥，由于公私钥不配对，很难保证加解密后的信息一致。

或者直接把浏览器拿到的证书搬到他自己的服务器？这样再给浏览器发的证书便是一模一样，但是由于他不知道证书的私钥，所以无法进行后续的操作，因此这样是没有意义的。

这个就是 HTTPS 能够验证身份的原理。另外一个例子是 SSH，需要手动验证签名是否正确。

例如通过打电话或者发邮件等方式告知服务器的签名，与自己算的证书的签名是否一致，如果一致说明证书没有被篡改过（如证书的公钥没有被改为 Hacker 的公钥）：

![iShot2020-04-0821.16.24](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.15.05.png)

上面展示的便是自己手动计算的值，拿这个值和之前的值进行比较是否相等便可知发过来的证书是否被修改过。

那么，为什么不直接使用 RSA 的密钥对进行加密数据？因为 RSA 的密钥对数值太大，不太合适频繁地加解密数据，所以需要更小的密钥。

另一个原因是服务端没有浏览器或者客户端的密钥，无法向浏览器发送加密的数据（不能用自己的私钥加密，因为公钥是公开的）。所以需要进行密钥交换。

## 密钥交换

密钥交换的方式有两种：RSA 和 ECDHE，RSA 的方式比较简单，浏览器生成一把密钥，然后使用证书 RSA 的公钥进行加密发给服务端，服务再使用它的密钥进行解密得到密钥，这样就能够共享密钥了。

它的缺点是攻击者虽然在发送的过程中无法破解，但是如果它保存了所有加密的数据，等到证书到期没有被维护之类的原因导致私钥泄露，那么它就可以使用这把私钥去解密之前传送过的所有数据。

而使用 ECDHE 是一种更安全的密钥交换算法。如下图所示，双方通过 ECDHE 进行密钥交换：

![iShot2020-04-0821.17.16](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.17.16.png)

ECDHE 的全称是 Elliptic Curve Diffie–Hellman key Exchange 椭圆曲线迪非-赫尔曼密钥交换，它是对迪非-赫尔曼密钥交换算法的改进。



**这个算法的思想如下图所示：**

![iShot2020-04-0821.17.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.17.51.png)

为了得到共享秘钥 K，甲用它的私钥计算一个数 g^a，发送给乙，乙的私钥为 b，乙便得到 K= g^a^b，同时发送 g^b 给甲，甲也得到了 K=g^b^a。

这个应该比较好理解，而引入椭圆曲线加密能够提高破解难度。

## 椭圆曲线加密

现在的证书的签名算法有两种：RSA 和新起的 EC。如下图所示，google.com 便是使用的 ECC 证书：

![iShot2020-04-0821.18.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.18.37.png)

我们上面讨论的便是 RSA，破解 RSA 的难点在于无法对公钥的 N 进行质数分解。

如果你能对证书的 N 拆成两个质数相乘，便可推算出证书的私钥，但是在当前的计算能力下是不可能的。而 ECC 的破解难点在于找到指定点的系数。

**如下图所示，有一条椭圆曲线方程：**

```python
y ^ 3 = x ^ 2 + ax + b:
```

![iShot2020-04-0821.19.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.20.17.png)

给定一个起点 G（x，y），现在要计算点 P=2G 的坐标，其过程是在 G 点上做一条线与曲线相切于 -2G，做 -2G 相对于 x 轴的反射便得到 2G 点。

**为了计算 3G 的坐标，如下图所示：**

![iShot2020-04-0821.20.17](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.22.23.png)

连接 2G 与 G 与曲线相郊于 -3G，再做反射得到 3G，同理计算 4G 便是连接 G 与 3G 再做反射。如果最后一个点和起点的连线垂直于 x 轴，说明所有的点已用完。



**EC 的难点在于给定起点 G 和点 K：**

```python
K = kG
```

想要得到 K（K 足够大）是一件很困难的事情。这个 K 便是私钥，而 K=kG 便是公钥。ECC 是怎么加解密数据的呢？

假设要加密的数据为 m，把这个点当作x坐标得到在曲线上的一个点 M，取定一个随机数 r，计算点 C1=rG，C2=M+rK。

把这两个点便是加密后的数据，发给对方，对方收到后使用私钥 K 进行解密，过程如下：

```python
M = C2 - rK = C2 - rkG = C2 - rkG = C2 - kC1
```

通过上面的计算便能还原得到 M，而不知道私钥 K 的人是无法解密的。更多细节可见 Medium 的这篇文章《ECC elliptic curve encryption》。这样我们便理解了 ECC 的原理，那么怎么利用 ECC 进行密钥交换呢？

## ECC 密钥交换

**原理很简单，如下图所示：**

![iShot2020-04-0821.21.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.24.02.png)

之前交换的是两个幂次方的数，现在变成交换两个曲线上的点。

而曲线方程是规定好的，例如 Curve X25519 使用的曲线方程为：

```python
y^2 = x^3 + 486662x^2 + x
```

在密钥交换里面会指定所使用的曲线方程，如下图所示：

![iShot2020-04-0821.22.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.19.37.png)

mozilla.org 所使用的曲线方程为 secp256r1，这个也是比较流行的一个，它的参数比 Curve X25519 大很多。

密钥交换也使用了证书的私钥进行签名，保证交换的密钥不会被人篡改，只是这里的私钥是 mozilla 自己的私钥。

也就是说从连接建立到现在都是明文传输的。接下来双方发送 Change Cipher Spec 的包通知，接下来的包都按照之前约定好的方式进行加密。至此整个安全连接建立完毕。

## HTTPS 证书的应用

那么是谁在做 HTTPS 加密呢？服务端通常是 Nginx、Apache 这些反向代理服务器做的，而具体的业务服务器不需要处理，客户端通常是浏览器等做的加解密，Chrome 是使用 boringSSL 这个库，fork 自 openssl。

我们通过 let’s encrypt 可以申请免费的 TLS 证书，每 3 个月需要手动续。

**证书分为 3 种：**DV、OV、EV，DV 适用于个人，OV 和 EV 需要身份审核，EV 最高端。

**EV 证书会在浏览器的地址栏显示证书的企业名称：**

![iShot2020-04-0821.24.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.21.37.png)

但是新版的 Chrome 似乎把这个去掉了，所以我们打开 medium 的控制台可以看到一个提示：

> **As part of an experiment, Chrome temporarily shows only the lock icon in the address bar. Your SSL certificate with Extended Validation is still valid.**

另外我们可以用 openssl 生成一个自签名证书，执行以下命令：

```python
openssl req -x509 -nodes -sha256 -days 365 -newkey rsa:2048 -keyout test.com.key -out test.com.crt
```

便会得到两个文件，test.com.crt 是证书，test.com.key 是证书的私钥，如下图所示：

![iShot2020-04-0821.25.26](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.25.26.png)

然后把这两个文件给 Nginx 使用便能使用 HTTPS 访问，如下代码所示：

```python
server {
        listen       443;
        server_name  test.com;
        ssl on;
        ssl_certificate    test.com.crt;
        ssl_certificate_key    test.com.key;
     }
```

可以把这个证书添加到系统证书里面，这样浏览器等便能信任，或者直接使用 mkcert 工具一步到位。

## 客户端证书

还有一种证书叫客户端证书，同样需要向 CA 机构申请一个客户端证书，和服务端 TLS 证书不一样的地方是，服务端证书通常是和域名绑定的，而客户端证书可以给本地的任意可执行文件进行签名。

签名验证算法和上文讨论的 TLS 证书一致。为什么可执行文件需要签名呢，因为如果不签名的话，系统会拦截安装或者运行，如 Mac 双击一个未签名的 dmg 包的提示：

![iShot2020-04-0821.27.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.27.36.png)

直接不让你运行了，而 Windows 也有类似的提示，Windows 是会给一个警告：

![iShot2020-04-0821.27.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.27.02.png)

而当我们运行一个已签名的 exe 文件将会是正常的提示，如 Chrome 的提示：

![iShot2020-04-0821.28.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0821.28.15.png)

综上本文主要讨论了对称加密和非对称加密的原理，并介绍了如何利用 RSA 对证书签名的检验以验证连接服务器的身份，怎么利用 ECC 进行数据加密和密钥交换，介绍了下怎么生成和使用 HTTPS 证书，并介绍了下客户端证书。

