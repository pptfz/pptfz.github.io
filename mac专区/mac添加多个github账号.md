[toc]



# MAC本添加多个github账号

### 使用需求

> **通常情况下，我们会有两个 github 账号：一个是公司的，另一个是私人的。由于 github 是使用 SSH key 的 fingerprint (对应的公钥id_rsa_pub)来判定你是哪个账户，而不是通过用户名，如果是在多台电脑上使用一个账号，可以为该账号添加多个 SSH key，如果是一台电脑使用多个账号，则分别生成多个 SSH key 添加到对应的账户即可。所以本文要实现的是公号和私号在 git 上同时使用，两者互不干扰。**



### 第一步、生成多个sshkey

**``cd ~/.ssh``切换到用户家目录，然后生成sshkey，执行以下命令，一路回车即可**

```python
ssh-keygen -t rsa -f ~/.ssh/id_rsa_one -C "one@xxx.com"
ssh-keygen -t rsa -f ~/.ssh/id_rsa_two -C "two@xxx.com"
```

**这样会在`~/.ssh`目录下生成四个文件：**

```python
id_rsa.one      //账号one的私钥
id_rsa.one.pub  //账号one的公钥
id_rsa.two      //账号two的私钥
id_rsa.two.pub  //账号two的公钥
```



### 第二步、创建配置文件config

**在 `~/.ssh`目录下新建 config 文件，令不同 Host 实际映射到同一 HostName，但密钥文件不同，这里举例为one和two，可自行修改为自己使用的用户**

```python
# one (first account)
Host one.github.com
HostName github.com
PreferredAuthentications publickey
User one
IdentityFile ~/.ssh/id_rsa_one

# two(second account) 
Host two.github.com
HostName github.com
PreferredAuthentications publickey
User two
IdentityFile ~/.ssh/id_rsa_two
```



### 第三步、github添加sshkey及测试

**分别登陆两个 github 账号，在 Settings —> SSH and GPG keys 中，点击 “new SSH key”，把 “id_rsa.one.pub” 和 "id_rsa.two.pub"这两个公钥的内容分别添加到相应的账号中。**
**为了确认我们可以通过 SSH 连接 github，可通过输入下面命令来验证**

```python
//执行以下命令测试
ssh -T git@one.github.com

//返回结果如下说明添加成功
Hi one! You've successfully authenticated, but GitHub does not provide shell access.
```



### 第四步、配置git信息

:::tip

**因为一台电脑上配置了多个 github 账号，所以就不能再配置全局的用户名和邮箱了，而是在不同的仓库下，如果需要连接不同的 git 账号，配置相应的局部用户名和邮箱即可，如果之前配置过全局的用户名和邮箱，需要取消配置**

:::

```python
//取消之前的全局配置
git config --global --unset user.name
git config --global --unset user.email


//设置局部用户名和邮箱
git config --local user.name "xx"
git config --local user.email "xx@xx.com"
```



### 第五步、使用git

**git的使用一般是从其他仓库直接clone或本地新建仓库**

<h3>方式一：clone仓库到本地</h3>

**原先写法**

```python
git clone git@github.com:用户名/仓库.git
```

**现在的写法**

```python
//这里距离了one用户的写法，two用户的操作一样
git clone git@one.github.com:one的用户名/仓库.git
```

**如果需要重建origin**

```python
//清空原有的
git remote rm origin 

//使用ssh方式添加远程仓库
git remote add origin git@one.github.com:one/仓库名.git
```

:::caution

**这里有个坑，添加远程仓库时，从github仓库的 `Clone or download` 下的 `Use SSH` 复制的路径需要修改**

:::

```python
这里需要注意的是，使用ssh方式添加远程仓库原先写法是这样的
git@github.com:one/仓库名.git
  
现在需要修改为如下写法
git remote add origin git@one.github.com:one/仓库名.git
```

---

<h3>方式二、推送本地仓库</h3>

```python
//初始化本地仓库
git init

//创建一个文件并提交到本地仓库
touch test
git add .
git commit -m "first commit"

//push到github上去
git remote add origin git@one.github.com:one/仓库名.git
git push origin master
```

