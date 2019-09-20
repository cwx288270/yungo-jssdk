var shareData = {
    title: "微信测试",
    link: "http://xxqin.com/wx/TestRecord.html",
    imgUrl: "http://xxqin.com/log.jpg",
    desc: "微信测试"
};

function wxConfig() {
    var url = window.location.href; // 返回当前页码完整的URL
    var post = url.indexOf("#"); // 返回当前页码的#号值
    if (post >= 0) {
        url = url.substring(0, post);
    }
    $.ajax({
        url: "http://xxqin.asuscomm.com:9090/wechat-auth/wechat/auth/getWXCfgInfo",
        type: "POST",
        data: {
            url: url
        },
        cache: false,
        success: function (obj) {
            $("#token").val(obj.token)
            wx.config({
                debug: false,
                appId: obj.appid, // 必填，公众号的唯一标识
                timestamp: obj.timestamp, // 必填，生成签名的时间戳
                nonceStr: obj.nonceStr,// 必填，生成签名的随机串
                signature: obj.signature,// 必填，签名
                jsApiList: ['checkJsApi', 'onMenuShareTimeline',
                    'onMenuShareAppMessage', 'onMenuShareQQ',
                    'onMenuShareWeibo', 'hideMenuItems', 'onMenuShareQZone', 'stopRecord', 'startRecord', 'onVoiceRecordEnd', 'uploadVoice']
            });

        }
    });

};

wx.ready(function () {
    // 1 判断当前版本是否支持指定 JS 接口，支持批量判断
    wx.checkJsApi({
        jsApiList: ['getNetworkType', 'previewImage', 'onMenuShareTimeline',
            'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'onMenuShareQZone'],
        success: function (res) {
        }
    });

    // 好友
    wx.onMenuShareAppMessage({
        title: shareData.title, // 分享标题
        desc: shareData.desc,// 分享描述
        link: shareData.link,
        imgUrl: shareData.imgUrl, // 分享图标
        type: '', // 分享类型,music、video或link，不填默认为link
        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        success: function () {
            // alert("好友")
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    // 朋友圈
    wx.onMenuShareTimeline({
        title: shareData.title, // 分享标题
        link: shareData.link,
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {

            // alert("朋友圈")
        },
        cancel: function () {
        }
    });
    // QQ
    wx.onMenuShareQQ({
        title: shareData.title, // 分享标题
        desc: shareData.desc, // 分享描述
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        type: '', // 分享类型,music、video或link，不填默认为link
        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        success: function () {
            // alert("QQ")
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });

    // 微博
    wx.onMenuShareWeibo({
        title: shareData.title, // 分享标题
        desc: shareData.desc, // 分享描述
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {
            // alert("微博")
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });

    /* wx.hideMenuItems({
     menuList: ["menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:originPage", "menuItem:copyUrl"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
     });*/

    //QQ空间
    wx.onMenuShareQZone({
        title: shareData.title, // 分享标题
        desc: shareData.desc, // 分享描述
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    /**
     * wx.config({ debug: true,
	 * //开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	 * appId: 'wxa84bbd27626ce6e3', // 必填，公众号的唯一标识 timestamp:'' , // 必填，生成签名的时间戳
	 * nonceStr: '', // 必填，生成签名的随机串 signature: '',//必填，签名，见附录1 jsApiList: [] //
	 * 必填，需要使用的JS接口列表，所有JS接口列表见附录2 });
     */
    wx.error(function (res) {
        console.log(res);
    });

    wx.onVoiceRecordEnd({
        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
        complete: function (res) {
            var localId = res.localId;
            $("#msg").append('<div>录音自动停止' + JSON.stringify(res) + '</div>')
            console.log(res)
        }
    });
});

function startRecord() {
    wx.startRecord({
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
}


function stopRecord() {
    wx.stopRecord({
        success: function (res) {
            var localId = res.localId;
            $("#localId").val(localId);
            $("#msg").append('<div>停止录音' + JSON.stringify(res) + '</div>')
        },
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
};

function onVoiceRecordEnd() {
    wx.onVoiceRecordEnd({
        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
        complete: function (res) {
            var localId = res.localId;
            $("#msg").append('<div>' + JSON.stringify(res) + '</div>')
        }
    });
};

function uploadRecord() {
    wx.uploadVoice({
        localId: $("#localId").val(), // 需要上传的音频的本地ID，由stopRecord接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
            $("#msg").append('<div>服务端id' + JSON.stringify(res) + '</div>')
            var serverId = res.serverId; // 返回音频的服务器端ID
            $("#serverId").val(serverId)
        },
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
}

function downloadRecord() {
    window.open("http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" + $("#token").val() +
        "&media_id=" + $("#serverId").val()
    )

}