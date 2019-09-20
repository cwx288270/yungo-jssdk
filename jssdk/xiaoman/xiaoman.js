/*!

 @Title: xiaomansdk
 @Description：晓曼客服js-sdk
 @Site: http://www.kxjlcc.com/
 @Author: xxqin
 @License：LGPL

 */

;!function (win) {

    "use strict";

    var path = function () {
        var jsPath = document.currentScript ? document.currentScript.src : function () {
            var js = document.scripts
                , last = js.length - 1
                , src;
            for (var i = last; i > 0; i--) {
                if (js[i].readyState === 'interactive') {
                    src = js[i].src;
                    break;
                }
            }
            return src || js[last].src;
        }();
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }();

    var xiaomansdk = function () {
        this.version = ""; //版本号
        this.constant = constant;
    };

    var xiaomansys = function () {
        this.cfg = config;
        this.cache = cache;
        this.xmLog = xmLog;
    }

    xiaomansdk.fn = xiaomansdk.prototype;
    xiaomansys.fn = xiaomansys.prototype;
    var doc = document, cache = xiaomansys.fn.cache = {}, config = {}, constant = {}, openConst = [],

        //获取xiaoman所在目录
        getPath = function () {
            var js = doc.scripts, jsPath = js[js.length - 1].src;
            return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
        }(),

        //异常提示
        error = function (msg) {
            win.console && console.error && console.error('xiaomansdk JSSDK Init: ' + msg);
        },

        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

    config.modules = []; //记录模块物理路径
    config.baseModules = []; //记录基础模块物理路径
    config.clientModules = []; //记录客户端模块物理路径
    config.status = {}; //记录模块加载状态
    config.timeout = 10; //符合规范的模块请求最长等待秒数
    config.event = {}; //记录模块自定义事件
    config.code = {};//返回码和描述定义
    //config.version = "1.0.7";
    openConst = ["AngentState", "Channel", "CallType", "MsgType", "CacheKey", "OnMessageType", "AgentStates", "code", "PluginName", "SupportModule", "IM"]

    var xmLog = new Dexie("SDKDatabase");
    xmLog.version(1).stores({
        phone: "++id,level,module,info,time"
    });

    //定义模块
    xiaomansys.fn.define = function (callback) {
        var that = this
            , mods = function () {
            typeof callback === 'function' && callback(function (category, app, exports) {
                //如果是电话插件则根据账号配置的插件类型加载
                if (category === 'phone') {
                    if (app == config.PhoneModule["All"]) {
                        xiaoman["phone"] = exports;
                    }
                } else if (category === 'im') {
                    if (app == config.IMModule["All"]) {
                        xiaoman["im"] = exports;
                    }
                } else if (category === 'client') {
                    if (!xiaoman[category])
                        xiaoman[category] = {};
                    xiaoman[category][app] = exports;
                }
                else {
                    xiaoman[app] = exports;
                }
                config.status[app] = true;
            });
            return this;
        };
        return mods.call(that);
    };
    //加载模块
    xiaomansys.fn.loadModule = function (plugin, callback, type, moduleType) {
        var dir = config.dir = config.dir ? config.dir : path;
        var head = doc.getElementsByTagName('head')[0];

        //加载完毕
        function onScriptLoad(e, url, loadResult, loadType, loadCallback) {
            //var readyRegExp = navigator.platform === 'PxiaomansdkSTATION 3' ? /^complete$/ : /^(complete|loaded)$/
            /*if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
             head.removeChild(node);
             }*/
            if (loadType != 'css')
                config.modules.push({PluginName: plugin, PluginUrl: url, PluginLoadResult: loadResult})
            if (moduleType == "base")
                config.baseModules.push({PluginName: plugin, PluginUrl: url, PluginLoadResult: loadResult})
            if (moduleType == "client")
                config.clientModules.push({PluginName: plugin, PluginUrl: url, PluginLoadResult: loadResult})
            callback({PluginName: plugin, Result: loadResult, Type: loadType})
        }

        var node = doc.createElement(type == 'css' ? 'link' : 'script'), url = "";
        //加载模块
        if (plugin == 'jquery') {
            url = dir + "lib/" + plugin + '.js';
        } else if (plugin == 'layer') {
            url = dir + "lib/layer/" + plugin + '.js';
        }
        else {
            if (type == 'css') {
                url = dir + 'css/' + plugin + '.css';
                node.rel = 'stylesheet';
                node.type = 'text/css';
            }
            else {
                url = dir + plugin + '.js';
                //如果引入的是client模块在需要引入相应的css文件
                if (plugin.indexOf('client') > -1) {
                    xmsys.loadModule(plugin, callback, "css")
                }
            }
        }

        node.async = true;
        node.charset = 'utf-8';
        var nodeDrc = url + function () {
            var version = config.version == null || config.version === "" || config.version === false
                ? (config.v || (new Date()).getTime())
                : (config.version || '');
            return version ? ('?v=' + version) : '';
        }();
        if (type == 'css') {
            node.href = nodeDrc;
        } else {
            node.src = nodeDrc;
        }

        head.appendChild(node);
        if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
            node.attachEvent('onreadystatechange', function (e) {
                onScriptLoad(e, url, true, type, callback);
            });
            node.addEventListener('error', function (e) {
                onScriptLoad(e, url, false, type, callback);
            }, false);
        } else {
            node.addEventListener('load', function (e) {
                onScriptLoad(e, url, true, type, callback);
            }, false);
            node.addEventListener('error', function (e) {
                onScriptLoad(e, url, false, type, callback);
            }, false);

        }
    }
    //系统配置
    xiaomansys.fn.addCfg = function (options) {
        options = options || {};
        for (var key in options) {
            config[key] = options[key];
            if (openConst.indexOf(key) != -1) {
                constant[key] = options[key];
            }
            //日志上报系统加载
            if (key == "Raven" && window.Raven) {
                Raven.config(options[key].serverUrl, options[key].config).install()
            }
            if (key == "version") {
                xiaoman.version = options[key];
            }
        }
    };
    //系统配置
    xiaomansys.fn.addCache = function (key, data) {
        cache[key] = data;
        this.sessionData(key, data);
    };
    //外部配置
    xiaomansdk.fn.config = function (options) {
        //生成浏览器指纹
        new Fingerprint2().get(function (result, components) {
            xmsys.addCache(xmsys.cfg.CacheKey.TmpData.Fingerprint, result);
        });
        //加载模块
        var cfgplugins = options['modulesName'] || [];
        cfgplugins = typeof cfgplugins === 'string' ? [cfgplugins] : cfgplugins;
        //对插件进行分类
        var categoryPlugin = pluginCategory(cfgplugins);

        options = options || {};
        for (var key in options) {
            config[key] = options[key];
        }
        //如果用户已经登录，则把用户信息放到缓存中
        var userInfo = xmsys.sessionData(xmsys.cfg.CacheKey.UserInfo)
        if (userInfo) {
            xmsys.addCache(xmsys.cfg.CacheKey.UserInfo, JSON.parse(userInfo))
        }
        //如果页面已经存在jQuery1.7+库且所定义的模块依赖jQuery，则不加载内部jquery模块
        cfgplugins.push("xiaoman-config");
        xmsys.loadModule('xiaoman-config', function (res) {
            if (!(window.jQuery && jQuery.fn.on)) {
                cfgplugins.push("jquery");
                xmsys.loadModule('jquery', function (res) {
                    loadModuleResult(res);
                    //如果引入了客户端模块在需要引入layer模块
                    if ((cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_All_Client)
                            || cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_Phone_Client)) && !window.layer) {
                        cfgplugins.push("layer");
                        xmsys.loadModule('layer', function (res) {
                            loadModuleResult(res);
                            pLoad()
                        }, 'js', false)
                    } else {
                        pLoad()
                    }
                }, 'js', false)


            } else {
                if ((cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_All_Client)
                        || cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_Phone_Client)) && !window.layer) {
                    cfgplugins.push("layer");
                    xmsys.loadModule('layer', function (res) {
                        loadModuleResult(res);
                        pLoad()
                    }, 'js', false)
                } else {
                    pLoad()
                }
            }
        }, 'js', false);
        var isRefClient = false;

        function pluginCategory(plugins) {
            var plugin = {};
            var clientPlugin = [];
            var basePlugin = [];
            var isAllClient = false;
            var isAllBase = false;
            for (var p in plugins) {
                if (new RegExp("client").test(plugins[p])) {
                    if (new RegExp("all-client").test(plugins[p])) {
                        isAllClient = true;
                    }
                    clientPlugin.push(plugins[p]);
                } else {
                    if (new RegExp("all").test(plugins[p])) {
                        isAllBase = true;
                    }
                    basePlugin.push(plugins[p])
                }
            }
            if (isAllBase) {
                basePlugin = [xmsys.cfg.PluginName.Xiaoman_All];
            }
            if (isAllClient) {
                clientPlugin = [xmsys.cfg.PluginName.Xiaoman_All_Client];
            }
            plugin.clientPlugin = clientPlugin;
            plugin.basePlugin = basePlugin;
            return plugin;
        }

        function pLoad() {
            if (cfgplugins && cfgplugins != "" && cfgplugins.length > 0) {
                var basePlugin = categoryPlugin.basePlugin
                var clientPlugin = categoryPlugin.clientPlugin;
                for (var p = 0; p < cfgplugins.length; p++) {
                    //判断传入的模块系统是否支持
                    if (config.SupportModule.indexOf(cfgplugins[p]) < -0) {
                        xmsys.error(xmsys.cfg.ModuleName.Xiaoman, "模块加载", "LoadModel", "模块->" + cfgplugins[p] + "->" + config.code.ModuleNotExists.desc + "|系统支持的模块：" + config.SupportModule)
                        options.fail && options.fail({
                            code: config.code.ModuleNotExists.code,
                            desc: config.code.ModuleNotExists.desc + "|" + cfgplugins[p] + ",系统支持的模块：" + config.SupportModule
                        })
                        return;
                    }
                    //判断指定的模块此账号下是否允许,如果当前账户配置的时允许所有插件在不鉴权
                    //暂时配置为全允许（暂不启用）
                    /*if (config.AccountAllowModule["All"].indexOf(xmsys.cfg.PluginName.Xiaoman_All) < 0 && config.AccountAllowModule["All"].indexOf(cfgplugins[p]) < 0) {
                     xmsys.error("模块->" + basePlugin[p] + "->" + config.code.ModuleNotInAccount.desc)
                     options.fail && options.fail({
                     code: config.code.ModuleNotInAccount.code,
                     desc: config.code.ModuleNotInAccount.desc + "|" + basePlugin[p] + ",您可以使用以下模块：" + config.AccountAllowModule[config.account]
                     })
                     return;
                     }*/
                }

                //如果配置开启了实时语音流转写则需要加载im模块
                /* if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush) {
                 if (basePlugin.indexOf(xmsys.cfg.PluginName.Xiaoman_All) == -1 && basePlugin.indexOf(xmsys.cfg.PluginName.Xiaoman_IM) == -1) {
                 cfgplugins.push(xmsys.cfg.PluginName.Xiaoman_IM);
                 basePlugin.push(xmsys.cfg.PluginName.Xiaoman_IM);
                 }

                 }*/

                if (basePlugin.length > 0) {
                    //加载指定的模块
                    for (var i = 0; i < basePlugin.length; i++) {
                        if (basePlugin[i] != 'jquery' && basePlugin[i] != 'layer')
                            xmsys.loadModule(basePlugin[i], loadModuleResult, 'js', 'base')
                    }
                }
                /*else {
                 //加载指定的模块
                 for (var i = 0; i < clientPlugin.length; i++) {
                 if (clientPlugin[i] != 'jquery' && clientPlugin[i] != 'layer')
                 xmsys.loadModule(clientPlugin[i], loadModuleResult, 'js', 'base')
                 }
                 }*/
            }
        }

        function loadModuleResult(res) {
            xmsys.info(xmsys.cfg.ModuleName.Xiaoman, "模块加载结果", "loadModuleResult", res.Type.toUpperCase() + "模块->[" + res.PluginName + (res.Result ? "]->加载成功" : "]->加载失败"))
            //判断插件是否加载完成
            if (config.modules && cfgplugins.length == config.modules.length) {
                if (cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_All_Client) > -1 || cfgplugins.indexOf(xmsys.cfg.PluginName.Xiaoman_Phone_Client) > -1) {
                    xiaoman.client.phone.callMain();
                }
                var faliPlugin = {};
                var loadResult = true;
                for (var k = 0; k < config.modules.length; k++) {
                    if (!config.modules[k].PluginLoadResult) {
                        faliPlugin = config.modules[k];
                        loadResult = false
                        break;
                    }
                }
                if (loadResult) {
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman, "模块加载结果", "loadModuleResult", "所有模块加载成功|" + cfgplugins)
                    //xmsys.info("所有模块加载成功|" + cfgplugins);
                    options.success && options.success({
                        code: config.code.Success.code,
                        desc: config.code.Success.desc + "|" + cfgplugins
                    })
                }
                else {
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman, "模块加载结果", "loadModuleResult", "部分模块加载失败|" + faliPlugin)
                    //xmsys.info("部分模块加载失败|" + faliPlugin);
                    options.fail && options.fail({
                        code: config.code.ModuleLoadError.code,
                        desc: config.code.ModuleLoadError.desc + "|" + faliPlugin.PluginName
                    })
                }

                config.modules = [];
                config.baseModules = [];
                config.clientModules = [];
                return;
            }
            //基础模块加载完成，如果有客户端模块则继续加载客户端模块
            if (categoryPlugin.basePlugin.length == config.baseModules.length && categoryPlugin.clientPlugin.length > 0
                && config.clientModules.length == 0 && res.Type != 'css') {
                //加载client的模块
                //debugger;
                for (var i = 0; i < categoryPlugin.clientPlugin.length; i++) {
                    if (categoryPlugin.clientPlugin[i] != 'jquery' && categoryPlugin.clientPlugin[i] != 'layer')
                        xmsys.loadModule(categoryPlugin.clientPlugin[i], loadModuleResult, 'js', 'client')
                }
            }
        }

        return this;
    };

    //获取缓存数据
    xiaomansys.fn.getFromCache = function (key) {
        var val = cache[key] || this.sessionData(key) || this.localData(key);
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    }

    //本地数据
    xiaomansys.fn.localData = function (key, data) {
        if (!key || key == "") {
            return "";
        }
        if (!data || data == "") {
            return localStorage.getItem(key)
        }
        if (typeof data == "object") {
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            localStorage.setItem(key, data);
        }
    };
    //会话存储
    xiaomansys.fn.sessionData = function (key, data) {
        if (!key || key == "") {
            return "";
        }
        if (!data || data == "") {
            return sessionStorage.getItem(key)
        }
        if (typeof data == "object") {
            sessionStorage.setItem(key, JSON.stringify(data));
        } else {
            sessionStorage.setItem(key, data);
        }
    };
    //移除本地数据
    xiaomansys.fn.removeLocalData = function (key) {
        localStorage.removeItem(key);
    };
    //移除会话存储
    xiaomansys.fn.removeSessionData = function (key) {
        if (!key || key == "") {
            return "";
        }
        sessionStorage.removeItem(key)
    };
    //移除会话存储
    xiaomansys.fn.removeAllSessionData = function () {
        for (var key in xmsys.cfg.CacheKey.TmpData) {
            sessionStorage.removeItem(xmsys.cfg.CacheKey.TmpData[key])
        }
        xmsys.removeSessionData(xmsys.cfg.CacheKey.UserInfo);
        xmsys.removeSessionData(xmsys.cfg.CacheKey.RunData);
    };

    //移除会话存储
    xiaomansys.fn.removeAllSessionDataExceptUserInfo = function () {
        for (var key in xmsys.cfg.CacheKey.TmpData) {
            sessionStorage.removeItem(xmsys.cfg.CacheKey.TmpData[key])
        }
        xmsys.removeSessionData(xmsys.cfg.CacheKey.RunData);
    };
    //设备信息
    xiaomansys.fn.device = function (key) {
        var agent = navigator.userAgent.toLowerCase();

        //获取版本号
        var getVersion = function (label) {
            var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
            label = (agent.match(exp) || [])[1];
            return label || false;
        };

        var result = {
            os: function () { //底层操作系统
                if (/windows/.test(agent)) {
                    return 'windows';
                } else if (/linux/.test(agent)) {
                    return 'linux';
                } else if (/iphone|ipod|ipad|ios/.test(agent)) {
                    return 'ios';
                }
            }()
            , ie: function () { //ie版本
                return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
                    (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
                ) : false;
            }()
            , weixin: getVersion('micromessenger')  //是否微信
        };

        //任意的key
        if (key && !result[key]) {
            result[key] = getVersion(key);
        }

        //移动设备
        result.android = /android/.test(agent);
        result.ios = result.os === 'ios';

        return result;
    };
    //提示
    xiaomansys.fn.hint = function () {
        return {
            error: error
        }
    };

    //输出消息
    xiaomansys.fn.info = function (module, desc, location, data) {
        if (config['debug']) {
            data = data || "";
            var errMsg = "";
            if (data instanceof TypeError) {
                errMsg = data.message;
            } else if (data instanceof Object) {
                errMsg = JSON.stringify(data);
            }
            else {
                errMsg = data;
            }
            var log = {
                module: module || "default",
                level: "info",
                location: location || "",
                desc: desc || "",
                data: errMsg,
                time: new Date()
            }
            console.info("KXJL-JSSDK->【" + log.module + "】 【" + xmsys.fun.Date.formatDate(log.time)
                + "】 【" + log.level + "】 【" + log.location + "】 " + log.desc + " " + log.data)
            xmsys.xmLog.phone.add(log);
        }
    };
    //输出消息
    xiaomansys.fn.debug = function (module, desc, location, data) {
        if (config['debug']) {
            data = data || "";
            var errMsg = "";
            if (data instanceof TypeError) {
                errMsg = data.message;
            } else if (data instanceof Object) {
                errMsg = JSON.stringify(data);
            }
            else {
                errMsg = data;
            }
            var log = {
                module: module || "default",
                level: "debug",
                location: location || "",
                desc: desc || "",
                data: errMsg,
                time: new Date()
            }

            console.debug("KXJL-JSSDK->【" + log.module + "】 【" + xmsys.fun.Date.formatDate(log.time)
                + "】 【" + log.level + "】 【" + log.location + "】 " + log.desc + " " + log.data)

            xmsys.xmLog.phone.add(log);
        }
    };
    //输出消息
    xiaomansys.fn.warn = function (module, desc, location, data) {
        data = data || "";
        var errMsg = "";
        if (data instanceof TypeError) {
            errMsg = data.message;
        } else if (data instanceof Object) {
            errMsg = JSON.stringify(data);
        }
        else {
            errMsg = data;
        }
        var log = {
            module: module || "default",
            level: "warn",
            location: location || "",
            desc: desc || "",
            data: errMsg,
            time: new Date()
        }
        console.warn("KXJL-JSSDK->【" + log.module + "】 【" + xmsys.fun.Date.formatDate(log.time)
            + "】 【" + log.level + "】 【" + log.location + "】 " + log.desc + " " + log.data)

        xmsys.xmLog.phone.add(log);
    };
    //输出错误
    xiaomansys.fn.error = function (module, desc, location, data) {
        data = data || "";
        var errMsg = "";
        if (data instanceof TypeError) {
            errMsg = data.message;
        } else if (data instanceof Object) {
            errMsg = JSON.stringify(data);
        }
        else {
            errMsg = data;
        }
        var log = {
            module: module || "default",
            level: "error",
            location: location || "",
            desc: desc || "",
            data: errMsg,
            time: new Date()
        }

        console.error("KXJL-JSSDK->【" + log.module + "】 【" + xmsys.fun.Date.formatDate(log.time)
            + "】 【" + log.level + "】 【" + log.location + "】 " + log.desc + " " + log.data)

        xmsys.xmLog.phone.add(log);
    };
    //遍历
    xiaomansys.fn.each = function (obj, fn) {
        var that = this, key;
        if (typeof fn !== 'function') return that;
        obj = obj || [];
        if (obj.constructor === Object) {
            for (key in obj) {
                if (fn.call(obj[key], key, obj[key])) break;
            }
        } else {
            for (key = 0; key < obj.length; key++) {
                if (fn.call(obj[key], key, obj[key])) break;
            }
        }
        return that;
    };
    //执行回调函数
    xiaomansys.fn.execCallBack = function (data, callback) {
        if (callback && typeof callback === "function") {
            if (data) {
                callback(data)
            } else {
                callback()
            }
        }

    };
    //检测是否有权限操作
    xiaomansys.fn.checkAuth = function (token) {
        if (!token || token == "") {
            return false;
        }
        if (!xmsys.cache[xmsys.cfg.CacheKey.UserInfo]) {
            return false;
        }
        if (token != xmsys.cache[xmsys.cfg.CacheKey.UserInfo].token) {
            return false;
        }
        return true;
    };
    //检测是否登录
    xiaomansys.fn.checkLogin = function () {
        if (!xmsys.cache[xmsys.cfg.CacheKey.UserInfo]) {
            return false;
        }
        return true;
    }
    xiaomansys.fn.observe = (function () {

        var clientList = {}, // 缓存订阅的事件
            listen = null,
            trigger = null,
            remove = null

        /**
         * 订阅者订阅事件
         * @param  {String}    key  事件名称
         * @param  {Boolean}    override 是否重新历史事件
         * @param  {Function}    fn   订阅者订阅事件的回调函数
         * @return Null
         */
        listen = function (key, override, fn) {

            if (!clientList[key]) {
                if (override) {
                    clientList[key] = {};
                } else {
                    clientList[key] = [];
                }
            }

            if (override) {
                clientList[key] = fn;
            } else {
                clientList[key].push(fn);
            }
        };

        trigger = function () {
            var arrArguments = [].slice.apply(arguments),
                key = [].shift.apply(arrArguments),
                fns = clientList[key];
            var triggerFn = function () {
                if (fns instanceof Array) {
                    for (var i = 0, fn; fn = fns[i]; i++) {
                        fn && fn.call(null, arrArguments[0]);
                    }
                } else {
                    fns && fns.call(null, arrArguments[0]);
                }

            };
            triggerFn();
        };

        /**
         * 取消订阅的事件
         * @param  {String}   key 要删除的已经订阅的事件
         * @param  {Function} fn  要删除的已经订阅的事件的相关回调函数
         * @return Null
         */
        remove = function (key, fn) {
            var fns = clientList[key];

            if (!fns) {
                return false;
            }
            if (!fn) {
                fns && (fns.length = 0); // 没有传入具体的fn就直接取消key对应事件的订阅
            }
            else {

                for (var l = fns.length - 1; l >= 0; l--) {
                    var _fn = fns[l];
                    if (_fn === fn) {
                        fns.splice(l, 1); // 删除订阅者的回调函数
                    }
                }
            }
        };

        return {	// 返回一个对象 揭露公有接口
            listen: listen,
            trigger: trigger,
            remove: remove
        };
    }());
    win.xiaoman = new xiaomansdk();
    win.xmsys = new xiaomansys();
}(window);

