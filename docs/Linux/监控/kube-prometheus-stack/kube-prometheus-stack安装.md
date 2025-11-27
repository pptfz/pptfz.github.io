# kube-prometheus-stack安装

[kube-prometheus-stack artifacthub](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack)

[Prometheus Community github](https://github.com/prometheus-community/helm-charts)



## 简介

`kube-prometheus-stack` 是一个 **完整的 Kubernetes 监控解决方案的 Helm Chart**，它打包了 Prometheus Operator 和相关的监控组件。

主要包含的组件：

核心监控组件：

- **Prometheus** - 监控系统和时间序列数据库
- **Alertmanager** - 告警管理组件
- **Grafana** - 数据可视化和仪表板
- **Prometheus Operator** - 简化 Prometheus 在 K8s 中的部署和管理

数据采集组件：

- **Node Exporter** - 节点级指标采集
- **kube-state-metrics** - Kubernetes 集群状态指标
- **各种 Exporters** - 应用和中间件指标采集





## 安装

### 添加仓库

```shell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```



### 下载包

```shell
helm pull prometheus-community/kube-prometheus-stack
```



### 解压缩

```shell
tar xf  kube-prometheus-stack-79.7.1.tgz      
```



### 编辑 `values.yaml`







```
1的执行结果
kubectl -n kube-prometheus-stack get prometheus -o wide || true
kubectl -n kube-prometheus-stack get prometheus -o yaml || true
NAME                               VERSION   DESIRED   READY   RECONCILED   AVAILABLE   AGE     PAUSED
kube-prometheus-stack-prometheus   v3.7.3    1         0       False        False       4m58s   false
apiVersion: v1
items:
- apiVersion: monitoring.coreos.com/v1
  kind: Prometheus
  metadata:
    annotations:
      meta.helm.sh/release-name: kube-prometheus-stack
      meta.helm.sh/release-namespace: kube-prometheus-stack
    creationTimestamp: "2025-11-27T02:39:33Z"
    generation: 1
    labels:
      app: kube-prometheus-stack-prometheus
      app.kubernetes.io/instance: kube-prometheus-stack
      app.kubernetes.io/managed-by: Helm
      app.kubernetes.io/part-of: kube-prometheus-stack
      app.kubernetes.io/version: 79.7.1
      chart: kube-prometheus-stack-79.7.1
      heritage: Helm
      release: kube-prometheus-stack
    name: kube-prometheus-stack-prometheus
    namespace: kube-prometheus-stack
    resourceVersion: "4550442"
    uid: ac35a608-39d6-4b78-907f-b45fbc0c35f9
  spec:
    affinity:
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
        - podAffinityTerm:
            labelSelector:
              matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                - prometheus
              - key: app.kubernetes.io/instance
                operator: In
                values:
                - kube-prometheus-stack-prometheus
            topologyKey: kubernetes.io/hostname
          weight: 100
    alerting:
      alertmanagers:
      - apiVersion: v2
        name: kube-prometheus-stack-alertmanager
        namespace: kube-prometheus-stack
        pathPrefix: /
        port: http-web
    automountServiceAccountToken: true
    enableAdminAPI: false
    enableOTLPReceiver: false
    evaluationInterval: 30s
    externalUrl: http://p8s-stack.ops.com/
    hostNetwork: false
    image: quay.io/prometheus/prometheus:v3.7.3
    imagePullPolicy: IfNotPresent
    listenLocal: false
    logFormat: logfmt
    logLevel: info
    paused: false
    persistentVolumeClaimRetentionPolicy:
      whenDeleted: Retain
      whenScaled: Retain
    podMonitorNamespaceSelector: {}
    podMonitorSelector:
      matchLabels:
        release: kube-prometheus-stack
    portName: http-web
    probeNamespaceSelector: {}
    probeSelector:
      matchLabels:
        release: kube-prometheus-stack
    replicas: 1
    retention: 10d
    routePrefix: /
    ruleNamespaceSelector: {}
    ruleSelector:
      matchLabels:
        release: kube-prometheus-stack
    scrapeConfigNamespaceSelector: {}
    scrapeConfigSelector:
      matchLabels:
        release: kube-prometheus-stack
    scrapeInterval: 30s
    securityContext:
      fsGroup: 2000
      runAsGroup: 2000
      runAsNonRoot: true
      runAsUser: 1000
      seccompProfile:
        type: RuntimeDefault
    serviceAccountName: kube-prometheus-stack-prometheus
    serviceMonitorNamespaceSelector: {}
    serviceMonitorSelector:
      matchLabels:
        release: kube-prometheus-stack
    shards: 1
    storage:
      volumeClaimTemplate:
        spec:
          accessModes:
          - ReadWriteOnce
          resources:
            requests:
              storage: 50Gi
          storageClassName: gluster
    tsdb:
      outOfOrderTimeWindow: 0s
    version: v3.7.3
    walCompression: true
  status:
    availableReplicas: 0
    conditions:
    - lastTransitionTime: "2025-11-27T02:43:34Z"
      message: 'shard 0: statefulset kube-prometheus-stack/prometheus-kube-prometheus-stack-prometheus
        not found'
      observedGeneration: 1
      reason: StatefulSetNotFound
      status: "False"
      type: Available
    - lastTransitionTime: "2025-11-27T02:43:34Z"
      message: storage class "gluster" does not exist
      observedGeneration: 1
      reason: ReconciliationFailed
      status: "False"
      type: Reconciled
    paused: false
    replicas: 0
    selector: app.kubernetes.io/instance=kube-prometheus-stack-prometheus,app.kubernetes.io/managed-by=prometheus-operator,app.kubernetes.io/name=prometheus,operator.prometheus.io/name=kube-prometheus-stack-prometheus,prometheus=kube-prometheus-stack-prometheus
    shardStatuses:
    - availableReplicas: 0
      replicas: 0
      shardID: "0"
      unavailableReplicas: 0
      updatedReplicas: 0
    shards: 1
    unavailableReplicas: 0
    updatedReplicas: 0
kind: List
metadata:
  resourceVersion: ""
  
2的执行结果
kubectl get crd prometheuses.monitoring.coreos.com -o yaml || kubectl get crds | grep -i prometheus || true
省略很多
         pattern: ^(\+|-)?(([0-9]+(\.[0-9]*)?)|(\.[0-9]+))(([KMGTPE]i)|[numkMGTPE]|([eE](\+|-)?(([0-9]+(\.[0-9]*)?)|(\.[0-9]+))))?$
                                              x-kubernetes-int-or-string: true
                                            resource:
                                              description: 'Required: resource to
                                                select'
                                              type: string
                                          required:
                                          - resource
                                          type: object
                                          x-kubernetes-map-type: atomic
                                      required:
                                      - path
                                      type: object
                                    type: array
                                    x-kubernetes-list-type: atomic
                                type: object
                              podCertificate:
                                description: |-
                                  Projects an auto-rotating credential bundle (private key and certificate
                                  chain) that the pod can use either as a TLS client or server.

                                  Kubelet generates a private key and uses it to send a
                                  PodCertificateRequest to the named signer.  Once the signer approves the
                                  request and issues a certificate chain, Kubelet writes the key and
                                  certificate chain to the pod filesystem.  The pod does not start until
                                  certificates have been issued for each podCertificate projected volume
                                  source in its spec.

                                  Kubelet will begin trying to rotate the certificate at the time indicated
                                  by the signer using the PodCertificateRequest.Status.BeginRefreshAt
                                  timestamp.

                                  Kubelet can write a single file, indicated by the credentialBundlePath
                                  field, or separate files, indicated by the keyPath and
                                  certificateChainPath fields.

                                  The credential bundle is a single file in PEM format.  The first PEM
                                  entry is the private key (in PKCS#8 format), and the remaining PEM
                                  entries are the certificate chain issued by the signer (typically,
                                  signers will return their certificate chain in leaf-to-root order).

                                  Prefer using the credential bundle format, since your application code
                                  can read it atomically.  If you use keyPath and certificateChainPath,
                                  your application must make two separate file reads. If these coincide
                                  with a certificate rotation, it is possible that the private key and leaf
                                  certificate you read may not correspond to each other.  Your application
                                  will need to check for this condition, and re-read until they are
                                  consistent.

                                  The named signer controls chooses the format of the certificate it
                                  issues; consult the signer implementation's documentation to learn how to
                                  use the certificates it issues.
                                properties:
                                  certificateChainPath:
                                    description: |-
                                      Write the certificate chain at this path in the projected volume.

                                      Most applications should use credentialBundlePath.  When using keyPath
                                      and certificateChainPath, your application needs to check that the key
                                      and leaf certificate are consistent, because it is possible to read the
                                      files mid-rotation.
                                    type: string
                                  credentialBundlePath:
                                    description: |-
                                      Write the credential bundle at this path in the projected volume.

                                      The credential bundle is a single file that contains multiple PEM blocks.
                                      The first PEM block is a PRIVATE KEY block, containing a PKCS#8 private
                                      key.

                                      The remaining blocks are CERTIFICATE blocks, containing the issued
                                      certificate chain from the signer (leaf and any intermediates).

                                      Using credentialBundlePath lets your Pod's application code make a single
                                      atomic read that retrieves a consistent key and certificate chain.  If you
                                      project them to separate files, your application code will need to
                                      additionally check that the leaf certificate was issued to the key.
                                    type: string
                                  keyPath:
                                    description: |-
                                      Write the key at this path in the projected volume.

                                      Most applications should use credentialBundlePath.  When using keyPath
                                      and certificateChainPath, your application needs to check that the key
                                      and leaf certificate are consistent, because it is possible to read the
                                      files mid-rotation.
                                    type: string
                                  keyType:
                                    description: |-
                                      The type of keypair Kubelet will generate for the pod.

                                      Valid values are "RSA3072", "RSA4096", "ECDSAP256", "ECDSAP384",
                                      "ECDSAP521", and "ED25519".
                                    type: string
                                  maxExpirationSeconds:
                                    description: |-
                                      maxExpirationSeconds is the maximum lifetime permitted for the
                                      certificate.

                                      Kubelet copies this value verbatim into the PodCertificateRequests it
                                      generates for this projection.

                                      If omitted, kube-apiserver will set it to 86400(24 hours). kube-apiserver
                                      will reject values shorter than 3600 (1 hour).  The maximum allowable
                                      value is 7862400 (91 days).

                                      The signer implementation is then free to issue a certificate with any
                                      lifetime *shorter* than MaxExpirationSeconds, but no shorter than 3600
                                      seconds (1 hour).  This constraint is enforced by kube-apiserver.
                                      `kubernetes.io` signers will never issue certificates with a lifetime
                                      longer than 24 hours.
                                    format: int32
                                    type: integer
                                  signerName:
                                    description: Kubelet's generated CSRs will be
                                      addressed to this signer.
                                    type: string
                                required:
                                - keyType
                                - signerName
                                type: object
                              secret:
                                description: secret information about the secret data
                                  to project
                                properties:
                                  items:
                                    description: |-
                                      items if unspecified, each key-value pair in the Data field of the referenced
                                      Secret will be projected into the volume as a file whose name is the
                                      key and content is the value. If specified, the listed keys will be
                                      projected into the specified paths, and unlisted keys will not be
                                      present. If a key is specified which is not present in the Secret,
                                      the volume setup will error unless it is marked optional. Paths must be
                                      relative and may not contain the '..' path or start with '..'.
                                    items:
                                      description: Maps a string key to a path within
                                        a volume.
                                      properties:
                                        key:
                                          description: key is the key to project.
                                          type: string
                                        mode:
                                          description: |-
                                            mode is Optional: mode bits used to set permissions on this file.
                                            Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511.
                                            YAML accepts both octal and decimal values, JSON requires decimal values for mode bits.
                                            If not specified, the volume defaultMode will be used.
                                            This might be in conflict with other options that affect the file
                                            mode, like fsGroup, and the result can be other mode bits set.
                                          format: int32
                                          type: integer
                                        path:
                                          description: |-
                                            path is the relative path of the file to map the key to.
                                            May not be an absolute path.
                                            May not contain the path element '..'.
                                            May not start with the string '..'.
                                          type: string
                                      required:
                                      - key
                                      - path
                                      type: object
                                    type: array
                                    x-kubernetes-list-type: atomic
                                  name:
                                    default: ""
                                    description: |-
                                      Name of the referent.
                                      This field is effectively required, but due to backwards compatibility is
                                      allowed to be empty. Instances of this type with an empty value here are
                                      almost certainly wrong.
                                      More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
                                    type: string
                                  optional:
                                    description: optional field specify whether the
                                      Secret or its key must be defined
                                    type: boolean
                                type: object
                                x-kubernetes-map-type: atomic
                              serviceAccountToken:
                                description: serviceAccountToken is information about
                                  the serviceAccountToken data to project
                                properties:
                                  audience:
                                    description: |-
                                      audience is the intended audience of the token. A recipient of a token
                                      must identify itself with an identifier specified in the audience of the
                                      token, and otherwise should reject the token. The audience defaults to the
                                      identifier of the apiserver.
                                    type: string
                                  expirationSeconds:
                                    description: |-
                                      expirationSeconds is the requested duration of validity of the service
                                      account token. As the token approaches expiration, the kubelet volume
                                      plugin will proactively rotate the service account token. The kubelet will
                                      start trying to rotate the token if the token is older than 80 percent of
                                      its time to live or if the token is older than 24 hours.Defaults to 1 hour
                                      and must be at least 10 minutes.
                                    format: int64
                                    type: integer
                                  path:
                                    description: |-
                                      path is the path relative to the mount point of the file to project the
                                      token into.
                                    type: string
                                required:
                                - path
                                type: object
                            type: object
                          type: array
                          x-kubernetes-list-type: atomic
                      type: object
                    quobyte:
                      description: |-
                        quobyte represents a Quobyte mount on the host that shares a pod's lifetime.
                        Deprecated: Quobyte is deprecated and the in-tree quobyte type is no longer supported.
                      properties:
                        group:
                          description: |-
                            group to map volume access to
                            Default is no group
                          type: string
                        readOnly:
                          description: |-
                            readOnly here will force the Quobyte volume to be mounted with read-only permissions.
                            Defaults to false.
                          type: boolean
                        registry:
                          description: |-
                            registry represents a single or multiple Quobyte Registry services
                            specified as a string as host:port pair (multiple entries are separated with commas)
                            which acts as the central registry for volumes
                          type: string
                        tenant:
                          description: |-
                            tenant owning the given Quobyte volume in the Backend
                            Used with dynamically provisioned Quobyte volumes, value is set by the plugin
                          type: string
                        user:
                          description: |-
                            user to map volume access to
                            Defaults to serivceaccount user
                          type: string
                        volume:
                          description: volume is a string that references an already
                            created Quobyte volume by name.
                          type: string
                      required:
                      - registry
                      - volume
                      type: object
                    rbd:
                      description: |-
                        rbd represents a Rados Block Device mount on the host that shares a pod's lifetime.
                        Deprecated: RBD is deprecated and the in-tree rbd type is no longer supported.
                      properties:
                        fsType:
                          description: |-
                            fsType is the filesystem type of the volume that you want to mount.
                            Tip: Ensure that the filesystem type is supported by the host operating system.
                            Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.
                            More info: https://kubernetes.io/docs/concepts/storage/volumes#rbd
                          type: string
                        image:
                          description: |-
                            image is the rados image name.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          type: string
                        keyring:
                          default: /etc/ceph/keyring
                          description: |-
                            keyring is the path to key ring for RBDUser.
                            Default is /etc/ceph/keyring.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          type: string
                        monitors:
                          description: |-
                            monitors is a collection of Ceph monitors.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          items:
                            type: string
                          type: array
                          x-kubernetes-list-type: atomic
                        pool:
                          default: rbd
                          description: |-
                            pool is the rados pool name.
                            Default is rbd.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          type: string
                        readOnly:
                          description: |-
                            readOnly here will force the ReadOnly setting in VolumeMounts.
                            Defaults to false.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          type: boolean
                        secretRef:
                          description: |-
                            secretRef is name of the authentication secret for RBDUser. If provided
                            overrides keyring.
                            Default is nil.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          properties:
                            name:
                              default: ""
                              description: |-
                                Name of the referent.
                                This field is effectively required, but due to backwards compatibility is
                                allowed to be empty. Instances of this type with an empty value here are
                                almost certainly wrong.
                                More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
                              type: string
                          type: object
                          x-kubernetes-map-type: atomic
                        user:
                          default: admin
                          description: |-
                            user is the rados user name.
                            Default is admin.
                            More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it
                          type: string
                      required:
                      - image
                      - monitors
                      type: object
                    scaleIO:
                      description: |-
                        scaleIO represents a ScaleIO persistent volume attached and mounted on Kubernetes nodes.
                        Deprecated: ScaleIO is deprecated and the in-tree scaleIO type is no longer supported.
                      properties:
                        fsType:
                          default: xfs
                          description: |-
                            fsType is the filesystem type to mount.
                            Must be a filesystem type supported by the host operating system.
                            Ex. "ext4", "xfs", "ntfs".
                            Default is "xfs".
                          type: string
                        gateway:
                          description: gateway is the host address of the ScaleIO
                            API Gateway.
                          type: string
                        protectionDomain:
                          description: protectionDomain is the name of the ScaleIO
                            Protection Domain for the configured storage.
                          type: string
                        readOnly:
                          description: |-
                            readOnly Defaults to false (read/write). ReadOnly here will force
                            the ReadOnly setting in VolumeMounts.
                          type: boolean
                        secretRef:
                          description: |-
                            secretRef references to the secret for ScaleIO user and other
                            sensitive information. If this is not provided, Login operation will fail.
                          properties:
                            name:
                              default: ""
                              description: |-
                                Name of the referent.
                                This field is effectively required, but due to backwards compatibility is
                                allowed to be empty. Instances of this type with an empty value here are
                                almost certainly wrong.
                                More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
                              type: string
                          type: object
                          x-kubernetes-map-type: atomic
                        sslEnabled:
                          description: sslEnabled Flag enable/disable SSL communication
                            with Gateway, default false
                          type: boolean
                        storageMode:
                          default: ThinProvisioned
                          description: |-
                            storageMode indicates whether the storage for a volume should be ThickProvisioned or ThinProvisioned.
                            Default is ThinProvisioned.
                          type: string
                        storagePool:
                          description: storagePool is the ScaleIO Storage Pool associated
                            with the protection domain.
                          type: string
                        system:
                          description: system is the name of the storage system as
                            configured in ScaleIO.
                          type: string
                        volumeName:
                          description: |-
                            volumeName is the name of a volume already created in the ScaleIO system
                            that is associated with this volume source.
                          type: string
                      required:
                      - gateway
                      - secretRef
                      - system
                      type: object
                    secret:
                      description: |-
                        secret represents a secret that should populate this volume.
                        More info: https://kubernetes.io/docs/concepts/storage/volumes#secret
                      properties:
                        defaultMode:
                          description: |-
                            defaultMode is Optional: mode bits used to set permissions on created files by default.
                            Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511.
                            YAML accepts both octal and decimal values, JSON requires decimal values
                            for mode bits. Defaults to 0644.
                            Directories within the path are not affected by this setting.
                            This might be in conflict with other options that affect the file
                            mode, like fsGroup, and the result can be other mode bits set.
                          format: int32
                          type: integer
                        items:
                          description: |-
                            items If unspecified, each key-value pair in the Data field of the referenced
                            Secret will be projected into the volume as a file whose name is the
                            key and content is the value. If specified, the listed keys will be
                            projected into the specified paths, and unlisted keys will not be
                            present. If a key is specified which is not present in the Secret,
                            the volume setup will error unless it is marked optional. Paths must be
                            relative and may not contain the '..' path or start with '..'.
                          items:
                            description: Maps a string key to a path within a volume.
                            properties:
                              key:
                                description: key is the key to project.
                                type: string
                              mode:
                                description: |-
                                  mode is Optional: mode bits used to set permissions on this file.
                                  Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511.
                                  YAML accepts both octal and decimal values, JSON requires decimal values for mode bits.
                                  If not specified, the volume defaultMode will be used.
                                  This might be in conflict with other options that affect the file
                                  mode, like fsGroup, and the result can be other mode bits set.
                                format: int32
                                type: integer
                              path:
                                description: |-
                                  path is the relative path of the file to map the key to.
                                  May not be an absolute path.
                                  May not contain the path element '..'.
                                  May not start with the string '..'.
省略很多

3的执行结果
helm -n kube-prometheus-stack get manifest kube-prometheus-stack | sed -n '1,240p' | grep -n "kind: Prometheus" -n || helm template ./ -f /Users/pptfz/Library/CloudStorage/OneDrive-共享的库-onedrive/devops/k8s/helm/kube-prometheus-stack/values.yaml | grep -n "kind: Prometheus" || true
Error: chart requires kubeVersion: >=1.25.0-0 which is incompatible with Kubernetes v1.20.0

Use --debug flag to render out invalid YAML

4的执行结果
省略很多
probes: true
    probesMetricRelabelings: []
    probesRelabelings:
    - action: replace
      sourceLabels:
      - __metrics_path__
      targetLabel: metrics_path
    proxyUrl: ""
    relabelings:
    - action: replace
      sourceLabels:
      - __metrics_path__
      targetLabel: metrics_path
    resource: false
    resourceInterval: 10s
    resourcePath: /metrics/resource/v1alpha1
    resourceRelabelings:
    - action: replace
      sourceLabels:
      - __metrics_path__
      targetLabel: metrics_path
    sampleLimit: 0
    targetLabels: []
    targetLimit: 0
    trackTimestampsStaleness: true
kubernetesServiceMonitors:
  enabled: true
nameOverride: ""
namespaceOverride: ""
nodeExporter:
  enabled: true
  forceDeployDashboards: false
  operatingSystems:
    aix:
      enabled: true
    darwin:
      enabled: true
    linux:
      enabled: true
prometheus:
  additionalLabels: {}
  additionalPodMonitors: []
  additionalRulesForClusterRole: []
  additionalServiceMonitors: []
  agentMode: false
  annotations: {}
  enabled: true
  extraSecret:
    annotations: {}
    data: {}
  ingress:
    annotations: {}
    enabled: true
    hosts:
    - p8s-stack.ops.com
    ingressClassName: nginx
    labels: {}
    paths: []
    tls: []
  ingressPerReplica:
省略很多

5的执行结果
kubectl -n kube-prometheus-stack get deploy
kubectl -n kube-prometheus-stack logs deploy/kube-prometheus-stack-operator --tail 200
# 如果 deployment 名称不同，把上面 deploy 名替换为实际名称
NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
kube-prometheus-stack-kube-state-metrics   1/1     1            1           7m48s
kube-prometheus-stack-operator             1/1     1            1           7m48s
ts=2025-11-27T02:39:34.564943146Z level=info caller=/workspace/cmd/operator/main.go:219 msg="Starting Prometheus Operator" version="(version=0.86.2, branch=, revision=6395867)" build_context="(go=go1.24.10, platform=linux/arm64, user=, date=20251107-13:20:47, tags=unknown)" feature_gates="PrometheusAgentDaemonSet=false,PrometheusShardRetentionPolicy=false,PrometheusTopologySharding=false,StatusForConfigurationResources=false"
ts=2025-11-27T02:39:34.565034479Z level=info caller=/workspace/cmd/operator/main.go:220 msg="Operator's configuration" watch_referenced_objects_in_all_namespaces=false controller_id="" enable_config_reloader_probes=false
ts=2025-11-27T02:39:34.565236354Z level=info caller=/workspace/internal/goruntime/cpu.go:27 msg="Leaving GOMAXPROCS=4: CPU quota undefined"
ts=2025-11-27T02:39:34.565454646Z level=info caller=/workspace/cmd/operator/main.go:234 msg="Namespaces filtering configuration " config="{allow_list=\"\",deny_list=\"\",prometheus_allow_list=\"\",alertmanager_allow_list=\"\",alertmanagerconfig_allow_list=\"\",thanosruler_allow_list=\"\"}"
ts=2025-11-27T02:39:34.575001184Z level=info caller=/workspace/cmd/operator/main.go:275 msg="connection established" kubernetes_version=1.33.3
ts=2025-11-27T02:39:34.586113764Z level=info caller=/workspace/cmd/operator/main.go:360 msg="Kubernetes API capabilities" endpointslices=true
ts=2025-11-27T02:39:34.62028017Z level=warn caller=/workspace/pkg/server/server.go:158 msg="server TLS client verification disabled" client_ca_file=/etc/tls/private/tls-ca.crt err="stat /etc/tls/private/tls-ca.crt: no such file or directory"
ts=2025-11-27T02:39:34.62185142Z level=info caller=/workspace/pkg/server/server.go:295 msg="starting secure server" address=[::]:10250 http2=false
ts=2025-11-27T02:39:34.62189417Z level=info caller=/go/pkg/mod/k8s.io/client-go@v0.34.1/tools/cache/shared_informer.go:349 msg="Waiting for caches to sync" controller=alertmanager
ts=2025-11-27T02:39:34.621918461Z level=info caller=/go/pkg/mod/k8s.io/client-go@v0.34.1/tools/cache/shared_informer.go:349 msg="Waiting for caches to sync" controller=prometheusagent
ts=2025-11-27T02:39:34.62215342Z level=info caller=/go/pkg/mod/k8s.io/client-go@v0.34.1/tools/cache/shared_informer.go:349 msg="Waiting for caches to sync" controller=prometheus
ts=2025-11-27T02:39:34.622167878Z level=info caller=/go/pkg/mod/k8s.io/apiserver@v0.34.1/pkg/server/dynamiccertificates/tlsconfig.go:243 msg="Starting DynamicServingCertificateController"
ts=2025-11-27T02:39:34.623798836Z level=info caller=/go/pkg/mod/k8s.io/client-go@v0.34.1/tools/cache/shared_informer.go:349 msg="Waiting for caches to sync" controller=thanos


6的执行结果
kubectl -n kube-prometheus-stack describe prometheus <prometheus-name>
kubectl -n kube-prometheus-stack get events --sort-by='.metadata.creationTimestamp' | tail -n 50
zsh: parse error near `\n'
```











