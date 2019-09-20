/**
 * Created by xxqin on 2016/11/30.
 */
;!function (win) {
    "use strict";
    var outboundService = function () {
    }

    outboundService.fn = outboundService.prototype;
    outboundService.fn.searchTask = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.Outbound.SearchTask, xmsys.cfg.ApiName.Outbound, xmsys.cfg.ApiModule.Outbound, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    outboundService.fn.searchTaskByTaskDataId = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.Outbound.SearchTaskByTaskDataId, xmsys.cfg.ApiName.Outbound, xmsys.cfg.ApiModule.Outbound, param.token),
            callback: function (result, data) {
                if (xmsys.cfg.code.Success.code == result.code) {
                    param.callback(result, data.result.rows && data.result.rows.length > 0 ? data.result.rows[0] : null);
                } else {
                    param.callback(result);
                }
            }
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    win.xmsys.outboundService = new outboundService();
}(window);