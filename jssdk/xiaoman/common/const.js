/**
 * Created by xxqin on 2016/11/28.
 */
xmsys.addCfg({
    ApiVersion: "v1",
    IsEncryptPassword: true,
    /* AngentState: {
     online: "online",//在线
     offline: "offline",//离线
     busy: "busy"//忙碌
     },*/
    Channel: {
        wechat: "wechat",//微信
        sms: "sms",//短信
        webchat: "webchat",//在线
        call: "call",//电话
        silence: "silence"//静默座席
    },
    CallType: {
        inbound: "inbound",//呼入
        outbound: "outbound"//呼出
    },
    MsgType: {
        text: "text",//文本消息
        audio: "audio",//语音消息
        image: "image",//图片消息
        video: "video",//视频信息
        preview: "preview"//预显消息
    },
    GenesysRecordOpType: {
        Start: 3013,
        Stop: 3014,
        Pause: 3015,
        Resume: 3016
    },
    CacheKey: {
        UserInfo: "XIAOMAN_USERINFO",
        RunData: "XIAOMAN_RUNDATA",
        RunDataKey: {
            RecordId: "RecordId",
            Channel: "Channel",
            Ani: "Ani",
            Dnis: "Dnis",
            TransferConnId: "TransferConnId",
            ConnId: "ConnId",
            CallType: "CallType",
            Line: "Line",
            IsRecord: "IsRecord",
            Token: "Token",
            PhoneSessionList: "PhoneSessionList"
        },
        TmpData: {
            SessionId: "XIAOMAN_TMPDATA_SESSIONID",
            IsAddEvent: "XIAOMAN_TMPDATA_ISADDEVENT",
            PhoneState: "XIAOMAN_TMPDATA_PHONESTATE",
            PhoneVersion: "XIAOMAN_TMPDATA_PHONEVERSION",
            StartSipClientResult: "XIAOMAN_TMPDATA_START_SIP_CLIENT_RESULT",
            IsStartSipClient: "XIAOMAN_TMPDATA_IS_START_SIP_CLIENT",
            Fingerprint: "XIAOMAN_TMPDATA_FINGERPRINT",
            //IsOtherDeviceLogin: "XIAOMAN_TMPDATA_IS_OHTER_DEVICE_LOGIN",
            PhoneIsStart: "XIAOMAN_TMPDATA_PHONE_IS_START",
            SIPClientIsConflict: "XIAOMAN_TMPDATA_SIP_CLIENT_CONFLICT",
            //IsReceiveKillTSClientRsp: "XIAOMAN_TMPDATA_IS_RECEIVE_KILL_TS_CLIENT_RESPONSE",
            //IsKillOtherAfterOpen: "XIAOMAN_TMPDATA_IS_KILL_OTHER_AFTER_OPEN"
        },
        ObserveType: {
            Method_Open: "XIAOMAN_METHOD_OPEN",
            Method_Close: "XIAOMAN_METHOD_CLOSE",
            Event_OnMessage: "XIAOMAN_EVENT_MESSAGE",
            Event_Ringing: "XIAOMAN_EVENT_RINGING",
            Event_Established: "XIAOMAN_EVENT_ESTABLISHED",
            Event_Released: "XIAOMAN_EVENT_RELEASED",
            Event_AgentStateChange: "XIAOMAN_EVENT_AGENTSTATECHANGE",
            Event_DnStateChange: "XIAOMAN_EVENT_DNSTATECHANGE",
            Event_Error: "XIAOMAN_EVENT_ERROR",
            Method_Login: "XIAOMAN_METHOD_LOGIN",
            Method_Logout: "XIAOMAN_METHOD_LOGOUT",
            Method_MakeCall: "XIAOMAN_METHOD_MAKECALL",
            Method_AnswerCall: "XIAOMAN_METHOD_ANSWERCALL",
            Method_ReleaseCall: "XIAOMAN_METHOD_RELEASECALL",
            Method_SetAgentState: "XIAOMAN_METHOD_SETAGENTSTATE",
            Method_CheckPhoneVersion: "XIAOMAN_METHOD_CHECKPHONEVERSION",
            Method_HoldCall: "XIAOMAN_METHOD_HOLDCALL",
            Method_RetrieveCall: "XIAOMAN_METHOD_RETRIEVECALL",
            Method_SingleStepConference: "XIAOMAN_METHOD_SINGLESTEPCONFERENCE",
            Method_Transfer: "XIAOMAN_METHOD_TRANSFER",
            Method_InitaiteConference: "XIAOMAN_METHOD_INITAITECONFERENCE",
            Method_CompleteConference: "XIAOMAN_METHOD_COMPLETECONFERENCE",
            Method_OpenRecord: "XIAOMAN_METHOD_OPENRECORD",
            Method_CloseRecord: "XIAOMAN_METHOD_CLOSERECORD",
            Method_PauseRecord: "XIAOMAN_METHOD_PAUSERECORD",
            Method_ResumeRecord: "XIAOMAN_METHOD_RESUMERECORD",
            Method_DeleteFromConference: "XIAOMAN_METHOD_DELETEFROMFONFERENCE",
            IM: {
                Message: {
                    Receive: "XIAOMAN_IM_EVENT_MESSAGE_RECEIVE"
                },
                Presence: {
                    Presence: "XIAOMAN_IM_EVENT_PRESENCE_PRESENCE",
                    Subscribe: "XIAOMAN_IM_EVENT_PRESENCE_SUBSCRIBE",
                    UnSubscribed: "XIAOMAN_IM_EVENT_PRESENCE_UNSUBSCRIBED",
                    Unavailable: "XIAOMAN_IM_EVENT_PRESENCE_UNAVAILABLE"
                },
                State: {
                    OnChange: "XIAOMAN_IM_EVENT_STATE_ONCHANGE"
                },
                IQ: {
                    Result: "XIAOMAN_IM_EVENT_IQ_RESULT"
                }
            }
        },
        TimeId: {
            CallShowWaitTimeId: "XIAOMAN_CALLSHOW_WAITTIMEID",
            PhoneBarCallTimeId: "XIAOMAN_PHONEBAR_CALLTIMEID"
        },
        IM: {
            SubscribedInfo: "XIAOMAN_IM_SUBSCRIBEDINFO"
        }
    },
    OnMessageType: {
        StartAgentLogin: "STARTAGENTlOGIN",
        WSSConnected: "WSSCONNECTED",
        StartTServer: "STARTTSERVER",
        StartTServerSuccess: "STARTTSERVERSUCCESS",
        StartTServerFail: "STARTTSERVERFAIL",
        StartRegisterAddress: "STARTREGISTERADDRESS",
        StartRegisterAddressSuccess: "STARTREGISTERADDRESSSUCCESS",
        StartAgentLoginSuccess: "STARTAGENTLOGINSUCCESS",
        ChatMsg: "CHATMSG",
        Phone: {
            VoiceToTextMsg: "VOICETOTEXTMSG",
            VoiceToTextTag: {
                INTERJECT: "VOICETOTEXTTAG_INTERJECT",
                KEYWORD: "VOICETOTEXTTAG_KEYWORD",
                MUTE: "VOICETOTEXTTAG_MUTE"
            },
            Ringing: "RINGING",
            AgentState: "AGENTSTATE",
            Established: "ESTABLISHED",
            Released: "RELEASED"
        },
        Error: {
            Phone: "ERROR_PHONE",
            IM: "ERROR_IM"
        }

    },
    AgentStates: {
        logout: {code: "logout", desc: "离线"},
        connected: {code: "connected", desc: "已连接"},
        notinitialized: {code: "notinitialized", desc: "未初始化"},
        dialing: {code: "dialing", desc: "正在呼叫"},
        busy: {code: "busy", desc: "正在通话"},
        aftercallwork: {code: "aftercallwork", desc: "话后处理"},
        ringing: {code: "ringing", desc: "来电"},
        ready: {code: "ready", desc: "示闲"},
        notready: {code: "notready", desc: "示忙"},
        holding: {code: "holding", desc: "通话保持中"},
        conferenced: {code: "conferenced", desc: "会议中"},
        conferencewaitanswer: {code: "conferencewaitanswer", desc: "等待"},
        conferencestep1: {code: "conferencestep1", desc: "等待"},
        /*Closed: {code: "closed", desc: "关闭"}*/
    },
    TransInterfaceCode: {
        "359": "AccountNotExists",
        "error.account.password.illegal": "PasswordError"
    },
    TransPhoneCode: {
        "173": "PhoneConferenceUnsuccessful",
        "191": "AgentIDIEIsMissingOrInvalid",
        "185": "AgentStateChangeFail",
        "56": "ConnIdError",
        "58": "PhoneOutOfService",
        "565": "AgentStateError",
        "1": "ConnectTServerFail",
        "59": "DNIsNotConfigInCME",
        "237": "PhoneDisconnected"
    },
    code: {
        Success: {code: "000000", desc: "操作成功"},
        ParamNotExist: {code: "100000", desc: "必选参数为空"},
        ParamFormatError: {code: "100000", desc: "参数格式错误"},
        ModuleLoadError: {code: "200001", desc: "模块加载失败"},
        ModuleNotExists: {code: "200002", desc: "模块不存在"},
        ModuleNotInAccount: {code: "200003", desc: "传入的模块没有权限使用"},
        AuthCheckError: {code: "300000", desc: "鉴权失败"},
        AccountOrPasswordError: {code: "300001", desc: "账号或者密码错误"},
        PasswordError: {code: "300002", desc: "密码错误"},
        AccountNotExists: {code: "300003", desc: "账号不存在"},
        PhoneOpenException: {code: "400000", desc: "打开启动电话客户端异常"},
        PhoneOpenConnWSSError: {code: "400001", desc: "启动电话，连接WSS失败"},
        PhoneOpenConnTServerError: {code: "400002", desc: "启动电话，连接TServer失败"},
        PhoneCalloutLineNotExists: {code: "400003", desc: "外呼时输入的线路编号不正确"},
        PhoneSendMsgWSSError: {code: "400004", desc: "wss连接异常，无法进行消息发送"},
        PhoneConferenceUnsuccessful: {code: "400005", desc: "会议操作失败"},
        AgentIDIEIsMissingOrInvalid: {code: "400006", desc: "坐席id不存在或者无效"},
        AgentStateChangeFail: {code: "400007", desc: "坐席状态切换失败"},
        ConnIdError: {code: "400008", desc: "ConnId不存在或者不正确"},
        PhoneOutOfService: {code: "400009", desc: "找不到分机或者分机掉线"},
        AgentStateError: {code: "400010", desc: "坐席状态不正确"},
        ConnectTServerFail: {code: "400011", desc: "连接TServer失败"},
        DNIsNotConfigInCME: {code: "400012", desc: "DN未配置"},
        PhoneDisconnected: {code: "400013", desc: "分机断开连接"},
        IMDisconnected: {code: "500001", desc: "IM连接已断开"},
        SysError: {code: "999999", desc: "系统内部错误"},
    },
    SipClientCode: {
        Success: {code: 600000, desc: "操作成功"},
        ProcessExists: {code: 600001, desc: "进程已启动"}
    },
    newcode: {
        Success: {code: 0, desc: "操作成功"},
        ParamNotExist: {code: 100000, desc: "必选参数为空"},
        ParamFormatError: {code: 100000, desc: "参数格式错误"},
        ModuleLoadError: {code: 200001, desc: "模块加载失败"},
        ModuleNotExists: {code: 200002, desc: "模块不存在"},
        ModuleNotInAccount: {code: 200003, desc: "传入的模块没有权限使用"},
        AuthCheckError: {code: 300000, desc: "鉴权失败"},
        AccountOrPasswordError: {code: 300001, desc: "账号或者密码错误"},
        PasswordError: {code: 300002, desc: "密码错误"},
        AccountNotExists: {code: 300003, desc: "账号不存在"},
        PhoneOpenException: {code: 400000, desc: "启动电话客户端异常"},
        PhoneOpenConnWSSError: {code: 400001, desc: "启动电话，连接WS失败"},
        PhoneOpenConnTServerError: {code: 400002, desc: "启动电话，连接TServer失败"},
        PhoneCalloutLineNotExists: {code: 400003, desc: "外呼时输入的线路编号不正确"},
        PhoneSendMsgWSSError: {code: 400004, desc: "ws连接异常，无法进行消息发送"},
        PhoneConferenceUnsuccessful: {code: 400005, desc: "会议操作失败"},
        AgentIDIEIsMissingOrInvalid: {code: 400006, desc: "坐席id不存在或者无效"},
        AgentStateChangeFail: {code: 400007, desc: "坐席状态切换失败"},
        ConnIdError: {code: 400008, desc: "ConnId不存在或者不正确"},
        PhoneOutOfService: {code: 400009, desc: "找不到分机或者分机掉线"},
        AgentStateError: {code: 400010, desc: "坐席状态不正确"},
        ConnectTServerFail: {code: 400011, desc: "连接TServer失败"},
        DNIsNotConfigInCME: {code: 400012, desc: "DN未配置"},
        PhoneDisconnected: {code: 400013, desc: "分机断开连接"},
        AgentLogoutFail: {code: 400014, desc: "坐席签出失败"},
        PhoneIsDisconnected: {code: 400015, desc: "电话服务已关闭，请不要重复操作"},
        PhoneIsConnected: {code: 400016, desc: "电话服务已启动，请不要重复操作"},
        SipIsStart: {code: 400017, desc: "SIP客户端已启动，请不要重复操作"},
        SipNotStartCanNotUpdate: {code: 400018, desc: "自动更新只支持以非iphonex作为客户端方式启动"},
        SipNotStart: {code: 400019, desc: "SIP客户端未启动，不能执行版本检测"},
        PhoneStarting: {code: 400020, desc: "电话服务正在启动中，请不要重复操作"},
        PhoneOpenConflictAndNotCloseConflictClient: {code: 400021, desc: "客户端启动冲突，且无法退出已经启动的客户端"},
        IMDisconnected: {code: 500001, desc: "IM连接已断开"},
        SysError: {code: 999999, desc: "系统内部错误"},
    },
    PluginName: {
        Xiaoman_All: "xiaoman-all",
        Xiaoman_Phone: "xiaoman-phone",
        Xiaoman_IM: "xiaoman-im",
        Xiaoman_All_Client: "xiaoman-all-client",
        Xiaoman_Phone_Client: "xiaoman-phone-client"
    },
    SupportModule: ["xiaoman-config", "xiaoman-all", "xiaoman-phone", "xiaoman-im", "xiaoman-all-client", "xiaoman-phone-client", "jquery", "layer"],//系统支持的模块
    webSessionTimeOut: 20 * 60 * 1000,
    ApiName: {
        CSS: "CSS",
        CMS: "CMS",
        YunGo: "YunGo",
        Outbound: "Outbound",
        AM: "AM",
    },
    ApiModule: {
        Session: "session",
        CMS: "cms",
        YunGo_Agent: "agent",
        Outbound: "outbound",
        Account: "account"
    },
    ApiSuffix: {
        CMS: {
            loginCheck: "/loginCheck",
            logout: "/logout",
        },
        AM: {
            queryIMAccountStatus: "/queryIMAccountStatus"
        },
        Session: {
            Create: "/create",
            UpdateById: "/updateById"
        },
        Outbound: {
            SearchTask: "/searchTask",
            SearchTaskByTaskDataId: "/searchTaskByTaskDataId"
        },
        YunGo: {
            PhonePluginLog: "/phonePluginLog",
            Login: "/login",
            Logout: "logout"
        }
    },
    IM: {
        SendMsgAccount: "XIAOMAN_IM_SENDMSGACCOUNT",
        VoiceToTextAccount: "translate",
        MessageSenderAccountSuffix: "msgsend",
        MessageReceiverAccountSuffix: "msgreceive",
        OpenType: {
            NotifySender: "notifysender",
            NotifyReceiver: "notifyreceiver",
            Agent: "agent",
            Client: "client",
            Genesys: "genesys"
        },
        FromType: {
            Translate: "translate"
        },
        TranslateType: {
            Text: "text",
            Tag: "tag"
        },
        StateMapping: [
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
    },
    LogLevel: {
        Info: "info",
        Warn: "warn",
        Error: "error",
        Fatal: "fatal",
        Debug: "debug"
    },
    ModuleName: {
        Fun: "fun",
        Xiaoman: "xiaoman",
        Xiaoman_Base: "xiaoman-base",
        Xiaoman_All: "xiaoman-all",
        Xiaoman_Phone: "xiaoman-phone",
        Xiaoman_IM: "xiaoman-im",
        Xiaoman_All_Client: "xiaoman-all-client",
        Xiaoman_Phone_Client: "xiaoman-phone-client",
        Xiaoman_Phone_KPhone: "xiaoman-kphone",
        Xiaoman_Phone_GPhone: "xiaoman-gphone",
    },
    GenesysRequestType: {
        RegisterDN: "RegisterDN",
        AgentLogin: "AgentLogin",
        AgentLogout: "AgentLogout",
        MakeCall: "MakeCall",
        AnswerCall: "AnswerCall",
        ReleaseCall: "ReleaseCall",
        SetAgentState: "SetAgentState",
        HoldCall: "HoldCall",
        RetrieveCall: "RetrieveCall",
        SingleStepConference: "SingleStepConference",
        OpRecord: "OpRecord",
        DeleteFromConference: "DeleteFromConference",
    },
    GenesysEventType: {
        EventRegistered: "EventRegistered",
        EventAgentNotReady: "EventAgentNotReady",
        EventAgentState: "EventAgentState",
        EventAgentLogin: "EventAgentLogin",
        EventAgentLogout: "EventAgentLogout",
        EventDialing: "EventDialing",
        EventReleased: "EventReleased",
        EventAbandoned: "EventAbandoned",
        EventEstablished: "EventEstablished",
        EventRinging: "EventRinging",
        EventError: "EventError",
        EventDNBackInService: "EventDNBackInService",
        EventDNOutOfService: "EventDNOutOfService",
    },
    SysEventType: {
        EventKillTSClient: "EventKillTSClient",
        EventKillTSClientResult: "EventKillTSClientResult",
        EventOtherDeviceLogin: "EventOtherDeviceLogin"

    },
    SysRequestType: {
        CheckSIPClientUpdate: "CheckSIPClientUpdate"
    },
    MsgOrigin: {
        SipClient: "sipclient",
        UserRequest: "UserRequest",
        SysEvent: "SysEvent"
    },
    SipClientMsgType: {
        Request: {
            GetHostInfo: "gethostinfo",
        },
        Response: {
            StartResult: "start_result",
            GetHostInfoResult: "host_inforesult",
            RuntimeInfo: "runtimeinfo",
            QuitResult: "quitresult"
        }
    },
    XiaomanJsRootUrl: "http://172.16.1.22:9090/newsdk/",//sdk文件所在的地址
});