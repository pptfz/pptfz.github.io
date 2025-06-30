# zabbix-server无法启动

zabbix5.0配置了主机自动注册后，主机注册到一半的时候(总数150+)，zabbix server挂了，然后日志信息如下，各种查，在[参考链接](https://www.zabbix.com/forum/zabbix-troubleshooting-and-problems/404123-zabbix-server-stopped-after-upgrade-to-5-0)中有提到可能是由于 `CacheSize` 的问题，调大 zabbix server中 `CacheSize`的值，然后重启zabbix server就可以了



```sh
12362:20210315:162445.365 Starting Zabbix Server. Zabbix 5.0.9 (revision 4d07aaafe2).
 12362:20210315:162445.365 ****** Enabled features ******
 12362:20210315:162445.365 SNMP monitoring:           YES
 12362:20210315:162445.365 IPMI monitoring:           YES
 12362:20210315:162445.365 Web monitoring:            YES
 12362:20210315:162445.365 VMware monitoring:         YES
 12362:20210315:162445.365 SMTP authentication:       YES
 12362:20210315:162445.365 ODBC:                      YES
 12362:20210315:162445.365 SSH support:               YES
 12362:20210315:162445.365 IPv6 support:              YES
 12362:20210315:162445.365 TLS support:               YES
 12362:20210315:162445.365 ******************************
 12362:20210315:162445.365 using configuration file: /etc/zabbix/zabbix_server.conf
 12362:20210315:162445.369 current database version (mandatory/optional): 05000000/05000002
 12362:20210315:162445.369 required mandatory version: 05000000
 12362:20210315:162445.377 server #0 started [main process]
 12364:20210315:162445.378 server #1 started [configuration syncer #1]
 12364:20210315:162445.802 __mem_malloc: skipped 0 asked 72 skip_min 18446744073709551615 skip_max 0
 12364:20210315:162445.802 [file:dbconfig.c,line:96] __zbx_mem_malloc(): out of memory (requested 70 bytes)
 12364:20210315:162445.802 [file:dbconfig.c,line:96] __zbx_mem_malloc(): please increase CacheSize configuration parameter
 12364:20210315:162445.802 === memory statistics for configuration cache ===
 12364:20210315:162445.802 free chunks of size     24 bytes:       15
 12364:20210315:162445.802 free chunks of size     64 bytes:        1
 12364:20210315:162445.802 min chunk size:         24 bytes
 12364:20210315:162445.802 max chunk size:         64 bytes
 12364:20210315:162445.802 memory of total size 7228440 bytes fragmented into 72488 chunks
 12364:20210315:162445.802 of those,        424 bytes are in       16 free chunks
 12364:20210315:162445.802 of those,    7228016 bytes are in    72472 used chunks
 12364:20210315:162445.802 of those,    1159792 bytes are used by allocation overhead
 12364:20210315:162445.802 ================================
 12364:20210315:162445.802 === Backtrace: ===
 12364:20210315:162445.803 14: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](zbx_backtrace+0x42) [0x555562a7ea97]
 12364:20210315:162445.803 13: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](__zbx_mem_malloc+0x18c) [0x555562a797e9]
 12364:20210315:162445.803 12: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](+0x18a609) [0x555562a40609]
 12364:20210315:162445.803 11: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](zbx_hashset_insert_ext+0x12e) [0x555562a8488e]
 12364:20210315:162445.803 10: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](+0x18b1b9) [0x555562a411b9]
 12364:20210315:162445.803 9: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](DCstrpool_replace+0x55) [0x555562a412b9]
 12364:20210315:162445.803 8: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](+0x1927c7) [0x555562a487c7]
 12364:20210315:162445.803 7: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](DCsync_configuration+0x1061) [0x555562a4d0fe]
 12364:20210315:162445.803 6: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](dbconfig_thread+0x135) [0x55556290f1b2]
 12364:20210315:162445.803 5: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](zbx_thread_start+0x37) [0x555562a8d5fa]
 12364:20210315:162445.803 4: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](MAIN_ZABBIX_ENTRY+0xa02) [0x5555628ff624]
 12364:20210315:162445.803 3: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](daemon_start+0x305) [0x555562a7e6e3]
 12364:20210315:162445.803 2: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](main+0x312) [0x5555628febd8]
 12364:20210315:162445.803 1: /lib64/libc.so.6(__libc_start_main+0xf5) [0x7f9ebac64555]
 12364:20210315:162445.803 0: /usr/sbin/zabbix_server: configuration syncer [syncing configuration](+0x47c59) [0x5555628fdc59]
 12362:20210315:162445.805 One child process died (PID:12364,exitcode/signal:1). Exiting ...
 12362:20210315:162445.806 syncing trend data...
 12362:20210315:162445.806 syncing trend data done
 12362:20210315:162445.807 Zabbix Server stopped. Zabbix 5.0.9 (revision 4d07aaafe2).
```

