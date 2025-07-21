# harbor同步项目镜像仓库

## 源harbor1.x版本

:::tip 说明

- 此脚本用于同步harbor某个项目下所有镜像仓库到目标harbor

- 同步报错 `No tags found for repository` 的镜像仓库回输出到`no_tags_found.log` 文件
- `synced_images.log` 是已同步的镜像记录文件，用于再次执行脚本 时可以跳过已经同步的镜像
- `synced_images_output.log` 是同步成功的镜像仓库名称

:::

```shell
#!/bin/bash

# 出错时立即退出
set -e

# HarborA 和 HarborB 的 URL 和认证信息
HARBOR_A_URL="xxx"
HARBOR_B_URL="xxx"
HARBOR_A_USER="xxx"
HARBOR_A_PASSWORD="xxx"
HARBOR_B_USER="xxx"
HARBOR_B_PASSWORD="xxx"

# 指定的项目名称
PROJECT_NAME="xxx"

# 错误日志文件
ERROR_LOG="no_tags_found.log"
# 已同步的镜像记录
SYNCED_LOG="synced_images.log"
# 同步成功的镜像记录
SYNCED_IMAGES_FILE="synced_images_output.log"

# 同步失败的镜像记录
FAILED_IMAGES=()

# 获取 Harbor A 的项目 ID
echo "Fetching project ID for $PROJECT_NAME..."
PROJECT_ID_RESPONSE=$(curl -s -u "$HARBOR_A_USER:$HARBOR_A_PASSWORD" "https://$HARBOR_A_URL/api/projects?name=$PROJECT_NAME")
PROJECT_ID=$(echo "$PROJECT_ID_RESPONSE" | jq -r '.[0].project_id')

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Could not find project ID for $PROJECT_NAME"
    exit 1
fi

echo "$PROJECT_NAME 项目的 ID 是 $PROJECT_ID"

# 登录 Harbor A 和 Harbor B
echo "Logging in to Harbor A..."
echo "$HARBOR_A_PASSWORD" | docker login "$HARBOR_A_URL" --username "$HARBOR_A_USER" --password-stdin
echo "Logging in to Harbor B..."
echo "$HARBOR_B_PASSWORD" | docker login "$HARBOR_B_URL" --username "$HARBOR_B_USER" --password-stdin

# 获取 Harbor A 中项目的所有镜像仓库列表
REPOSITORIES=""
PAGE=1
SIZE=500

while true; do
    RESPONSE=$(curl -s -u "$HARBOR_A_USER:$HARBOR_A_PASSWORD" "https://$HARBOR_A_URL/api/repositories?project_id=$PROJECT_ID&page=$PAGE&page_size=$SIZE")

    if [ "$(echo "$RESPONSE" | jq 'type')" != '"array"' ]; then
        echo "Error: Invalid response format"
        echo "$RESPONSE"
        exit 1
    fi

    REPOSITORIES+=$(echo "$RESPONSE" | jq -r '.[].name' | tr '\n' ' ')
    
    if [ "$(echo "$RESPONSE" | jq 'length')" -lt "$SIZE" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
done

# 初始化统计变量
SYNC_COUNT=0
SYNCED_IMAGES=()

# 从日志中读取已同步的镜像
if [ -f "$SYNCED_LOG" ]; then
    mapfile -t SYNCED_IMAGES < "$SYNCED_LOG"
fi

# 遍历每个镜像仓库，找到最近一次拉取的镜像并同步到 Harbor B
for REPO in $REPOSITORIES; do
    # 检查是否已同步
    if [[ " ${SYNCED_IMAGES[@]} " =~ " $REPO " ]]; then
        echo "Skipping already synced repository: $REPO"
        continue
    fi

    TAGS=$(curl -s -u "$HARBOR_A_USER:$HARBOR_A_PASSWORD" "https://$HARBOR_A_URL/api/repositories/$REPO/tags" | jq -r '.[] | "\(.name) \(.pull_time)"')

    LATEST_TAG=""
    LATEST_PULL_TIME=0
    TAG_COUNT=$(echo "$TAGS" | wc -l)

    # 处理单个标签的情况
    if [ "$TAG_COUNT" -eq 1 ]; then
        LATEST_TAG=$(echo "$TAGS" | awk '{print $1}')
    elif [ "$TAG_COUNT" -gt 1 ]; then
        # 遍历所有标签，找到最近拉取的标签
        while IFS= read -r line; do
            TAG=$(echo "$line" | awk '{print $1}')
            PULL_TIME=$(echo "$line" | awk '{print $2}' | xargs -I{} date -d {} +%s)
            
            if [ "$PULL_TIME" -gt "$LATEST_PULL_TIME" ]; then
                LATEST_PULL_TIME=$PULL_TIME
                LATEST_TAG=$TAG
            fi
        done <<< "$TAGS"
    fi

    # 如果找到最新标签，执行同步
    if [ -n "$LATEST_TAG" ]; then
        SOURCE_IMAGE="$HARBOR_A_URL/$REPO:$LATEST_TAG"
        TARGET_IMAGE="$HARBOR_B_URL/$REPO:$LATEST_TAG"

        echo "准备推送镜像: $SOURCE_IMAGE 到 $TARGET_IMAGE..."
        
        if docker pull "$SOURCE_IMAGE"; then
            docker tag "$SOURCE_IMAGE" "$TARGET_IMAGE"
            echo "正在推送镜像: $TARGET_IMAGE..."
            if docker push "$TARGET_IMAGE"; then
                SYNC_COUNT=$((SYNC_COUNT + 1))
                SYNCED_IMAGES+=("$REPO:$LATEST_TAG")  # 将成功同步的镜像添加到数组
                echo "$REPO:$LATEST_TAG" | tee -a "$SYNCED_IMAGES_FILE"  # 输出到控制台并追加到文件
                echo "$REPO" >> "$SYNCED_LOG"

                echo "准备删除镜像: $SOURCE_IMAGE 和 $TARGET_IMAGE..."
                docker rmi "$SOURCE_IMAGE"
                docker rmi "$TARGET_IMAGE"
            else
                echo "Failed to push image: $TARGET_IMAGE"
                FAILED_IMAGES+=("$REPO:$LATEST_TAG")  # 添加到失败列表
            fi
        else
            echo "Failed to pull image: $SOURCE_IMAGE"
            FAILED_IMAGES+=("$REPO:$LATEST_TAG")  # 添加到失败列表
        fi
    else
        echo "No tags found for repository $REPO"
        echo "$REPO" >> "$ERROR_LOG"
        FAILED_IMAGES+=("$REPO (no tags found)")  # 添加无标签仓库到失败列表
    fi
done

# 输出同步结果
echo "同步完成: 共同步了 $SYNC_COUNT 个镜像。"
if [ "$SYNC_COUNT" -gt 0 ]; then
    echo "同步的镜像包括:"
    for IMAGE in "${SYNCED_IMAGES[@]}"; do
        echo "- $IMAGE"
    done
fi

# 输出同步失败的镜像
if [ "${#FAILED_IMAGES[@]}" -gt 0 ]; then
    echo "同步失败的镜像包括:"
    for IMAGE in "${FAILED_IMAGES[@]}"; do
        echo "- $IMAGE"
    done
fi

# 登出
docker logout "$HARBOR_A_URL"
docker logout "$HARBOR_B_URL"

echo "Sync complete."
```





## 源harbor2.x版本

