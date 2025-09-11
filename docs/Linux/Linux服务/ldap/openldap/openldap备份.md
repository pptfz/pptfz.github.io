# openldap备份

### 使用docker备份ldap

[docker备份openldap github地址](https://github.com/osixia/docker-openldap-backup)



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run \
  -d \
  -e LDAP_BACKUP_CONFIG_CRON_EXP="0 5 * * *" \
  -v /data/openldap/backup:/data/backup \
  -h openldap-backup \
  --name openldap-backup \
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

