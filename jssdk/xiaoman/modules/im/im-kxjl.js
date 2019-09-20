xmsys.define(function (exports) {
    var kim = function () {

    };
    var IMClient = function (options) {
        this.__proto__.options = options;
    }

    kim.prototype.Builder = function (options) {
        return new IMClient(options);
    };


    IMClient.prototype.Connection = {};

    IMClient.prototype

    IMClient.prototype.open = function (params) {
        this.__proto__.Connection = new Strophe.Connection(this.options.Server, {withCredentials: false}, false);
        this.__proto__.Connection.connect(this.options.from, this.options.password, function (status) {
            if (status == Strophe.Status.CONNECTED) {
                this.__proto__.Connection.send($pres());
            }
        });
    };

    IMClient.prototype.addHandler = function (handler, ns, name, type, id, from, options) {
        this.__proto__.Connection.addHandler(handler, ns, name, type, id, from, options);
        return this;
    }

    IMClient.prototype.close = function (params) {

    }
    exports('im', 'kim', new kim());
});