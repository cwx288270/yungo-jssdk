/**
 * Created by xxqin on 2016/11/28.
 */
xmsys.addCfg({
    version: "1.0.10",
    PhoneModule: {
        "All": "kphone"
    },
    IMModule: {
        "All": "stropheim"
    },
    AccountAllowModule: {//账户允许使用的模块
        "All": ["xiaoman-all"]
    },
    //gphone配置信息
    GPhoneConfig: {
        tServer1: "sipserver.kxjlcc.com",
        port1: "3300",
        tServer2: "sipserver.kxjlcc.com",
        port2: "3300",
        sipServer: "sipserver.kxjlcc.com",
        port3: "49580",
        version: "2017-01-06 00:06 Build(C4.3.5.0)",
        TryConnectTimes: 5
    },
    ApiPrefix: {
        //css工程请求地址
        CSS: "http://agent.kxjlcc.com/csssvc/api/",
        //cms工程请求地址
        CMS: "http://agent.kxjlcc.com/cms/",
        YunGo: "http://agent.kxjlcc.com/yungo-api/api/",
        Outbound: "http://agent.kxjlcc.com/yungo-outbound/api/",
        AM: "http://agent.kxjlcc.com/yungo-am-api/api/"
    },
    StorpheIMConfig: {
        Server: "ws://agent.kxjlcc.com:5290",//IM网关地址
        Robot: "robot@xiaomankf.com",//机器人帐号
        Xiaoman: "xiaoman@xiaomankf.com",
        CalendarMaxDate: '2017-12-20 23:59:59',//最大时间
        WebSessionTimeOut: 20 * 60 * 1000,//web端session超时控制
        Suffix: "@xiaomankf.com",
        ReConnectInterval: 5000//单位毫秒，只针对消息发送和消息接口2种类型
    },
    GenesysProxyIMConfig: {
        Server: "ws://agent.kxjlcc.com:5290",//IM网关地址
        //Server: "ws://172.16.1.22:5290",//IM网关地址
        userName: "phoneProxy",
        CalendarMaxDate: '2017-12-20 23:59:59',//最大时间
        WebSessionTimeOut: 20 * 60 * 1000,//web端session超时控制
        ServerName: "@xiaomankf.com",
        ReConnectInterval: 5000,//单位毫秒，只针对消息发送和消息接口2种类型
        Resource: "/tserver-client"
    },
    SipClientConfig: {
        IM: {
            Server: "agent.kxjlcc.com",
            Port: 5222,
            userNamePrefix: "sip-",
            ServerName: "@xiaomankf.com",
            Resource: "/sipclient",
        },
        SIP: {
            Server: "sipserver.kxjlcc.com:49580"
        }
    },
    Raven: {
        serverUrl: "http://210dba72ef164b32b4c9edf3210b4ea1@172.16.1.55:9000/2",
        config: {
            release: "1.0.9",
            serverName: "JS-SDK",
            autoBreadcrumbs: {
                'xhr': true,      // XMLHttpRequest
                'console': true,  // console logging
                'dom': false,       // DOM interactions, i.e. clicks/typing
                'location': true  // url changes, including pushState/popState
            },
            debug: true
        }
    },
    WaitPhoneStartTime: 10000,//在此时间内如果没有启动成功则认为启动失败
    WaitKillTSClientRespTime: 10000//如果在此时间内还没有收到强踢结果则认为强踢成功
});