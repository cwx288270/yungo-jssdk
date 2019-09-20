/**
 * Created by xxqin on 2016/11/28.
 * 模块 kphone
 */
xmsys.define(function (exports) {
    var kphone = function () {
        this.connection = null;
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
    var genMsg = function (jsonMsg) {
        //判断resource是否配置了，如果配置了则在登录是需要带上
        var resource = xmsys.cfg.GenesysProxyIMConfig.Resource == null ? "" : xmsys.cfg.GenesysProxyIMConfig.Resource;
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var from = "tsc-" + userInfo.extentInfo.placeCode + xmsys.cfg.GenesysProxyIMConfig.ServerName + resource;
        var message = $msg({
            to: xmsys.cfg.GenesysProxyIMConfig.userName + xmsys.cfg.GenesysProxyIMConfig.ServerName,
            from: from,
            type: 'chat'
        });
        jsonMsg.ua = navigator.userAgent;
        jsonMsg.account = userInfo.user.account;
        jsonMsg.businessId = userInfo.enterprise.id;
        jsonMsg.businessName = userInfo.enterprise.name;
        jsonMsg.fingerPrint = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint)
        message.c("body", null, JSON.stringify(jsonMsg))
            .c("fromType", null, "client")
            .c("toType", null, "phoneProxyIM")
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "向TServerProxyIM发送消息内容", "genMsg", message.toString())
        return message;
    }
    var genCommMsg = function (from, to, jsonMsg) {
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var message = $msg({
            to: to,
            from: from,
            type: 'chat'
        });
        jsonMsg.ua = navigator.userAgent;
        jsonMsg.account = userInfo.user.account;
        jsonMsg.businessId = userInfo.enterprise.id;
        jsonMsg.businessName = userInfo.enterprise.name;
        jsonMsg.fingerPrint = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint)
        message.c("body", null, JSON.stringify(jsonMsg))
            .c("fromType", null, "client")
            .c("toType", null, "phoneProxyIM")
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "发送的IM消息", "genCommMsg", message.toString())
        return message;
    }
    var genSipClientMsg = function (jsonMsg) {
        //判断resource是否配置了，如果配置了则在登录是需要带上
        var resource = xmsys.cfg.GenesysProxyIMConfig.Resource == null ? "" : xmsys.cfg.GenesysProxyIMConfig.Resource;
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var from = "tsc-" + userInfo.extentInfo.placeCode + xmsys.cfg.GenesysProxyIMConfig.ServerName + resource;
        var message = $msg({
            to: xmsys.cfg.SipClientConfig.IM.userNamePrefix + userInfo.extentInfo.placeCode + xmsys.cfg.SipClientConfig.IM.ServerName + xmsys.cfg.SipClientConfig.IM.Resource,
            from: from,
            type: 'chat'
        });
        jsonMsg.origin = "tsclient";
        jsonMsg.sender = from;
        jsonMsg.fingerPrint = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint)
        message.c("body", null, JSON.stringify(jsonMsg))
            .c("fromType", null, "client")
            .c("toType", null, "SipClient")
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "向SIPClient(iphonex)客户端发送消息内容", "genSipClientMsg", message.toString())
        return message;
    }

    //启动电话
    var setIntervalId = 0;
    kphone.prototype.open = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "启动电话服务", "open", "调用失败，原因:" + xmsys.cfg.newcode.AuthCheckError.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //如果信令服务已启动则返回错误，不允许重复启动
        if (xiaoman.phone.connection != null && xiaoman.phone.connection.connected) {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "启动电话服务", "open", "调用失败，原因:" + xmsys.cfg.newcode.PhoneIsConnected.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.PhoneIsConnected.code,
                desc: xmsys.cfg.newcode.PhoneIsConnected.desc
            });
            return;
        }

        xmsys.removeAllSessionDataExceptUserInfo();

        //获取登录信息
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);

        handlerOpen();

        function handlerOpen() {
            //订阅软电话启动结果
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Open, true, function (data) {
                if (data.code === xmsys.cfg.newcode.Success.code || data.code === xmsys.cfg.SipClientCode.ProcessExists.code) {
                    params && params.success && params.success(data);
                } else {
                    xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "启动电话服务失败", "open", data)
                    clearInterval(setIntervalId);
                    if (xiaoman.phone.connection && xiaoman.phone.connection.connected) {
                        xiaoman.phone.connection.disconnect();
                        xiaoman.phone.connection = null;
                    } else {
                        xiaoman.phone.connection = null;
                    }

                    xmsys.removeSessionData(xmsys.cfg.CacheKey.TmpData.IsStartSipClient);
                    params && params.fail && params.fail(data);
                }

            });

            //是否开启电话消息实时推送,如启动则需要启动一个im发送服务
            /*if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            }*/

            //创建连接
            if (xiaoman.phone.connection == null) {
                xiaoman.phone.connection = new Strophe.Connection(xmsys.cfg.GenesysProxyIMConfig.Server, {withCredentials: false}, false);
            }

            //判断resource是否配置了，如果配置了则在登录是需要带上
            var resource = xmsys.cfg.GenesysProxyIMConfig.Resource == null ? "" : xmsys.cfg.GenesysProxyIMConfig.Resource;
            var tscFrom = "tsc-" + userInfo.extentInfo.placeCode + xmsys.cfg.GenesysProxyIMConfig.ServerName + resource;
            xiaoman.phone.connection.connect(tscFrom, xmsys.cfg.GenesysProxyIMConfig.password, function (status, condition) {
                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "TServer IM连接状态", "ConnectInfo", "状态：" + xmsys.cfg.IM.StateMapping[status] + ",信息：" + (condition ? condition : ""));
                try {

                    if (status == Strophe.Status.CONNECTED) {
                        clearInterval(setIntervalId);
                        var times = 0;

                        //连接断开检测
                        setIntervalId = setInterval(function () {
                            if (xiaoman.phone.connection == null || !xiaoman.phone.connection.connected) {
                                xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "信令服务已断开,正在尝试重新连接", "CheckConnect");
                                xiaoman.phone.open(params);
                            } else {
                                if (times >= 5) {
                                    times = 0
                                    xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone,
                                        "信令服务连接检测,当前连接状态正常，检查间隔(" + xmsys.cfg.GenesysProxyIMConfig.ReConnectInterval / 1000 + "秒)", "CheckConnect");
                                }
                                times++;
                            }
                        }, xmsys.cfg.GenesysProxyIMConfig.ReConnectInterval);

                        this.send($pres());
                        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
                        this.addHandler(function (msg) {
                            handlerTSCMsg(msg, params);
                            return true;
                        }, null, 'message', null, null, null);

                        //判断是否拉起本地客户端，默认拉起
                        if (params.isStartXphone == null || params.isStartXphone === true || params.isStartXphone === "") {
                            setTimeout(function () {
                                var phoneIsStart = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.PhoneIsStart)
                                if (phoneIsStart == null || phoneIsStart === "") {
                                    var sipClientIsConflict = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.SIPClientIsConflict);
                                    if (sipClientIsConflict) {
                                        startXphone();
                                    } else {
                                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                            code: xmsys.cfg.newcode.PhoneOpenException.code,
                                            desc: xmsys.cfg.newcode.PhoneOpenException.desc,
                                            isLogin: false
                                        });
                                    }
                                }
                            }, xmsys.cfg.WaitPhoneStartTime);
                            //判断sip客户端是否启动
                            var querySipClientStatus = {
                                data: {account: xmsys.cfg.SipClientConfig.IM.userNamePrefix + userInfo.extentInfo.placeCode},
                                token: userInfo.token,
                                callback: function (queryRes, data) {
                                    if (queryRes.code == xmsys.cfg.code.Success.code && data) {
                                        var sipStatus = data && data.result && data.result.rows && data.result.rows.length > 0 ? data.result.rows[0].status : 0;
                                        if (sipStatus != 1) {
                                            startXphone();
                                        } else {
                                            handlerSIPConflict();
                                        }
                                    }
                                }
                            };
                            xmsys.amService.queryIMAccountStatus(querySipClientStatus);


                        } else {
                            //若不自动启动电话客户端则直接注册分机（默认认为软电话已经启动成功）
                            var msg = {
                                requestType: "RegisterDN",
                                businessId: userInfo.enterprise.id,
                                channelCode: 1,
                                agentId: userInfo.extentInfo.loginCode,
                                thisDn: userInfo.extentInfo.placeCode
                            }

                            var message = genMsg(msg);

                            xiaoman.phone.connection.send(message);
                        }
                    } else if (condition === 'conflict') {
                        handlerTSCConflict();
                    }
                }
                catch (e) {
                    xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "启动信令服务", "Open", e);
                    clearInterval(setIntervalId);
                    xiaoman.phone.connection.disconnect();
                    xiaoman.phone.connection = null;
                }
            });
        }

        function handlerSIPConflict() {
            xmsys.addCache(xmsys.cfg.CacheKey.TmpData.SIPClientIsConflict, true)
            var sipClientGetHostInfo = {
                key: xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint),
                type: "host_info"
            }
            var sipClientGetHostInfoMsg = genSipClientMsg(sipClientGetHostInfo);
            xiaoman.phone.connection.send(sipClientGetHostInfoMsg);
        }

        function handlerTSCConflict() {
            clearInterval(setIntervalId);
            xmsys.warn(xmsys.cfg.ModuleName.Xiaoman_Phone, "您的帐号已在其他设备登录，您将下线", xmsys.cfg.SysEventType.EventOtherDeviceLogin, "");
            if (xiaoman.phone.connection && xiaoman.phone.connection.connected) {
                xiaoman.phone.connection.disconnect();
                xiaoman.phone.connection = null;
            } else {
                xiaoman.phone.connection = null;
            }
            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                msgType: xmsys.cfg.SysEventType.EventKillTSClient,
                desc: "您的帐号在其他设备登录，已强制您下线"
            });
        }

        function handlerTSCMsg(msg, reqParams) {
            var from = $(msg).attr("from");
            xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "收到来自【" + from + "】的消息", "message", msg.outerHTML)
            var result = {};
            var strMsg = $(msg).find("body").text();
            var msgObj = {};
            if (strMsg != null && strMsg != "") {
                msgObj = JSON.parse(strMsg);
            }
            //目前消息来源有2个渠道，一个是TServer代理另一个是SIP客户端
            if (msgObj.origin == xmsys.cfg.MsgOrigin.SipClient || from.indexOf(xmsys.cfg.MsgOrigin.SipClient) > -1) {
                result = xmsys.imService.parseSipClientMsg(msg);
                result.origin = xmsys.cfg.MsgOrigin.SipClient
            } else {
                result = xmsys.imService.parseGenesysProxyMsg(msg);
            }

            if (result.origin == xmsys.cfg.MsgOrigin.UserRequest) {
                handlerUserRequest(result, reqParams);
            } else if (result.origin && result.origin.toLowerCase() == xmsys.cfg.MsgOrigin.SipClient) {
                handlerSipClient(result, reqParams);
            }
            else {
                handlerDefault(result, reqParams);
            }
        }

        function startXphone() {
            //信令服务已启动，客户端未启动。则启动客户端。
            var utl2 = "iphonex://fun=start&dn="
                + userInfo.extentInfo.placeCode
                + "&agent=" + userInfo.extentInfo.loginCode
                + "&key=" + xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint)
                + "&imserver=" + xmsys.cfg.SipClientConfig.IM.Server
                + "&import=" + xmsys.cfg.SipClientConfig.IM.Port
                + "&sipserver=" + xmsys.cfg.SipClientConfig.SIP.Server
            console.log(utl2)
            $("body").append("<iframe id='xphoneclient' width='0' height='0' src='" + utl2 + "'></iframe>");
        }

        function registerDn() {
            //如果电话服务已经启动，则直接注册分机
            var msg = {
                requestType: "RegisterDN",
                businessId: userInfo.enterprise.id,
                channelCode: 1,
                agentId: userInfo.extentInfo.loginCode,
                thisDn: userInfo.extentInfo.placeCode
            }

            var message = genMsg(msg);

            xiaoman.phone.connection.send(message);
        }

        //处理来自用户请求，响应消息
        function handlerUserRequest(result, reqParams) {
            //来自用户请求消息
            switch (result.msgType) {
                case xmsys.cfg.GenesysRequestType.RegisterDN:
                    xmsys.addCache(xmsys.cfg.CacheKey.TmpData.PhoneIsStart, true);
                    var isLogin = result.agentStatus && result.agentStatus != agentStates.logout;
                    if (reqParams.isStartXphone == null || reqParams.isStartXphone === true || reqParams.isStartXphone === "") {
                        var isStartSipClient = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient);
                        var startSipResult = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.StartSipClientResult);
                        if (isStartSipClient || (startSipResult != null && startSipResult.code == xmsys.cfg.SipClientCode.Success.code)) {
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                code: xmsys.cfg.newcode.Success.code,
                                desc: xmsys.cfg.newcode.Success.desc,
                                hostInfo: startSipResult && startSipResult.hostinfo && startSipResult.hostinfo != "" && startSipResult.hostinfo != "None" ? JSON.parse(startSipResult.hostinfo) : {},
                                version: startSipResult && startSipResult.version ? startSipResult.version : "",
                                isLogin: isLogin
                            });
                        } else {
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                code: xmsys.cfg.newcode.PhoneOpenException.code,
                                desc: xmsys.cfg.newcode.PhoneOpenException.desc,
                                isLogin: false
                            });
                        }
                    } else {
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                            code: xmsys.cfg.newcode.Success.code,
                            desc: xmsys.cfg.newcode.Success.desc,
                            isLogin: isLogin
                        });
                    }

                    break;
                case xmsys.cfg.GenesysRequestType.AgentLogin:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Login, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.AgentLogout:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Logout, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.MakeCall:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_MakeCall, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.AnswerCall:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_AnswerCall, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.ReleaseCall:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_ReleaseCall, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.SetAgentState:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_SetAgentState, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.HoldCall:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_HoldCall, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.RetrieveCall:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_RetrieveCall, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.SingleStepConference:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_SingleStepConference, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.GenesysRequestType.DeleteFromConference:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_DeleteFromConference, {
                        code: result.code,
                        desc: result.desc
                    });
                    break;
                case xmsys.cfg.SysRequestType.CheckSIPClientUpdate:

                    var resp = result.updateInfo;
                    resp.code = xmsys.cfg.newcode.Success.code;
                    resp.desc = xmsys.cfg.newcode.Success.desc;
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_CheckPhoneVersion, resp);
                    break;
                case xmsys.cfg.GenesysRequestType.OpRecord:
                    var method = "";
                    if (result.opType == 3013) {
                        method = xmsys.cfg.CacheKey.ObserveType.Method_OpenRecord;
                    } else if (result.opType == 3014) {
                        method = xmsys.cfg.CacheKey.ObserveType.Method_CloseRecord
                    } else if (result.opType == 3015) {
                        method = xmsys.cfg.CacheKey.ObserveType.Method_PauseRecord
                    }
                    else if (result.opType == 3016) {
                        method = xmsys.cfg.CacheKey.ObserveType.Method_ResumeRecord
                    }
                    if (method != null && method != "") {
                        xmsys.observe.trigger(method, {
                            code: result.code,
                            desc: result.desc
                        });
                    }
                    break;
            }
        }

        //处理来自sip客户端消息
        function handlerSipClient(result, reqParams) {
            switch (result.msgType) {
                case xmsys.cfg.SipClientMsgType.Response.StartResult:
                    if (result.code == xmsys.cfg.SipClientCode.Success.code) {
                        xmsys.addCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient, true);
                        //获取登录信息
                        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
                        var msg = {
                            requestType: "RegisterDN",
                            businessId: userInfo.enterprise.id,
                            channelCode: 1,
                            agentId: userInfo.extentInfo.loginCode,
                            thisDn: userInfo.extentInfo.placeCode
                        }

                        var message = genMsg(msg);
                        xiaoman.phone.connection.send(message);
                    } else {
                        xiaoman.phone.connection.disconnect();
                        xiaoman.phone.connection = null;
                        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                            code: result.code == xmsys.cfg.SipClientCode.Success.code ? xmsys.cfg.newcode.Success.code : result.code,
                            desc: result.code == xmsys.cfg.SipClientCode.Success.code ? xmsys.cfg.newcode.Success.desc : result.desc,
                            version: result.version,
                            hostInfo: result.hostinfo && result.hostinfo != "" && result.hostinfo != "None" ? JSON.parse(result.hostinfo) : {}
                        });
                    }
                    xmsys.addCache(xmsys.cfg.CacheKey.TmpData.StartSipClientResult, result);
                    break;
                case xmsys.cfg.SipClientMsgType.Response.QuitResult:
                    //如果是客户端冲突触发的退出，在其他客户端退出后需要启动本地客户端
                    var sipClientIsConflict = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.SIPClientIsConflict);
                    if (sipClientIsConflict) {
                        if (result.code === xmsys.cfg.SipClientCode.Success.code) {
                            setTimeout(function () {
                                startXphone();
                            }, 2000)
                            xmsys.removeSessionData(xmsys.cfg.CacheKey.TmpData.SIPClientIsConflict);
                        } else {
                            xmsys.removeAllSessionDataExceptUserInfo();
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Open, {
                                code: xmsys.cfg.newcode.PhoneOpenConflictAndNotCloseConflictClient.code,
                                desc: xmsys.cfg.newcode.PhoneOpenConflictAndNotCloseConflictClient.desc + "，原因：" + result.desc,
                                isLogin: false
                            });
                        }
                    }
                    break;
                case xmsys.cfg.SipClientMsgType.Response.GetHostInfoResult:
                    //判断获取hostinfo是否为查询到客户端已启动触发的
                    var sipClientIsConflict = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.SIPClientIsConflict);
                    if (sipClientIsConflict) {
                        var startKey = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint);
                        if (startKey === result.key) {
                            xmsys.addCache(xmsys.cfg.CacheKey.TmpData.StartSipClientResult, result);
                            xmsys.addCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient, true);
                            registerDn();
                        } else {
                            var sipClientQuit = {
                                key: result.key,
                                type: "quit"
                            }
                            var message = genSipClientMsg(sipClientQuit);
                            xiaoman.phone.connection.send(message);
                        }

                    }
                    console.log(result);
            }
        }

        //处理默认消息
        function handlerDefault(result, reqParams) {
            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, result);
            switch (result.msgType) {
                case xmsys.cfg.GenesysEventType.EventAgentState:
                    agentStateChange({state: result.state});
                    break;
                case xmsys.cfg.GenesysEventType.EventError:
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Error, {
                        code: result.code,
                        desc: result.desc,
                        genesysErrorCode: result.genesysErrorCode,
                        genesysErrorMsg: result.genesysErrorMsg,
                        msgType: result.msgType
                    });
                    break;
                case xmsys.cfg.GenesysEventType.EventDialing:
                    ringing(result);
                    break;
                case xmsys.cfg.GenesysEventType.EventEstablished:
                    established(result);
                    break;
                case xmsys.cfg.GenesysEventType.EventReleased:
                    released(result);
                    break;
                case xmsys.cfg.GenesysEventType.EventAbandoned:
                    released(result);
                    break;
                case xmsys.cfg.GenesysEventType.EventRinging:
                    ringing(result);
                    break;
                case xmsys.cfg.GenesysEventType.EventDNBackInService:
                    var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
                    xiaoman.phone.login({
                        token: userInfo.token,
                        success: function (loginSuccess) {
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_DnStateChange, {
                                state: "online",
                                notifyType: result.msgType
                            });
                        }, fail: function (loginFail) {
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_DnStateChange, {
                                state: "offline",
                                notifyType: result.msgType
                            });
                        }
                    });

                    break;
                case xmsys.cfg.GenesysEventType.EventDNOutOfService:
                    var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_DnStateChange, {
                        state: "offline",
                        msgType: result.msgType
                    });
                    break;
                case xmsys.cfg.SysEventType.EventKillTSClient:
                    xiaoman.phone.close({
                        success: function (res) {
                            xmsys.warn(xmsys.cfg.ModuleName.Xiaoman_Phone, "管理员已强制您下线", xmsys.cfg.SysEventType.EventOtherDeviceLogin, "")
                            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, {
                                msgType: xmsys.cfg.SysEventType.EventKillTSClient,
                                desc: "您已被管理员强制您下线"
                            });
                        }, fail: function (res) {

                        }
                    });
                    break;
                default:

                    break;
            }
        }
    };

    //关闭电话
    kphone.prototype.close = function (params) {
        if (xiaoman.phone.connection == null) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.PhoneIsDisconnected.code,
                desc: xmsys.cfg.newcode.PhoneIsDisconnected.desc
            });
            return;
        }

        //订阅软电话登录结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Close, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        clearInterval(setIntervalId);

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        xiaoman.phone.logout({
            token: userInfo.token,
            success: function (logoutSuccess) {
                var isStartSipClient = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient);
                if (isStartSipClient === true || isStartSipClient == "true") {
                    //判断sip客户端是否启动
                    var querySipClientStatus = {
                        data: {account: xmsys.cfg.SipClientConfig.IM.userNamePrefix + userInfo.extentInfo.placeCode},
                        token: userInfo.token,
                        callback: function (queryRes, data) {
                            if (queryRes.code == xmsys.cfg.code.Success.code && data) {
                                var sipStatus = data && data.result && data.result.rows && data.result.rows.length > 0 ? data.result.rows[0].status : 0;
                                if (sipStatus != 1) {
                                    //如果不存在客户端则直接发回关闭成功，并释放信令服务和缓存
                                    xiaoman.phone.connection.disconnect();
                                    xiaoman.phone.connection = null;
                                    xmsys.removeAllSessionDataExceptUserInfo();
                                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Close, {
                                        code: xmsys.cfg.newcode.Success.code,
                                        desc: xmsys.cfg.newcode.Success.desc
                                    });
                                } else {
                                    //如果服务存在则发送退出命令给客户端，让其退出。
                                    var sipClientQuit = {
                                        key: xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint),
                                        type: "quit"
                                    }

                                    var message = genSipClientMsg(sipClientQuit);
                                    xiaoman.phone.connection.send(message);
                                    xiaoman.phone.connection.disconnect();
                                    xiaoman.phone.connection = null;
                                    xmsys.removeAllSessionDataExceptUserInfo();
                                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Close, {
                                        code: xmsys.cfg.newcode.Success.code,
                                        desc: xmsys.cfg.newcode.Success.desc
                                    });

                                }
                            }
                        }
                    };
                    xmsys.amService.queryIMAccountStatus(querySipClientStatus);
                } else {
                    xmsys.removeAllSessionDataExceptUserInfo();
                    xiaoman.phone.connection.disconnect();
                    xiaoman.phone.connection = null;
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Method_Close, {
                        code: xmsys.cfg.newcode.Success.code,
                        desc: xmsys.cfg.newcode.Success.desc
                    });
                }
            }, fail: function (logoutFail) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.newcode.AgentLogoutFail.code,
                    desc: xmsys.cfg.newcode.AgentLogoutFail.desc
                });
            }
        });
    };

    //显示电话客户端
    kphone.prototype.openClient = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        params && params.success && params.success({
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc
        });
    };
    //显示电话客户端
    kphone.prototype.closeClient = function (params) {
        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }
        params && params.success && params.success({
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc
        });
    };
    //电话签入
    kphone.prototype.login = function (params) {
        if (!params || !params.token || params.token == "") {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "电话签入", "login", "调用失败，原因:" + xmsys.cfg.newcode.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.ParamNotExist.code,
                desc: xmsys.cfg.newcode.ParamNotExist.desc
            });
            return;
        }
        //订阅软电话登录结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Login, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        //判断用户是否登录和传入的token是否正确
        if (!xmsys.checkAuth(params.token)) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "AgentLogin",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //电话签出
    kphone.prototype.logout = function (params) {
        //订阅软电话登录结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Logout, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "AgentLogout",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };

    //接听电话
    kphone.prototype.answer = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_AnswerCall, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "AnswerCall",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //挂断电话
    kphone.prototype.release = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_ReleaseCall, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "ReleaseCall",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //外呼
    kphone.prototype.callOut = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.phoneNum || params.phoneNum == "") {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "电话外呼", "callOut", "调用失败，原因:" + xmsys.cfg.newcode.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.ParamNotExist.code,
                desc: xmsys.cfg.newcode.ParamNotExist.desc
            });
            return;
        }

        //订阅软电话启动结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_MakeCall, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        })

        //如果外显号码不为空则判断外显号码是否正确
        var line = "";
        if (params.line && params.line != "") {
            var outShowTelNumInfos = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).telRes;
            var lineInfo = outShowTelNumInfos[params.line];
            if (!outShowTelNumInfos || !lineInfo) {
                params && params.fail && params.fail({
                    code: xmsys.cfg.newcode.PhoneCalloutLineNotExists.code,
                    desc: xmsys.cfg.newcode.PhoneCalloutLineNotExists.desc
                });
                return;
            }

            line = lineInfo.line;
        }

        if (typeof (params.isRecord) == "undefined" || params.isRecord === "") {
            params.isRecord = true;
        }

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var isRecord = params.isRecord || params.isRecord == true ? "1" : false
        var msg = {
            requestType: "MakeCall",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            otherDn: params.phoneNum,
            line: line,
            userData: params.userData,
            isRecord: isRecord
        }

        var message = genMsg(msg);
        this.connection.send(message);
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
    };
    //设置座席状态
    kphone.prototype.setAgentState = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }
        //参数检查
        if (!params || !params.state || params.state == "") {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "设置坐席状态", "setAgentState", "调用失败，原因:" + xmsys.cfg.newcode.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.ParamNotExist.code,
                desc: xmsys.cfg.newcode.ParamNotExist.desc
            });
            return;
        }
        //参数格式检查
        var angentState = this.AgentStates[params.state]
        if (!angentState) {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "设置坐席状态", "setAgentState", "调用失败，原因:" + xmsys.cfg.code.ParamFormatError.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamFormatError.code,
                desc: xmsys.cfg.code.ParamFormatError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_SetAgentState, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "SetAgentState",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            state: angentState
        };

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //获取座席状态
    kphone.prototype.getAgentState = function (params) {
        params && params.success && params.success({
            state: xmsys.getFromCache(xmsys.cfg.CacheKey.RunData).AgentState,
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc
        });
    };
    //获取版本
    kphone.prototype.checkPhoneVersion = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_CheckPhoneVersion, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var isStartSipClient = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient);
        var startSipResult = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.StartSipClientResult);

        if (isStartSipClient && startSipResult) {
            var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
            var msg = {
                requestType: "CheckSIPClientUpdate",
                businessId: userInfo.enterprise.id,
                channelCode: 1,
                agentId: userInfo.extentInfo.loginCode,
                thisDn: userInfo.extentInfo.placeCode,
                currVersion: startSipResult.version
            }

            var message = genMsg(msg);
            this.connection.send(message);
        } else {
            params && params.success && params.fail({
                code: xmsys.cfg.newcode.SipNotStart.code,
                desc: xmsys.cfg.newcode.SipNotStart.desc
            });
        }
    };
    //立即更新版本
    kphone.prototype.startUpdateProgram = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        var isStartSipClient = xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.IsStartSipClient);
        if (isStartSipClient) {
            xiaoman.phone.close({
                success: function () {
                    var utl2 = "iphonexu://"
                    console.log(utl2)
                    $("body").append("<iframe id='iphonexclient' width='0' height='0' src='" + utl2 + "'></iframe>");
                    params && params.success && params.success({
                        code: xmsys.cfg.newcode.Success.code,
                        desc: xmsys.cfg.newcode.Success.desc
                    });
                },
                fail: function () {
                    var utl2 = "iphonexu://"
                    console.log(utl2)
                    $("body").append("<iframe id='iphonexclient' width='0' height='0' src='" + utl2 + "'></iframe>");
                    params && params.success && params.success({
                        code: xmsys.cfg.newcode.Success.code,
                        desc: xmsys.cfg.newcode.Success.desc
                    });
                }
            });

        } else {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.SipNotStartCanNotUpdate.code,
                desc: xmsys.cfg.newcode.SipNotStartCanNotUpdate.desc
            });
        }

    };
    //开启录音
    kphone.prototype.openRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_OpenRecord, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "OpRecord",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId,
            opType: xmsys.cfg.GenesysRecordOpType.Start
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //关闭录音
    kphone.prototype.closeRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_CloseRecord, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "OpRecord",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId,
            opType: xmsys.cfg.GenesysRecordOpType.Stop
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //暂停录音
    kphone.prototype.pauseRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_PauseRecord, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "OpRecord",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId,
            opType: xmsys.cfg.GenesysRecordOpType.Pause
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //恢复录音
    kphone.prototype.resumeRecord = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_ResumeRecord, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "OpRecord",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId,
            opType: xmsys.cfg.GenesysRecordOpType.Resume
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //打开和关闭静音
    kphone.prototype.setMute = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "静音或者取消静音", "setMute", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }
        //参数格式检查
        if (params.operate != "open" && params.operate != "close") {
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "静音或者取消静音", "setMute", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamFormatError.code,
                desc: xmsys.cfg.code.ParamFormatError.desc
            });
            return;
        }

        //如果服务存在则发送退出命令给客户端，让其退出。
        var sipClientQuit = {
            key: xmsys.getFromCache(xmsys.cfg.CacheKey.TmpData.Fingerprint),
            type: params.operate == "open" ? "mute" : "unmute"
        }

        var message = genSipClientMsg(sipClientQuit);
        xiaoman.phone.connection.send(message);

        params && params.success && params.success({
            code: xmsys.cfg.code.Success.code,
            desc: xmsys.cfg.code.Success.desc
        });
    };
    //电话转接
    kphone.prototype.transfer = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "电话转接", "transfer", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_Transfer, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

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

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var msg = {
            requestType: "SingleStepTransfer",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            otherDn: params.phoneNum,
            line: line,
            userData: params.userData,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //发起单步会议
    kphone.prototype.singleStepConference = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "单步完成会议", "singleStepConference", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_SingleStepConference, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

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

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var msg = {
            requestType: "SingleStepConference",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            otherDn: params.phoneNum,
            line: line,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //从会议室中剔除一个人
    kphone.prototype.deleteFromConference = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "会议室中删除指定成员", "deleteFromConference", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_DeleteFromConference, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

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

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var msg = {
            requestType: "DeleteFromConference",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            dropDn: params.phoneNum,
            line: line,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //发起会议
    kphone.prototype.initaiteConference = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "初始化会议室", "initaiteConference", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_InitaiteConference, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

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

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var msg = {
            requestType: "InitaiteConference",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            otherDn: params.phoneNum,
            line: line,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //确认会议
    kphone.prototype.completeConference = function (params) {
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
            xmsys.error(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "完成会议室", "completeConference", "调用失败，原因:" + xmsys.cfg.code.ParamNotExist.desc)
            params && params.fail && params.fail({
                code: xmsys.cfg.code.ParamNotExist.code,
                desc: xmsys.cfg.code.ParamNotExist.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_CompleteConference, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

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

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var msg = {
            requestType: "CompleteConference",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId,
            otherConnId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //发起通话保持
    kphone.prototype.hold = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_HoldCall, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "HoldCall",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };
    //取回通话保持
    kphone.prototype.retrieve = function (params) {
        //检测登录状态
        if (!xmsys.checkLogin()) {
            params && params.fail && params.fail({
                code: xmsys.cfg.newcode.AuthCheckError.code,
                desc: xmsys.cfg.newcode.AuthCheckError.desc
            });
            return;
        }

        //订阅结果
        xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Method_RetrieveCall, true, function (data) {
            if (data.code === xmsys.cfg.newcode.Success.code) {
                params && params.success && params.success(data);
            } else {
                params && params.fail && params.fail(data);
            }

        });

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData);
        var connId = params.connId || runData.ConnIdList[runData.ConnIdList.length - 1];
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo);
        var msg = {
            requestType: "RetrieveCall",
            businessId: userInfo.enterprise.id,
            channelCode: 1,
            agentId: userInfo.extentInfo.loginCode,
            thisDn: userInfo.extentInfo.placeCode,
            connId: connId
        }

        var message = genMsg(msg);
        this.connection.send(message);
    };

    kphone.prototype.getUsers = function () {
        var iq = $iq({type: 'get',}).c('query', {xmlns: 'jabber:iq:roster'});
        this.connection.sendIQ(iq, function (a) {
            console.log('sent iq', a);

            $(a).find('item').each(function () {
                var jid = $(this).attr('jid'); // jid
                console.log('jid', jid);
            });
        });
    }

    /*======================================事件相关==========================================*/
    //振铃通知事件
    var ringing = function (obj) {
        //清除上一通电话产生的session
        xmsys.addCache(xmsys.cfg.CacheKey.TmpData.SessionId, "");
        //xmsys.info("ringing：" + JSON.stringify(obj))
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "收到振铃事件", "Ringing", JSON.stringify(obj))
        var callType = obj.callType.toLowerCase();

        //保存运行时参数
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        var phoneSessionInfo = {
            ani: obj.ani,
            dnis: obj.dnis,
            connId: obj.connId,
            callType: callType,
            callUuid: obj.callUUID
        }
        if (runData) {
            runData.Channel = obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call";
            runData.Ani = obj.ani;
            runData.Dnis = obj.dnis;
            runData.ConnId = obj.connId;
            runData.CallType = callType;
            runData.CallUuid = obj.callUUID;
            //runData.TransferConnId = obj.isTransferred && obj.isTransferred == "1" ? obj.isTransferred : ""
            runData.RecordId = obj.callUUID;

            if (runData.PhoneSessionList != null) {
                runData.PhoneSessionList.push(phoneSessionInfo)
            } else {
                runData.PhoneSessionList = [phoneSessionInfo]
            }
        } else {
            runData = {
                Channel: obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call",
                Ani: obj.ani,
                Dnis: obj.dnis,
                ConnId: obj.connId,
                CallType: callType,
                CallUuid: obj.callUUID,
                //TransferConnID: obj.isTransferred && obj.isTransferred == "1" ? obj.isTransferred : "",
                PhoneSessionList: [phoneSessionInfo],
                RecordId: obj.callUUID
            };
        }
        runData.ConnIdList = runData.ConnIdList || [];
        runData.ConnIdList.push(obj.connId);
        xmsys.addCache(xmsys.cfg.CacheKey.RunData, runData);

        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)

        var line = runData ? runData.Line : ""
        var callType = runData ? runData.CallType : ""
        var dnis = obj.dnis ? obj.dnis.replace(line, '') : ""
        var ani = obj.ani ? obj.ani.replace(line, '') : ""

        //如果时外呼过来需要查询外呼数据
        var taskDataid = obj.taskdataid;
        var taskInfo = {}
        if (taskDataid && taskDataid != "") {
            var searchTaskReq = {
                token: xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo).token,
                data: {taskDataId: parseInt(taskDataid)},
                callback: function (result, data) {
                    if (data) {
                        taskInfo.TaskId = data.id;
                        taskInfo.TaskName = data.name;
                        taskInfo.TaskDataId = taskDataid;
                    }

                    var resp = {
                        code: xmsys.cfg.newcode.Success.code,
                        desc: xmsys.cfg.newcode.Success.desc,
                        channel: obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call",
                        ani: ani,
                        dnis: dnis,
                        calltype: callType,
                        connid: obj.connId,
                        taskinfo: taskInfo,
                        recordId: obj.callUUID,
                        callUUID: obj.callUUID,
                        isTransferred: obj.isTransferred
                    };
                    /* if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
                         resp.OriginalData = jQuery.extend(true, {}, obj);
                     }*/
                    xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Ringing, resp)
                    if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {

                    }
                }
            }
            xmsys.outboundService.searchTaskByTaskDataId(searchTaskReq)
        } else {
            var resp = {
                code: xmsys.cfg.newcode.Success.code,
                desc: xmsys.cfg.newcode.Success.desc,
                channel: obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call",
                ani: ani,
                dnis: dnis,
                calltype: callType,
                connid: obj.connId,
                recordId: obj.callUUID,
                callUUID: obj.callUUID,
                isTransferred: obj.isTransferred,
                userData: obj.userData
            }
            if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
                resp.OriginalData = jQuery.extend(true, {}, obj);
            }
            xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Ringing, resp)
            if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {

            }
        }
    }
    //电话接听通知事件
    var established = function (obj) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "收到接听事件", "Established", JSON.stringify(obj))
        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        var callType = obj.callType.toLowerCase();
        var line = runData ? runData.Line : ""
        var dnis = obj.dnis ? obj.dnis.replace(line, '') : ""
        var ani = obj.ani ? obj.ani.replace(line, '') : ""
        var resp = {
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc,
            ani: ani,
            dnis: dnis,
            connid: obj.connId,
            recordId: obj.callUUID,
            channel: obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call",
            callUUID: obj.callUUID,
            calltype: callType,
            userData: obj.userData
        }

        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Established, resp)
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {

        }
    }
    //电话挂断通知事件
    var released = function (obj) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "收到挂机事件", "eleased", JSON.stringify(obj))

        var runData = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        if (runData) {
            runData.RecordId = obj.callUUID;
            runData.TransferConnId = obj.transferConnId ? obj.transferConnId : ""
        } else {
            runData = {
                Channel: 1,
                Ani: obj.ani,
                Dnis: obj.dnis,
                ConnId: obj.connId,
                CallUuid: obj.callUUID,
                RecordId: obj.callUUID,
                TransferConnID: obj.transferConnId ? obj.transferConnId : ""
            };
        }
        runData.ConnIdList.splice(runData.ConnIdList.indexOf(obj.connId), 1);
        xmsys.addCache(xmsys.cfg.CacheKey.RunData, runData);
        var line = runData ? runData.Line : ""
        var callType = obj.callType.toLowerCase();
        var dnis = obj.dnis ? obj.dnis.replace(line, '') : ""
        var ani = obj.ani ? obj.ani.replace(line, '') : ""
        var resp = {
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc,
            channel: obj.userData && obj.userData.channelType ? obj.userData.channelType.toLowerCase() : "call",
            ani: ani,
            dnis: dnis,
            connid: obj.connId,
            recordId: obj.callUUID,
            callUUID: obj.callUUID,
            calltype: callType,
            userData: obj.userData
        }
        /* if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
             resp.OriginalData = jQuery.extend(true, {}, obj);
         }*/
        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_Released, resp);
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {

        }
    }
    //座席状态改变通知事件
    var agentStateChange = function (obj) {
        xmsys.info(xmsys.cfg.ModuleName.Xiaoman_Phone_KPhone, "座席状态改变通知事件", "agentStateChange", JSON.stringify(obj))
        var runDate = xmsys.getFromCache(xmsys.cfg.CacheKey.RunData)
        if (runDate) {
            runDate.AgentState = obj.state ? obj.state.toLowerCase() : "";
        } else {
            runDate = {
                AgentState: obj.state ? obj.state.toLowerCase() : ""
            }
            xmsys.addCache(xmsys.cfg.CacheKey.RunData, runDate);
        }

        var resp = {
            code: xmsys.cfg.newcode.Success.code,
            desc: xmsys.cfg.newcode.Success.desc,
            state: obj.state.toLowerCase()
        }
        /* if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsAcceptOriginalData && xmsys.cfg.extOptions.IsAcceptOriginalData == true) {
             resp.OriginalData = jQuery.extend(true, {}, obj);
         }*/
        xmsys.observe.trigger(xmsys.cfg.CacheKey.ObserveType.Event_AgentStateChange, resp)
        var userInfo = xmsys.getFromCache(xmsys.cfg.CacheKey.UserInfo)
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsMsgPush && xmsys.cfg.extOptions.IsMsgPush == true) {
            /* xiaoman.im.sendMsg({
                 msgData: {
                     extendAttributes: {notifyType: xmsys.cfg.OnMessageType.Phone.AgentState},
                     body: JSON.stringify({state: resp.state}),
                     to: userInfo.user.account + "-" + xmsys.cfg.IM.MessageReceiverAccountSuffix
                 }
             })*/
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
    //状态通知
    event.dnStateChange = function (callback) {
        if (callback) {
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_DnStateChange, false, callback);
        }
    };
    event.onMessage = function (callback) {
        //订阅消息接收
        if (callback)
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_OnMessage, false, callback);
    }
    event.error = function (callback) {
        //订阅错误事件接收
        if (callback)
            xmsys.observe.listen(xmsys.cfg.CacheKey.ObserveType.Event_Error, false, callback);
    }
    exports('phone', 'kphone', new kphone());
});