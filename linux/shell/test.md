**<span style={{color: 'red'}}>`-r`和`-w`都是判断文件属主是否有权限(root用户下都会返回1)，属组和其他人即使有权限也返回0</span>**
**<span style={{color: 'red'}}>`-x` root用户下只要文件有执行权限就返回1</span>**
**<span style={{color: 'red'}}>-a -o不能用在[[]]中，&& ||等不能用在[]中</span>**
