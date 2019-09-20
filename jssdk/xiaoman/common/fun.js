/**
 * Created by xxqin on 2016/11/30.
 */
;(function (w) {
    w.xmsys.fun = {
        isChrome: function () {
            return window.navigator.userAgent.indexOf("Chrome") !== -1;
        },
        isFirefox: function () {
            return window.navigator.userAgent.indexOf("Firefox") !== -1;
        },
        nullValue: function (val) {
            if (!val || val == "null" || val == "undefined") {
                return "";
            }
            return val;
        },
        nullObject: function (obj) {
            for (var key in obj) {
                if (typeof key == "string") {
                    var val = obj[key];
                    obj[key] = this.nullValue(val);
                }
            }
            return obj;
        },
        getObjVal: function (obj, key) {
            try {
                var result = obj;
                var arr = key.split(".");
                for (var i = 0, len = arr.length; i < len; i++) {
                    var key = arr[i];
                    if (/\[\d+\]$/.test(key)) {
                        var index = key.match(/\[\d\]/)[0].replace(/\[|\]/g, "");
                        var key2 = key.replace(/\[\d\]/g, "");
                        result = result[key2][index];
                    } else {
                        result = result[arr[i]];
                    }
                    if (!result) {
                        return "";
                    }
                }
                return result;
            } catch (e) {
                return "";
            }
        },
        Cookie: {
            /*
             * 设置cookie
             * @param name 名称
             * @param val 值
             * @param param对象{  G：过期时间毫秒(以当前时间开始计算) ,domin：域名 path :表示cookie所在的目录 }
             */
            set: function (name, val, param) {
                var d;
                param && param.G && (d = new Date, d.setTime(d.getTime() + param.G));
                document.cookie = name + "=" + val + (d ? "; expires=" + d.toGMTString() : "")
                    + '; domain=' + ((param && param.domin) ? param.domin : '')
                    + '; path=' + ((param && param.path) ? param.path : '') + ';';
            },
            get: function (name) {
                return (name = RegExp("(^| )" + name + "=([^;]*)(;|$)").exec(document.cookie)) ? name[2] : null;
            }
        },
        Date: {
            getNowTime: function (fmt) {
                var dataFormat = fmt || "y-m-d h:m:s";
                return this.formatDate(new Date(), dataFormat);
            },
            formatDate: function (date, fmt) {
                var dataFormat = fmt || "y-m-d h:m:s";
                dataFormat = dataFormat.toUpperCase();

                function zeroFill(str) {
                    if (str != null && parseInt(str) < 10) {
                        return "0" + str;
                    }
                    return str;
                }

                var d = {
                    Y: date.getFullYear(),
                    M: zeroFill((date.getMonth() + 1)),
                    D: zeroFill(date.getDate()),
                    H: zeroFill(date.getHours()),
                    MIN: zeroFill(date.getMinutes()),
                    S: zeroFill(date.getSeconds())
                };
                if (!$.isNumeric(date.getFullYear())) {
                    return '--';
                } else {
                    if (dataFormat.indexOf("Y-M") >= 0) {
                        return dataFormat.replace(/Y/, d.Y).replace(/M/, d.M).replace(/D/, d.D).replace(/H/, d.H).replace(/M/, d.MIN)
                            .replace(/S/, d.S);
                    }
                    return dataFormat.replace(/D/, d.D).replace(/H/, d.H).replace(/M/, d.MIN)
                        .replace(/S/, d.S);
                }
            },
            //获取日期的长整型数据
            getLongTime: function (str, flagTime) {
                if (str) {
                    str = $.trim(str);
                    if (flagTime == 'start') {
                        return Date.parse(str + " 00:00:00");
                    } else if (flagTime == 'end') {
                        return Date.parse(str + " 23:59:59");
                    } else {
                        return Date.parse(str);
                    }
                }
                return "";
            },
            //毫秒格式化成时分秒
            formatLongTime: function (longTime) {
                var h = 0, m = 0, s = 0;//时分秒
                if (longTime > 60 * 60 * 1000) {
                    h = longTime / (60 * 60 * 1000);
                } else if (longTime > 60 * 1000) {
                    m = longTime / (60 * 1000);
                } else {
                    s = longTime / 1000;
                }
                var result = "";
                result += h ? (h + "h") : "";
                result += m ? (m + "m") : "";
                result += s ? (s + "s") : "";
                return result;
            },
            formatLongDiference: function (diference) {
                var m = 0;
                var s = 0;
                var returnTmp = '';
                if (diference != null) {
                    var sTmp = Math.ceil(diference / 1000);//毫秒转换成秒
                    m = Math.floor(sTmp / 60);//获取分钟
                    s = sTmp % 60;//获取剩余秒数
                }
                return m == 0 ? s == 0 ? '--' : s + '"' : m + "'" + s + '"';
            },
            formatLongDiferenceForS: function (diference) {
                var m = 0;
                var s = 0;
                var returnTmp = '';
                if (diference != null) {
                    m = Math.floor(diference / 60);//获取分钟
                    s = diference % 60;//获取剩余秒数
                }
                return m == 0 ? s + '"' : m + "'" + s + '"';
            },
            //获取当前时间减去创建时间的时差
            formatLagTime: function (LagTime) {
                var leave1 = LagTime % (24 * 3600 * 1000);   //计算天数后剩余的毫秒数
                var d = Math.floor(LagTime / (24 * 3600 * 1000));
                var h = Math.floor(leave1 / (3600 * 1000));  //计算相差分钟数
                var leave2 = leave1 % (3600 * 1000);       //计算小时数后剩余的毫秒数
                var m = Math.floor(leave2 / (60 * 1000));
                var result = "";
                result += h ? (h + "h") : "";
                result += h ? (h + '"') : "";
                return result;
            },
            //获取当前时间减去创建时间的时差并向上取整
            formatLagTimeToUp: function (LagTime) {
                //将毫秒转换成小时，向上取整数
                var leave = Math.ceil(LagTime / (3600 * 1000));
                //获取天数，向下取整
                var d = Math.floor(leave / 24);
                var h = leave % 24;
                var result = "";
                if (d == 0 && h == 1) {
                    var m = Math.ceil(LagTime / (60 * 1000));
                    result += m ? (m + "'") : "";
                } else {
                    result += d ? (d + "天") : "";
                    result += h ? (h + "h") : "";
                }
                return result;
            },
            /*计算距离当前时间的前几天或过去几天的日期*/
            getBefOrAftD: function (num, formateStyle, time) {
                var formateStyle = formateStyle || '-';
                var now = new Date().getTime();
                var minD = 1000 * 60 * 60 * 24;
                var calcD = now + minD * num;
                var afterD = new Date(calcD);
                var year = afterD.getFullYear();
                var month = (afterD.getMonth() + 1).toString().length < 2 ? '0' + (afterD.getMonth() + 1) : (afterD.getMonth() + 1);
                var day = afterD.getDate().toString().length < 2 ? '0' + afterD.getDate() : afterD.getDate();
                return year + formateStyle + month + formateStyle + day + (time ? (time == 'start' ? ' 00:00:00' : ' 23:59:59') : '');
            },
            getBefOrAftDWeek: function (num, formateStyle, time) {
                var now = new Date();
                var formateStyle = formateStyle || '-';
                var now = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
                var minD = 1000 * 60 * 60 * 24;
                var calcD = now + minD * num;
                var afterD = new Date(calcD);
                var year = afterD.getFullYear();
                var month = (afterD.getMonth() + 1).toString().length < 2 ? '0' + (afterD.getMonth() + 1) : (afterD.getMonth() + 1);
                var day = afterD.getDate().toString().length < 2 ? '0' + afterD.getDate() : afterD.getDate();
                return year + formateStyle + month + formateStyle + day + (time ? (time == 'start' ? ' 00:00:00' : ' 23:59:59') : '');
            },
            chngDtTmFrm: function (dateTemp) {
                var sp1 = dateTemp.split(' ');
                if (sp1.length == 1) {
                    return dateTemp;
                }
                var sp2 = sp1[0].split('-');
                var sp3 = sp1[1].split(':');
                var sp4 = sp2[0] + '/' + sp2[1] + '/' + sp2[2] + ' ' + sp3[0] + ':' + sp3[1];
                return sp4;
            },
            getCallDifferentTime: function (differentTime) {
                var s = Math.floor(differentTime / 1000); //转换成秒
                var m = Math.floor(s / 60); //获取分钟
                var overS = s % 60; //获取剩余秒数
                var h = Math.floor(m / 60); //获取小时
                var overM = m % 60; //获取剩余分钟
                overS = overS < 10 ? '0' + overS : overS;
                overM = overM < 10 ? '0' + overM : overM;
                h = h < 10 ? '0' + h : h;
                return h == '00' ? overM + ':' + overS : h + ':' + overM + ':' + overS;
            },
            getShort: function (str) {
                if (!str) {
                    return str || '--';
                } else if (str && str.length < 12) {
                    return str;
                } else {
                    return str.substring(0, 11) + '...';
                }
            }
        },
        //这里的参数说明一下，text是要复制的文本内容，button是点击触发复制的dom对象,msg是复制成功后的提示信息
        clipboard: function (text, button, msg) {
            if (window.clipboardData) {//如果是IE浏览器
                var copyBtn = document.getElementById(button);
                copyBtn.onclick = function () {
                    window.clipboardData.setData('text', text);
                    alert(msg);
                }
            } else {//非IE浏览器
                var clip = new ZeroClipboard.Client();//初始化一个剪切板对象
                clip.setHandCursor(true);//设置手型游标
                clip.setText(text);//设置待复制的文本内容
                clip.addEventListener("mouseUp", function (client) {//绑定mouseUp事件触发复制
                    alert(msg);
                });
                clip.glue(button, button);//调用ZeroClipboard.js的内置方法处理flash的位置的问题
            }
            return false;
        },
        getLocalUrl: function () {
            var url = location.protocol + "//" + location.hostname;
            if (location.port.length > 0) {
                url += ":" + location.port;
            }
            return url;
        },
        getProtocol: function () {
            return window.location.protocol;
        },
        getQueryParam: function (param) {
            var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
            var searchParam = window.location.search.substr(1);
            searchParam = searchParam.replace(/&amp;/g, "&");
            var r = searchParam.match(reg);
            if (r != null) {
                return decodeURIComponent(r[2]);
            }
            return "";
        },
        getUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        getRestfulUrl: function (url, apiName, module, token, version) {

            var v = version || xmsys.cfg.ApiVersion;
            var apiUrl = "";
            if (apiName == xmsys.cfg.ApiName.CMS) {
                return xmsys.cfg.ApiPrefix.CMS + url.substring(1, url.length);
            }
            var business = xmsys.cache[xmsys.cfg.CacheKey.UserInfo].enterprise.id
            if (apiName == xmsys.cfg.ApiName.CSS) {
                apiUrl = xmsys.cfg.ApiPrefix.CSS;
            } else if (apiName == xmsys.cfg.ApiName.Outbound) {
                apiUrl = xmsys.cfg.ApiPrefix.Outbound;
            }
            else if (apiName == xmsys.cfg.ApiName.AM) {
                apiUrl = xmsys.cfg.ApiPrefix.AM;
            }
            else {
                apiUrl = xmsys.cfg.ApiPrefix.YunGo;
            }
            if (module == "account") {
                url = apiUrl + v + "/" + module + url;
            } else {
                url = apiUrl + v + "/" + module + "/" + business + url;
            }

            if (token == null || token == "") {
                token = new Date().getTime();
            }

            if (url.indexOf("?") >= 0) {
                url += "&token=" + token;
            } else {
                url += "?token=" + token;
            }
            return url;
        },
        parseChannel: function (channelType) {
            var channel = 0;
            switch (channelType) {
                case xmsys.cfg.Channel.call:
                    channel = 4;
                    break;
                case  xmsys.cfg.Channel.sms:
                    channel = 2;
                    break;
                case  xmsys.cfg.Channel.wechat:
                    channel = 1;
                    break;
                case  xmsys.cfg.Channel.webchat:
                    channel = 3;
                    break;
            }
            return channel;
        },
        parseCallType: function (callType) {
            var callType = 0;
            switch (callType) {
                case xmsys.cfg.CallType.inbound:
                    callType = 0;
                    break;
                case  xmsys.cfg.CallType.outbound:
                    callType = 1;
                    break;
            }
            return callType;
        },
        getPhoneTransCode: function (originalCode, originalDesc) {
            var key = xmsys.cfg.TransPhoneCode[originalCode]
            if (key == null || key == "") {
                key = "SysError"
            }
            var definCode = xmsys.cfg.code[key];
            var codeInfo = {};
            if (definCode != null) {
                codeInfo = {
                    code: definCode.code,
                    desc: definCode.desc,
                    originalCode: originalCode,
                    originalDesc: originalDesc
                }
            } else {
                codeInfo = {
                    code: xmsys.cfg.code.SysError.code,
                    desc: xmsys.cfg.code.SysError.desc,
                    originalCode: originalCode,
                    originalDesc: originalDesc
                }
            }
            return codeInfo;
        }
    };
    xmsys.ajax = {
        _ajaxDefault: {
            type: "post",
            xhrFields: {
                withCredentials: false
            },
            crossDomain: true,
            dataType: "json",
        },
        ajaxPost: function (req, options) {
            var param = {
                url: req.url,
                type: "post",
                xhrFields: {
                    //withCredentials: true
                    withCredentials: false
                },
                beforeSend: function () {
                    //进行ajax请求前需要设置cookie
                    if (xmsys.fun.Cookie.get("webSession")) {
                        xmsys.fun.Cookie.set("webSession", new Date().getTime(), {G: xmsys.cfg.webSessionTimeOut});
                    }
                },
                success: function (data, textStatus, jqXHR) {
                    //xmsys.info("请求参数：[" + JSON.stringify(req) + "|" + JSON.stringify(options) + "]，结果：" + JSON.stringify(data))
                    xmsys.info(xmsys.cfg.ModuleName.Fun, "post请求成功", "ajaxPost",
                        "请求参数：[" + JSON.stringify(req) + "|" + JSON.stringify(options) + "]，结果：" + JSON.stringify(data))
                    if (!data && !jqXHR.responseText) {
                        req.callback && req.callback({
                            code: xmsys.cfg.code.SysError.code,
                            desc: xmsys.cfg.code.SysError.desc
                        });
                    } else {
                        var transCodeKey = xmsys.cfg.TransInterfaceCode[data.code]
                        if ((!transCodeKey || transCodeKey == "") && data.subCode) {
                            transCodeKey = xmsys.cfg.TransInterfaceCode[data.subCode]
                        }
                        var transCode = xmsys.cfg.code[transCodeKey ? transCodeKey : "SysError"];
                        req.callback && req.callback({
                            code: data.code == 200 || data.code == 0 ? xmsys.cfg.code.Success.code : (transCode ? transCode.code : xmsys.cfg.code.SysError.code),
                            desc: data.code == 200 || data.code == 0 ? xmsys.cfg.code.Success.desc : (transCode ? transCode.desc : xmsys.cfg.code.SysError.desc)
                        }, data);
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    //xmsys.info("请求参数：[" + JSON.stringify(req) + "|" + JSON.stringify(options) + "]，结果：" + JSON.stringify(errorThrown))
                    xmsys.error(xmsys.cfg.ModuleName.Fun,  "post请求出错", "ajaxPost",
                        "请求参数：[" + JSON.stringify(req) + "|" + JSON.stringify(options) + "]，结果：" + JSON.stringify(errorThrown))
                    req.callback && req.callback({
                        code: xmsys.cfg.code.SysError.code,
                        desc: xmsys.cfg.code.SysError.desc
                    });
                    throw errorThrown;
                }
            };
            return $.ajax($.extend(true, {}, this._ajaxDefault, options || {}, param));
        }
    }
})(window);