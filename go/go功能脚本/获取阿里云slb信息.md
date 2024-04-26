# 获取阿里云slb信息

[阿里云slb API文档](https://help.aliyun.com/zh/slb/classic-load-balancer/developer-reference/api-reference-clb/?spm=a2c4g.11186623.0.0.4b483ac1yNKlnu)



其中，查询所需的 `AccessKeyId` 通过变量 `ALIBABA_CLOUD_ACCESS_KEY_ID` 传递，`AccessKeySecret` 通过变量 `ALIBABA_CLOUD_ACCESS_KEY_SECRET` 

```go
AccessKeyId: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		AccessKeySecret: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
```



## 查询阿里云所有region

```go
package main

import (
	"fmt"
	"os"

	"github.com/alibabacloud-go/darabonba-openapi/v2/client"
	"github.com/alibabacloud-go/tea/tea"
	slb20140515 "github.com/alibabacloud-go/slb-20140515/v4/client"
)

func main() {
	// 初始化客户端
	client, err := CreateClient()
	if err != nil {
		panic(err)
	}

	// 调用 DescribeRegions API
	regions, err := DescribeRegions(client)
	if err != nil {
		panic(err)
	}

	// 输出所有区域信息
	for _, region := range regions {
		fmt.Printf("RegionId: %s, LocalName: %s\n", *region.RegionId, *region.LocalName)
	}
}

func CreateClient() (*slb20140515.Client, error) {
	config := &client.Config{
		AccessKeyId:     tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		AccessKeySecret: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
		Endpoint:        tea.String("slb.aliyuncs.com"),
	}
	client, err := slb20140515.NewClient(config)
	if err != nil {
		return nil, err
	}
	fmt.Println("Client created successfully")
	return client, nil
}

func DescribeRegions(client *slb20140515.Client) ([]*slb20140515.DescribeRegionsResponseBodyRegionsRegion, error) {
	// 构造 DescribeRegions 请求
	req := &slb20140515.DescribeRegionsRequest{}

	// 发送请求并处理响应
	resp, err := client.DescribeRegions(req)
	if err != nil {
		return nil, err
	}

	// 检查响应中的字段是否为 nil
	if resp.Body == nil || resp.Body.Regions == nil || resp.Body.Regions.Region == nil {
		return nil, fmt.Errorf("regions data not found in API response")
	}

	return resp.Body.Regions.Region, nil
}
```



输出如下

```sh
$ go run get_aliyun_region.go 
Client created successfully
RegionId: cn-hangzhou, LocalName: 华东1（杭州）
RegionId: cn-shanghai, LocalName: 华东2（上海）
RegionId: cn-nanjing, LocalName: 华东5（南京-本地地域）
RegionId: cn-fuzhou, LocalName: 华东6（福州-本地地域）
RegionId: cn-qingdao, LocalName: 华北1（青岛）
RegionId: cn-beijing, LocalName: 华北2（北京）
RegionId: cn-zhangjiakou, LocalName: 华北3（张家口）
RegionId: cn-huhehaote, LocalName: 华北5（呼和浩特）
RegionId: cn-wulanchabu, LocalName: 华北6（乌兰察布）
RegionId: cn-shenzhen, LocalName: 华南1（深圳）
RegionId: cn-heyuan, LocalName: 华南2（河源）
RegionId: cn-guangzhou, LocalName: 华南3（广州）
RegionId: cn-wuhan-lr, LocalName: 华中1（武汉-本地地域）
RegionId: cn-chengdu, LocalName: 西南1（成都）
RegionId: cn-hongkong, LocalName: 中国香港
RegionId: ap-southeast-1, LocalName: 新加坡
RegionId: ap-southeast-2, LocalName: 澳大利亚（悉尼）
RegionId: ap-northeast-2, LocalName: 韩国（首尔）
RegionId: ap-southeast-3, LocalName: 马来西亚（吉隆坡）
RegionId: ap-southeast-5, LocalName: 印度尼西亚（雅加达）
RegionId: ap-northeast-1, LocalName: 日本（东京）
RegionId: eu-central-1, LocalName: 德国（法兰克福）
RegionId: eu-west-1, LocalName: 英国（伦敦）
RegionId: us-west-1, LocalName: 美国（硅谷）
RegionId: us-east-1, LocalName: 美国（弗吉尼亚）
RegionId: me-east-1, LocalName: 阿联酋（迪拜）
RegionId: me-central-1, LocalName: 沙特（利雅得）
RegionId: ap-southeast-6, LocalName: 菲律宾（马尼拉）
RegionId: ap-southeast-7, LocalName: 泰国（曼谷）
RegionId: ap-south-1, LocalName: 印度（孟买）
```





## 获取当前账号下指定区域的slb

通过 `regions := []string{"region1", "region2", "region3"}` 指定想要查询的region

```go
package main

import (
	"fmt"
	"os"

	"github.com/xuri/excelize/v2"
	slb20140515 "github.com/alibabacloud-go/slb-20140515/v4/client"
	"github.com/alibabacloud-go/darabonba-openapi/v2/client"
	"github.com/alibabacloud-go/tea/tea"
)

func main() {
	// 要查询的区域列表
	regions := []string{"region1", "region2", "region3"}

	// 初始化客户端
	client, err := CreateClient()
	if err != nil {
		panic(err)
	}

	// 创建 Excel 文件
	file := excelize.NewFile()
	sheetName := "LoadBalancers"
	file.NewSheet(sheetName)

	// 写入表头
	headers := []string{"LoadBalancerId", "LoadBalancerName", "LoadBalancerSpec", "Address", "AddressType", "CreateTime", "DeleteProtection", "InstanceChargeType", "InternetChargeType", "InternetChargeTypeAlias", "LoadBalancerStatus", "MasterZoneId", "NetworkType", "PayType", "RegionId", "ResourceGroupId", "SlaveZoneId", "VSwitchId", "VpcId"}
	for col, header := range headers {
		cell := string('A' + col) + "1"
		file.SetCellValue(sheetName, cell, header)
	}

	row := 2
	// 遍历每个区域下的负载均衡信息
	for _, region := range regions {
		// 构造请求
		req := &slb20140515.DescribeLoadBalancersRequest{
			RegionId: tea.String(region),
		}

		// 发送请求并处理响应
		resp, err := client.DescribeLoadBalancers(req)
		if err != nil {
			fmt.Println(err.Error())
			continue
		}

		// 写入数据到 Excel
		for _, lb := range resp.Body.LoadBalancers.LoadBalancer {
			col := 0
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerName))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerSpec))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.Address))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.AddressType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.CreateTime))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.DeleteProtection))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InstanceChargeType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InternetChargeType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InternetChargeTypeAlias))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerStatus))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.MasterZoneId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.NetworkType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.PayType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), region)
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.ResourceGroupId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.SlaveZoneId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.VSwitchId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.VpcId))
			row++
		}
	}

	// 保存 Excel 文件
	if err := file.SaveAs("load_balancers.xlsx"); err != nil {
		fmt.Println(err)
	}

	// 设置文件权限为 0644
	if err := os.Chmod("load_balancers.xlsx", 0644); err != nil {
		fmt.Println("Error setting file permissions:", err)
	} else {
		fmt.Println("Excel file saved successfully as load_balancers.xlsx")
	}
}

func CreateClient() (*slb20140515.Client, error) {
	config := &client.Config{
		AccessKeyId:     tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		AccessKeySecret: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
		Endpoint:        tea.String("slb.aliyuncs.com"),
	}
	client, err := slb20140515.NewClient(config)
	if err != nil {
		return nil, err
	}
	fmt.Println("Client created successfully")
	return client, nil
}
```



## 获取当前账号下所有区域的slb

```go
package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/xuri/excelize/v2"
	slb20140515 "github.com/alibabacloud-go/slb-20140515/v4/client"
	"github.com/alibabacloud-go/darabonba-openapi/v2/client"
	"github.com/alibabacloud-go/tea/tea"
)

func main() {
	// 初始化客户端
	client, err := CreateClient()
	if err != nil {
		panic(err)
	}

	// 获取所有可用区域
	regions, err := DescribeRegions(client)
	if err != nil {
		panic(err)
	}

	// 创建 Excel 文件
	file := excelize.NewFile()
	sheetName := "LoadBalancers"
	file.NewSheet(sheetName)

	// 写入表头
	headers := []string{"LoadBalancerId", "LoadBalancerName", "LoadBalancerSpec", "Address", "AddressType", "CreateTime", "DeleteProtection", "InstanceChargeType", "InternetChargeType", "InternetChargeTypeAlias", "LoadBalancerStatus", "MasterZoneId", "NetworkType", "PayType", "RegionId", "ResourceGroupId", "SlaveZoneId", "VSwitchId", "VpcId"}
	for col, header := range headers {
		cell := string('A' + col) + "1"
		file.SetCellValue(sheetName, cell, header)
	}

	row := 2
	// 遍历每个区域下的负载均衡信息
	for _, region := range regions {
		// 构造请求
		req := &slb20140515.DescribeLoadBalancersRequest{
			RegionId: region.RegionId,
		}

		// 发送请求并处理响应
		resp, err := client.DescribeLoadBalancers(req)
		if err != nil {
			fmt.Println(err.Error())
			continue
		}

		// 写入数据到 Excel
		for _, lb := range resp.Body.LoadBalancers.LoadBalancer {
			col := 0
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerName))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerSpec))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.Address))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.AddressType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.CreateTime))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.DeleteProtection))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InstanceChargeType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InternetChargeType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.InternetChargeTypeAlias))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.LoadBalancerStatus))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.MasterZoneId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.NetworkType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.PayType))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(region.RegionId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.ResourceGroupId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.SlaveZoneId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.VSwitchId))
			col++
			file.SetCellValue(sheetName, string('A'+col)+fmt.Sprint(row), tea.StringValue(lb.VpcId))
			row++
		}
	}

	// 保存 Excel 文件
	fileName := "load_balancers.xlsx"
	if err := file.SaveAs(fileName); err != nil {
		fmt.Println(err)
	} else {
		// 设置文件权限为 0644
		if err := os.Chmod(fileName, 0644); err != nil {
			fmt.Println("Error setting file permissions:", err)
		} else {
			fmt.Println("Excel file saved successfully as", fileName)
		}
	}
}

func CreateClient() (*slb20140515.Client, error) {
	config := &client.Config{
		AccessKeyId:     tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		AccessKeySecret: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
		Endpoint:        tea.String("slb.aliyuncs.com"),
	}
	client, err := slb20140515.NewClient(config)
	if err != nil {
		return nil, err
	}
	fmt.Println("Client created successfully")
	return client, nil
}

func DescribeRegions(client *slb20140515.Client) ([]*slb20140515.DescribeRegionsResponseBodyRegionsRegion, error) {
	// 构造请求
	req := &slb20140515.DescribeRegionsRequest{}

	// 发送请求并处理响应
	resp, err := client.DescribeRegions(req)
	if err != nil {
		return nil, err
	}

	// 检查响应中的字段是否为 nil
	if resp.Body == nil || resp.Body.Regions == nil || resp.Body.Regions.Region == nil {
		return nil, errors.New("regions data not found in API response")
	}

	return resp.Body.Regions.Region, nil
}
```

