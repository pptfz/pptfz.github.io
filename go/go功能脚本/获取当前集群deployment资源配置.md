# 获取当前集群deployment资源配置

可以在切片中定义多个想要查询的命名空间 `namespaces := []string{"ns1", "ns2", "ns3"}` 

```go
package main

import (
	"context"
	"fmt"
	"log"
        "os"
	"path/filepath"

	"github.com/xuri/excelize/v2"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func main() {
	// 要查询的命名空间列表
	namespaces := []string{"ns1", "ns2", "ns3"}

	// 创建 Excel 文件
	f := excelize.NewFile()

	// 在 Excel 文件中创建一个新的工作表
	index, err := f.NewSheet("Deployment Resources")
	if err != nil {
		log.Fatalf("Error creating new sheet: %s", err.Error())
	}
	f.SetActiveSheet(index)

	// 设置 Excel 表头
	f.SetCellValue("Deployment Resources", "A1", "Namespace")
	f.SetCellValue("Deployment Resources", "B1", "Deployment")
	f.SetCellValue("Deployment Resources", "C1", "Request CPU")
	f.SetCellValue("Deployment Resources", "D1", "Request Memory")
	f.SetCellValue("Deployment Resources", "E1", "Limit CPU")
	f.SetCellValue("Deployment Resources", "F1", "Limit Memory")

	// 循环遍历每个命名空间
	for _, namespace := range namespaces {
		// 获取 Kubernetes 配置
		config, err := rest.InClusterConfig()
		if err != nil {
			kubeconfig := filepath.Join(homedir.HomeDir(), ".kube", "config")
			config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
			if err != nil {
				log.Fatalf("Error building kubeconfig: %s", err.Error())
			}
		}

		// 创建 Kubernetes 客户端
		clientset, err := kubernetes.NewForConfig(config)
		if err != nil {
			log.Fatalf("Error creating Kubernetes client: %s", err.Error())
		}

		// 使用 Informer 监听 Deployment 资源的变化
		ctx := context.TODO()
		factory := informers.NewSharedInformerFactoryWithOptions(clientset, 0, informers.WithNamespace(namespace))
		deploymentInformer := factory.Apps().V1().Deployments().Informer()

		// 启动 Informer
		stopCh := make(chan struct{})
		defer close(stopCh)
		go deploymentInformer.Run(stopCh)

		// 等待 Informer 同步
		if !deploymentInformer.HasSynced() {
			fmt.Println("Waiting for informer to sync")
		}

		// 获取 Deployment 资源并写入 Excel 文件
		deployments, err := clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
		if err != nil {
			log.Fatalf("Error listing deployments in namespace %s: %s", namespace, err.Error())
		}

		for _, deployment := range deployments.Items {
			row, err := f.GetRows("Deployment Resources")
			if err != nil {
				log.Fatalf("Error getting rows: %s", err.Error())
			}
			nextRow := len(row) + 1 // 获取当前行数并加1，因为第一行是表头

			// 获取 Deployment 的请求和限制值
			cpuReq := deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Cpu().String()
			memReq := deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Memory().String()
			cpuLimit := deployment.Spec.Template.Spec.Containers[0].Resources.Limits.Cpu().String()
			memLimit := deployment.Spec.Template.Spec.Containers[0].Resources.Limits.Memory().String()

			// 将请求和限制值写入 Excel 文件
			f.SetCellValue("Deployment Resources", fmt.Sprintf("A%d", nextRow), namespace)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("B%d", nextRow), deployment.Name)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("C%d", nextRow), cpuReq)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("D%d", nextRow), memReq)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("E%d", nextRow), cpuLimit)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("F%d", nextRow), memLimit)
		}
	}

	// 将 Excel 文件保存到磁盘
	if err := f.SaveAs("deployment_resources.xlsx"); err != nil {
		fmt.Println("Error saving Excel file:", err)
	} else {
		// 设置文件权限为 0640
		if err := filepath.Walk("deployment_resources.xlsx", func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			return os.Chmod(path, 0640)
		}); err != nil {
			fmt.Println("Error setting file permissions:", err)
		} else {
			fmt.Println("Excel file saved successfully as deployment_resources.xlsx")
		}
	}
}
```



执行后，输出的excel文件内容如下所示

![iShot_2024-04-25_15.15.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-04-25_15.15.31.png)