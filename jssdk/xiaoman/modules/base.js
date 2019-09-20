/**
 * Created by xxqin on 2016/11/28.
 */
xmsys.define(function (exports) {
    var base = function () {
    };

    //api检测
    base.prototype.check = function (params) {
        if (!params || !params.apis) {
            //xmsys.error("base.check->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Error, "检查api是否支持", "check", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            })
            return;
        }
        var apis = typeof params.apis === 'string' ? [params.apis] : params.apis;
        var checkResult = [];
        for (var index in apis) {
            var o = {}

            //当前只要求浏览器支持websocket即可
            if (window.WebSocket)
                o[apis[index]] = true
            else
                o[apis[index]] = false
            checkResult.push(o)
        }

        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            result: checkResult
        })
    };
    base.prototype.checkLogin = function (params) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Info, "晓曼登录", "checkLogin", JSON.stringify(params))
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            result: xmsys.checkLogin()
        })
    };
    base.prototype.checkLoginByAccount = function (params) {
        //参数为空检查
        if (!params || !params.account || params.account == "") {
            //xmsys.error("base.checkLoginByAccount->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Error, "检查指定帐号是否登录", "checkLoginByAccount", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            })
            return;
        }
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        if (userInfo == null || userInfo.user.account != params.account) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc,
                result: false
            })
            return
        }
        var resp = {
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            result: xmsys.checkLogin()
        }
        params && params.success && params.success(resp);
    };
    //登录
    base.prototype.login = function (params) {
        if (!params || !params.account || params.account == "" || !params.password || params.password == "") {
            //xmsys.error("base.login->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Error, "登录", "login", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            })
            return;
        }
        var timestamp = new Date().getTime();
        var md5Pwd = CryptoJS.MD5(params.password, {asString: true}).toString().toUpperCase();
        var sha256Pwd = CryptoJS.SHA256(params.account + timestamp + md5Pwd).toString(CryptoJS.enc.Hex);
        var data = "";
        if (xmsys.cfg.IsEncryptPassword) {
            data = {phone: params.account, password: sha256Pwd, timestamp: timestamp}
        } else {
            data = {phone: params.account, password: params.password}
        }
        var req = {
            data: data,
            callback: function (result, data) {
                if (result.code == xmsys.cfg.code.Success.code && data) {
                    var token = data.data.token;
                    var outShowTel = {};
                    var arrOutShowTel = []
                    if (data.data.telResouce) {
                        for (var i = 0; i < data.data.telResouce.length; i++) {
                            arrOutShowTel.push(data.data.telResouce[i].telNumber)
                            outShowTel[data.data.telResouce[i].telNumber] = data.data.telResouce[i]
                        }
                    }
                    //保存用户信息
                    var userInfo = {
                        user: data.data.user,
                        enterprise: data.data.enterprise,
                        extentInfo: data.data.extentInfo,
                        group: data.data.group,
                        token: token,
                        telRes: outShowTel
                    };
                    userInfo.user.account = params.account;
                    //Raven.setUserContext(userInfo)
                    xmsys.addCache(xmsys.cfg.CacheKey.UserInfo, userInfo)
                    xmsys.sessionData(xmsys.cfg.CacheKey.UserInfo, userInfo);
                    params && params.success && params.success({
                        code: result.code,
                        desc: result.desc,
                        token: token,
                        outshowtel: arrOutShowTel
                    })
                } else {
                    params && params.fail && params.fail(result)
                }
            }
        };
        xmsys.cmsService.login(req);
    };
    //登出
    base.prototype.logout = function (params) {
        var req = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            callback: function (result, data) {
                if (result.code == xmsys.cfg.code.Success.code) {
                    //清除用户信息
                    xmsys.removeAllSessionData();
                    params && params.success && params.success({
                        code: result.code,
                        desc: result.desc
                    })
                } else {
                    params && params.fail && params.fail(result)
                }
            }
        };
        xmsys.cmsService.logout(req);
    };
    //获取运行时数据
    base.prototype.getRuntimeData = function (params) {
        //参数为空检查
        if (!params || !params.name || params.name == "") {
            //xmsys.error("base.getRuntimeData->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Error, "获取运行时数据", "getRuntimeData", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            })
            return;
        }
        //参数正确性检查
        var runDataName = xmsys.cfg.CacheKey.RunDataKey[params.name];
        if (!runDataName) {
            // xmsys.error("base.getRuntimeData->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Base, xmsys.cfg.LogLevel.Error, "获取运行时数据", "getRuntimeData", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamFormatError.code,
                desc: xmsys.cfg.code.ParamFormatError.desc
            })
            return;
        }
        var runData = xmsys.cache[xmsys.cfg.CacheKey.RunData]
        var runDataValue = runData ? runData[xmsys.cfg.CacheKey.RunDataKey[runDataName]] : "";
        //若获取主叫或被叫号码时，移除线路名称
        var line = runData ? runData.Line : ""
        var callType = runData ? runData.CallType : ""
        if (line && callType && runDataName == xmsys.cfg.CacheKey.RunDataKey.Ani && callType == xmsys.cfg.CallType.inbound) {
            runDataValue = runDataValue.replace(line, "")
        } else if (line && callType && runDataName == xmsys.cfg.CacheKey.RunDataKey.Dnis && callType == xmsys.cfg.CallType.outbound) {
            runDataValue = runDataValue.replace(line, "")
        }

        var resp = {
            value: runDataValue,
            name: params.name,
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        }
        params && params.success && params.success(resp)


        //记录电话日志
        var phoneLogReq = {
            data: {
                type: "Operation",
                action: "getRuntimeData",
                groupId: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].group.id,
                agentId: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].extentInfo.id,
                agentLoginCode: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].extentInfo.loginCode,
                agentDnCode: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].extentInfo.placeCode,
                params: resp
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };

    base.prototype.feedback = function (options, data) {
        var msg = "用户反馈-" + Math.random();
        var loginInfo = {};
        if (xmsys.checkLogin()) {
            loginInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo];
            msg = "企业【" + loginInfo.enterprise.name + "-" + loginInfo.enterprise.id +
                "】用户【" + loginInfo.user.account + "-" + loginInfo.user.name + "】-" + new Date().getTime()
        }
        options = options || {};
        if (options.extra == null) {
            options.extra = {}
            options.extra.userData = data
        }

        xmsys.xmLog.phone.toArray().then(function (logInfo) {
            options.extra = logInfo
            Raven.captureMessage(msg, options);
            Raven.showReportDialog();
        });
    }
    exports('common', 'base', new base());
});