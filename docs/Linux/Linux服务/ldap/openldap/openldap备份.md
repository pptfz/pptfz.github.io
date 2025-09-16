# openldap备份



## openldap使用osixia镜像

[docker备份openldap github地址](https://github.com/osixia/docker-openldap-backup)



### 支持的环境变量

| 变量名                        | 说明                     |
| ----------------------------- | ------------------------ |
| `LDAP_BACKUP_DATA_CRON_EXP`   | 备份openldap数据         |
| `LDAP_BACKUP_CONFIG_CRON_EXP` | 备份openldap配置文件     |
| `LDAP_BACKUP_TTL`             | 备份保留时间，默认为15天 |



### 需要注意的点

:::caution 注意

使用 [docker-openldap-backup](https://github.com/osixia/docker-openldap-backup) 备份容器，需要让备份容器能够访问到openldap的数据目录和配置文件目录，现在openldap容器已经把 **数据目录** `/var/lib/ldap` 和 **配置目录** `/etc/ldap/slapd.d` 挂载到了宿主机

所以启动 **`osixia/openldap-backup`** 容器时，只需要把openldap持久化的目录挂载到备份容器中，这样它才能读取到 LDAP 的实际内容，从而进行备份

```yaml
services:
  openldap:
    image: osixia/openldap:1.5.0
    container_name: openldap
    hostname: openldap
    restart: always
    environment:
      LDAP_ORGANISATION: "ops"
      LDAP_DOMAIN: "ops.com"
      LDAP_ADMIN_PASSWORD: "admin"
    ports:
      - "389:389"
      - "636:636"
    volumes:
      - /data/docker-volume/openldap/data:/var/lib/ldap
      - /data/docker-volume/openldap/config:/etc/ldap/slapd.d
```

:::



### 启动备份容器

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run -d \
  --name openldap-backup \
  --hostname openldap-backup \
  --restart always \
  -v /data/docker-volume/openldap/data:/var/lib/ldap:ro \
  -v /data/docker-volume/openldap/config:/etc/ldap/slapd.d:ro \
  -v /data/docker-volume/openldap/backup:/data/backup \
  -e LDAP_BACKUP_DATA_CRON_EXP="*/1 * * * *" \
  -e LDAP_BACKUP_CONFIG_CRON_EXP="*/1 * * * *" \
  -e LDAP_BACKUP_TTL=7 \
  osixia/openldap-backup:1.5.0
```

 

 </TabItem>
  <TabItem value="docker-compose" label="docker-compose">

```shell
cat > docker-compose.yaml << EOF
services:
  openldap-backup:
    image: osixia/openldap-backup:1.5.0
    container_name: openldap-backup
    hostname: openldap-backup
    restart: always
    environment:
      - LDAP_BACKUP_CONFIG_CRON_EXP=*/1 * * * *
      - LDAP_BACKUP_DATA_CRON_EXP=*/1 * * * *
      - LDAP_BACKUP_TTL=7
    volumes:
      - /data/openldap/backup:/data/backup
      - /data/docker-volume/openldap/data:/var/lib/ldap:ro
      - /data/docker-volume/openldap/config:/etc/ldap/slapd.d:ro
EOF
```

  </TabItem>
</Tabs>



### 查看备份文件

然后会在 `/data/openldap/backup`  目录下生成以下备份文件

![iShot_2025-09-15_17.40.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-15_17.40.11.png)



解压缩后

![iShot_2025-09-15_17.41.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-15_17.41.30.png)



`20250915T094001-data` 文件内容

ldap中的组和用户如下，需要注意data文件内容备份是否正确

![iShot_2025-09-15_17.44.48](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-15_17.44.48.png)



```shell
$ cat 20250915T094001-data 
dn: dc=ops,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: ops
dc: ops
structuralObjectClass: organization
entryUUID: 34358968-2323-1040-8507-cb1f297b6d9f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.123326Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911062049Z

dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1000
structuralObjectClass: posixGroup
entryUUID: 941eaab2-232d-1040-973f-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.001980Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1001
structuralObjectClass: posixGroup
entryUUID: 9420bbc2-232d-1040-9740-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.015559Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=python,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: python
gidNumber: 1002
structuralObjectClass: posixGroup
entryUUID: 9422ed66-232d-1040-9741-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.029941Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=php,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: php
gidNumber: 1003
structuralObjectClass: posixGroup
entryUUID: 9424c064-232d-1040-9742-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.041895Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=c,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: c
gidNumber: 1004
structuralObjectClass: posixGroup
entryUUID: 94262ddc-232d-1040-9743-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.051252Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=c\2B\2B,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: c++
gidNumber: 1005
structuralObjectClass: posixGroup
entryUUID: 94280a26-232d-1040-9744-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.063445Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: cn=c#,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: c#
gidNumber: 1006
structuralObjectClass: posixGroup
entryUUID: 94299b66-232d-1040-9745-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073505Z
entryCSN: 20250911073505.073717Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073505Z

dn: uid=user1,cn=go,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user1
sn: user1
uid: user1
uidNumber: 1001
gidNumber: 1000
homeDirectory: /home/user1
loginShell: /bin/bash
mail: user1@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 24b0d776-232e-1040-9746-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073907Z
entryCSN: 20250911073907.551879Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073907Z

dn: uid=user2,cn=go,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user2
sn: user2
uid: user2
uidNumber: 1002
gidNumber: 1000
homeDirectory: /home/user2
loginShell: /bin/bash
mail: user2@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 24b2af06-232e-1040-9747-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073907Z
entryCSN: 20250911073907.563973Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073907Z

dn: uid=user3,cn=go,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user3
sn: user3
uid: user3
uidNumber: 1003
gidNumber: 1000
homeDirectory: /home/user3
loginShell: /bin/bash
mail: user3@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 24b38638-232e-1040-9748-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073907Z
entryCSN: 20250911073907.569482Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073907Z

dn: uid=user1,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user1
sn: user1
uid: user1
uidNumber: 1001
gidNumber: 1000
homeDirectory: /home/user1
loginShell: /bin/bash
mail: user1@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 32e04e62-232e-1040-9749-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073931Z
entryCSN: 20250911073931.351062Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073931Z

dn: uid=user2,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user2
sn: user2
uid: user2
uidNumber: 1002
gidNumber: 1000
homeDirectory: /home/user2
loginShell: /bin/bash
mail: user2@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 32e1fa00-232e-1040-974a-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073931Z
entryCSN: 20250911073931.362013Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073931Z

dn: uid=user3,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: user3
sn: user3
uid: user3
uidNumber: 1003
gidNumber: 1000
homeDirectory: /home/user3
loginShell: /bin/bash
mail: user3@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
structuralObjectClass: inetOrgPerson
entryUUID: 32e301d4-232e-1040-974b-819bc7a17f6f
creatorsName: cn=admin,dc=ops,dc=com
createTimestamp: 20250911073931Z
entryCSN: 20250911073931.368768Z#000000#000#000000
modifiersName: cn=admin,dc=ops,dc=com
modifyTimestamp: 20250911073931Z
```



`20250915T094001-config` 内容如下

```shell
$ cat 20250915T094001-config
dn: cn=config
objectClass: olcGlobal
cn: config
olcArgsFile: /var/run/slapd/slapd.args
olcLogLevel: none
olcPidFile: /var/run/slapd/slapd.pid
olcToolThreads: 1
structuralObjectClass: olcGlobal
entryUUID: 3432699a-2323-1040-9684-37b17f47910e
creatorsName: cn=config
createTimestamp: 20250911062049Z
olcTLSCipherSuite: SECURE256:+SECURE128:-VERS-TLS-ALL:+VERS-TLS1.2:-RSA:-DHE
 -DSS:-CAMELLIA-128-CBC:-CAMELLIA-256-CBC
olcTLSCACertificateFile: /container/service/slapd/assets/certs/ca.crt
olcTLSCertificateFile: /container/service/slapd/assets/certs/ldap.crt
olcTLSCertificateKeyFile: /container/service/slapd/assets/certs/ldap.key
olcTLSDHParamFile: /container/service/slapd/assets/certs/dhparam.pem
olcTLSVerifyClient: demand
entryCSN: 20250915093915.987567Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250915093915Z

dn: cn=module{0},cn=config
objectClass: olcModuleList
cn: module{0}
olcModulePath: /usr/lib/ldap
olcModuleLoad: {0}back_mdb
olcModuleLoad: {1}memberof
olcModuleLoad: {2}refint
structuralObjectClass: olcModuleList
entryUUID: 3432c66a-2323-1040-968c-37b17f47910e
creatorsName: cn=admin,cn=config
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.263918Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250911062049Z

dn: cn=schema,cn=config
objectClass: olcSchemaConfig
cn: schema
structuralObjectClass: olcSchemaConfig
entryUUID: 343274bc-2323-1040-9687-37b17f47910e
creatorsName: cn=admin,cn=config
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.103141Z#000000#000#000000
modifiersName: cn=admin,cn=config
modifyTimestamp: 20250911062049Z
......
structuralObjectClass: olcSchemaConfig
entryUUID: 34457daa-2323-1040-94db-3d6d2d8f803e
creatorsName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.227888Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250911062049Z

dn: olcDatabase={-1}frontend,cn=config
objectClass: olcDatabaseConfig
objectClass: olcFrontendConfig
olcDatabase: {-1}frontend
olcAccess: {0}to * by dn.exact=gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth manage by * break
olcAccess: {1}to dn.exact="" by * read
olcAccess: {2}to dn.base="cn=Subschema" by * read
olcSizeLimit: 500
structuralObjectClass: olcDatabaseConfig
entryUUID: 34326e36-2323-1040-9685-37b17f47910e
creatorsName: cn=config
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.102974Z#000000#000#000000
modifiersName: cn=config
modifyTimestamp: 20250911062049Z

dn: olcDatabase={0}config,cn=config
objectClass: olcDatabaseConfig
olcDatabase: {0}config
olcAccess: {0}to * by dn.exact=gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth manage by * break
olcRootDN: cn=admin,cn=config
structuralObjectClass: olcDatabaseConfig
entryUUID: 3432721e-2323-1040-9686-37b17f47910e
creatorsName: cn=config
createTimestamp: 20250911062049Z
olcRootPW:: e1NTSEF9YVZMdE1xOVJhV29Felg4Sy9NamJmQi81VkpxODgwZnA=
entryCSN: 20250915093915.987730Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250915093915Z

dn: olcDatabase={1}mdb,cn=config
objectClass: olcDatabaseConfig
objectClass: olcMdbConfig
olcDatabase: {1}mdb
olcDbDirectory: /var/lib/ldap
olcSuffix: dc=ops,dc=com
olcLastMod: TRUE
olcRootDN: cn=admin,dc=ops,dc=com
olcDbCheckpoint: 512 30
olcDbMaxSize: 1073741824
structuralObjectClass: olcMdbConfig
entryUUID: 3432d4ca-2323-1040-968d-37b17f47910e
creatorsName: cn=admin,cn=config
createTimestamp: 20250911062049Z
olcAccess: {0}to * by dn.exact=gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth manage by * break
olcAccess: {1}to attrs=userPassword,shadowLastChange by self write by dn="cn
 =admin,dc=ops,dc=com" write by anonymous auth by * none
olcAccess: {2}to * by self read by dn="cn=admin,dc=ops,dc=com" write by * no
 ne
olcDbIndex: uid eq
olcDbIndex: mail eq
olcDbIndex: memberOf eq
olcDbIndex: entryCSN eq
olcDbIndex: entryUUID eq
olcDbIndex: objectClass eq
olcRootPW:: e1NTSEF9ZXBIQzdhQW0zamcyWk5PbTBTMHc1M2NnZERVYmF1aWs=
entryCSN: 20250915093915.987864Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250915093915Z

dn: olcOverlay={0}memberof,olcDatabase={1}mdb,cn=config
objectClass: olcOverlayConfig
objectClass: olcMemberOf
olcOverlay: {0}memberof
olcMemberOfDangling: ignore
olcMemberOfRefInt: TRUE
olcMemberOfGroupOC: groupOfUniqueNames
olcMemberOfMemberAD: uniqueMember
olcMemberOfMemberOfAD: memberOf
structuralObjectClass: olcMemberOf
entryUUID: 3449cf36-2323-1040-94dc-3d6d2d8f803e
creatorsName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.256189Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250911062049Z

dn: olcOverlay={1}refint,olcDatabase={1}mdb,cn=config
objectClass: olcOverlayConfig
objectClass: olcRefintConfig
olcOverlay: {1}refint
olcRefintAttribute: owner
olcRefintAttribute: manager
olcRefintAttribute: uniqueMember
olcRefintAttribute: member
olcRefintAttribute: memberOf
structuralObjectClass: olcRefintConfig
entryUUID: 344b0fea-2323-1040-94dd-3d6d2d8f803e
creatorsName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
createTimestamp: 20250911062049Z
entryCSN: 20250911062049.264400Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250911062049Z
```





## openldap使用bitnami镜像



```yaml

```





