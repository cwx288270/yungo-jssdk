/**
 * Created by xxqin on 2016/11/30.
 */
;!function (win) {
    "use strict";
    var amService = function () {
    }

    amService.fn = amService.prototype;
    amService.fn.queryIMAccountStatus = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.AM.queryIMAccountStatus, xmsys.cfg.ApiName.AM, xmsys.cfg.ApiModule.YunGo_Agent, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    win.xmsys.amService = new amService();
}(window);