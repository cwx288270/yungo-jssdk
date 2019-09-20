/**
 * Created by xxqin on 2016/12/28.
 */
xmsys.define(function (exports) {
    var phoneClient = function () {
        this.cache = cache;
    };
    var cache = phoneClient.prototype.cache = {};

    phoneClient.prototype.showLogin = function () {
        layer.closeAll();
        var html = template('phone/login', {});
        layer.open({
            title: false,
            maxWidth: 500,
            type: 1,
            closeBtn: 0, //不显示关闭按钮
            shadeClose: true, //开启遮罩关闭
            content: html
        });
    };
    phoneClient.prototype.callShow = function (data) {
        clearInterval(cache[xmsys.cfg.CacheKey.TimeId.CallShowWaitTimeId])
        layer.closeAll();
        var html = template('phone/callshow', data ? data : {});
        layer.open({
            title: false,
            maxWidth: 500,
            type: 1,
            closeBtn: 0, //不显示关闭按钮
            shadeClose: false, //开启遮罩关闭
            content: html
        });
        var timeIndex = 0;
        var setTime = function () {
            var hour = parseInt(timeIndex / 3600);    // 计算时
            var minutes = parseInt((timeIndex % 3600) / 60);    // 计算分
            var seconds = parseInt(timeIndex % 60);    // 计算秒
            hour = hour < 10 ? "0" + hour : hour;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            $("#xm_waittime span").html(hour + ":" + minutes + ":" + seconds);
            timeIndex++;
        }
        var timeId = setInterval(setTime, 1000);
        cache[xmsys.cfg.CacheKey.TimeId.CallShowWaitTimeId] = timeId
    };
    phoneClient.prototype.callPlateShow = function () {
        if (!xmsys.checkLogin()) {
            xiaoman.client.phone.showLogin();
            return;
        } else {

        }
        var data = {};
        data.telRes = xmsys.cache[xmsys.cfg.CacheKey.UserInfo].telRes;
        layer.closeAll();
        var html = template('phone/callplate', data);
        layer.open({
            title: false,
            maxWidth: 500,
            type: 1,
            closeBtn: 0, //不显示关闭按钮
            shadeClose: true, //开启遮罩关闭
            content: html
        });
        $("#xm_plate span").click(function () {
            $("#xm_callnum").val($("#xm_callnum").val() + $(this).text())
        })
    };
    phoneClient.prototype.transferPlateShow = function () {
        if (!xmsys.checkLogin()) {
            xiaoman.client.phone.showLogin();
            return;
        } else {

        }
        var data = {};
        data.telRes = xmsys.cache[xmsys.cfg.CacheKey.UserInfo].telRes;
        layer.closeAll();
        var html = template('phone/transferplate', data);
        layer.open({
            title: false,
            maxWidth: 500,
            type: 1,
            closeBtn: 0, //不显示关闭按钮
            shadeClose: true, //开启遮罩关闭
            content: html
        });
        $("#xm_plate span").click(function () {
            $("#xm_callnum").val($("#xm_callnum").val() + $(this).text())
        })
    };
    phoneClient.prototype.setAgentState = function (state) {
        if (!xmsys.checkLogin()) {
            return false;
        }
        //判断是否签入，如果没有签入则执行签入
        xiaoman.phone.getAgentState({
            success: function (getAgentStateRes) {
                if (getAgentStateRes && getAgentStateRes.state && getAgentStateRes.state == xmsys.cfg.AgentStates.logout.code) {
                    xiaoman.client.phone.loginPhone();
                } else {
                    xiaoman.phone.setAgentState({
                        state: state,
                        success: function (res) {
                        },
                        fail: function (res) {
                        }
                    })
                }
                $(".callStatusBox").toggle();
            },
            fail: function (res) {
            }
        })
    };
    phoneClient.prototype.callMain = function () {
        var xmfb = $(".xiaoman-fb");
        //如果已存在则判断是否为隐藏，如果是则显示，不是则直接退出
        if (xmfb.length > 0) {
            if (xmfb.css("display") == "block")
                return;
            else {
                xmfb.show();
                return;
            }
        }
        if (xmsys.checkLogin()) {
            xiaoman.client.phone.addEvent();
            xiaoman.phone.open({
                success: function (openRes) {
                    xiaoman.phone.login({
                        token: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].token,
                        success: function (phoneLoginRes) {
                            layer.msg("电话签入成功", {time: 2000})
                        },
                        fail: function (phoneLoginRes) {
                            layer.msg("电话签入失败:" + logrinRes.desc, {time: 2000})
                        }
                    })
                },
                fail: function (openRes) {
                }
            })
        }
        layer.closeAll();
        var html = template('phone/callMain', {});
        $("body").prepend(html);
        $(".callStatusFa").click(function () {
            if (!xmsys.checkLogin()) {
                xiaoman.client.phone.showLogin();
            } else {
                $(".callStatusBox").toggle();
            }
        });
        var _move = false;//移动标记
        var _x, _y;//鼠标离控件左上角的相对位置
        var width = document.documentElement.clientWidth;
        var height = document.documentElement.clientHeight;

        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.PhoneClient) {
            var defaultBottom = xmsys.cfg.extOptions.PhoneClient.bottom;
            var defaultRight = xmsys.cfg.extOptions.PhoneClient.right;
            if (!defaultRight) {
                defaultRight = width - 150
            }
            if (!defaultBottom) {
                defaultBottom = height - 200
            }
            $(".xiaoman-fb").css({bottom: defaultBottom, right: defaultRight})
        } else {
            $(".xiaoman-fb").css({bottom: 200, right: 150})
        }


        $(".callmove").mousedown(function (e) {
            if ($(".xiaoman-fb").css("display") == "none") {
                return;
            }
            width = $(window).width();
            height = $(window).height();
            _move = true;
            _x = e.pageX - parseInt($(".xiaoman-fb").css("left"));
            _y = e.pageY - parseInt($(".xiaoman-fb").css("top"));
            $(".xiaoman-fb").fadeTo(20, 0.5);//点击后开始拖动并透明显示
            return false;
        });
        $(document).mousemove(function (e) {
            if ($(".xiaoman-fb").css("display") == "none") {
                return;
            }
            var moveElementWidth = $(".xiaoman-fb").width();
            var moveElementHeight = $(".xiaoman-fb").height();
            if (_move) {
                var x = e.pageX - _x;//移动时根据鼠标位置计算控件左上角的绝对位置
                var y = e.pageY - _y;
                //判断拖拽不能超过窗口宽度
                if (x - 10 <= 0 || x + moveElementWidth + 15 >= width) {
                    if (y > 0 && y + moveElementHeight < height) {
                        $(".xiaoman-fb").css({bottom: height - y - moveElementHeight});
                        return false;
                    }
                    return false;
                }
                if (y - 10 <= 0 || y + moveElementHeight >= height) {
                    if (x > 0 && x + moveElementWidth + 15 < width) {
                        $(".xiaoman-fb").css({right: width - x - moveElementWidth});
                    }
                    return false;
                }
                $(".xiaoman-fb").css({bottom: height - y - moveElementHeight, right: width - x - moveElementWidth});//控件新位置
                return false;
            }
        }).mouseup(function () {
            if ($(".xiaoman-fb").css("display") == "none") {
                return;
            }
            _move = false;
            $(".xiaoman-fb").fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明
        });
    };
    phoneClient.prototype.login = function () {
        xiaoman.base.login({
            account: $("#xm_username").val(), password: $("#xm_password").val(),
            success: function (logrinRes) {
                $(".callStatusFa").unbind('click').click(function () {
                    $(".callStatusBox").toggle();
                });
                layer.closeAll();
                layer.msg("登录成功", {time: 1000})
                //如果开启了实时语音流转写则需要启动im
                if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsOpenVoiceToText) {
                    xiaoman.im.open({
                        success: function (res) {
                            layer.msg("消息推送服务启动成功", {time: 1000})
                        },
                        fail: function (res) {

                        }
                    })
                }
                xiaoman.client.phone.addEvent()
                xiaoman.phone.open({
                    success: function (opeRes) {
                        layer.msg("电话启动成功", {time: 2000})
                        xiaoman.phone.login({
                            token: logrinRes.token,
                            success: function (phoneLoginRes) {
                                layer.msg("电话签入成功", {time: 2000})
                            },
                            fail: function (phoneLoginRes) {
                                layer.msg("电话签入失败:" + logrinRes.desc, {time: 2000})
                            }
                        })
                    },
                    fail: function (opeRes) {
                        layer.msg("电话启动失败", {time: 2000})
                    }
                })
            },
            fail: function (res) {
                layer.msg(res.desc, {time: 2000})
            }
        })
    };
    phoneClient.prototype.loginPhone = function () {
        xiaoman.phone.login({
            token: xmsys.cache[xmsys.cfg.CacheKey.UserInfo].token,
            success: function (loginRes) {
            },
            fail: function (loginRes) {
            }
        })
    };
    phoneClient.prototype.logout = function () {
        if (!xmsys.checkLogin()) {
            return false;
        }
        if (xmsys.cfg.extOptions && xmsys.cfg.extOptions.IsOpenVoiceToText) {
            xiaoman.im.close();
        }
        xiaoman.phone.close({
            success: function (res) {

                xiaoman.base.logout({
                    success: function (res) {
                        $(".callStatusFa").unbind('click').click(function () {
                            xiaoman.client.phone.showLogin();
                        });
                        $(".callStatusBox").toggle();
                        $(".callStatusFa .statusText").html("点击登录");
                        $(".callStatusFa .fa-status").removeClass().addClass("fa-status fa-logout");
                    },
                    fail: function (res) {

                    }
                })
            },
            fail: function (res) {

            }
        })

    };
    phoneClient.prototype.cancel = function () {
        layer.closeAll();
    };
    phoneClient.prototype.callOut = function () {
        xiaoman.phone.callOut({
            line: $("#xm_outshowtel").val(),
            phoneNum: $("#xm_callnum").val(),
            isRecord: true,
            success: function (res) {
                layer.closeAll();
                layer.msg(res.desc, {time: 2000})
            },
            fail: function (res) {
                layer.msg(res.desc, {time: 2000})
            }
        })
    };
    phoneClient.prototype.transfer = function () {
        xiaoman.phone.transfer({
            line: $("#xm_outshowtel").val(),
            phoneNum: $("#xm_callnum").val(),
            isRecord: true,
            success: function (res) {
                layer.closeAll();
                layer.msg(res.desc, {time: 2000})
            },
            fail: function (res) {
                layer.msg(res.desc, {time: 2000})
            }
        })
    };
    phoneClient.prototype.answer = function () {
        xiaoman.phone.answer({
            success: function (res) {
                layer.closeAll();
                layer.msg(res.desc, {time: 2000})
            },
            fail: function (res) {
                layer.msg(res.desc, {time: 2000})
            }
        })
    };
    phoneClient.prototype.release = function () {
        xiaoman.phone.release({
            success: function (res) {
                layer.closeAll();
                layer.msg(res.desc, {time: 2000})
            },
            fail: function (res) {
                layer.msg(res.desc, {time: 2000})
            }
        })
    };
    phoneClient.prototype.setMute = function () {
        var muteState = $(".callMain .callMute").attr("mutestate")
        if (muteState == "close") {
            xiaoman.phone.setMute({
                operate: "open",
                success: function (res) {
                    $(".callMain .callMute").attr("mutestate", "open");
                    $(".callMain .callMute").children("i").removeClass().addClass("fa fa-volume-off");
                },
                fail: function (res) {
                }
            })
        } else {
            xiaoman.phone.setMute({
                operate: "close",
                success: function (res) {
                    $(".callMain .callMute").attr("mutestate", "close")
                    $(".callMain .callMute").children("i").removeClass().addClass("fa fa-volume-up");
                },
                fail: function (res) {
                }
            })
        }
    };
    phoneClient.prototype.setCallKeep = function () {
        var keepstate = $(".callMain .callKeep").attr("keepstate")
        if (keepstate == "holding") {
            xiaoman.phone.retrieve({
                success: function (res) {
                    $(".callMain .callKeep").attr("keepstate", "busy");
                    $(".callMain .callKeep").children("i").removeClass().addClass("fa fa-volume-off");
                },
                fail: function (res) {
                }
            })
        } else {
            xiaoman.phone.hold({
                success: function (res) {
                    $(".callMain .callKeep").attr("keepstate", "holding")
                    $(".callMain .callKeep").children("i").removeClass().addClass("fa fa-volume-up");
                },
                fail: function (res) {
                }
            })
        }
    };
    phoneClient.prototype.addEvent = function () {
        if (xiaoman.client.phone.cache[xmsys.cfg.CacheKey.TmpData.IsAddEvent] == true) {
            return;
        }
        /* xiaoman.phone.event.onMessage(function (res) {

         });
         xiaoman.phone.event.ringing(function (res) {

         });*/
        xiaoman.phone.event.established(function (res) {
            //显示通话时间
            var timeIndex = 0;
            var setTime = function () {
                var hour = parseInt(timeIndex / 3600);    // 计算时
                var minutes = parseInt((timeIndex % 3600) / 60);    // 计算分
                var seconds = parseInt(timeIndex % 60);    // 计算秒
                hour = hour < 10 ? "0" + hour : hour;
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
                $(".callMain .callTime").html(hour + ":" + minutes + ":" + seconds);
                timeIndex++;
            }
            var timeId = setInterval(setTime, 1000);
            cache[xmsys.cfg.CacheKey.TimeId.PhoneBarCallTimeId] = timeId
            $(".callMain .callTime").fadeIn(100);
            $(".callMain .callMute").fadeIn(100);
        });
        xiaoman.phone.event.released(function (res) {
            clearInterval(cache[xmsys.cfg.CacheKey.TimeId.PhoneBarCallTimeId])
            $(".callMain .callTime").fadeOut(1000);
            $(".callMain .callMute").fadeOut(1000);
            $(".callMain .callRelease").fadeOut(1000);
            $(".callMain .callTrans").fadeOut(1000);
           /* $(".callMain .callKeep").fadeOut(1000);*/
        });
        xiaoman.phone.event.agentStateChange(function (res) {

            //phone bar 状态处理
            if (xmsys.sessionData(xmsys.cfg.CacheKey.TmpData.PhoneState) == "close") {
                $(".callStatusFa .statusText").html("点击登录");
                $(".callStatusFa .fa-status").removeClass().addClass("fa-status fa-logout");
            }
            else {
                $(".callStatusFa .statusText").html(xmsys.cfg.AgentStates[res.state] ? xmsys.cfg.AgentStates[res.state].desc : xmsys.cfg.AgentStates.notready.desc);
                $(".callStatusFa .fa-status").removeClass().addClass("fa-status fa-" + res.state);
            }

            $(".callStatusBox span").children("i:last-child").removeClass("activate").addClass("noactivate");
            if (res.state != xmsys.cfg.AgentStates.ready.code && res.state != xmsys.cfg.AgentStates.aftercallwork.code && res.state != xmsys.cfg.AgentStates.logout.code) {
                $(".callStatusBox span[agentstate=" + xmsys.cfg.AgentStates.notready.code + "]").children("i:last-child").removeClass("noactivate").addClass("activate");
                if (res.state == xmsys.cfg.AgentStates.dialing.code || res.state == xmsys.cfg.AgentStates.busy.code || res.state == xmsys.cfg.AgentStates.ringing.code) {
                    $(".callMain .callRelease").fadeIn(1000);
                }
            }
            else {
                $(".callStatusBox span[agentstate=" + res.state + "]").children("i:last-child").removeClass("noactivate").addClass("activate");
            }

            if (res.state == xmsys.cfg.AgentStates.ringing.code) {
                //显示通话时间
                $(".callMain .callTime").fadeIn(1000);
                xiaoman.base.getRuntimeData({
                    name: xmsys.cfg.CacheKey.RunDataKey.Ani,
                    success: function (runDataRes) {
                        xiaoman.client.phone.callShow(runDataRes);
                    },
                    fail: function (res) {

                    }
                })
            } else if (res.state == xmsys.cfg.AgentStates.busy.code || res.state == xmsys.cfg.AgentStates.holding.code) {
                //刷新页面后继续计时
                if (!cache[xmsys.cfg.CacheKey.TimeId.PhoneBarCallTimeId]) {
                    //显示通话时间
                    var timeIndex = 0;
                    var setTime = function () {
                        var hour = parseInt(timeIndex / 3600);    // 计算时
                        var minutes = parseInt((timeIndex % 3600) / 60);    // 计算分
                        var seconds = parseInt(timeIndex % 60);    // 计算秒
                        hour = hour < 10 ? "0" + hour : hour;
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        $(".callMain .callTime").html(hour + ":" + minutes + ":" + seconds);
                        timeIndex++;
                    }
                    var timeId = setInterval(setTime, 1000);
                    cache[xmsys.cfg.CacheKey.TimeId.PhoneBarCallTimeId] = timeId
                }


                $(".callMain .callRelease").fadeIn(1000);
                /*$(".callMain .callKeep").fadeIn(1000);*/
                $(".callMain .callMute").fadeIn(1000);
                $(".callMain .callTime").fadeIn(1000);
                xiaoman.base.getRuntimeData({
                    name: "CallType",
                    success: function (getRuntimeDataRes) {
                        if (getRuntimeDataRes && getRuntimeDataRes.value == 'inbound') {
                            $(".callMain .callTrans").fadeIn(1000);
                        }
                    },
                    fail: function (res) {

                    }
                })
            }
        })
        cache[xmsys.cfg.CacheKey.TmpData.IsAddEvent] = true;
    }
    exports('client', 'phone', new phoneClient());
});