var vm = new Vue({
    el: "#app",
    data: {
        choices: "空",
        choice: "",
        res: "",
        debug: "debug",
        question: "无提示！",
        dob: "2006-03-09",
        sex: "female",
        org: "testorg",
        jingwei: "",
        seq: 1
    },
    computed: {},
    methods: {
        addcss: function (index) {
            item = $('#item' + index)
            item.removeClass("duoxuan_no")
            item.addClass("duoxuan_yes")
        },
        initAddCss: function () {
            for (i = 0; i < 7; i++) {
                item = $('#item' + i)
                if (item.length > 0) {
                    if(item.hasClass("duoxuan_yes")){
                        item.removeClass("duoxuan_yes")
                    }
                     if(!item.hasClass("duoxuan_no")){
                         item.addClass("duoxuan_no")
                    }

                }

            }
        },
        changeImg: function () {
            if (vm.debug === "debug") {
                vm.debug = "no_de_bug"
            }
            else {
                vm.debug = "debug"
            }
        },
        inputcontains: function (longtext, shorttext) {
            return longtext.indexOf(shorttext) > 0;
        },
        start: function () {
            vm.seq = 1
            vm.jingwei = ""
            vm.question = "无提示！"
            vm.choices = "空"
            vm.res = ""
            vm.sessionId = ""
            vm.choice = ""
            $.ajax({
                type: "POST",
                url: httpurl+"/v2/sessions?clientId=testclient&orgId=testorg",
                data: JSON.stringify({
                        "patient": {
                            "name": "J",
                            "dob": vm.dob,
                            "sex": vm.sex,
                            "cardNo": "abc1231"
                        },
                        "wechatOpenId": "weichat1icdmqq23123mmq"
                    }
                ),
		contentType:"application/json",
                dataType: "json",
                success: function (message) {
                    console.log(message)
                    vm.res = JSON.stringify(message, null, 2)

                    vm.question = message.question.query
                    vm.choices = message.question.choices
                    vm.sessionId = message.sessionId
                },
                error: function (message) {
                    vm.res = message
                    $.confirm({
                        icon: 'fa fa-question',
                        theme: 'modern',
                        animation: 'RotateX',
                        title: '错误检查',
                        content: "您是否安装了谷歌浏览器?或者正在使用谷歌浏览器？",
                        buttons: {
                            "是": function () {
                                $.confirm({
                                    icon: 'fa fa-question',
                                    theme: 'modern',
                                    title: '错误检查',
                                    animation: 'RotateR',
                                    content: "您是否安装了陈博给的谷歌浏览器插件 'allow-control-allow-origi' <img src='img/cors.png'/>？",
                                    buttons: {
                                        "是": function () {
                                            $.alert({
                                                title: '解决方案：',
                                                content: "" +
                                                "<br/>1.点击陈博给的google浏览器插件" +
                                                "<br/>" +
                                                "2.蓝色的开关，先关闭，再打开" +
                                                "<br/> <img src='img/2.png'/>" +
                                                "<br/>3.重新点击<开始>按钮" +
                                                "<br/>" +
                                                "<h5 style='color: red'>如果无效，询问管理员是否正在更新服务？或者服务挂掉了？</h5>",
                                            });
                                        },
                                        "否": function () {
                                            window.open("https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-app-launcher-info-dialog")
                                        }
                                    }
                                });
                            },
                            "否": function () {
                                window.open("https://www.baidu.com/s?ie=UTF-8&wd=%E8%B0%B7%E6%AD%8C%E6%B5%8F%E8%A7%88%E5%99%A8")
                            }
                        }
                    });


                }
            });
        },
        query: function () {
            if (vm.seq > 10) {
                $.alert({
                    title: '提示!',
                    content: "请先输入性别年龄，再点击开始测试!",
                })
                return
            }
            $.ajax({
                url: httpurl+"/v2/doctors?" + "clientId=testclient&" + vm.debug + "=true&orgId=testorg&sessionId=" + vm.sessionId + "&seqno=" + vm.seq + "&query=您有哪些不舒服的症状？&choice=" + vm.choice,
                method: 'GET',
                dataType: "json",
                success: function (result) {
             
                    if (result.status === "department") {
                        $.alert({
                            title: '提示',
                            content: "已经为您找到了合适的科室！",
                        })
                        vm.res = JSON.stringify(result, null, 2)
                        vm.seq = 100
                    } else if (result.status === "other") {
                        $.alert({
                            title: '提示',
                            content: "对不起，暂时不能为您找到合适的医生！",
                        })
                        vm.res = JSON.stringify(result, null, 2)
                        vm.seq = 100
                    }
                    else if (result.status === "doctors") {

                        vm.res = JSON.stringify(result, null, 2)
                        vm.jingwei = result.recommendation.jingwei
                        $.alert({
                            title: '提示',
                            content: "已经为您找到了合适的医生！",
                        })
                        vm.seq = 100
                    }
                    else {
                        vm.initAddCss()
                        vm.res = JSON.stringify(result, null, 2)
                        vm.question = result.question.query
                        vm.choices = result.question.choices
                        vm.seq = vm.seq + 1
                        vm.choice = ""
                    }
                },
                error: function (result) {
                    $.alert({
                        title: '服务无响应',
                        content: "请重新开始测试，如果还是不行，询问管理员是否正在更新服务？或者服务挂掉了？" +
                        "<br/><h3>返回值：</h3>" +
                        "<br/>" + JSON.stringify(result, null, 2) + "" +
                        "<br/>",
                    });
                }
            })

        },

    }
})
