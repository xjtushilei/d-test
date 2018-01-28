function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

httpurl = getQueryString("url")
if (httpurl === null) {
    alert("url中缺乏‘url’参数")
}
orgId = getQueryString("orgId")
if (orgId === null) {
    alert("url中缺乏‘orgId’参数")
}
clientId = getQueryString("clientId")
if (clientId === null) {
    alert("url中缺乏‘clientId’参数")
}


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
                    if (item.hasClass("duoxuan_yes")) {
                        item.removeClass("duoxuan_yes")
                    }
                    if (!item.hasClass("duoxuan_no")) {
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
                url: httpurl + "/v2/sessions?clientId=" + clientId + "&orgId=" + orgId,
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
                contentType: "application/json",
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
                    $.alert({
                        title: '提示',
                        content: "检查url中各项参数是否发生错误",
                    })
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
                url: httpurl + "/v2/doctors?" + "clientId=" + clientId + "&" + vm.debug + "=true&orgId=" + orgId + "&sessionId=" + vm.sessionId + "&seqno=" + vm.seq + "&query=您有哪些不舒服的症状？&choice=" + vm.choice,
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
