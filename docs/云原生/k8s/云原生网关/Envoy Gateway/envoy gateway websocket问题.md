# Envoy Gateway WebSocket 超时断连问题

## 现象

通过 Envoy Gateway 转发的 WebSocket 长连接，**保持约 60 秒后被网关掐断**，客户端表现为连接无响应/超时断开，服务端应用日志没有任何异常。

## 关键日志

Gateway 访问日志（已脱敏）：

```json
{
  ":authority": "ws.example.com",
  "bytes_received": 0,
  "bytes_sent": 15,
  "downstream_local_address": "172.16.0.10:10080",
  "downstream_remote_address": "203.0.113.7:11205",
  "duration": 60000,
  "method": "GET",
  "protocol": "HTTP/1.1",
  "response_code": 408,
  "response_code_details": "request_overall_timeout",
  "response_flags": "-",
  "route_name": "httproute/demo/demo-app/rule/0/match/0/ws_example_com",
  "start_time": "2026-08-11T06:08:34.187Z",
  "upstream_cluster": "httproute/demo/demo-app/rule/0",
  "upstream_host": null,
  "user-agent": "Apifox/1.0.0 (https://apifox.com)",
  "x-envoy-origin-path": "/v1/tts/ws"
}
```

## 原因分析

两个关键信息：

1. `response_code_details: request_overall_timeout` —— 请求被**总超时（overall request timeout）**终止
2. `duration: 60000` —— 恰好 60 秒，且 `upstream_host: null`，说明请求**根本没到后端**就超时了

原因：WebSocket 是长连接，建立后连接会一直挂着不发包（比如等服务端推送）。而 Envoy Gateway 默认给每个 HTTP 请求套一个整体超时，时间一到不管连接是否活跃直接断掉——这对普通 HTTP 请求是合理保护，对 WebSocket 就是必杀。

## 版本相关：v1.7.1 的已知 bug（issue #8693）

`http2.enabled: false` 这个 workaround 背后是 Envoy Gateway 的一个已知 bug，只影响 **v1.8.0 之前的版本（本文环境为 v1.7.1）**：

- **[Issue #8693 "WSS → WSS handling"](https://github.com/envoyproxy/gateway/issues/8693)**（2026-04，kind/bug）：upstream 协议为 `AutoConfig` 时，Envoy 通过 ALPN 和后端协商协议。只要后端 ALPN 宣布支持 h2（哪怕它同时服务普通 HTTP 和 WebSocket），Envoy 就会对 WebSocket 走 **RFC 8441 extended CONNECT over HTTP/2**（`:protocol` 伪头）。不支持该扩展的 HTTP/1.1 代理（如 ingress-nginx）会直接报 400：`client sent unknown pseudo-header ":protocol"`
- **[PR #8699](https://github.com/envoyproxy/gateway/pull/8699)**（2026-04-22 合入，milestone v1.8.0-rc.1）：**对 `appProtocol` 为 `gateway.envoyproxy.io/ws` / `wss` 的 Backend 强制 HTTP/1.1 upstream**，不再协商 h2
- **修复落地版本：v1.8.0**（2026-05-13 发布）。升级到 v1.8.0+ 后，ws/wss Backend 自动走 HTTP/1.1 Upgrade，不再需要 `http2.enabled: false` 这个 workaround
- 但 `requestTimeout: 0s` 仍然需要——整体请求超时掐断长连接是 Envoy 路由层的默认行为，与这个 bug 无关

## 解决方案

给对应的 HTTPRoute 挂一个 `BackendTrafficPolicy`，把整体请求超时关掉，并禁用 HTTP/2（让 WebSocket 走 HTTP/1.1 Upgrade 通道）：

```yaml
apiVersion: gateway.envoyproxy.io/v1alpha1
kind: BackendTrafficPolicy
metadata:
  name: demo-app-ws
  namespace: demo
spec:
  targetRefs:
    - group: gateway.networking.k8s.io
      kind: HTTPRoute
      name: demo-app

  timeout:
    http:
      requestTimeout: 0s   # 0 = 禁用整体超时，长连接不再被掐

  http2:
    enabled: false
```

## 验证

1. `kubectl apply` 后等 Envoy Gateway 配置下发完成（可看 Gateway Pod 日志确认配置已翻译）
2. 用 Apifox / wscat 重连 WebSocket，保持空闲超过 60 秒
3. 连接不再断开，且日志里该请求不再出现 `request_overall_timeout`

## 注意点

- `requestTimeout: 0s` 相当于对该 route **取消整体超时保护**，只建议对确认是长连接的 route 单独设置，不要全局套用
- 如果只是想放宽而不是取消，可以设一个足够大的值（如 `3600s`）
- `http2.enabled: false` 是让该 route 用 HTTP/1.1 Upgrade 方式建立 WebSocket；**仅 v1.8.0 之前需要**（见上方版本说明），升级后可去掉
- 除了整体超时，Envoy 侧还有 **TCP 空闲超时（idle timeout）**、中间 LB/SLB 的空闲超时——如果关掉总超时后连接仍在固定时间断（比如恰好 100s/900s），排查方向转向各层 idle timeout 和云上负载均衡器的会话保持时长

## 参考

- [Envoy Gateway BackendTrafficPolicy 文档](https://gateway.envoyproxy.io/docs/api/v1alpha1/backend_traffic_policy/)
- [Envoy request timeout 说明](https://www.envoyproxy.io/docs/envoy/latest/faq/configuration/timeouts)
