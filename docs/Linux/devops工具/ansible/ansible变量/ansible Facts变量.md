[toc]



# ansible Facts变量

:::tip

**在yml文件中通过 `gather_facts: no` 来关闭facts变量**

:::

## 1.Facts变量作用

Facts变量作用：用来采集被控端主机信息，例如cpu、内存、硬盘等



## 2.使用setup模块来获取被控机相关信息

可以使用setup模块来获取被控机相关信息

```shell
ansible devops02 -m setup
```



以下为执行setup模块输出的单个被控机全部内容，所看到的信息全部都是变量

```yaml
devops02 | SUCCESS => {
    "ansible_facts": {
        "ansible_all_ipv4_addresses": [
            "10.0.0.61"
        ], 
        "ansible_all_ipv6_addresses": [
            "fe80::21c:42ff:fed4:711d"
        ], 
        "ansible_apparmor": {
            "status": "disabled"
        }, 
        "ansible_architecture": "x86_64", 
        "ansible_bios_date": "07/31/2020", 
        "ansible_bios_version": "16.0.0 (48916)", 
        "ansible_cmdline": {
            "BOOT_IMAGE": "/vmlinuz-3.10.0-1160.el7.x86_64", 
            "LANG": "en_US.UTF-8", 
            "net.ifnames": "0", 
            "quiet": true, 
            "rd.lvm.lv": "centos/swap", 
            "rhgb": true, 
            "ro": true, 
            "root": "/dev/mapper/centos-root", 
            "spectre_v2": "retpoline"
        }, 
        "ansible_date_time": {
            "date": "2021-09-15", 
            "day": "15", 
            "epoch": "1631707228", 
            "hour": "20", 
            "iso8601": "2021-09-15T12:00:28Z", 
            "iso8601_basic": "20210915T200028186193", 
            "iso8601_basic_short": "20210915T200028", 
            "iso8601_micro": "2021-09-15T12:00:28.186193Z", 
            "minute": "00", 
            "month": "09", 
            "second": "28", 
            "time": "20:00:28", 
            "tz": "CST", 
            "tz_offset": "+0800", 
            "weekday": "Wednesday", 
            "weekday_number": "3", 
            "weeknumber": "37", 
            "year": "2021"
        }, 
        "ansible_default_ipv4": {
            "address": "10.0.0.61", 
            "alias": "eth0", 
            "broadcast": "10.0.0.255", 
            "gateway": "10.0.0.1", 
            "interface": "eth0", 
            "macaddress": "00:1c:42:d4:71:1d", 
            "mtu": 1500, 
            "netmask": "255.255.255.0", 
            "network": "10.0.0.0", 
            "type": "ether"
        }, 
        "ansible_default_ipv6": {}, 
        "ansible_device_links": {
            "ids": {
                "dm-0": [
                    "dm-name-centos-root", 
                    "dm-uuid-LVM-MDpDUifPb6kJUr9fDyJ3m16lXE23SScm2hWpbl8n7I5MqclSkfSLRtLVhwqIZP5B"
                ], 
                "dm-1": [
                    "dm-name-centos-swap", 
                    "dm-uuid-LVM-MDpDUifPb6kJUr9fDyJ3m16lXE23SScmUhtOfTUBKWPnHn8VklaeXfnR6LhzeZUO"
                ], 
                "sda": [
                    "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD"
                ], 
                "sda1": [
                    "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD-part1"
                ], 
                "sda2": [
                    "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD-part2", 
                    "lvm-pv-uuid-Z75Sgb-wZGs-IthV-5Bhm-hn5m-9VeB-24PIOp"
                ], 
                "sr0": [
                    "ata-Virtual_DVD-ROM__1__-_31415B265"
                ]
            }, 
            "labels": {}, 
            "masters": {
                "sda2": [
                    "dm-0", 
                    "dm-1"
                ]
            }, 
            "uuids": {
                "dm-0": [
                    "0fe73be4-eeb3-4995-9d5b-bfc0cc576a83"
                ], 
                "dm-1": [
                    "1c605635-105b-4fc5-aa39-633d867bf1d7"
                ], 
                "sda1": [
                    "544d152e-4e60-41f1-b1f9-d976a1983ac3"
                ]
            }
        }, 
        "ansible_devices": {
            "dm-0": {
                "holders": [], 
                "host": "", 
                "links": {
                    "ids": [
                        "dm-name-centos-root", 
                        "dm-uuid-LVM-MDpDUifPb6kJUr9fDyJ3m16lXE23SScm2hWpbl8n7I5MqclSkfSLRtLVhwqIZP5B"
                    ], 
                    "labels": [], 
                    "masters": [], 
                    "uuids": [
                        "0fe73be4-eeb3-4995-9d5b-bfc0cc576a83"
                    ]
                }, 
                "model": null, 
                "partitions": {}, 
                "removable": "0", 
                "rotational": "0", 
                "sas_address": null, 
                "sas_device_handle": null, 
                "scheduler_mode": "", 
                "sectors": "98549760", 
                "sectorsize": "512", 
                "serial": "V65X1HR75TK4SFVV1XTD", 
                "size": "46.99 GB", 
                "support_discard": "4096", 
                "vendor": null, 
                "virtual": 1
            }, 
            "dm-1": {
                "holders": [], 
                "host": "", 
                "links": {
                    "ids": [
                        "dm-name-centos-swap", 
                        "dm-uuid-LVM-MDpDUifPb6kJUr9fDyJ3m16lXE23SScmUhtOfTUBKWPnHn8VklaeXfnR6LhzeZUO"
                    ], 
                    "labels": [], 
                    "masters": [], 
                    "uuids": [
                        "1c605635-105b-4fc5-aa39-633d867bf1d7"
                    ]
                }, 
                "model": null, 
                "partitions": {}, 
                "removable": "0", 
                "rotational": "0", 
                "sas_address": null, 
                "sas_device_handle": null, 
                "scheduler_mode": "", 
                "sectors": "4194304", 
                "sectorsize": "512", 
                "serial": "V65X1HR75TK4SFVV1XTD", 
                "size": "2.00 GB", 
                "support_discard": "4096", 
                "vendor": null, 
                "virtual": 1
            }, 
            "sda": {
                "holders": [], 
                "host": "SATA controller: Intel Corporation 82801HR/HO/HH (ICH8R/DO/DH) 6 port SATA Controller [AHCI mode] (rev 02)", 
                "links": {
                    "ids": [
                        "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD"
                    ], 
                    "labels": [], 
                    "masters": [], 
                    "uuids": []
                }, 
                "model": "Virtual HDD", 
                "partitions": {
                    "sda1": {
                        "holders": [], 
                        "links": {
                            "ids": [
                                "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD-part1"
                            ], 
                            "labels": [], 
                            "masters": [], 
                            "uuids": [
                                "544d152e-4e60-41f1-b1f9-d976a1983ac3"
                            ]
                        }, 
                        "sectors": "2097152", 
                        "sectorsize": 512, 
                        "size": "1.00 GB", 
                        "start": "2048", 
                        "uuid": "544d152e-4e60-41f1-b1f9-d976a1983ac3"
                    }, 
                    "sda2": {
                        "holders": [
                            "centos-root", 
                            "centos-swap"
                        ], 
                        "links": {
                            "ids": [
                                "ata-Virtual_HDD_V65X1HR75TK4SFVV1XTD-part2", 
                                "lvm-pv-uuid-Z75Sgb-wZGs-IthV-5Bhm-hn5m-9VeB-24PIOp"
                            ], 
                            "labels": [], 
                            "masters": [
                                "dm-0", 
                                "dm-1"
                            ], 
                            "uuids": []
                        }, 
                        "sectors": "102758400", 
                        "sectorsize": 512, 
                        "size": "49.00 GB", 
                        "start": "2099200", 
                        "uuid": null
                    }
                }, 
                "removable": "0", 
                "rotational": "0", 
                "sas_address": null, 
                "sas_device_handle": null, 
                "scheduler_mode": "deadline", 
                "sectors": "104857600", 
                "sectorsize": "512", 
                "serial": "V65X1HR75TK4SFVV1XTD", 
                "size": "50.00 GB", 
                "support_discard": "4096", 
                "vendor": "ATA", 
                "virtual": 1
            }, 
            "sr0": {
                "holders": [], 
                "host": "SATA controller: Intel Corporation 82801HR/HO/HH (ICH8R/DO/DH) 6 port SATA Controller [AHCI mode] (rev 02)", 
                "links": {
                    "ids": [
                        "ata-Virtual_DVD-ROM__1__-_31415B265"
                    ], 
                    "labels": [], 
                    "masters": [], 
                    "uuids": []
                }, 
                "model": "Virtual DVD-ROM", 
                "partitions": {}, 
                "removable": "1", 
                "rotational": "1", 
                "sas_address": null, 
                "sas_device_handle": null, 
                "scheduler_mode": "deadline", 
                "sectors": "2097151", 
                "sectorsize": "512", 
                "size": "1024.00 MB", 
                "support_discard": "0", 
                "vendor": null, 
                "virtual": 1
            }
        }, 
        "ansible_distribution": "CentOS", 
        "ansible_distribution_file_parsed": true, 
        "ansible_distribution_file_path": "/etc/redhat-release", 
        "ansible_distribution_file_variety": "RedHat", 
        "ansible_distribution_major_version": "7", 
        "ansible_distribution_release": "Core", 
        "ansible_distribution_version": "7.9", 
        "ansible_dns": {
            "nameservers": [
                "223.5.5.5", 
                "114.114.114.114"
            ], 
            "search": [
                "localdomain"
            ]
        }, 
        "ansible_domain": "", 
        "ansible_effective_group_id": 0, 
        "ansible_effective_user_id": 0, 
        "ansible_env": {
            "HISTTIMEFORMAT": "%Y-%m-%d %H:%M:%S ", 
            "HOME": "/root", 
            "LANG": "C", 
            "LC_ALL": "C", 
            "LC_NUMERIC": "C", 
            "LESSOPEN": "||/usr/bin/lesspipe.sh %s", 
            "LOGNAME": "root", 
            "LS_COLORS": "rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=01;05;37;41:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.axv=01;35:*.anx=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=01;36:*.au=01;36:*.flac=01;36:*.mid=01;36:*.midi=01;36:*.mka=01;36:*.mp3=01;36:*.mpc=01;36:*.ogg=01;36:*.ra=01;36:*.wav=01;36:*.axa=01;36:*.oga=01;36:*.spx=01;36:*.xspf=01;36:", 
            "MAIL": "/var/mail/root", 
            "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin", 
            "PWD": "/root", 
            "SHELL": "/bin/bash", 
            "SHLVL": "2", 
            "SSH_CLIENT": "10.0.0.60 60520 22", 
            "SSH_CONNECTION": "10.0.0.60 60520 10.0.0.61 22", 
            "SSH_TTY": "/dev/pts/2", 
            "TERM": "xterm", 
            "USER": "root", 
            "XDG_RUNTIME_DIR": "/run/user/0", 
            "XDG_SESSION_ID": "7504", 
            "_": "/usr/bin/python"
        }, 
        "ansible_eth0": {
            "active": true, 
            "device": "eth0", 
            "features": {
                "busy_poll": "off [fixed]", 
                "fcoe_mtu": "off [fixed]", 
                "generic_receive_offload": "on", 
                "generic_segmentation_offload": "on", 
                "highdma": "on [fixed]", 
                "hw_tc_offload": "off [fixed]", 
                "l2_fwd_offload": "off [fixed]", 
                "large_receive_offload": "off [fixed]", 
                "loopback": "off [fixed]", 
                "netns_local": "off [fixed]", 
                "ntuple_filters": "off [fixed]", 
                "receive_hashing": "off [fixed]", 
                "rx_all": "off [fixed]", 
                "rx_checksumming": "off [fixed]", 
                "rx_fcs": "off [fixed]", 
                "rx_gro_hw": "off [fixed]", 
                "rx_udp_tunnel_port_offload": "off [fixed]", 
                "rx_vlan_filter": "off [fixed]", 
                "rx_vlan_offload": "off [fixed]", 
                "rx_vlan_stag_filter": "off [fixed]", 
                "rx_vlan_stag_hw_parse": "off [fixed]", 
                "scatter_gather": "on", 
                "tcp_segmentation_offload": "on", 
                "tx_checksum_fcoe_crc": "off [fixed]", 
                "tx_checksum_ip_generic": "on", 
                "tx_checksum_ipv4": "off [fixed]", 
                "tx_checksum_ipv6": "off [fixed]", 
                "tx_checksum_sctp": "off [fixed]", 
                "tx_checksumming": "on", 
                "tx_fcoe_segmentation": "off [fixed]", 
                "tx_gre_csum_segmentation": "off [fixed]", 
                "tx_gre_segmentation": "off [fixed]", 
                "tx_gso_partial": "off [fixed]", 
                "tx_gso_robust": "off [fixed]", 
                "tx_ipip_segmentation": "off [fixed]", 
                "tx_lockless": "off [fixed]", 
                "tx_nocache_copy": "off", 
                "tx_scatter_gather": "on", 
                "tx_scatter_gather_fraglist": "off [fixed]", 
                "tx_sctp_segmentation": "off [fixed]", 
                "tx_sit_segmentation": "off [fixed]", 
                "tx_tcp6_segmentation": "on", 
                "tx_tcp_ecn_segmentation": "on", 
                "tx_tcp_mangleid_segmentation": "off", 
                "tx_tcp_segmentation": "on", 
                "tx_udp_tnl_csum_segmentation": "off [fixed]", 
                "tx_udp_tnl_segmentation": "off [fixed]", 
                "tx_vlan_offload": "off [fixed]", 
                "tx_vlan_stag_hw_insert": "off [fixed]", 
                "udp_fragmentation_offload": "off [fixed]", 
                "vlan_challenged": "off [fixed]"
            }, 
            "hw_timestamp_filters": [], 
            "ipv4": {
                "address": "10.0.0.61", 
                "broadcast": "10.0.0.255", 
                "netmask": "255.255.255.0", 
                "network": "10.0.0.0"
            }, 
            "ipv6": [
                {
                    "address": "fe80::21c:42ff:fed4:711d", 
                    "prefix": "64", 
                    "scope": "link"
                }
            ], 
            "macaddress": "00:1c:42:d4:71:1d", 
            "module": "virtio_net", 
            "mtu": 1500, 
            "pciid": "virtio0", 
            "promisc": false, 
            "timestamping": [
                "rx_software", 
                "software"
            ], 
            "type": "ether"
        }, 
        "ansible_fibre_channel_wwn": [], 
        "ansible_fips": false, 
        "ansible_form_factor": "Laptop", 
        "ansible_fqdn": "devops02", 
        "ansible_hostname": "devops02", 
        "ansible_hostnqn": "", 
        "ansible_interfaces": [
            "lo", 
            "eth0"
        ], 
        "ansible_is_chroot": false, 
        "ansible_iscsi_iqn": "", 
        "ansible_kernel": "3.10.0-1160.el7.x86_64", 
        "ansible_kernel_version": "#1 SMP Mon Oct 19 16:18:59 UTC 2020", 
        "ansible_lo": {
            "active": true, 
            "device": "lo", 
            "features": {
                "busy_poll": "off [fixed]", 
                "fcoe_mtu": "off [fixed]", 
                "generic_receive_offload": "on", 
                "generic_segmentation_offload": "on", 
                "highdma": "on [fixed]", 
                "hw_tc_offload": "off [fixed]", 
                "l2_fwd_offload": "off [fixed]", 
                "large_receive_offload": "off [fixed]", 
                "loopback": "on [fixed]", 
                "netns_local": "on [fixed]", 
                "ntuple_filters": "off [fixed]", 
                "receive_hashing": "off [fixed]", 
                "rx_all": "off [fixed]", 
                "rx_checksumming": "on [fixed]", 
                "rx_fcs": "off [fixed]", 
                "rx_gro_hw": "off [fixed]", 
                "rx_udp_tunnel_port_offload": "off [fixed]", 
                "rx_vlan_filter": "off [fixed]", 
                "rx_vlan_offload": "off [fixed]", 
                "rx_vlan_stag_filter": "off [fixed]", 
                "rx_vlan_stag_hw_parse": "off [fixed]", 
                "scatter_gather": "on", 
                "tcp_segmentation_offload": "on", 
                "tx_checksum_fcoe_crc": "off [fixed]", 
                "tx_checksum_ip_generic": "on [fixed]", 
                "tx_checksum_ipv4": "off [fixed]", 
                "tx_checksum_ipv6": "off [fixed]", 
                "tx_checksum_sctp": "on [fixed]", 
                "tx_checksumming": "on", 
                "tx_fcoe_segmentation": "off [fixed]", 
                "tx_gre_csum_segmentation": "off [fixed]", 
                "tx_gre_segmentation": "off [fixed]", 
                "tx_gso_partial": "off [fixed]", 
                "tx_gso_robust": "off [fixed]", 
                "tx_ipip_segmentation": "off [fixed]", 
                "tx_lockless": "on [fixed]", 
                "tx_nocache_copy": "off [fixed]", 
                "tx_scatter_gather": "on [fixed]", 
                "tx_scatter_gather_fraglist": "on [fixed]", 
                "tx_sctp_segmentation": "on", 
                "tx_sit_segmentation": "off [fixed]", 
                "tx_tcp6_segmentation": "on", 
                "tx_tcp_ecn_segmentation": "on", 
                "tx_tcp_mangleid_segmentation": "on", 
                "tx_tcp_segmentation": "on", 
                "tx_udp_tnl_csum_segmentation": "off [fixed]", 
                "tx_udp_tnl_segmentation": "off [fixed]", 
                "tx_vlan_offload": "off [fixed]", 
                "tx_vlan_stag_hw_insert": "off [fixed]", 
                "udp_fragmentation_offload": "on", 
                "vlan_challenged": "on [fixed]"
            }, 
            "hw_timestamp_filters": [], 
            "ipv4": {
                "address": "127.0.0.1", 
                "broadcast": "", 
                "netmask": "255.0.0.0", 
                "network": "127.0.0.0"
            }, 
            "ipv6": [
                {
                    "address": "::1", 
                    "prefix": "128", 
                    "scope": "host"
                }
            ], 
            "mtu": 65536, 
            "promisc": false, 
            "timestamping": [
                "rx_software", 
                "software"
            ], 
            "type": "loopback"
        }, 
        "ansible_local": {}, 
        "ansible_lsb": {}, 
        "ansible_lvm": {
            "lvs": {
                "root": {
                    "size_g": "46.99", 
                    "vg": "centos"
                }, 
                "swap": {
                    "size_g": "2.00", 
                    "vg": "centos"
                }
            }, 
            "pvs": {
                "/dev/sda2": {
                    "free_g": "0.00", 
                    "size_g": "49.00", 
                    "vg": "centos"
                }
            }, 
            "vgs": {
                "centos": {
                    "free_g": "0.00", 
                    "num_lvs": "2", 
                    "num_pvs": "1", 
                    "size_g": "49.00"
                }
            }
        }, 
        "ansible_machine": "x86_64", 
        "ansible_machine_id": "0af8c41dd588fb4f8f96a48e78beb674", 
        "ansible_memfree_mb": 142, 
        "ansible_memory_mb": {
            "nocache": {
                "free": 734, 
                "used": 252
            }, 
            "real": {
                "free": 142, 
                "total": 986, 
                "used": 844
            }, 
            "swap": {
                "cached": 0, 
                "free": 0, 
                "total": 0, 
                "used": 0
            }
        }, 
        "ansible_memtotal_mb": 986, 
        "ansible_mounts": [
            {
                "block_available": 223727, 
                "block_size": 4096, 
                "block_total": 259584, 
                "block_used": 35857, 
                "device": "/dev/sda1", 
                "fstype": "xfs", 
                "inode_available": 523962, 
                "inode_total": 524288, 
                "inode_used": 326, 
                "mount": "/boot", 
                "options": "rw,relatime,attr2,inode64,noquota", 
                "size_available": 916385792, 
                "size_total": 1063256064, 
                "uuid": "544d152e-4e60-41f1-b1f9-d976a1983ac3"
            }, 
            {
                "block_available": 11527392, 
                "block_size": 4096, 
                "block_total": 12312705, 
                "block_used": 785313, 
                "device": "/dev/mapper/centos-root", 
                "fstype": "xfs", 
                "inode_available": 24533001, 
                "inode_total": 24637440, 
                "inode_used": 104439, 
                "mount": "/", 
                "options": "rw,relatime,attr2,inode64,noquota", 
                "size_available": 47216197632, 
                "size_total": 50432839680, 
                "uuid": "0fe73be4-eeb3-4995-9d5b-bfc0cc576a83"
            }
        ], 
        "ansible_nodename": "devops02", 
        "ansible_os_family": "RedHat", 
        "ansible_pkg_mgr": "yum", 
        "ansible_proc_cmdline": {
            "BOOT_IMAGE": "/vmlinuz-3.10.0-1160.el7.x86_64", 
            "LANG": "en_US.UTF-8", 
            "net.ifnames": "0", 
            "quiet": true, 
            "rd.lvm.lv": [
                "centos/root", 
                "centos/swap"
            ], 
            "rhgb": true, 
            "ro": true, 
            "root": "/dev/mapper/centos-root", 
            "spectre_v2": "retpoline"
        }, 
        "ansible_processor": [
            "0", 
            "GenuineIntel", 
            "Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz", 
            "1", 
            "GenuineIntel", 
            "Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz"
        ], 
        "ansible_processor_cores": 2, 
        "ansible_processor_count": 1, 
        "ansible_processor_threads_per_core": 1, 
        "ansible_processor_vcpus": 2, 
        "ansible_product_name": "Parallels Virtual Platform", 
        "ansible_product_serial": "Parallels-1D C4 F8 0A 88 D5 4F FB 8F 96 A4 8E 78 BE B6 74", 
        "ansible_product_uuid": "0AF8C41D-D588-FB4F-8F96-A48E78BEB674", 
        "ansible_product_version": "None", 
        "ansible_python": {
            "executable": "/usr/bin/python", 
            "has_sslcontext": true, 
            "type": "CPython", 
            "version": {
                "major": 2, 
                "micro": 5, 
                "minor": 7, 
                "releaselevel": "final", 
                "serial": 0
            }, 
            "version_info": [
                2, 
                7, 
                5, 
                "final", 
                0
            ]
        }, 
        "ansible_python_version": "2.7.5", 
        "ansible_real_group_id": 0, 
        "ansible_real_user_id": 0, 
        "ansible_selinux": {
            "status": "disabled"
        }, 
        "ansible_selinux_python_present": true, 
        "ansible_service_mgr": "systemd", 
        "ansible_ssh_host_key_ecdsa_public": "AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCSlkb1znSaz1isLTp/A+1gAUSHuH72VkAUu40IovJZSZ4IbCkSWPunoghZrF9SX29XOfauFUK3hZvdiLXMQwD8=", 
        "ansible_ssh_host_key_ed25519_public": "AAAAC3NzaC1lZDI1NTE5AAAAIFqE/3imUpdPXOqCkpjQkEAp8vMQOX/Tmoe9HYcVFTYK", 
        "ansible_ssh_host_key_rsa_public": "AAAAB3NzaC1yc2EAAAADAQABAAABAQDmJK1wwE9wLsL/5uqqtB2RfkSwCQJ4X8uc4+F6fqNMkrvnfsicT2MiIoC4LIRc3MCaVCSYjtJdFb7ExDICIMHuno6/DhnfUCHwQxAJoupE59YgeCZyh1I+pbDy86RKIMybpJpDCMvFp/fPWubrlLX29dXa64Ytmxgu9/gqCKhXIJw9+ZetRJrvDyiv0Fhot8YzaxBwWBSTI+pgAo6o81QO1HkbkENluK9WKrJkWZYnD6FC2VFzjMLHFw+EIf5HJ0Ll+X1YfE9z7Pch2jOoFLKCXa3vz2Bhxt+v71MfXv+j+u8qs7twh5WYaT5ZQoqh39WB1B9FWLg3Fs3xGT12sy/J", 
        "ansible_swapfree_mb": 0, 
        "ansible_swaptotal_mb": 0, 
        "ansible_system": "Linux", 
        "ansible_system_capabilities": [
            "cap_chown", 
            "cap_dac_override", 
            "cap_dac_read_search", 
            "cap_fowner", 
            "cap_fsetid", 
            "cap_kill", 
            "cap_setgid", 
            "cap_setuid", 
            "cap_setpcap", 
            "cap_linux_immutable", 
            "cap_net_bind_service", 
            "cap_net_broadcast", 
            "cap_net_admin", 
            "cap_net_raw", 
            "cap_ipc_lock", 
            "cap_ipc_owner", 
            "cap_sys_module", 
            "cap_sys_rawio", 
            "cap_sys_chroot", 
            "cap_sys_ptrace", 
            "cap_sys_pacct", 
            "cap_sys_admin", 
            "cap_sys_boot", 
            "cap_sys_nice", 
            "cap_sys_resource", 
            "cap_sys_time", 
            "cap_sys_tty_config", 
            "cap_mknod", 
            "cap_lease", 
            "cap_audit_write", 
            "cap_audit_control", 
            "cap_setfcap", 
            "cap_mac_override", 
            "cap_mac_admin", 
            "cap_syslog", 
            "35", 
            "36+ep"
        ], 
        "ansible_system_capabilities_enforced": "True", 
        "ansible_system_vendor": "Parallels Software International Inc.", 
        "ansible_uptime_seconds": 359912, 
        "ansible_user_dir": "/root", 
        "ansible_user_gecos": "root", 
        "ansible_user_gid": 0, 
        "ansible_user_id": "root", 
        "ansible_user_shell": "/bin/bash", 
        "ansible_user_uid": 0, 
        "ansible_userspace_architecture": "x86_64", 
        "ansible_userspace_bits": "64", 
        "ansible_virtualization_role": "guest", 
        "ansible_virtualization_type": "parallels", 
        "discovered_interpreter_python": "/usr/bin/python", 
        "gather_subset": [
            "all"
        ], 
        "module_setup": true
    }, 
    "changed": false
}
```



## 3.使用debug模块来获取被控机相关变量信息

**示例1：获取被控机ip地址**

**方法1：使用命令**

```shell
$ ansible devops02 -m setup -a "filter=ansible_default_ipv4"
devops02 | SUCCESS => {
    "ansible_facts": {
        "ansible_default_ipv4": {
            "address": "10.0.0.61", 
            "alias": "eth0", 
            "broadcast": "10.0.0.255", 
            "gateway": "10.0.0.1", 
            "interface": "eth0", 
            "macaddress": "00:1c:42:d4:71:1d", 
            "mtu": 1500, 
            "netmask": "255.255.255.0", 
            "network": "10.0.0.0", 
            "type": "ether"
        }, 
        "discovered_interpreter_python": "/usr/bin/python"
    }, 
    "changed": false
}
```



**方法2: 使用playbook**

编辑yml文件

```shell
$ cat > facts.yml << EOF
- hosts: all
  tasks:
    - name: output hosts info
      debug:
        msg: "{{ ansible_default_ipv4.address }}"
EOF       
```



执行yml文件

```shell
$ ansible-playbook facts.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [output hosts info] *******************************************************************************************************************************
ok: [devops01] => {
    "msg": "10.0.0.60"
}
ok: [devops02] => {
    "msg": "10.0.0.61"
}
ok: [devops03] => {
    "msg": "10.0.0.62"
}

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



## 4.Facts变量使用示例

### 4.1 示例1 拷贝文件，不同主机信息不同

典型的例子就是zabbix agent文件 `zabbix_agentd.conf` 中有 `Hostname` 参数，默认为 `Zabbix server`

现在我们批量在被控机上安装zabbix agent，想实现的效果是不同主机，`zabbix_agentd.conf` 文件中 `Hostname` 参数为当前主机的主机名



这里我们用一个文件测试即可，编辑一个测试文件

> ansible Facts变量中有一个固定变量 `ansible_fqdn` ，这个变量就是获取当前主机的主机名

```shell
# 编辑一个文件，模拟zabbix agent文件，这里主要是验证Facts变量
cat > zabbix_agentd.conf << EOF
Hostname={{ ansible_fqdn }}
EOF
```



编辑yml文件

> 这里使用的是template模块而不是copy模块，template模块会解析facts变量

```yaml
cat > facts_zabbix.yml << EOF
- hosts: all
  tasks:
    - name: copy zabbix agent conf
      template:
        src: 
          /root/zabbix_agentd.conf
        dest:
          /etc
EOF
```



执行yml文件

```shell
$ ansible-playbook facts_zabbix.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]
ok: [devops02]
ok: [devops01]

TASK [copy zabbix agent conf] **************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



登陆其中一台机器验证

```shell
$ cat /etc/zabbix_agentd.conf 
Hostname=devops02
```

 
