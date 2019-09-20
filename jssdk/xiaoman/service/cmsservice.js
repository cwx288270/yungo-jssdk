/**
 * Created by xxqin on 2016/11/30.
 */
;!function (win) {
    "use strict";
    var cmsService = function () {
    }

    cmsService.fn = cmsService.prototype;
    cmsService.fn.login = function (param) {
        var ajaxOptions = {
            data: param.data
        };
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.CMS.loginCheck, xmsys.cfg.ApiName.CMS, xmsys.cfg.ApiModule.CMS, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req, ajaxOptions);
    };
    cmsService.fn.logout = function (param) {
        var req = {
            url: xmsys.fun.getRestfulUrl(xmsys.cfg.ApiSuffix.CMS.logout, xmsys.cfg.ApiName.CMS, xmsys.cfg.ApiModule.CMS, param.token),
            callback: param.callback
        };
        xmsys.ajax.ajaxPost(req);
    }
    win.xmsys.cmsService = new cmsService();
}(window);