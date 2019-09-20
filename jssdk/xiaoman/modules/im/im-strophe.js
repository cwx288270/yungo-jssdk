/**
 * Created by xxqin on 2016/11/29.
 * 基于IM的在线消息
 */
xmsys.define(function (exports) {
    var connection = null;
    var agentStates = {
        ready: 2,
        notready: 3
    };
    var event = {};
    var stropheIM = function () {
        this.event = event
        this.connection = connection;
        this.AgentStates = agentStates;
    };
    var imOptinos = {
        from: null,//帐号
        password: null,//密码
        Server: xmsys.cfg.StorpheIMConfig.Server,//IM网关地址
        Robot: xmsys.cfg.StorpheIMConfig.Robot,//机器人帐号
        Xiaoman: xmsys.cfg.StorpheIMConfig.Xiaoman,
        CalendarMaxDate: xmsys.cfg.StorpheIMConfig.CalendarMaxDate,//最大时间
        WebSessionTimeOut: xmsys.cfg.StorpheIMConfig.WebSessionTimeOut//web端session超时控制
    }
    var StateMapping = [
        "ERROR",//错误
        "CONNECTING",//正在创建连接
        "CONNFAIL",//连接创建失败
        "AUTHENTICATING",//正在验证
        "AUTHFAIL",//验证失败
        "CONNECTED",//连接创建成功
        "DISCONNECTED",//连接已关闭
        "DISCONNECTING",//连接正在关闭
        "ATTACHED",
        "REDIRECT",
        "CONNTIMEOUT"]

    var setIntervalId = 0;
    stropheIM.prototype.open = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        //根据不同类型创建不同账号，默认和登录账号一致
        if (params.openType == xmsys.cfg.IM.OpenType.NotifySender) {
            imOptinos.from = userInfo.user.account + "-" + xmsys.cfg.IM.MessageSenderAccountSuffix + xmsys.cfg.StorpheIMConfig.Suffix;
        } else if (params.openType == xmsys.cfg.IM.OpenType.NotifyReceiver) {
            imOptinos.from = userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix + xmsys.cfg.StorpheIMConfig.Suffix;
        } else if (params.openType == xmsys.cfg.IM.OpenType.Client) {
            if (!params || !params.account || params.account == "") {
                imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
            } else {
                imOptinos.from = params.account + xmsys.cfg.StorpheIMConfig.Suffix;
            }
        } else {
            imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        }
        xmsys.addCache(xmsys.cfg.IM.SendMsgAccount, imOptinos.from);
        imOptinos.password = userInfo.token;
        //创建连接
        connection = new Strophe.Connection(imOptinos.Server, {withCredentials: false}, false);
        connection.connect(imOptinos.from, imOptinos.password, function (status) {
            console.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "连接状态", "ConnectStatus", StateMapping[status])
            var eventName = StateMapping[status];
            //触发状态通知事件
            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.State.OnChange, {
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc,
                state: eventName
            });
            if (status == Strophe.Status.CONNECTED) {
                //当启动类型为消息发送者或者为消息接收者时需要进行掉线检测，如果掉线需要重新连接。防止掉线后消息无法送达或者接收
                if (params.openType == xmsys.cfg.IM.OpenType.NotifySender || params.openType == xmsys.cfg.IM.OpenType.NotifyReceiver) {
                    clearInterval(setIntervalId);
                    setIntervalId = setInterval(function () {
                        if (!connection || !connection.connected) {
                            console.info("IM->连接已断开,正在尝试重新连接.....");
                            xiaoman.im.open(params);
                        } else {
                            console.info("IM->连接检测,当前连接状态正常......");
                        }
                    }, xmsys.cfg.StorpheIMConfig.ReConnectInterval);
                }

                params && params.success && params.success({
                    code: xmsys.cfg.code.Success.code,
                    desc: xmsys.cfg.code.Success.desc
                });
                connection.send($pres());
                connection.addHandler(function (iq) {
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "iq原始消息", "iq", iq.outerHTML)
                    try {
                        var respType = $(iq).find("query").attr("xmlns").split("jabber:iq:")[1];
                        //触发消息通知事件
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.IQ.Result, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            respType: respType
                        });
                    } catch (err) {
                        xiaoman.error(err);
                    }
                    return true;
                }, null, 'iq', 'result');
                connection.addHandler(function (msg) {
                    try {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "message原始消息", "iq", msg.outerHTML)
                        var from = $(msg).attr('from');
                        var fromType = $(msg).find('fromType').text();
                        from = from.substring(0, from.indexOf('/'))
                        //如果是实时语音聊转写则推送到电话消息推送接口
                        var parsResult = {};
                        //实时语音流转写消息
                        if (fromType == xmsys.cfg.IM.FromType.Translate) {
                            var translateType = $(msg).find('translateType').text();
                            //只推送转写结果
                            if (xmsys.cfg.IM.TranslateType.Text == translateType) {
                                parsResult = xmsys.imService.parseTranslateMsg(msg);
                            } else {
                                parsResult = xmsys.imService.parseTranslateTag(msg);
                            }
                            //关键词匹配暂不推送
                        } else {
                            parsResult = xmsys.imService.parseChatMsg(msg);
                        }
                        //触发消息通知事件
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.Message.Receive, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            notifyType: parsResult.notifyType,
                            notifyContent: parsResult.body
                        });
                    }
                    catch (err) {
                        xmsys.error(err)
                    }
                    return true;
                }, null, 'message', null, null, null);
                connection.addHandler(function (presence) {
                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "presence原始消息", "presence", presence.outerHTML)
                    var type = presence.getAttribute("type");
                    var from = $(presence).attr('from');
                    var to = $(presence).attr('to');
                    if (type == "subscribe") {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "subscribe原始消息", "subscribe", presence.outerHTML)
                        //回复已订阅
                        var _press = $pres({
                            from: to,
                            to: from,
                            type: "subscribed"
                        });
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "回复已订阅", "subscribed", _press.toString())
                        connection.send(_press);
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Subscribe, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            msg: presence,
                            data : xmsys.imService.parsePresence(presence)
                        });
                    }else if (type == "unsubscribe") {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "收到取消订阅消息", "unsubscribe", presence.outerHTML)
                        //回复取消订阅
                        var _replyPress = $pres({
                            from: to,
                            to: from,
                            type: "unsubscribed"
                        });
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "回复取消订阅", "unsubscribed", _replyPress.toString())
                        connection.send(_replyPress);
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.Presence.UnSubscribed, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            msg: presence,
                            data : xmsys.imService.parsePresence(presence)
                        });
                    } else if (type == "subscribed") {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "收到回复已订阅", "subscribed", presence.outerHTML)
                    } else if (type == "unsubscribed") {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "收到回复取消订阅", "unsubscribed", presence.outerHTML)
                    }else if(type == "unavailable"){
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "收到离线通知", "unavailable", presence.outerHTML)
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Unavailable, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            msg: presence,
                            data : xmsys.imService.parsePresence(presence)
                        });
                    }else {
                        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_IM, xmsys.cfg.LogLevel.Info, "未识别的消息", "presence", presence.outerHTML)
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Presence, {
                            code: xmsys.cfg.code.Success.code,
                            desc: xmsys.cfg.code.Success.desc,
                            msg: presence,
                            data : xmsys.imService.parsePresence(presence)
                        });
                    }
                    return true;
                }, null, "presence");
            }
        });

    };
    stropheIM.prototype.close = function (params) {
        clearInterval(setIntervalId);
        if (connection && connection.connected) {
            connection.disconnect()
        }
        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
    }
    stropheIM.prototype.send = function (msg) {
        console.log("xiaoman.im.send:" + msg.toString());
        if (connection && connection.connected) {
            connection.send(msg.tree());
            return true;
        } else {
            console.log("连接已断开无法发送消息.....");
            return false;
        }
    };
    stropheIM.prototype.sendMsg = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = xmsys.cache[xmsys.cfg.IM.SendMsgAccount];
        imOptinos.password = userInfo.token;

        var message = $msg({
            to: params.msgData.to + xmsys.cfg.StorpheIMConfig.Suffix,
            from: imOptinos.from,
            type: 'chat'
        });
        message.c("body", null, params.msgData.body)
            .c("msgType", null, params.msgData.type || "text")
            .c("channelKey", null, "")
            .c("sessionId", null, "")
            .c("channel", null, "webchat")
            .c("fromType", null, params.msgData.fromType || "agent")
            .c("toType", null, params.msgData.toType || "client")
            .c("style", null, params.msgData.style || " ")
        if (params.msgData.extendAttributes) {
            for (var a in params.msgData.extendAttributes) {
                message.c(a, null, params.msgData.extendAttributes[a]);
            }
        }
        var isSuccess = xiaoman.im.send(message);
        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };
    stropheIM.prototype.request = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var req = $iq({
            to: params.To,
            from: imOptinos.from,
            type: 'get'
        }).c("body", null, content);
        var isSuccess = xiaoman.im.send(req);
        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };
    stropheIM.prototype.presence = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var presence = $pres({
            from: imOptinos.from,
            to: params.toUser,
            sessionId: params.sessionId
        }).c('show').t(params.status);
        var isSuccess = xiaoman.im.send(presence)

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };
    stropheIM.prototype.subscribe = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var subscribe = $pres({
            from: imOptinos.from,
            to: params.toUser + xmsys.cfg.StorpheIMConfig.Suffix,
            sessionId: params.sessionId,
            type: "subscribe"
        });
        var isSuccess = xiaoman.im.send(subscribe);

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };
    stropheIM.prototype.unSubscribe = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var subscribe = $pres({
            from: imOptinos.from,
            to: params.toUser + xmsys.cfg.StorpheIMConfig.Suffix,
            sessionId: params.sessionId,
            type: "unsubscribe"
        });
        var isSuccess = xiaoman.im.send(subscribe);

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };

    stropheIM.prototype.available = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var available = $pres({
            from: imOptinos.from,
            to: params.toUser + xmsys.cfg.StorpheIMConfig.Suffix,
            sessionId: params.sessionId,
            type: "available"
        });
        var isSuccess = xiaoman.im.send(available);

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };

    stropheIM.prototype.unavailable = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //获取登录信息
        var userInfo = xmsys.cache[xmsys.cfg.CacheKey.UserInfo]
        imOptinos.from = userInfo.user.account + xmsys.cfg.StorpheIMConfig.Suffix;
        imOptinos.password = userInfo.token;

        var unavailable = $pres({
            from: imOptinos.from,
            to: params.toUser + xmsys.cfg.StorpheIMConfig.Suffix,
            sessionId: params.sessionId,
            type: "unavailable"
        });
        var isSuccess = xiaoman.im.send(unavailable);

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    };

    //状态设置
    stropheIM.prototype.setAgentState = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.code.AuthCheckError.code,
                desc: xmsys.cfg.code.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.state || params.state == "") {
            xmsys.error("im.setAgentState->调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }
        var $ready = $pres({from: imOptinos.from, to: imOptinos.Xiaoman}).c('show').t(this.AgentStates[params.state]);
        var isSuccess = xiaoman.im.send($ready);

        if (isSuccess) {
            params && params.success && params.success({
                code: xmsys.cfg.code.Success.code,
                desc: xmsys.cfg.code.Success.desc
            });
        } else {
            params && params.success && params.success({
                code: xmsys.cfg.code.IMDisconnected.code,
                desc: xmsys.cfg.code.IMDisconnected.desc
            });
        }
    }
    //事件
    event.message = {
        receive: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.Message.Receive, false, callback);
            }
        }
    };
    event.presence = {
        presence: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Presence, false, callback);
            }
        },
        subscribe: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Subscribe, false, callback);
            }
        },
        unSubscribed: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.Presence.UnSubscribed, false, callback);
            }
        },
        unavailable : function(callback){
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.Presence.Unavailable, false, callback);
            }
        }
    };
    event.state = {
        onChange: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.State.OnChange, false, callback);
            }
        }
    };
    event.iq = {
        result: function (callback) {
            if (callback) {
                xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.IM.IQ.Result, false, callback);
            }
        }
    };


    exports('im', 'stropheim', new stropheIM());
});