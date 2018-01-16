if (typeof jQuery !== 'undefined') {
    console.log("jQuery library is loaded!");
} else {
    alert("jQuery library is not found!");
}

function FindDoctor(clientId, orgId, name, dob, gender, card_no, wechatOpenId, apiUrl) {
    if (!IsDate(dob)) throw "出生日期格式有问题！请满足：'2006-03-09'格式";
    if (!(gender === "male" || gender === "female")) throw "性别格式有问题！请满足：gender == 'male' or gender == 'female'";
    var done = false
    var sessionId
    var next_seqno
    var next_query
    var status

    /**
     * @return {boolean}
     */
    function IsDate( mystring) {
        var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
        var str = mystring;
        var arr = reg.exec(str);
        if (str === "") return true
        if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
            return false
        }
        return true
    }

    this.creatSession = function (callback) {
        if (!callback) throw "回调函数为空"
        if (done) throw "本次问诊已经结束!"
        url = apiUrl + "/v1/sessions?clientId=" + clientId + "&orgId=" + orgId
        data = {
            "patient":
                {
                    "name": name,
                    "dob": dob,
                    "sex": gender,
                    "cardNo": card_no
                },
            "wechatOpenId": wechatOpenId
        }
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            dataType: "JSON",
            success: function (message) {
                sessionId = message.sessionId
                next_seqno = 1
                next_query = message.question.query
                status = "followup"
                callback(message)
            },
            error: function (message) {
                console.error(message)
                throw "创建session异常";
            }
        })
    }

    this.findDoctor = function (choice, callback, seqno) {
        if (!callback) throw "回调函数为空"
        if (done) throw "本次问诊已经结束!"
        if (seqno) {
            if (parseInt(seqno) > next_seqno + 1 || parseInt(seqno) < 0) throw "seqno参数不正确！"
        }
        else {
            seqno = next_seqno
        }
        url = apiUrl + "/v1/doctors?clientId=" + clientId + "&orgId=" + orgId +
            "&sessionId=" + sessionId + "&seqno=" + seqno + "&query=" + next_query +
            "&choice=" + choice
        $.ajax({
            url: url,
            method: 'GET',
            dataType: "JSON",
            success: function (result) {
                status = result.status
                if (status === "followup") {
                    next_query = result.question.query
                    next_seqno = result.question.seqno
                }
                else {
                    done = true
                }
                callback(result)
            },
            error: function (message) {
                console.error(message)
                throw "findDoctor请求异常";
            }
        })
    }
}

