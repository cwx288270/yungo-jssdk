/**
 * Created by xxqin on 2016/11/30.
 */
;!function (win) {
    "use strict";
    var cssApiService = function () {
    }

    cssApiService.fn = cssApiService.prototype;
    cssApiService.fn.createSession = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.Session.Create, xmsys.cfg.ApiName.CSS, xmsys.cfg.ApiModule.Session, param.token),
            callback: function (result, data) {
                param.callback(result, (data && data.result && data.result.rows && data.result.rows.length > 0) ? data.result.rows[0].id : 0)
            }

        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    cssApiService.fn.updateSession = function (param) {
        var ajaxOptions = {
            contentType: "application/json",
            data: JSON.stringify(param.data)
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.Session.UpdateById, xmsys.cfg.ApiName.CSS, xmsys.cfg.ApiModule.Session, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    }
    win.xmsys.cssService = new cssApiService();
}(window);