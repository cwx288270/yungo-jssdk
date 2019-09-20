/**
 * Created by xxqin on 2016/11/28.
 */
xmsys.addCfg({
    version: "2.0.2.20180124",
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
        tServer1: "117.71.59.51",
        port1: "3500",
        tServer2: "117.71.59.51",
        port2: "3500",
        sipServer: "172.16.1.15",
        port3: "5060",
        version: "2017-01-06 00:06 Build(C4.3.5.0)",
        TryConnectTimes: 5
    },
    ApiPrefix: {
        //css工程请求地址
        CSS: "http://172.16.1.22:9090/csssvc/api/",
        //cms工程请求地址
        CMS: "http://172.16.1.22:9090/cms/",
        YunGo: "http://172.16.1.22:9090/yungo-api/api/",
        Outbound: "http://172.16.1.22:9090/outbound/api/",
        AM: "http://172.16.1.22:9090/am/api/"
    },
    StorpheIMConfig: {
        Server: "ws://172.16.1.22:5290",//IM网关地址
        Robot: "robot@xiaomankf.com",//机器人帐号
        Xiaoman: "xiaoman@xiaomankf.com",
        CalendarMaxDate: '2017-12-20 23:59:59',//最大时间
        WebSessionTimeOut: 20 * 60 * 1000,//web端session超时控制
        Suffix: "@xiaomankf.com",
        ReConnectInterval: 5000//单位毫秒，只针对消息发送和消息接口2种类型
    },
    GenesysProxyIMConfig: {
        Server: "ws://172.16.1.22:5290",//IM网关地址
        userName: "phoneProxy-xxqin",
        CalendarMaxDate: '2017-12-20 23:59:59',//最大时间
        WebSessionTimeOut: 20 * 60 * 1000,//web端session超时控制
        ServerName: "@xiaomankf.com",
        ReConnectInterval: 5000,//单位毫秒，只针对消息发送和消息接口2种类型
        Resource: "/tserver-client"
    },
    SipClientConfig: {
        IM: {
            Server: "172.16.1.22",
            Port: 5222,
            userNamePrefix: "sip-",
            ServerName: "@xiaomankf.com",
            Resource: "/sipclient",
        },
        SIP: {
            Server: "172.16.1.15:5060"
        }
    },
    Raven: {
        serverUrl: "http://0d75e5c3aeb345b498100123816fa9df@192.168.32.150:9010/sentry/2",
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