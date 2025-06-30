# harbor获取项目所有镜像仓库



## harbor1.x版本

:::tip 说明

- harbor1.x版本，`page_size` 最大限制为500，否则只会获取到500个镜像仓库而导致结果出错

- 在harbor1.x版本中，需要先通过项目名称获取项目id，进而在获取镜像仓库，不能通过项目名直接获取

:::



```shell
#!/bin/bash

PAGE=1
SIZE=500
HARBOR_USER="xxx"
HARBOR_PASSWORD="xxx"
HARBOR_URL="xxx"

PROJECT_NAME="xxx"

# 获取项目id
echo "Fetching project ID for $PROJECT_NAME..."
PROJECT_ID_RESPONSE=$(curl -s -u "$HARBOR_USER:$HARBOR_PASSWORD" "https://$HARBOR_URL/api/projects?name=$PROJECT_NAME")
echo "Response: $PROJECT_ID_RESPONSE"
PROJECT_ID=$(echo "$PROJECT_ID_RESPONSE" | jq -r '.[0].project_id')

# 清空或创建 response_body.txt
> response_body.txt

while true; do
    response=$(curl -s -u "$HARBOR_USER:$HARBOR_PASSWORD" -w "%{http_code}" -o temp_response.txt "https://$HARBOR_URL/api/repositories?project_id=$PROJECT_ID&page=$PAGE&page_size=$SIZE")

    echo "HTTP Status Code: $response"

    # 检查 API 响应是否有效
    if [[ "$response" != "200" ]]; then
        echo "Error fetching data. HTTP Status: $response"
        cat temp_response.txt  # 输出响应内容以便调试
        break
    fi

    # 从临时文件中读取响应
    response=$(<temp_response.txt)

    # 追加到 response_body.txt
    echo "$response" >> response_body.txt

    count=$(echo "$response" | jq '. | length')

    # 检查 count 是否有效
    if [[ -z "$count" ]]; then
        echo "Count is empty. Response might not be valid JSON."
        break
    fi

    # 提取项目名
    echo "$response" | jq '.[].name'

    echo "Count: $count"

    if [ "$count" -lt "$SIZE" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
done
```



脚本执行成功后会将结果输出到 `response_body.txt` ，在通过 `jq` 命令就可以获取所有镜像仓库名称了

```shell
cat response_body.txt |jq '.[].name'
```



## harbor2.x版本

:::tip 说明

- harbor2.x版本，`page_size` 最大限制为100，否则调用会报错如下
  
  ```shell
  HTTP Status Code: 422
  Error fetching data. HTTP Status: 422
  {"errors":[{"code":"UNPROCESSABLE_ENTITY","message":"validation failure list:\npage_size in query should be less than or equal to 100"}]}
  ```
  
  
  
- 在harbor2.x版本中，可以直接通过项目名获取项目下的镜像仓库，而不像1.x版本需要通过项目id获取

:::

```shell
#!/bin/bash

PAGE=1
SIZE=100
HARBOR_USER="xxx"
HARBOR_PASSWORD="xxx"
HARBOR_URL="xxx"

PROJECT_NAME="xxx"

# 清空或创建 response_body.txt
> response_body.txt

while true; do
    response=$(curl -s -u "$HARBOR_USER:$HARBOR_PASSWORD" -w "%{http_code}" -o temp_response.txt "https://$HARBOR_URL/api/v2.0/projects/$PROJECT_NAME/repositories?page=$PAGE&page_size=$SIZE")

    echo "HTTP Status Code: $response"

    # 检查 API 响应是否有效
    if [[ "$response" != "200" ]]; then
        echo "Error fetching data. HTTP Status: $response"
        cat temp_response.txt  # 输出响应内容以便调试
        break
    fi

    # 从临时文件中读取响应
    response=$(<temp_response.txt)

    # 追加到 response_body.txt
    echo "$response" >> response_body.txt

    count=$(echo "$response" | jq '. | length')

    # 检查 count 是否有效
    if [[ -z "$count" ]]; then
        echo "Count is empty. Response might not be valid JSON."
        break
    fi

    # 提取项目名
    echo "$response" | jq '.[].name'

    echo "Count: $count"

    if [ "$count" -lt "$SIZE" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
done
```



脚本执行成功后会将结果输出到 `response_body.txt` ，在通过 `jq` 命令就可以获取所有镜像仓库名称了

```shell
cat response_body.txt |jq '.[].name'
```

