/**
 * Created by xxqin on 2016/11/28.
 * 模块 gphone
 */
xmsys.define(function (exports) {
    var gphone = function () {
        this.version = xmsys.cfg.GPhoneConfig.version;
        this.ws = {};
        this.event = event;
        this.AgentStates = agentStates;
    };
    var agentStates = {
        logout: "Logout",
        connected: "Connected",
        notinitialized: "NotInitialized",
        dialing: "Dialing",
        busy: "Busy",
        aftercallwork: "AfterCallWork",
        ringing: "Ringing",
        ready: "Ready",
        notready: "NotReady"

    }
    var event = {}
    //显示电话客户端
    gphone.prototype.openClient = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        var data = '{"request":"ShowGPhone","params":""}'
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "启动GPhone客户端", "openClient", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "ShowGPhone",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }

        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //显示电话客户端
    gphone.prototype.closeClient = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        var data = '{"request":"HideGPhone","params":""}'
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "关闭GPhone客户端", "closeClient", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "HideGPhone",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //电话签入
    gphone.prototype.login = function (params) {
        var _this = this;
        if (!params || !params.token || params.token == "") {
            xmsys.error("phone.login->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }
        //订阅软电话登录结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Login, true, function (data) {
            if (data.code === xmsys.cfg.code.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkAuth(params.token)) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        var agentId = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode
        var loginData = '{"request":"Login","params":' + agentId + '}';
        var infoData = '{"request":"SetAgentInfo","agentid":"' + agentId + '","agenttype":"0"}';
        // xmsys.info("发送数据：" + JSON.stringify(infoData))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话签入(SetAgentInfo)", "login", JSON.stringify(infoData))
        try {
            _this.ws.send(infoData)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        setTimeout(function () {
            //xmsys.info("发送数据：" + JSON.stringify(loginData))
            xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话签入(Login)", "login", JSON.stringify(loginData))
            try {
                xiaoman.phone.ws.send(loginData);
            } catch (ex) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                    desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
                });
                return;
            }

            //记录电话日志
            var phoneLogReq = {
                token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                data: {
                    type: "Operation",
                    action: "Login",
                    groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                    agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                    agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                    agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                    params: loginData
                }
            };
            xmsys.yungoService.phonePluginLog(phoneLogReq);
        }, 500);

        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "SetAgentInfo",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: infoData
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //电话签出
    gphone.prototype.logout = function (params) {
        var data = '{"request":"Logout","params":""}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话签出", "logout", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Logout",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //启动电话
    gphone.prototype.open = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //是否开启电话消息实时推送,如启动则需要启动一个im发送服务
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            xiaoman.im.open({
                openType: xmsys.cfg.IM.OpenType.NotifySender,
                success: function (res) {
                    // xmsys.info("im服务启动成功:" + JSON.stringify(res));
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "开启消息推送,im服务启动成功", "open", JSON.stringify(res))
                },
                fail: function (res) {
                    //xmsys.info("im服务启动失败:" + JSON.stringify(res));
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, xmsys.cfg.LogLevel.Error, "开启消息推送,im服务启动失败", "open", JSON.stringify(res))
                }
            })
        }
        xmsys.sessionData(xmsys.cfg.CacheKey.TmpData.PhoneState, "open");
        //订阅软电话启动结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Open, true, function (data) {
            if (data.code === xmsys.cfg.code.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        })
        //分机号
        var dn = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode

        try {
            var wsOptions = {
                maxReconnectAttempts: xmsys.cfg.GPhoneConfig.TryConnectTimes,
                reconnectDecay: 1
            };
            if (xmsys.fun.getProtocol().indexOf("https") >= 0) {
                this.ws = new ReconnectingWebSocket("wss://127.0.0.1:5050", [], wsOptions);
            } else {
                this.ws = new ReconnectingWebSocket("ws://127.0.0.1:5050", [], wsOptions);
            }

            this.ws.onopen = function (event) {
                /*  params && params.success && params.success({
                 code: xmsys.cfg.code.Success.code,
                 desc: xmsys.cfg.code.Success.desc + ",GPhone连接成功"
                 });*/
                return;
            };
            this.ws.onmessage = function (event) {
                //记录电话日志
                try {
                    var phoneLogReq = {
                        token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                        data: {
                            type: "Operation",
                            action: "onmessage",
                            groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                            agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                            agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                            agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                            params: JSON.stringify(event)
                        }
                    };
                    xmsys.yungoService.phonePluginLog(phoneLogReq);
                } catch (e) {

                }
                //xmsys.info("onmessage:" + JSON.stringify(event));
                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "GPhone原始消息", "onmessage", JSON.stringify(event))
                var obj = JSON.parse(event.data);
                //处理不同的事件
                switch (obj.event) {
                    case "EventChatRinging"://多媒体聊天振铃事件
                        ringing(obj);
                        break;
                    case "EventChatMsg"://消息到达事件
                        break;
                    case "EventChatReleased"://聊天会话结束事件
                        released(obj);
                        break;
                    case "EventStateChanged"://座席状态改变
                        agentStateChange(obj)
                        break;
                    case "EventChatEstablished" ://建立通话
                        established(obj)
                        break;
                    case "EventWSSConnected" ://ws客户端已连接
                        //agentStateChange(obj);
                        var state = obj.state
                        if (state != null && state != '' && state.toLowerCase() != xmsys.cfg.AgentStates.notinitialized.code) {
                            var isLogout = (state.toLowerCase() == xmsys.cfg.AgentStates.notinitialized.code || state.toLowerCase() == xmsys.cfg.AgentStates.logout.code);
                            agentStateChange(obj);
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                code: xmsys.cfg.code.Success.code,
                                desc: xmsys.cfg.code.Success.desc,
                                isLogin: !isLogout
                            });
                        }
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.WSSConnected
                        });
                        break;
                    case "TOpenServer" ://软电话连接TServer
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartTServer
                        });
                        break;
                    case "TOpenServerError" ://软电话连接TServer失败
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                            code: xmsys.cfg.code.PhoneOpenConnTServerError.code,
                            desc: xmsys.cfg.code.PhoneOpenConnTServerError.desc
                        });
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.PhoneOpenConnTServerError.code,
                            desc: xmsys.cfg.code.PhoneOpenConnTServerError.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartTServerFail
                        });
                        break;
                    case
                    "EventLinkConnected"://软电话连接TServer成功
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartTServerSuccess
                        });
                        break;
                    case
                    "TRegisterAddress"://软电话开始注册分机
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartRegisterAddress
                        });
                        break;
                    case
                    "EventRegistered"://软电话分机注册成功
                        if (xmsys.sessionData(xmsys.cfg.CacheKey.TmpData.PhoneState) != "close") {
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                code: xmsys.cfg.code.Success.code,
                                desc: xmsys.cfg.code.Success.desc,
                                isLogin: false
                            });
                        }

                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartRegisterAddressSuccess
                        });
                        break;
                    case
                    "TAgentLogin"://开始签入工号
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartAgentLogin
                        });
                        break;
                    case
                    "EventAgentLogin":
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Login, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc
                        });
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: xmsys.cfg.OnMessageType.StartAgentLoginSuccess
                        });
                        break;
                    case
                    "EventGetVersion":
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_CheckPhoneVersion, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            isNew: xmsys.cfg.GPhoneConfig.version == obj.version,
                            currVersion: obj.version,
                            newVersion: xmsys.cfg.GPhoneConfig.version
                        });
                        xmsys.addCache(xmsys.cfg.CacheKey.TmpData.PhoneVersion, obj.version)
                        xmsys.sessionData(xmsys.cfg.CacheKey.TmpData.PhoneVersion, obj.version);
                    case "EventError":
                        var transCode = xmsys.fun.getPhoneTransCode(obj.ErrorCode, obj.ErrorMessage);
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                            code: transCode.code,
                            desc: transCode.desc,
                            originalCode: transCode.originalCode,
                            originalDesc: transCode.originalDesc,
                            notifyType: xmsys.cfg.OnMessageType.Error.Phone
                        });
                        break;
                    default:
                }
                if (event.message) {
                    //记录电话日志
                    var phoneLogReq = {
                        token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                        data: {
                            type: "Message",
                            action: "notice",
                            groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                            agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                            agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                            agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                            data: event.data,
                            code: event.code,
                            subCode: event.subCode

                        }
                    };
                    xmsys.yungoService.phonePluginLog(phoneLogReq);
                }
            };

            this.ws.onclose = function (event) {
                // xmsys.info("ws连接关闭")
                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, xmsys.cfg.LogLevel.Warn, "ws连接关闭", "onclose", JSON.stringify(event))
                /*if (xiaoman.phone.ws.reconnectAttempts == 10) {
                 this.ws = null;
                 }*/
            };
            var isStartGPhone = false;

            var serverConfig = {
                tServer1: xmsys.cfg.GPhoneConfig.tServer1,
                port1: xmsys.cfg.GPhoneConfig.port1,
                tServer2: xmsys.cfg.GPhoneConfig.tServer2,
                port2: xmsys.cfg.GPhoneConfig.port2,
                sipServer: xmsys.cfg.GPhoneConfig.sipServer,
                port3: xmsys.cfg.GPhoneConfig.port3,
                thisDN: dn
            };
            var url = "gphone://startup?tserver1=" + serverConfig.tServer1 +
                "&port1=" + serverConfig.port1 +
                "&tserver2=" + serverConfig.tServer2 +
                "&port2=" + serverConfig.port2 +
                "&thisdn=" + serverConfig.thisDN +
                "&sipserver=" + serverConfig.sipServer +
                "&port3=" + serverConfig.port3 + "";
            if (params.isStartXphone === false) {
                url = url + "&xphone=0"
            } else {
                url = url + "&xphone=1"
            }
            //xmsys.info("启动地址：" + JSON.stringify(url))
            xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "启动地址", "open", url)
            $("body").append("<iframe id='gphoneclient' width='0' height='0' src='" + url + "'></iframe>");
            this.ws.onerror = function (event) {
                //xmsys.info(JSON.stringify(new Date()) + "ws连接异常:" + xiaoman.phone.ws.reconnectAttempts)
                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, xmsys.cfg.LogLevel.Fatal, "ws连接异常", "onerror", xiaoman.phone.ws.reconnectAttempts)
                if (xiaoman.phone.ws.reconnectAttempts == xmsys.cfg.GPhoneConfig.TryConnectTimes) {
                    params && params.fail && params.fail({
                        code: xmsys.cfg.code.PhoneOpenConnWSSError.code,
                        desc: xmsys.cfg.code.PhoneOpenConnWSSError.desc + ",GPhone启动失败"
                    });
                    return;
                }

            };
            //记录电话日志
            var phoneLogReq = {
                token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                data: {
                    type: "Operation",
                    action: "open",
                    groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                    agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                    agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                    agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                    params: url
                }
            };
            xmsys.yungoService.phonePluginLog(phoneLogReq);
        } catch (e) {
            return params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneOpenException.code,
                desc: xmsys.cfg.code.PhoneOpenException.desc
            })
        }
    };
    //关闭电话
    gphone.prototype.close = function (params) {
        xmsys.sessionData(xmsys.cfg.CacheKey.TmpData.PhoneState, "close");
        var data = '{"request":"CloseGPhone","params":""}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "关闭电话", "close", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }

        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });

        setTimeout(function () {
            xiaoman.phone.ws.close(1000, "用户主动关闭电话，系统关闭ws连接")
        }, 500);
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "CloseGPhone",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //接听电话
    gphone.prototype.answer = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //挂断
        var data = '{"request":"Answer","params":""}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "接听电话", "answer", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Answer",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //挂断电话
    gphone.prototype.release = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var data = '{"request":"ChatRelease","connid":"' + connId + '"}';

        xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "挂断电话", "release", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Release",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //电话转接
    gphone.prototype.transfer = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.phoneNum || params.phoneNum === "") {
            xmsys.error("phone.transfer->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //如果外显号码不为空则判断外显号码是否正确
        var line = "";
        if (params.line && params.line != "") {
            var outShowTelNumInfos = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).telRes;
            var lineInfo = outShowTelNumInfos[params.line];
            if (!outShowTelNumInfos || !lineInfo) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.code.PhoneCalloutLineNotExists.code,
                    desc: xmsys.cfg.code.PhoneCalloutLineNotExists.desc
                });
                return;
            }

            line = lineInfo.line;
        }

        if (line) {
            params.phoneNum = line + params.phoneNum;
        }
        var data = '{"request":"TransferIvr","params":"' + params.phoneNum + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话转接", "transfer", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "transfer",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: params.phoneNum
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //开启录音
    gphone.prototype.openRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        var connId = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).ConnId
        var data = '{"request":"StartRecord","params":"","connid":"' + connId + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "开启录音", "openRecord", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "StartRecord",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: connId
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //关闭录音
    gphone.prototype.closeRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        var connId = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).ConnId
        var data = '{"request":"StopRecord","params":"","connid":"' + connId + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "关闭录音", "closeRecord", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "StopRecord",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: connId
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //外呼
    gphone.prototype.callOut = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.phoneNum || params.phoneNum == "") {
            xmsys.error("phone.callOut->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //如果外显号码不为空则判断外显号码是否正确
        var line = "";
        if (params.line && params.line != "") {
            var outShowTelNumInfos = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).telRes;
            var lineInfo = outShowTelNumInfos[params.line];
            if (!outShowTelNumInfos || !lineInfo) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.code.PhoneCalloutLineNotExists.code,
                    desc: xmsys.cfg.code.PhoneCalloutLineNotExists.desc
                });
                return;
            }

            line = lineInfo.line;
        }

        if (typeof (params.isRecord) == "undefined" || params.isRecord === "") {
            params.isRecord = true;
        }

        var data = '{"request":"MakeCall","params":"' + ((line && line != "") ? (line + params.phoneNum) : params.phoneNum) + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "外呼", "callOut", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }

        //缓存线路和是否开启录音
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        if (runData) {
            runData.Line = line;
            runData.IsRecord = params.isRecord;
        } else {
            runData = {
                Line: params.line,
                IsRecord: params.isRecord
            }
        }
        xmsys.addCache(xmsys.cfg.CacheKey.RunData, runData);
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "callOut",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ((params.line && params.line != "") ? (params.line + params.phoneNum) : params.phoneNum)
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    /*gphone.prototype.multiTalk = function (success, fail) {
     xiaoman.execCallBack(success)
     };*/
    //设置座席状态
    gphone.prototype.setAgentState = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.state || params.state == "") {
            xmsys.error("phone.setAgentState->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }
        //参数格式检查
        var angentState = this.AgentStates[params.state]
        if (!angentState) {
            xmsys.error("phone.setAgentState->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamFormatError.code,
                desc: xmsys.cfg.code.ParamFormatError.desc
            });
            return;
        }
        var data = '{"request":"' + angentState + '","params":""}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "设置座席状态", "setAgentState", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: angentState,
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: angentState
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //获取座席状态
    gphone.prototype.getAgentState = function (params) {
        params && params.success && params.success({
            state: xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).AgentState,
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
    };
    //打开和关闭静音
    gphone.prototype.setMute = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.operate || params.operate == "") {
            xmsys.error("phone.callOut->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }
        //参数格式检查
        if (params.operate != "open" && params.operate != "close") {
            xmsys.error("phone.setMute->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamFormatError.code,
                desc: xmsys.cfg.code.ParamFormatError.desc
            });
            return;
        }

        var data = "";
        var connId = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).ConnId
        if (params.operate == "open") {
            data = '{ "request":"EnableMicPhone", "params":"0","connid" : "' + connId + '"  }';
        } else {
            data = '{ "request":"EnableMicPhone", "params":"1","connid" : "' + connId + '"   }';
        }
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "打开和关闭静音", "setMute", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "EnableMicPhone",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: data
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //获取版本
    gphone.prototype.checkPhoneVersion = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        var data = '{"request":"GetVersion","params":""}';

        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "获取版本", "checkPhoneVersion", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        //订阅检测结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_CheckPhoneVersion, true, function (data) {
            if (data.code === xmsys.cfg.code.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        })
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "GetVersion",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: data
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //通话保持
    gphone.prototype.hold = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        var connId = params.connId || xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).ConnId;
        var data = data = '{"request":"ChatHold","connid":"' + connId + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "通话保持", "hold", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).HoldConnId = connId;
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Hold",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: data
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };
    //取回通话保持
    gphone.prototype.retrieve = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        var connId = params.connId || xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).HoldConnId;
        var data = '{"request":"ChatRetrieve","connid":"' + connId + '"}';

        // xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "取回通话保持", "retrieve", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).HoldConnId = "";
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Retrieve",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: data
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };

    //获取版本
    gphone.prototype.send = function (data) {
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
    };

    //发起会议
    gphone.prototype.conference = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        if (params.phoneNum == null || params.phoneNum == "") {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //如果外显号码不为空则判断外显号码是否正确
        var line = "";
        if (params.line && params.line != "") {
            var outShowTelNumInfos = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).telRes;
            var lineInfo = outShowTelNumInfos[params.line];
            if (!outShowTelNumInfos || !lineInfo) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.code.PhoneCalloutLineNotExists.code,
                    desc: xmsys.cfg.code.PhoneCalloutLineNotExists.desc
                });
                return;
            }

            line = lineInfo.line;
        }

        if (line) {
            params.phoneNum = line + params.phoneNum;
        }

        //触发会议
        var connId = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).ConnId
        //var data = '{"request":"ChatSingleStepConference","connid":"' + connId + '","touser":"' + params.phoneNum + '"}';
        var data = '{"request":"ConsultAgent","params":"' + params.phoneNum + '"}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "发起会议", "conference", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "ConsultAgent",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };

    //确认会议
    gphone.prototype.confirmConference = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }

        //确认三方通话
        var data = '{"request":"Conference","params":""}';
        //xmsys.info("发送数据：" + JSON.stringify(data))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "确认会议", "confirmConference", JSON.stringify(data))
        try {
            this.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "Conference",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };


    //询问座席
    gphone.prototype.consultAgent = function (params) {
        var _that = this,
            line = params.line || "",
            phoneNum = params.phoneNum || "";
        var number = line ? (line + "" + phoneNum) : phoneNum;
        data = '{"request":"ConsultAgent","params":"' + number + '"}';
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "询问座席", "consultAgent", data);
        try {
            _that.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        runData.HoldConnId = runData.ConnIdList[runData.ConnIdList.length - 1] || "";
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });

        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "consultAgent",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: number
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    }

    //完成座席会议转接（和询问座席接口一起）
    gphone.prototype.completeTransfer = function (params) {
        var _that = this,
            data = '{"request":"CompleteTransfer"}';
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "完成座席转接", "completeTransfer", data);
        try {
            _that.ws.send(data)
        } catch (ex) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.PhoneSendMsgWSSError.code,
                desc: xmsys.cfg.code.PhoneSendMsgWSSError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "Operation",
                action: "completeTransfer",
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                params: ""
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    };


    //振铃通知事件
    var ringing = function (obj) {
        //清除上一通电话产生的session
        xmsys.addCache(xmsys.cfg.CacheKey.TmpData.SessionId, "");
        //xmsys.info("ringing：" + JSON.stringify(obj))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "振铃消息", "ringing", JSON.stringify(obj))
        var callType = obj.CallDir.toLowerCase();

        //保存运行时参数
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        var phoneSessionInfo = {
            ani: obj.ANI,
            dnis: obj.DNIS,
            connId: obj.connid,
            callType: callType,
            callUuid: obj.CallUuid
        }
        if (runData) {
            runData.Channel = obj.channeltype.toLowerCase();
            runData.Ani = obj.ANI;
            runData.Dnis = obj.DNIS;
            runData.ConnId = obj.connid;
            runData.CallType = obj.CallDir.toLowerCase();
            runData.CallUuid = obj.CallUuid;
            runData.TransferConnId = obj.TransferConnID ? obj.TransferConnID : ""
            runData.RecordId = obj.CallUuid;

            if (runData.PhoneSessionList != null) {
                runData.PhoneSessionList.push(phoneSessionInfo)
            } else {
                runData.PhoneSessionList = [phoneSessionInfo]
            }
        } else {
            runData = {
                Channel: obj.channeltype.toLowerCase(),
                Ani: obj.ANI,
                Dnis: obj.DNIS,
                ConnId: obj.connid,
                CallType: obj.CallDir.toLowerCase(),
                CallUuid: obj.CallUuid,
                TransferConnID: obj.TransferConnID ? obj.TransferConnID : "",
                PhoneSessionList: [phoneSessionInfo],
                RecordId: obj.CallUuid
            };
        }
        runData.ConnIdList = runData.ConnIdList || [];
        runData.ConnIdList.push(obj.connid);
        xmsys.addCache(xmsys.cfg.CacheKey.RunData, runData);

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)

        var line = runData ? runData.Line : ""
        var callType = runData ? runData.CallType : ""
        var dnis = callType == xmsys.cfg.CallType.outbound ? obj.DNIS.replace(line, '') : obj.DNIS

        //如果时外呼过来需要查询外呼数据
        var taskDataid = obj.taskdataid;
        var taskInfo = {}
        var createSessionReq = {
            data: {
                session: {
                    ani: obj.ANI || "",
                    dnis: dnis || "",
                    ///1.电话 2.IM 3.离线留言 4.机器人应答 5.视频(目前只有电话和IM)
                    sessionType: xmsys.cfg.Channel.call == obj.channeltype.toLowerCase() ? "1" : "2",
                    agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                    agentGrpId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                    visitorId: "",
                    custId: "",
                    channel: xmsys.fun.parseChannel(obj.channeltype.toLowerCase()),
                    ccpStreamId: obj.CallUuid || "",
                    ccpConnId: (obj.connid || "").toUpperCase(),
                    ccpRecordId: obj.CallUuid,
                    //1:客户主动发起 2:客服主动发起
                    //当不是电话渠道时只能由客户发起，所以默认为1
                    mode: xmsys.cfg.Channel.call == obj.channeltype.toLowerCase() ? "2" : "1",
                    //1：接通 2：客户未接
                    result: "2",
                    outbound: (taskDataid && taskDataid != "") ? "1" : "0",
                    //1.震铃2.通话中3.通话结束
                    status: "1",
                    transferType: obj.TransferConnID ? 1 : 0,
                    obTaskId: "",
                    obTaskDataId: "",
                    direction: obj.InteractionType || obj.CallDir.toLowerCase() === "outbound" ? "2" : "1"
                }
            },
            callback: function (result, data) {
                if (result.code == xmsys.cfg.code.Success.code) {
                    xmsys.addCache(xmsys.cfg.CacheKey.TmpData.SessionId, data);
                }
                //xmsys.info("电话振铃创建会话：" + JSON.stringify(result))
                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话振铃创建会话", "ringing", JSON.stringify(result))
            }
        };
        if (taskDataid && taskDataid != "") {
            var searchTaskReq = {
                token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                data: {taskDataId: parseInt(taskDataid)},
                callback: function (result, data) {
                    if (data) {
                        taskInfo.TaskId = data.id;
                        taskInfo.TaskName = data.name;
                        taskInfo.TaskDataId = taskDataid;
                        createSessionReq.data.obTaskId = data.id;
                        createSessionReq.data.obTaskDataId = taskDataid;
                    }
                    //晓曼系统集成自己创建会话，sdk不需要创建
                    if (!xmsys.cfg.extOptions ||
                        xmsys.cfg.extOptions.IsCreateSession == null ||
                        xmsys.cfg.extOptions.IsCreateSession === '' ||
                        typeof(xmsys.cfg.extOptions.IsCreateSession) == "undefined" ||
                        xmsys.cfg.extOptions.IsCreateSession == true) {
                        xmsys.cssService.createSession(createSessionReq)
                    }

                    var resp = {
                        code: xmsys.cfg.code.Success.code,
                        desc: xmsys.cfg.code.Success.desc,
                        channel: obj.channeltype.toLowerCase(),
                        ani: obj.ANI,
                        dnis: dnis,
                        calltype: obj.CallDir.toLowerCase(),
                        connid: obj.connid,
                        taskinfo: taskInfo,
                        recordId: obj.CallUuid
                    };
                    if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
                        resp.OriginalData = jQuery.extend(true, {}, obj);
                    }
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Ringing, resp)
                    if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
                        xiaoman.im.sendMsg({
                            msgData: {
                                extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.Ringing},
                                body: JSON.stringify({
                                    channel: obj.channeltype.toLowerCase(),
                                    ani: obj.ANI,
                                    dnis: dnis,
                                    calltype: obj.CallDir.toLowerCase(),
                                    connid: obj.connid,
                                    taskinfo: taskInfo,
                                    recordId: obj.CallUuid
                                }),
                                to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                            }
                        })
                    }
                }
            }
            xmsys.outboundService.searchTaskByTaskDataId(searchTaskReq)
        } else {
            //晓曼系统集成自己创建会话，sdk不需要创建
            if (!xmsys.cfg.extOptions ||
                xmsys.cfg.extOptions.IsCreateSession == null ||
                xmsys.cfg.extOptions.IsCreateSession === '' ||
                typeof(xmsys.cfg.extOptions.IsCreateSession) == "undefined" ||
                xmsys.cfg.extOptions.IsCreateSession == true) {
                xmsys.cssService.createSession(createSessionReq)
            }

            var resp = {
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc,
                channel: obj.channeltype.toLowerCase(),
                ani: obj.ANI,
                dnis: dnis,
                calltype: obj.CallDir.toLowerCase(),
                connid: obj.connid,
                recordId: obj.CallUuid
            }
            if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
                resp.OriginalData = jQuery.extend(true, {}, obj);
            }
            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Ringing, resp)
            if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
                xiaoman.im.sendMsg({
                    msgData: {
                        extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.Ringing},
                        body: JSON.stringify({
                            channel: obj.channeltype.toLowerCase(),
                            ani: obj.ANI,
                            dnis: dnis,
                            calltype: obj.CallDir.toLowerCase(),
                            connid: obj.connid,
                            recordId: obj.CallUuid
                        }),
                        to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                    }
                })
            }
        }

        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "SessionEvent",
                action: obj.event,
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                direction: xmsys.cfg.CallType.outbound == obj.CallDir.toLowerCase() ? 2 : 1,
                transferType: obj.TransferConnID ? 1 : 0,
                ani: obj.ANI,
                dnis: obj.DNIS,
                ccpConnId: obj.connid,
                ccpRecordId: obj.CallUuid
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    }
    //电话接听通知事件
    var established = function (obj) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话接听通知事件消息", "established", JSON.stringify(obj))
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)

        if (runData.IsRecord) {
            xiaoman.phone.openRecord();
        }
        //xmsys.info("established：" + JSON.stringify(obj))
        var sessionId = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.SessionId)
        //晓曼系统集成自己创建会话，sdk不需要创建
        if (!xmsys.cfg.extOptions ||
            xmsys.cfg.extOptions.IsCreateSession == null ||
            xmsys.cfg.extOptions.IsCreateSession === '' ||
            typeof(xmsys.cfg.extOptions.IsCreateSession) == "undefined" ||
            xmsys.cfg.extOptions.IsCreateSession == true) {
            var updateSessionReq = {
                data: {
                    session: {
                        id: sessionId ? parseInt(sessionId) : 0,
                        visitorId: "",
                        custId: "",
                        ccpStreamId: obj.CallUuid || "",
                        ccpConnId: (obj.connid || "").toUpperCase(),
                        agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                        ccpRecordId: obj.CallUuid,
                        result: "1",
                        status: "2",
                        transferType: obj.TransferConnID ? 1 : 0
                    }
                },
                callback: function (result) {
                    //xmsys.info("电话接通更新会话：" + JSON.stringify(result))
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话接通更新会话", "established", JSON.stringify(result))
                }
            };
            xmsys.cssService.updateSession(updateSessionReq)
        }

        var line = runData ? runData.Line : ""
        var callType = runData ? runData.CallType : ""
        var dnis = callType == xmsys.cfg.CallType.outbound ? obj.DNIS.replace(line, '') : obj.DNIS
        var resp = {
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            ani: obj.ANI,
            dnis: dnis,
            connid: obj.connid,
            recordId: obj.CallUuid
        }
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
            resp.OriginalData = jQuery.extend(true, {}, obj);
        }
        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Established, resp)
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            xiaoman.im.sendMsg({
                msgData: {
                    extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.Established},
                    body: JSON.stringify({
                        ani: obj.ANI,
                        dnis: dnis,
                        connid: obj.connid,
                        recordId: obj.CallUuid
                    }),
                    to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                }
            })
        }
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "SessionEvent",
                action: obj.event,
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                direction: xmsys.cfg.CallType.outbound == xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).CallType ? 2 : 1,
                transferType: obj.TransferConnID ? 1 : 0,
                ani: obj.ANI,
                dnis: obj.DNIS,
                ccpConnId: obj.connid,
                ccpRecordId: obj.CallUuid
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    }
    //电话挂断通知事件
    var released = function (obj) {
        //xmsys.info("released：" + JSON.stringify(obj))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话挂断通知事件消息", "released", JSON.stringify(obj))

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        if (runData) {
            runData.RecordId = obj.CallUuid;
            runData.TransferConnId = obj.TransferConnID ? obj.TransferConnID : ""
        } else {
            runData = {
                Channel: obj.channeltype.toLowerCase(),
                Ani: obj.ANI,
                Dnis: obj.DNIS,
                ConnId: obj.connid,
                CallUuid: obj.CallUuid,
                RecordId: obj.CallUuid,
                TransferConnID: obj.TransferConnID ? obj.TransferConnID : ""
            };
        }
        runData.ConnIdList.splice(runData.ConnIdList.indexOf(obj.connid), 1);
        xmsys.addCache(xmsys.cfg.CacheKey.RunData, runData);
        var sessionId = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.SessionId)
        //晓曼系统集成自己创建会话，sdk不需要创建
        if (!xmsys.cfg.extOptions ||
            xmsys.cfg.extOptions.IsCreateSession == null ||
            xmsys.cfg.extOptions.IsCreateSession === '' ||
            typeof(xmsys.cfg.extOptions.IsCreateSession) == "undefined" ||
            xmsys.cfg.extOptions.IsCreateSession == true) {
            var updateSessionReq = {
                data: {
                    session: {
                        id: sessionId ? parseInt(sessionId) : 0,
                        visitorId: "",
                        custId: "",
                        ccpStreamId: obj.CallUuid || "",
                        ccpConnId: (obj.connid || "").toUpperCase(),
                        agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                        ccpRecordId: obj.CallUuid,
                        status: "3",
                        transferType: obj.TransferConnID ? 1 : 0
                    }
                },
                callback: function (result) {
                    // xmsys.info("电话结束更新会话：" + JSON.stringify(result))
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "电话结束更新会话", "released", JSON.stringify(result))
                }
            };
            xmsys.cssService.updateSession(updateSessionReq)
        }
        var line = runData ? runData.Line : ""
        var callType = runData ? runData.CallType : ""
        var dnis = callType == xmsys.cfg.CallType.outbound ? obj.DNIS.replace(line, '') : obj.DNIS
        var resp = {
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            channel: obj.channeltype.toLowerCase(),
            ani: obj.ANI,
            dnis: dnis,
            connid: obj.connid,
            recordId: obj.CallUuid
        }
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
            resp.OriginalData = jQuery.extend(true, {}, obj);
        }
        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Released, resp);
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            xiaoman.im.sendMsg({
                msgData: {
                    extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.Released},
                    body: JSON.stringify({
                        channel: obj.channeltype.toLowerCase(),
                        ani: obj.ANI,
                        dnis: dnis,
                        connid: obj.connid,
                        recordId: obj.CallUuid
                    }),
                    to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                }
            })
        }
        //记录电话日志
        var phoneLogReq = {
            token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
            data: {
                type: "SessionEvent",
                action: obj.event,
                groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                direction: xmsys.cfg.CallType.outbound == xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).CallType ? 2 : 1,
                transferType: obj.TransferConnID ? 1 : 0,
                ani: obj.ANI,
                dnis: obj.DNIS,
                ccpConnId: obj.connid,
                ccpRecordId: obj.CallUuid
            }
        };
        xmsys.yungoService.phonePluginLog(phoneLogReq);
    }
    //座席状态改变通知事件
    var agentStateChange = function (obj) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone, "座席状态改变通知事件", "agentStateChange", JSON.stringify(obj))
        var runDate = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        if (runDate) {
            runDate.AgentState = obj.state.toLowerCase();
        } else {
            runDate = {
                AgentState: obj.state.toLowerCase()
            }
            xmsys.addCache(xmsys.cfg.CacheKey.RunData, runDate);
        }

        var resp = {
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc,
            state: obj.state.toLowerCase()
        }
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
            resp.OriginalData = jQuery.extend(true, {}, obj);
        }
        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_AgentStateChange, resp)
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            xiaoman.im.sendMsg({
                msgData: {
                    extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.AgentState},
                    body: JSON.stringify({state: resp.state}),
                    to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                }
            })
        }

        if (xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)) {
            var phoneLogReq = {
                token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                data: {
                    type: "StateEvent",
                    action: "EventStateChanged",
                    groupId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).group.id,
                    agentId: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.id,
                    agentLoginCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.loginCode,
                    agentDnCode: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).extentInfo.placeCode,
                    state: obj.state.toLowerCase()
                }
            };
            xmsys.yungoService.phonePluginLog(phoneLogReq);
        }
    }


    //事件注入
    //振铃事件
    event.ringing = function (callback) {
        if (callback) {
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_Ringing, false, callback);
        }
    };
    //电话接通
    event.established = function (callback) {
        if (callback) {
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_Established, false, callback);
        }
    };
    //电话挂断
    event.released = function (callback) {
        if (callback) {
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_Released, false, callback);
        }
    };
    //状态通知
    event.agentStateChange = function (callback) {
        if (callback) {
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_AgentStateChange, false, callback);
        }
    };
    event.onMessage = function (callback) {
        //订阅消息接收
        if (callback)
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, false, callback);
    }
    exports('phone', 'gphone', new gphone());
});