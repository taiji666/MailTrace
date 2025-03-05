## **简易的邮件追踪**
发现163有邮件追踪功能，还是收费的，好奇分析复现了一下
### **追踪信息分析**
1. **追踪像素（Tracking Pixel）**  
   在网易邮件的HTML正文部分，存在以下代码：  
   ```html
   <img src="https://count.mail.163.com/beacon/webmail.gif?type=webmail_mailtrace&amp;guid=f2a0cbe19d18390f2971ff21">
   ```  
   这是一个典型的追踪像素，由网易邮箱（163.com）提供。当收件人打开邮件时，邮件客户端会尝试加载此图片，并向`count.mail.163.com`发送请求。服务器通过`guid`参数记录该邮件的打开行为，从而实现追踪。

2. **追踪逻辑**  
   - 如果邮件客户端默认加载远程图片（如移动端客户端或某些网页邮箱），则会触发追踪。  
   - 如果客户端禁用图片加载（如Outlook默认设置），则需用户手动允许加载，追踪才会生效。

---
### ** 使用方法**
在邮件中嵌入HTML图片链接
   ```html
    <img src=" https://www.doit.ip-ddns.com/image/2/?guid=ceshi&client_id=ceshi" >
   ```
在网页中搜索client_id即可查询邮件状态
### **注意**
发送邮件**包含追踪信息**，通过嵌入的邮箱追踪像素实现已读状态检测。是否成功追踪取决于收件人客户端的图片加载策略。
