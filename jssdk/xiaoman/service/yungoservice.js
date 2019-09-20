/**
 * Created by xxqin on 2016/11/30.
 */
;!function (win) {
    "use strict";
    var yungoService = function () {
    }

    yungoService.fn = yungoService.prototype;
    yungoService.fn.phonePluginLog = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.YunGo.PhonePluginLog, xmsys.cfg.ApiName.YunGo, xmsys.cfg.ApiModule.YunGo_Agent, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };

    yungoService.fn.login = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.YunGo.Login, xmsys.cfg.ApiName.YunGo, xmsys.cfg.ApiModule.Account, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };

    yungoService.fn.logout = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.YunGo.Logout, xmsys.cfg.ApiName.YunGo, xmsys.cfg.ApiModule.Account, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    win.xmsys.yungoService = new yungoService();
}(window);