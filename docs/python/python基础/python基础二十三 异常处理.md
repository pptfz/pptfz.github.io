[toc]



# python基础二十三	异常处理

## 1.异常和错误

### 1.1 错误

#### 1.1.1 语法错误

```python
#if后边没有加冒号，属于语法错误，无法通过python解释器，必须运行前修改  
num = 10
if num == 11
    print('ok')
  
结果报错：
SyntaxError: invalid syntax
```



#### 1.1.2 逻辑错误

```python
#除数为0
num = 10
    print(num/0)
  
  
结果报错：
ZeroDivisionError: division by zero
```





### 1.2 异常

**什么是异常？**

- **异常即是一个事件，该事件会在程序执行过程中发生，影响了程序的正常执行。**

- **一般情况下，在Python无法正常处理程序时就会发生一个异常。**

- **异常是Python对象，表示一个错误。**

- **当Python脚本发生异常时我们需要捕获处理它，否则程序会终止执行。**



![iShot2020-10-16 11.58.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2011.58.28.png)



### 1.3 python中异常的类

**错误示例**

```python
#触发IndexError: 索引超出范围
lst = [1,2,3]
print(lst[5])

结果报错：
IndexError: list index out of range

  
#触发KeyError: 字典中没有此键
dic = {'k1':1,'k2':2}
print(dic['k3'])

结果报错：
KeyError: 'k3'
```

**常见异常**

| 异常名称                      | 描述                                                   |
| :---------------------------- | :----------------------------------------------------- |
| **BaseException**             | **所有异常的基类**                                     |
| **SystemExit**                | **解释器请求退出**                                     |
| **KeyboardInterrupt**         | **用户中断执行(通常是输入^C)**                         |
| **Exception**                 | **常规错误的基类**                                     |
| **StopIteration**             | **迭代器没有更多的值**                                 |
| **GeneratorExit**             | **生成器(generator)发生异常来通知退出**                |
| **StandardError**             | **所有的内建标准异常的基类**                           |
| **ArithmeticError**           | **所有数值计算错误的基类**                             |
| **FloatingPointError**        | **浮点计算错误**                                       |
| **OverflowError**             | **数值运算超出最大限制**                               |
| **ZeroDivisionError**         | **除(或取模)零 (所有数据类型)**                        |
| **AssertionError**            | **断言语句失败**                                       |
| **AttributeError**            | **对象没有这个属性**                                   |
| **EOFError**                  | **没有内建输入,到达EOF 标记**                          |
| **EnvironmentError**          | **操作系统错误的基类**                                 |
| **IOError**                   | **输入/输出操作失败**                                  |
| **OSError**                   | **操作系统错误**                                       |
| **WindowsError**              | **系统调用失败**                                       |
| **ImportError**               | **导入模块/对象失败**                                  |
| **LookupError**               | **无效数据查询的基类**                                 |
| **IndexError**                | **序列中没有此索引(index)**                            |
| **KeyError**                  | **映射中没有这个键**                                   |
| **MemoryError**               | **内存溢出错误(对于Python 解释器不是致命的)**          |
| **NameError**                 | **未声明/初始化对象 (没有属性)**                       |
| **UnboundLocalError**         | **访问未初始化的本地变量**                             |
| **ReferenceError**            | **弱引用(Weak reference)试图访问已经垃圾回收了的对象** |
| **RuntimeError**              | **一般的运行时错误**                                   |
| **NotImplementedError**       | **尚未实现的方法**                                     |
| **SyntaxError**               | **Python 语法错误**                                    |
| **IndentationError**          | **缩进错误**                                           |
| **TabError**                  | **Tab 和空格混用**                                     |
| **SystemError**               | **一般的解释器系统错误**                               |
| **TypeError**                 | **对类型无效的操作**                                   |
| **ValueError**                | **传入无效的参数**                                     |
| **UnicodeError**              | **Unicode 相关的错误**                                 |
| **UnicodeDecodeError**        | **Unicode 解码时的错误**                               |
| **UnicodeEncodeError**        | **Unicode 编码时错误**                                 |
| **UnicodeTranslateError**     | **Unicode 转换时错误**                                 |
| **Warning**                   | **警告的基类**                                         |
| **DeprecationWarning**        | **关于被弃用的特征的警告**                             |
| **FutureWarning**             | **关于构造将来语义会有改变的警告**                     |
| **OverflowWarning**           | **旧的关于自动提升为长整型(long)的警告**               |
| **PendingDeprecationWarning** | **关于特性将会被废弃的警告**                           |
| **RuntimeWarning**            | **可疑的运行时行为(runtime behavior)的警告**           |
| **SyntaxWarning**             | **可疑的语法的警告**                                   |
| **UserWarning**               | **用户代码生成的警告**                                 |





## 2.异常处理

**捕捉异常可以使用try/except语句。**

**try/except语句用来检测try语句块中的错误，从而让except语句捕获异常信息并处理。**

**如果你不想在异常发生时结束你的程序，只需在try里捕获它。**



### 2.1 try/except语句

**语法**

```python
try:
    被检测的代码块        
except 异常类型：
    try中一旦检测到异常，就执行这里的代码
```



![iShot2020-10-16 11.59.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2011.59.09.png)



### 2.2 try/except...else语句

**语法**

```python
try:
    被检测的代码块        
except 异常类型：
    try中一旦检测到异常，就执行这里的代码        
else:
    没有发生异常执行的代码        
```



![iShot2020-10-16 11.59.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2011.59.32.png)

**try的工作原理是，当开始一个try语句后，python就在当前程序的上下文中作标记，这样当异常出现时就可以回到这里，try子句先执行，接下来会发生什么依赖于执行时是否出现异常。**

- **如果当try后的语句执行时发生异常，python就跳回到try并执行第一个匹配该异常的except子句，异常处理完毕，控制流就通过整个try语句（除非在处理异常时又引发新的异常）。**
- **如果在try后的语句里发生了异常，却没有匹配的except子句，异常将被递交到上层的try，或者到程序的最上层（这样将结束程序，并打印默认的出错信息）。**
- **如果在try子句执行时没有发生异常，python将执行else语句后的语句（如果有else的话），然后控制流通过整个try语句。**



**正常运行示例，打开一个文件test.py，在该文件中写入以下内容，且并未发生异常：**

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
try:
    fh = open("testfile", "w")
    fh.write("这是一个测试文件，用于测试异常!!")
except IOError:
    print("Error: 没有找到文件或读取文件失败")
else:
    print("内容写入文件成功")
    fh.close()
    

运行结果：
$ python3 test.py 
内容写入文件成功

$ cat testfile       # 查看写入的内容
这是一个测试文件，用于测试异常!!
```



**异常运行示例，还是运行以上文件，但文件没有写入权限，发生了异常**

```python
先取消test.py文件的执行权限

$ python3 test.py 
Error: 没有找到文件或读取文件失败
```



### 2.3 try-finally 语句

**try-finally 语句无论是否发生异常都将执行最后的代码。**

**语法**

```python
try:
    <语句>
finally:
    <语句>    #退出try时总会执行
raise
```



![iShot2020-10-16 11.59.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2011.59.50.png)



**示例**

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-

代码写法一
try:
    fh = open("testfile", "w")
    fh.write("这是一个测试文件，用于测试异常!!")
finally:
    print("Error: 没有找到文件或读取文件失败")
   
  
代码写法二	属于异常嵌套
try:
    fh = open("testfile", "w")
    try:
        fh.write("这是一个测试文件，用于测试异常!!")
    finally:
        print("关闭文件")
        fh.close()
except IOError:
    print("Error: 没有找到文件或读取文件失败")
  
    
如果文件没有可写权限，会报错
$ python3 test.py 
Error: 没有找到文件或读取文件失败
```

**当在try块中抛出一个异常，立即执行finally块代码。**

**finally块中的所有语句执行后，异常被再次触发，并执行except块代码。**

**参数的内容不同于异常。**



### 2.4 万能异常 Exception

**exception可以捕获所有异常**



**示例，将字符串转换为整型，会报错**

```python
s1 = 'hello'
try:
    int(s1)
except Exception as e:
    print(e)
    
结果：
invalid literal for int() with base 10: 'hello'

```



### 2.5 异常捕获嵌套示例

```python
a = int(input("请输入除数>>>"))
b = int(input("请输入被除数>>>"))
try:
    print(a/b)
except Exception:
    try:
        b = int(input("被除数为0，请重新输入被除数>>>"))
        print(a/b)

    except ZeroDivisionError:
        print("被除数能为0？？？，滚吧！！！")
```



### 2.6 raise抛出异常

**语法**

```python
raise [异常类型[(异常原因)]]
```

**其中，用 [] 括起来的为可选参数，其作用是指定抛出的异常名称，以及异常信息的相关描述。如果可选参数全部省略，则 raise 会把当前错误原样抛出；如果仅省略 (异常原因)，则在抛出异常时，将不附带任何的异常描述信息。**

**也就是说，raise 语句有如下三种常用的用法：**

- **raise：单独一个 raise。该语句引发当前上下文中捕获的异常（比如在 except 块中），或默认引发 RuntimeError 异常。**

- **raise 异常类名称：raise 后带一个异常类名称。该语句引发指定异常类的默认实例。**

- **raise 异常类名称(描述信息)：在引发指定异常的同时，附带异常的描述信息。**

**上面三种用法最终都是要引发一个异常实例（即使指定的是异常类，实际上也是引发该类的默认实例），raise 语句每次只能引发一个异常实例。**

#### 2.6.1 raise

```python
def main():
    try:
        # 使用try...except来捕捉异常
        # 此时即使程序出现异常，也不会传播给main函数
        mtd(3)
    except Exception as e:
        print('程序出现异常:', e)
    # 不使用try...except捕捉异常，异常会传播出来导致程序中止
    mtd(3)
def mtd(a):
    if a > 0:
        raise 
main()

程序运行结果：
    程序出现异常: No active exception to reraise
        raise 
    RuntimeError: No active exception to reraise
```



#### 2.6.2 raise 异常类名称

```python
def main():
    try:
        # 使用try...except来捕捉异常
        # 此时即使程序出现异常，也不会传播给main函数
        mtd(3)
    except Exception as e:
        print('程序出现异常:', e)
    # 不使用try...except捕捉异常，异常会传播出来导致程序中止
    mtd(3)
def mtd(a):
    if a > 0:
        raise ValueError
main()

程序运行结果：
    程序出现异常: 
        raise ValueError
    ValueError
```



#### 2.6.3 raise异常类名称(描述信息)

```python
def main():
    try:
        # 使用try...except来捕捉异常
        # 此时即使程序出现异常，也不会传播给main函数
        mtd(3)
    except Exception as e:
        print('程序出现异常:', e)
    # 不使用try...except捕捉异常，异常会传播出来导致程序中止
    mtd(3)
def mtd(a):
    if a > 0:
        raise ValueError("a的值大于0，不符合要求")
main()


程序运行结果：
    程序出现异常: a的值大于0，不符合要求
        raise ValueError("a的值大于0，不符合要求")
    ValueError: a的值大于0，不符合要求
```



### 2.7 自定义异常

**可以通过创建一个新的异常类来拥有自己的异常。异常类继承自 Exception 类，可以直接继承，或者间接继承，例如:**

```python
class MyError(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)

try:
    raise MyError(3 * 2)
except MyError as e:
    print(f'这是我自定义的异常，自定义运算结果是{e.value}')
    
    
程序运行结果：
这是我自定义的异常，自定义运算结果是6    
```



### 2.8 assert断言

**Python assert（断言）用于判断一个表达式，在表达式条件为 false 的时候触发异常。**

**断言可以在条件不满足程序运行的情况下直接返回错误，而不必等待程序运行后出现崩溃的情况，例如我们的代码只能在 Linux 系统下运行，可以先判断当前系统是否符合条件。**



**语法**

```python
assert 异常类型

等价于	
if not expression:
    raise AssertionError
```

**assert后边可以紧跟参数**

```python
assert expression [, arguments]

等价于
if not expression:
    raise AssertionError(arguments)
```



**使用示例**

```python
#使用示例1，这段代码只能在linux系统中运行
import sys
assert ('linux' in sys.platform), "该代码只能在Linux下执行"


#使用示例2
assert 1 == 2
结果：
	AssertionError
  
  
>>> assert True     # 条件为true正常执行
>>> assert False    # 条件为false触发异常  
```



![iShot2020-10-16 12.00.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2012.00.11.png)
