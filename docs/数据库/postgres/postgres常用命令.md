# postgres常用命令











```
pg_dump -h localhost -U postgres -d dbname -t table_name > table.sql
```



```
psql -h localhost -U postgres -d dbname < table.sql
```

