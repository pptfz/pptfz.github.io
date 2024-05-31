[toc]



# python基础一	变量、常量、注释

## 1.变量

### 1.1 定义

​	``将程序中运行的中间值，临时存储起来，以便再次使用``

### 1.2 命名规范

- 数字、字母、下划线组成

- 变量名要具有可描述性

- 不能以数字开头

- 禁止使用python中的关键字

- ```python
  ['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
  ```

- 驼峰命名法

  - 单词首字母大写
    - AisMan

- 下划线命名法

  - 单词之间以下划线分割
    - a_is_man



## 2.常量

### 2.1 定义

``变量名大写的就是常量``

### 2.2 说明

- python中本没有常量，为了迎合别的语言
- python中的常量可以修改，但是不建议修改

### 2.3 用途

- 用于配置文件中

  

## 3.注释

### 3.1 定义

``给一些晦涩难懂的代码进行标注或者解释``

### 3.2 分类

- 单行注释

  > 一个#号

- 多行注释

  > 3个单引号或者3个双引号(推荐)



## 4.用户输入

### 4.1 语法

``input(提示语句)``

### 4.2 说明

⚠️``python中input输入的内容都是字符串``



