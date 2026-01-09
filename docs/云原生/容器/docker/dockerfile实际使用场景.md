# dockerfile实际使用场景

## 环境变量

在 Dockerfile 中，可以通过 `ARG` + `ENV` 实现多环境（`test` / `prod`）构建与运行配置的统一管理。

构建时传入环境变量

```shell
docker build --build-arg BUILD_ARG=${BUILD_ARG}`
```



Dockerfile 示例

:::caution 注意

CMD 必须使用 shell 形式，才能进行环境变量展开

```dockerfile
CMD uwsgi --ini deploy/${BUILD_ENV}/uwsgi.ini
```



exec(JSON) 形式不会展开环境变量

```dockerfile
CMD ["uwsgi", "--ini", "deploy/$BUILD_ENV/uwsgi.ini"]
```

:::

```dockerfile
# 构建期参数（仅在 build 阶段有效）
ARG BUILD_ARG=prod

# 运行期环境变量（build + runtime 均可用）
ENV BUILD_ENV=${BUILD_ARG}

# 根据环境变量执行不同的构建命令
RUN npm run build:${BUILD_ENV}

# CMD 必须使用 shell 形式，才能进行环境变量展开
CMD uwsgi --ini deploy/${BUILD_ENV}/uwsgi.ini

# ❌ exec(JSON) 形式不会展开环境变量
# CMD ["uwsgi", "--ini", "deploy/$BUILD_ENV/uwsgi.ini"]
```



`ARG` vs `ENV`

- `ARG`：仅在 **镜像构建阶段** 可用
- `ENV`：在 **构建阶段和容器运行阶段** 都可用
- 因此需要通过 `ENV` 将构建参数传递到运行阶段



CMD 形式差异（重点）

| CMD 形式        | 是否支持变量展开 |
| --------------- | ---------------- |
| shell 形式      | ✅ 支持           |
| exec(JSON) 形式 | ❌ 不支持         |

原因：

- shell 形式会通过 `/bin/sh -c` 执行
- exec 形式不会经过 shell，`$BUILD_ENV` 会被当作普通字符串