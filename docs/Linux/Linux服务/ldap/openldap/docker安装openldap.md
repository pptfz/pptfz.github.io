# docker安装openldap

openldap docker 安装有 [bitnami](https://hub.docker.com/r/bitnami/openldap) 和 [osixia](https://github.com/osixia/docker-openldap) 2种常用的镜像



## 使用 `osixia` 镜像

[osixia openldap docker github地址](https://github.com/osixia/docker-openldap)

### 启动容器

:::tip

需要持久化2个目录

- `/var/lib/ldap` : ldap数据库文件目录
- `/etc/ldap/slapd.d` : ldap配置文件目录

:::



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run \
  -d \
  -p 389:389 \
  -p 636:636 \
  -v /data/docker-volume/openldap/data:/var/lib/ldap \
  -v /data/docker-volume/openldap/config:/etc/ldap/slapd.d \
  -e LDAP_ORGANISATION="ops" \
  -e LDAP_DOMAIN="ops.com" \
  -e LDAP_ADMIN_PASSWORD="admin" \
  --name openldap \
  --hostname openldap \
  --network bridge \
  --restart=always \
  osixia/openldap:1.5.0
```

  </TabItem>
  <TabItem value="docker compose" label="docker compose">

```shell
cat > docker-compose.yaml << EOF
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
    networks:
      - bridge

networks:
  bridge:
    driver: bridge
EOF
```

  </TabItem>
</Tabs>



**变量说明**

| 参数                        | 说明           |
| --------------------------- | -------------- |
| `--env LDAP_ORGANISATION`   | ldap组织名称   |
| `--env LDAP_DOMAIN`         | ldap域名称     |
| `--env LDAP_ADMIN_PASSWORD` | ldap管理员密码 |



可以执行如下命令在容器中进行搜索

```shell
docker exec 容器名称 ldapsearch -x -H ldap://localhost -b dc=example,dc=org -D "cn=admin,dc=example,dc=org" -w 密码
```



输出结果

```shell
$ docker exec openldap ldapsearch -x -H ldap://localhost -b dc=ops,dc=com -D "cn=admin,dc=ops,dc=com" -w admin
# extended LDIF
#
# LDAPv3
# base <dc=pptfz,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# pptfz.com
dn: dc=pptfz,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: pptfz
dc: pptfz

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



### 使用docker备份ldap

[docker备份openldap github地址](https://github.com/osixia/docker-openldap-backup)

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run \
  -d \
  --env LDAP_BACKUP_CONFIG_CRON_EXP="0 5 * * *" \
  -v /data/openldap/backup:/data/backup \
  --name openldap-backup \
  -h openldap-backup \
  --detach \
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
      - LDAP_BACKUP_CONFIG_CRON_EXP=0 5 * * *
    volumes:
      - /data/openldap/backup:/data/backup
EOF
```

  </TabItem>
</Tabs>



然后会在 `/data/openldap/backup`  目录下生成以下备份文件

![iShot_2022-09-10_22.41.40](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-09-10_22.41.40.png)



解压缩后

![iShot_2022-09-10_22.42.58](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-09-10_22.42.58.png)





## 使用 `bitnami` 镜像

[bitnami openldap dockerhub 地址](https://hub.docker.com/r/bitnami/openldap)

[bitnami openldap官方文档](https://techdocs.broadcom.com/us/en/vmware-tanzu/bitnami-secure-images/bitnami-secure-images/services/bsi-app-doc/apps-containers-openldap-index.html)

如有问题可以在 [bitnami containers](https://github.com/bitnami/containers) 提



### 创建network

```shell
docker network create ldap-net
```



#### 启动容器

<Tabs>
  <TabItem value="docker" label="docker" default>

:::tip 说明

如果使用宿主机目录显式指定，即 `-v /data/docker-volume/openldap:/bitnami/openldap` ，则需要设置宿主机目录权限为`1001`  `chown -R 1001:1001 /data/docker-volume/openldap` ，否则会报错 `mkdir: cannot create directory '/bitnami/openldap/data': Permission denied`

:::

```shell
docker run -d \
  --name openldap \
  --network ldap-net \
  -p 389:1389 \
  -p 636:1636 \
  -e LDAP_ROOT="dc=ops,dc=com" \
  -e LDAP_ADMIN_USERNAME="admin" \
  -e LDAP_ADMIN_PASSWORD="admin" \
  -e LDAP_ALLOW_ANON_BINDING=no \
  -v openldap_data:/bitnami/openldap \
  bitnami/openldap:2.6.10
```

  </TabItem>
  <TabItem value="docker compose" label="docker compose">

```shell
cat > docker-compose.yaml << EOF
services:
  openldap:
    image: bitnami/openldap:2.6.10
    container_name: openldap
    restart: always
    ports:
      - "1389:389"
      - "1636:636"
    environment:
      - LDAP_ROOT=dc=ops,dc=com
      - LDAP_ADMIN_USERNAME=admin
      - LDAP_ADMIN_PASSWORD=admin
      - LDAP_ALLOW_ANON_BINDING=no
    volumes:
      - openldap_data:/bitnami/openldap
    networks:
      - ldap-net

volumes:
  openldap_data:

networks:
  ldap-net:
    driver: bridge
EOF
```

  </TabItem>
</Tabs>



**变量说明**

| 变量                      | 说明                                   |
| ------------------------- | -------------------------------------- |
| `LDAP_ROOT`               | baseDN，默认值 `dc=example,dc=org`     |
| `LDAP_ADMIN_USERNAME`     | ldap管理员用户名，默认值 `admin`       |
| `LDAP_ADMIN_PASSWORD`     | ldap管理员密码，默认值 `adminpassword` |
| `LDAP_ALLOW_ANON_BINDING` | 禁止匿名用户登录                       |



使用 `bitnami` 镜像启动的openldap，默认会有2个ou， `ou=groups` 和 `ou=users`

![iShot_2025-06-12_13.26.02](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-12_13.26.02.png)

