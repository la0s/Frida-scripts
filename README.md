## Frida-scripts
分享个人工作中一些事半功倍的脚本
### ios_trace.js
#### 说明
* 根据关键词模糊Hook Objective-C方法，可以对类名和方法名模糊Hook，参考[FridaDev](https://github.com/houugen/FridaDev)，在此基础上进行了修改。
* 对Objective-C的地址进行判断（防止解析出错），默认拦截所有的@id对象类型的参数或返回值，并提供着色。
* 当拦截方法较多时，为避免无关的关键词Hook造成性能问题，可以对关键词通过filter列表设置过滤。
* 大小写敏感，逆向找突破口的时候可尽情发挥想象力。
#### 举例
trace("\*[\* \*md5\*]") --> 模糊Hook签名
![](./Images/trace_md5.png)
