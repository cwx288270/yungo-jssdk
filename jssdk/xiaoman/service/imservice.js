/**
 * Created by xxqin on 2017/2/8.
 */
;!function (win) {
    "use strict";
    var imService = function () {
    }

    imService.fn = imService.prototype;
    imService.fn.parseGenesysProxyIQ = function (msg) {
        var $msg = $(msg).find("msg");
        var resultMsg = JSON.parse($msg.text());
        var origin = $msg.attr("origin");
        resultMsg.origin = origin;
        return resultMsg;

    }

    imService.fn.parseGenesysProxyMsg = function (msg) {
        var $msg = $(msg);
        var resultMsg = JSON.parse($msg.find("body").text());
        var origin = $msg.find("origin").text();
        var strFrom = $msg.attr("from")
        var strTo = $msg.attr("to");
        resultMsg.origin = origin;
        resultMsg.from = strFrom;
        resultMsg.to = strTo;
        return resultMsg;

    }
    imService.fn.parseSipClientMsg = function (msg) {
        var $msg = $(msg);
        var resultMsg = JSON.parse($msg.find("body").text());
        var strFrom = $msg.attr("from")
        var strTo = $msg.attr("to");
        resultMsg.origin = resultMsg.origin;
        resultMsg.from = strFrom;
        resultMsg.to = strTo;
        resultMsg.msgType = resultMsg.type;
        return resultMsg;

    }
    imService.fn.parseChatMsg = function (msg) {
        var $msg = $(msg);
        var strFrom = $msg.attr("from")
        var strTo = $msg.attr("to");
        var from = strFrom.substring(0, strFrom.indexOf('@'));
        var to = strTo.substring(0, strTo.indexOf('@'));
        var type = $msg.attr("type");
        var body = $msg.find("body").text();
        var createTime = $msg.find("createTime").text();
        var msgType = $msg.find("msgType").text();
        var msgId = $msg.find("msgId").text();
        var channelKey = $msg.find("channelKey").text();
        var sessionId = $msg.find("sessionId").text();
        var channel = $msg.find("channel").text();
        var fromType = $msg.find("fromType").text();
        var toType = $msg.find("toType").text();
        var notifyType = $msg.find("notifyType").text();
        if (notifyType == null || notifyType == "") {
            notifyType = xmsys.cfg.OnMessageType.ChatMsg
        }
        return {
            notifyType: notifyType,
            body: {
                from: from,
                to: to,
                sessionId: sessionId,
                body: body,
                createTime: createTime,
                msgType: msgType,
                msgId: msgId,
                /*  type: type,
                 channelKey: channelKey,
                 channel: channel,
                 fromType: fromType,
                 toType: toType*/
            }

        }
    };
    imService.fn.parseTranslateMsg = function (msg) {
        var $msg = $(msg);
        var strFrom = $msg.attr("from")
        var strTo = $msg.attr("to");
        var from = strFrom.substring(0, strFrom.indexOf('@'));
        var to = strTo.substring(0, strTo.indexOf('@'));
        var type = $msg.attr("type");
        var body = $msg.find("body").text();
        var createTime = $msg.find("createTime").text();
        var msgType = $msg.find("msgType").text();
        var msgId = $msg.find("msgId").text();
        //var channelKey = $msg.find("channelKey").text();
        var sessionId = $msg.find("sessionId").text();
        var channel = $msg.find("channel").text();
        var fromType = $msg.find("fromType").text();
        var toType = $msg.find("toType").text();
        var mark = $msg.find("mark").text();
        var translateType = $msg.find("translateType").text();
        return {
            notifyType: xmsys.cfg.OnMessageType.Phone.VoiceToTextMsg,
            body: {
                from: from,
                to: to,
                body: {content: body, who: mark, translateType: translateType},
                createTime: createTime,
                msgType: msgType,
                msgId: msgId,
                sessionId: sessionId
                /*  type: type,
                 channel: channel,
                 fromType: fromType,
                 toType: toType,*/
            }

        }
    };
    imService.fn.parseTranslateTag = function (msg) {
        var $msg = $(msg);
        var strFrom = $msg.attr("from")
        var strTo = $msg.attr("to");
        var from = strFrom.substring(0, strFrom.indexOf('@'));
        var to = strTo.substring(0, strTo.indexOf('@'));
        var type = $msg.attr("type");
        var createTime = $msg.find("createTime").text();
        var msgType = $msg.find("msgType").text();
        var msgId = $msg.find("msgId").text();
        var channel = $msg.find("channel").text();
        var fromType = $msg.find("fromType").text();
        var toType = $msg.find("toType").text();
        var tagValue = $msg.find("tagValue").text();
        var tagContent = $msg.find("tagContent").text();
        var translateType = $msg.find("translateType").text();
        var tagType = $msg.find("tagType").text();
        return {
            notifyType: xmsys.cfg.OnMessageType.Phone.VoiceToTextTag[tagType],
            body: {
                from: from,
                to: to,
                body: {tagValue: tagValue, tagContent: tagContent, translateType: translateType},
                createTime: createTime,
                msgType: msgType,
                msgId: msgId
                /*  type: type,
                 channel: channel,
                 fromType: fromType,
                 toType: toType,*/
            }

        }
    };
    imService.fn.parsePresence = function (presence) {
        var type = presence.getAttribute("type");
        var from = $(presence).attr('from');
        var to = $(presence).attr('to');
        return {
            from: from || "",
            to: to || "",
            type: type || ""
        };
    }

    win.xmsys.imService = new imService();
}(window);