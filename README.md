# 注意事项：
* 页面的HTML代码必须是 <!DOCTYPE html> 开头
* 需要支持websorcket的浏览器，建议使用firefox、chorme

# 在线文档
http://xiaoman.kxjlcc.com/xiaoman-doc/
# 更新历史
## 1.00 
   - 原稿
## 1.01   
   - 优化启动和签入接口，根据电话客户端响应正确返回调用结果  
   - 新增onMessage接口，推送电话运行状态
   - 外呼接口新增是否录音参数，默认开启录音
   - 外呼接口支持选择外显号码
##1.0.2
   - 电话模块新增版本检测接口
   - 电话模块增通话保持和取回通话保持接口
   - 电话启动接口（open）增加是否启动内置终端参数（isStartXphone），以支持第三方终端
   - 优化模块加载器，当加载多个模块时先加载依赖的模块
   - PhoneBar创建优化，如果已经存在则不在生成PhoneBar。防止重复加载模块时重复生成PhoneBar
   - 基础模块新增登录检测接口（checkLogin）
   - 创建PhoneBar时判断当前是否登录，如果已登录则自动签入电话
   - PhoneBar新增电话转接功能
##1.0.3
   - 修复模块重复加载问题
   - 模块加载新增版本号，防止缓存
   - 发送GPhone增加异常处理，防止wss连接异常时不回调问题
   - 新增消息推送功能
   - 新增通话保持后外呼功能
 