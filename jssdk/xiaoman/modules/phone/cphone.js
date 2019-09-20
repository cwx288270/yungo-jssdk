/**
 * Created by xxqin on 2016/11/28.
 * 模块 cphone
 */
xmsys.define(function (exports) {
    var cphone = function () {
    };

    cphone.prototype.login = function (token, success, fail) {
        xiaoman.execCallBack("cphone:" + token, success)
    };
    cphone.prototype.logout = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.open = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.close = function (success, fail) {

    };
    cphone.prototype.answer = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.release = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.transfer = function (phoneNum, success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.openRecord = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.closeRecord = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.callOut = function (phoneNum, success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.multiTalk = function (success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.setAgentState = function (state, success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.getAgentState = function (token, success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.setMute = function (operate, success, fail) {
        xiaoman.execCallBack(success)
    };
    cphone.prototype.set = function (options) {
        var that = this;
        that.options = options;
        return that;
    }
    exports('phone', 'cphone', new cphone());
});