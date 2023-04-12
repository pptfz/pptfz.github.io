# php编译报错

## 报错一	make: *** [sapi/fpm/php-fpm] Error 1

环境 ubuntu16.04

php版本 7.3.27



php编译报错如下

```sh
/root/php-7.3.27/ext/xmlrpc/libxmlrpc/encodings.c:65: undefined reference to `libiconv_open'
/root/php-7.3.27/ext/xmlrpc/libxmlrpc/encodings.c:72: undefined reference to `libiconv'
/root/php-7.3.27/ext/xmlrpc/libxmlrpc/encodings.c:88: undefined reference to `libiconv_close'
/root/php-7.3.27/ext/xmlrpc/libxmlrpc/encodings.c:88: undefined reference to `libiconv_close'
collect2: error: ld returned 1 exit status
Makefile:305: recipe for target 'sapi/fpm/php-fpm' failed
make: *** [sapi/fpm/php-fpm] Error 1
```



网上搜到解决方式为在make编译时加上 `ZEND_EXTRA_LIBS='-liconv'`还有的是重新安装libiconv，全部是扯淡，因为一个人瞎鸡吧写了篇博客后所有人相互抄袭，然后都还是 `原创` 



机器环境太乱，php装了一堆，所以这个问题无解

