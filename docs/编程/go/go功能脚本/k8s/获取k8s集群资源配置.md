# 获取k8s集群资源配置

## deployment

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
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

func main() {
	// 要查询的命名空间列表
	namespaces := []string{"ratel", "ns2", "ns3"}

	// 创建 Excel 文件
	f := excelize.NewFile()
	sheetName := "Deployment Resources"

	// 创建工作表
	index, err := f.NewSheet(sheetName)
	if err != nil {
		log.Fatalf("Error creating new sheet: %v", err)
	}
	f.SetActiveSheet(index)

	// 设置表头
	headers := []string{"Namespace", "Deployment", "Request CPU", "Request Memory", "Limit CPU", "Limit Memory"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheetName, cell, header)
	}

	// 获取 Kubernetes 配置
	var config *rest.Config
	config, err = rest.InClusterConfig()
	if err != nil {
		// 集群内配置不可用，尝试使用本地 kubeconfig
		kubeconfig := filepath.Join(homedir.HomeDir(), ".kube", "config")
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			log.Fatalf("Error building kubeconfig: %v", err)
		}
	}

	// 创建 Kubernetes 客户端
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("Error creating Kubernetes client: %v", err)
	}

	// 遍历命名空间
	rowIndex := 2 // 数据行从第2行开始
	for _, namespace := range namespaces {
		// 获取 Deployment 列表
		deployments, err := clientset.AppsV1().Deployments(namespace).List(context.TODO(), v1.ListOptions{})
		if err != nil {
			log.Printf("Error listing deployments in namespace %s: %v", namespace, err)
			continue
		}

		// 处理每个 Deployment
		for _, deployment := range deployments.Items {
			for _, container := range deployment.Spec.Template.Spec.Containers {
				cpuReq := formatResource(container.Resources.Requests.Cpu())
				memReq := formatResource(container.Resources.Requests.Memory())
				cpuLimit := formatResource(container.Resources.Limits.Cpu())
				memLimit := formatResource(container.Resources.Limits.Memory())

				// 写入 Excel
				data := []interface{}{namespace, deployment.Name, cpuReq, memReq, cpuLimit, memLimit}
				for colIndex, value := range data {
					cell := fmt.Sprintf("%c%d", 'A'+colIndex, rowIndex)
					f.SetCellValue(sheetName, cell, value)
				}
				rowIndex++
			}
		}
	}

	// 保存 Excel 文件
	outputFile := "deployment_resources.xlsx"
	if err := f.SaveAs(outputFile); err != nil {
		log.Fatalf("Error saving Excel file: %v", err)
	}

	// 设置文件权限
	if err := os.Chmod(outputFile, 0640); err != nil {
		log.Printf("Error setting file permissions: %v", err)
	}

	fmt.Printf("Excel file saved successfully as %s\n", outputFile)
}

// formatResource 将 Kubernetes 资源单位格式化为字符串
func formatResource(quantity *resource.Quantity) string {
	if quantity == nil {
		return "N/A"
	}
	return quantity.String()
}
```



执行后，输出的excel文件内容如下所示

![iShot_2024-04-25_15.15.31](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-04-25_15.15.31.png)



可以在切片中定义多个想要查询的命名空间 `namespaces := []string{"ns1", "ns2", "ns3"}` 

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/xuri/excelize/v2"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func main() {
	// 要查询的命名空间列表
	namespaces := []string{"ratel", "ns2", "ns3"}

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
	f.SetCellValue("Deployment Resources", "C1", "Replicas")
	f.SetCellValue("Deployment Resources", "D1", "Request CPU")
	f.SetCellValue("Deployment Resources", "E1", "Request Memory")
	f.SetCellValue("Deployment Resources", "F1", "Limit CPU")
	f.SetCellValue("Deployment Resources", "G1", "Limit Memory")

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
			replicas := *deployment.Spec.Replicas
			cpuReq := formatCPU(deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Cpu().String())
			memReq := formatMemory(deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Memory().String())
			cpuLimit := formatCPU(deployment.Spec.Template.Spec.Containers[0].Resources.Limits.Cpu().String())
			memLimit := formatMemory(deployment.Spec.Template.Spec.Containers[0].Resources.Limits.Memory().String())

			// 获取简化的 Deployment 名称
			deploymentName := simplifyDeploymentName(deployment.Name)

			// 将请求和限制值写入 Excel 文件
			f.SetCellValue("Deployment Resources", fmt.Sprintf("A%d", nextRow), namespace)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("B%d", nextRow), deploymentName)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("C%d", nextRow), replicas)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("D%d", nextRow), cpuReq)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("E%d", nextRow), memReq)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("F%d", nextRow), cpuLimit)
			f.SetCellValue("Deployment Resources", fmt.Sprintf("G%d", nextRow), memLimit)
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

// formatCPU 将 CPU 资源格式化为核心数
func formatCPU(cpu string) string {
	if strings.HasSuffix(cpu, "m") {
		value, err := strconv.Atoi(strings.TrimSuffix(cpu, "m"))
		if err != nil {
			log.Fatalf("Error converting CPU value: %s", err.Error())
		}
		return fmt.Sprintf("%.2f", float64(value)/1000)
	}
	return cpu
}

// formatMemory 将内存资源格式化为 Mi
func formatMemory(memory string) string {
	quantity, err := resource.ParseQuantity(memory)
	if err != nil {
		log.Fatalf("Error converting memory value: %s", err.Error())
	}
	return fmt.Sprintf("%d", quantity.Value()/(1024*1024))
}

// simplifyDeploymentName 通过 '.' 分隔符简化 Deployment 名称
func simplifyDeploymentName(name string) string {
	parts := strings.Split(name, ".")
	return parts[0]
}
```

执行后，输出的excel文件内容如下所示

![iShot_2024-06-04_12.21.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-06-04_12.21.44.png)







## statefulset

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
	index, err := f.NewSheet("StatefulSet Resources")
	if err != nil {
		log.Fatalf("Error creating new sheet: %s", err.Error())
	}
	f.SetActiveSheet(index)

	// 设置 Excel 表头
	f.SetCellValue("StatefulSet Resources", "A1", "Namespace")
	f.SetCellValue("StatefulSet Resources", "B1", "StatefulSet")
	f.SetCellValue("StatefulSet Resources", "C1", "Request CPU")
	f.SetCellValue("StatefulSet Resources", "D1", "Request Memory")
	f.SetCellValue("StatefulSet Resources", "E1", "Limit CPU")
	f.SetCellValue("StatefulSet Resources", "F1", "Limit Memory")

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

		// 使用 Informer 监听 StatefulSet 资源的变化
		ctx := context.TODO()
		factory := informers.NewSharedInformerFactoryWithOptions(clientset, 0, informers.WithNamespace(namespace))
		statefulSetInformer := factory.Apps().V1().StatefulSets().Informer()

		// 启动 Informer
		stopCh := make(chan struct{})
		defer close(stopCh)
		go statefulSetInformer.Run(stopCh)

		// 等待 Informer 同步
		if !statefulSetInformer.HasSynced() {
			fmt.Println("Waiting for informer to sync")
		}

		// 获取 StatefulSet 资源并写入 Excel 文件
		statefulSets, err := clientset.AppsV1().StatefulSets(namespace).List(ctx, metav1.ListOptions{})
		if err != nil {
			log.Fatalf("Error listing statefulsets in namespace %s: %s", namespace, err.Error())
		}

		for _, statefulSet := range statefulSets.Items {
			row, err := f.GetRows("StatefulSet Resources")
			if err != nil {
				log.Fatalf("Error getting rows: %s", err.Error())
			}
			nextRow := len(row) + 1 // 获取当前行数并加1，因为第一行是表头

			// 获取 StatefulSet 的请求和限制值
			cpuReq := statefulSet.Spec.Template.Spec.Containers[0].Resources.Requests.Cpu().String()
			memReq := statefulSet.Spec.Template.Spec.Containers[0].Resources.Requests.Memory().String()
			cpuLimit := statefulSet.Spec.Template.Spec.Containers[0].Resources.Limits.Cpu().String()
			memLimit := statefulSet.Spec.Template.Spec.Containers[0].Resources.Limits.Memory().String()

			// 将请求和限制值写入 Excel 文件
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("A%d", nextRow), namespace)
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("B%d", nextRow), statefulSet.Name)
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("C%d", nextRow), cpuReq)
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("D%d", nextRow), memReq)
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("E%d", nextRow), cpuLimit)
			f.SetCellValue("StatefulSet Resources", fmt.Sprintf("F%d", nextRow), memLimit)
		}
	}

	// 将 Excel 文件保存到磁盘
	if err := f.SaveAs("statefulset_resources.xlsx"); err != nil {
		fmt.Println("Error saving Excel file:", err)
	} else {
		// 设置文件权限为 0640
		if err := filepath.Walk("statefulset_resources.xlsx", func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			return os.Chmod(path, 0640)
		}); err != nil {
			fmt.Println("Error setting file permissions:", err)
		} else {
			fmt.Println("Excel file saved successfully as statefulset_resources.xlsx")
		}
	}
}
```



执行后，输出的excel文件内容如下所示

![iShot_2024-04-25_19.27.04](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-04-25_19.27.04.png)