# shell流程控制语句之case

**case语句语法**

```shell
case 变量名 in
模式1)
	命令1
	;;
模式2)
	命令2
	;;
模式3)
	命令3
	;;
*)
	其它命令
esac
```



**使用示例**

```shell
read -p "请输入一个数字：" NUM
case $NUM in
1)
	echo "你输入的是1"
	;;
2)
	echo "你输入的是2"
	;;
3)
	echo "你输入的是3"
	;;
*)
	echo "请输入以下数字{1|2|3}"
esac
```



**购物脚本示例**

打印本店菜单，然后提示输入商品的编号，购买的数量，并计算消费多少，如果输入不正确则退出

```shell
#!/bin/bash
echo -e "\033[36m这是本店的菜单:\033[0m \n\t\033[32m1.汉堡/13￥\033[0m\n\t\033[35m2.>鸡腿/9￥\033[0m\n\t\033[31m3.可乐/6￥\033[0m"
xunhuan (){
read -p  '请输入要购买的商品编号,按"q"退出,按"y"打印消费清单: ' menu
case "$menu" in
q)
	break
	;;
1)
	read -p "请输入要购买的汉堡数量: " hb
	echo -e "\033[34m\n您购买了$hb个汉堡\n\033[0m"
	;;

2)
	read -p "请输入要购买的鸡腿数量: " jt
	echo -e "\033[34m\n您购买了$jt个鸡腿\n\033[0m"
	;;
3)
	read -p "请输入要购买的可乐数量: " kl
	echo -e "\033[34m\n您购买了$kl个可乐\n\033[0m"
	;;
y)
	a=$hb*13
	b=$jt*9
	c=$kl*6
	let sum=$a+$b+$c
	echo -e "\033[32m消费清单:\n\t商品名称\t单价\t数量\t总价\n\t汉堡\t\t13￥\t$hb\t$a\n\t鸡腿\t\t9￥\t$jt\t$b\n\t可乐\t\t6￥\t$kl\t$c\n\n\t总计:$sum元\t\t收银员：李骚峰\033[0m"
;;
*)
	echo "输入不正确,请输入正确的编号{1|2|3}"
esac
}
while : ;do
	xunhuan
done
```

