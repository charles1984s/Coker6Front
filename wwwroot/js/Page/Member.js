﻿
var resetEmailModal, ResetEmailModal, $InputResetEmailVCode, $ResetEmailImgCaptcha, ResetEmailForms, reOrderAlertModal, ReOrderAlertModal
var old_email
var TabNow = "info", date_now = "";

function PageReady() {
    Coker.Member = {
        GetOrderHistory: function (page) {
            return $.ajax({
                url: "/api/Order/GetHistoryOrder/",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                },
                data: { page: page },
            });
        },
        Reorder: function (ohid) {
            return $.ajax({
                url: "/api/Order/Reorder/",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                },
                data: { ohid: ohid },
            });
        },
        CheckOrder: function (ohid) {
            return $.ajax({
                url: "/api/Order/CheckOrder/",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                },
                data: { ohid: ohid },
            });
        },
        OrderRepay: function (data) {
            return $.ajax({
                url: "/api/Order/OrderRepay",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                },
                data: JSON.stringify(data),
                dataType: "json"
            });
        },
        CancelOrder: function (ohid, payment) {
            return $.ajax({
                url: "/api/Order/CancelOrder/",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                data: { ohid: ohid, payment: payment },
            });
        }
    }

    let addr = $("#TWzipcode .address").val()
    co.Zipcode.init("#TWzipcode");
    co.Zipcode.setData({
        el: $("#TWzipcode"),
        addr: addr
    });

    Coker.Token.CheckToken().done(function (resule) {
        if (!resule.isLogin) {
            co.sweet.warning("尚未登入", "請登入後再重新操作，將引導至首頁。", function () {
                location.href = "/";
            })
        } else Member(resule);
    });
}
function Member(data) {

    var now = new Date();
    var month = (now.getMonth() + 1).toString();
    if (month.length == 1) month = '0' + month;
    var day = now.getDate().toString();
    if (day.length == 1) day = '0' + day;
    date_now = `${now.getFullYear()}-${month}-${day}`

    resetEmailModal = $("#ResetEmailModal").length > 0 ? new bootstrap.Modal($("#ResetEmailModal")) : null;
    reOrderAlertModal = $("#ReOrderAlertModal").length > 0 ? new bootstrap.Modal($("#ReOrderAlertModal")) : null;
    $InputResetEmailVCode = $("#InputNewMailVCode");
    $ResetEmailImgCaptcha = $('#NewMailImgCaptcha');
    ResetEmailForms = $('#ResetEmailForm');

    $("#ResetForm .reset_old_pass").removeClass("d-none");
    $("#ResetForm .reset_old_pass input").removeAttr("disabled");
    $("#ResetOldPassFeedBack").removeClass("d-none");
    $("#ResetModal .btn_resetforget").removeClass("d-none");

    SetMemberData();
    WebPageChange();

    $(".btn_logout").on("click", function () {
        co.User.Logout().done(function (result) {
            if (result.success) {
                co.sweet.success("登出成功");
                setTimeout(e => {
                    location.href = "/";
                }, 1000);
            }
        });
    });

    $(".btn_modifi").on("click", function () {
        var data = co.Form.getJson($("#UserDataForm").attr("id"));
        if (data.name == "") {
            co.sweet.warning("請注意", "姓名不可為空", null);
        } else if ($("#Email").val() == "") {
            co.sweet.warning("請注意", "電子郵件不可為空", null);
        } else if (data.zone == "" ^ data.telPhone == "") {
            co.sweet.warning("請注意", "如要填入電話資訊，請確實填寫區碼與聯絡電話", null);
        } else if (((data.county == "") ^ (data.address == ""))) {
            co.sweet.warning("請注意", "如要填入地址資訊，請確實填寫縣市、鄉鎮與地址", null);
        }
        else {
            var datacheck = true;
            if (data.birthday == "") data.birthday = null;
            data.address = `${data.county} ${data.district} ${data.address}`;
            if (data.cellPhone != "" && (!$.isNumeric(data.cellPhone) || data.cellPhone.length != 10)) {
                co.sweet.warning("請注意", "手機格式不正確，請重新輸入", null);
                datacheck = false;
            }
            if (data.telPhone != "") {
                if ($.isNumeric(data.zone) && $.isNumeric(data.telPhone) && ((data.ext != "" && $.isNumeric(data.ext)) || data.ext == "")) {
                    data.telPhone = `${data.zone}-${data.telPhone}-${data.ext}`;
                } else {
                    co.sweet.warning("請注意", "電話格式不正確，請重新輸入", null);
                    datacheck = false;
                }
            }
            if (datacheck) {
                co.User.UserEdit(data).done(function (result) {
                    co.sweet.success("資料修改完成！", null, true);
                });
            }
        }
    });

    $(".btn_resetPassword").on("click", function () {
        resetModal.show();
    })

    $(".btn_resetEmail").on("click", function () {
        resetEmailModal.show()
    });

    $("#ResetEmailModal .btn_resetforget").on("click", function () {
        $("#ResetModal .btn_resetforget").click();
    })

    $('#ResetEmailModal .btn_refresh').on('click', function (event) {
        event.preventDefault();
        NewCaptcha($ResetEmailImgCaptcha, $InputResetEmailVCode);
    });

    ResetEmailModal = document.getElementById('ResetEmailModal')
    if (ResetEmailModal != null) {
        ResetEmailModal.addEventListener('show.bs.modal', function (event) {
            NewCaptcha($ResetEmailImgCaptcha, $InputResetEmailVCode);
        })
        ResetEmailModal.addEventListener('hidden.bs.modal', function (event) {
            FormClear(ResetEmailForms, $InputResetEmailVCode)
        })
    }

    ReOrderAlertModal = document.getElementById('ReOrderAlertModal')
    if (ReOrderAlertModal != null) {
        ReOrderAlertModal.addEventListener('hidden.bs.modal', function (event) {
            $(".btn_repay").removeClass("d-none")
            $("#ReOrderAlertModal .orderlist ul li").remove();
        })
    }
    $("#ResetEmailForm input").on("keypress", function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $("#ResetEmailModal .btn_resetmail").click();
        }
    });
    $(".btn_resetmail").on("click", function () {
        if (SiteFormCheck(ResetEmailForms, $InputResetEmailVCode)) {
            CaptchaVerify($ResetEmailImgCaptcha, $InputResetEmailVCode, function () {
                ResetmailAction(data);
            })
        } else {
            $InputResetEmailVCode.addClass('is-invalid');
            $InputResetEmailVCode.siblings("div").addClass("me-4 pe-2");
            NewCaptcha($ResetEmailImgCaptcha, $InputResetEmailVCode)
            $InputResetEmailVCode.val("");
            Coker.sweet.warning("請注意", "請確實填寫資料", null, true);
        }
    });
    $(".btn_switchViewType button").on("click", function () {
        var $this = $(this);
        var $thisbro = $this.siblings("button");
        if (!$this.hasClass("focus")) $this.addClass("focus")
        if ($thisbro.hasClass("focus")) $thisbro.removeClass("focus")
        var $content = $this.parents(".tab-pane").find(".content");
        switch ($this.data("type")) {
            case "grid":
                localStorage.setItem(`switchViewType-Member${$content.data("storagename")}`, "grid");
                if (!$content.hasClass("type_grid")) $content.addClass("type_grid");
                if ($content.hasClass("type_list")) $content.removeClass("type_list");
                break;
            case "list":
                localStorage.setItem(`switchViewType-Member${$content.data("storagename")}`, "list");
                if (!$content.hasClass("type_list")) $content.addClass("type_list");
                if ($content.hasClass("type_grid")) $content.removeClass("type_grid");
                break;
        }
    })
    if (typeof (localStorage["switchViewType-MemberFavorite"]) != "undefined") {
        if (localStorage["switchViewType-MemberFavorite"] == "list") $("#favorite-tab-pane .btn_switchViewType button[data-type='list'").click();
    }
    if (typeof (localStorage["switchViewType-MemberBrowsing"]) != "undefined") {
        if (localStorage["switchViewType-MemberBrowsing"] == "list") $("#history-tab-pane .btn_switchViewType button[data-type='list'").click();
    }
    $("#ToolList > li button").on("click", function () {
        switch ($(this).attr("id")) {
            case "profile-tab":
                window.location.hash = "#order";
                break;
            case "favorite-tab":
                window.location.hash = "#favorites";
                break;
            case "history-tab":
                window.location.hash = "#browsing";
                break;
            default:
                window.location.hash = "#";
                break;
        }
    });
    $("#ReOrderAlertModal .btn_cancelrepay").on("click", function () {
        reOrderAlertModal.hide();
    })

    if ("onhashchange" in window) {
        window.onhashchange = hashChange;
    } else {
        setInterval(hashChange, 1000);
    }
}
function hashChange(e) {
    if (!!e) {
        e.preventDefault();
        WebPageChange();
    } else {
        console.log("HashChange錯誤")
    }
}
function WebPageChange() {
    if (!window.location.hash.startsWith(`#${TabNow}`)) {
        $("#TabContent > div").each(function (index) {
            var $this = $(this);
            if ($this.hasClass("active")) $this.removeClass("active");
            if ($this.hasClass("show")) $this.removeClass("show");
        });
        $("#ToolList > li button").each(function (index) {
            var $this = $(this);
            if ($this.hasClass("active")) $this.removeClass("active");
        });
        if (window.location.hash.startsWith("#order")) {
            if ($("#TabContent > div#profile-tab-pane").length > 0) {
                $("#TabContent > div#profile-tab-pane").addClass("active show");
                $("#ToolList > li button#profile-tab").addClass("active");
                if (window.location.hash.indexOf("-") > 0) {
                    var pagenumber = window.location.hash.substring(window.location.hash.indexOf("-") + 1);
                    if (!isNaN(Number(pagenumber))) SetHistoryOrderPage(pagenumber);
                    else window.location.hash = "#order-1";
                } else {
                    window.location.hash = "#order-1";
                }
            } else {
                window.location.hash = "";
            }
        } else if (window.location.hash.startsWith("#browsing")) {
            $("#TabContent > div#history-tab-pane").addClass("active show");
            $("#ToolList > li button#history-tab").addClass("active");
            if (window.location.hash.indexOf("-") > 0) {
                var pagenumber = window.location.hash.substring(window.location.hash.indexOf("-") + 1);
                if (!isNaN(Number(pagenumber))) SetBrowsingHistoryPage(pagenumber);
                else window.location.hash = "#browsing-1";
            } else {
                window.location.hash = "#browsing-1";
            }
        } else if (window.location.hash.startsWith("#favorites")) {
            $("#TabContent > div#favorite-tab-pane").addClass("active show");
            $("#ToolList > li button#favorite-tab").addClass("active");
            if (window.location.hash.indexOf("-") > 0) {
                var pagenumber = window.location.hash.substring(window.location.hash.indexOf("-") + 1);
                if (!isNaN(Number(pagenumber))) SetFavoritesPage(pagenumber);
                else window.location.hash = "#favorites-1";
            } else {
                window.location.hash = "#favorites-1";
            }
        } else {
            $("#TabContent > div#info-tab-pane").addClass("active show");
            $("#ToolList > li button#info-tab").addClass("active");
        }
    }
}
function SetMemberData() {
    Coker.User.GetUser().done(function (result) {
        if (result.success) {
            if (result.data.telPhone != null && result.data.telPhone != "") {
                result.data['zone'] = (result.data.telPhone).split('-')[0];
                result.data['telPhone'] = (result.data.telPhone).split('-')[1];
                if ((result.data.telPhone).split('-').length == 2) result.data['ext'] = (result.data.telPhone).split('-')[2];
            }

            co.Form.insertData(result.data, "#UserDataForm");

            old_email = result.data.email;

            co.Zipcode.setData({
                el: $("#TWzipcode"),
                addr: result.data.address
            });

            $("#ResetForm").data("Email", result.data.email);

            $("#Birthday").attr("max", date_now);

            $("#Birthday").on("keydown", function (e) {
                e.preventDefault();
            });

        } else {

        }
    });
}
function SetHistoryOrderPage(number) {
    Coker.Member.GetOrderHistory(number).done(function (result) {
        if (result.success && result.orderData != null && result.orderData.length > 0) {
            if (result.page_Total > 1) {
                if (!$("#profile-tab-pane .page_btn").data("init")) {
                    PageButtonInit($("#profile-tab-pane .page_btn"), result.page_Total, "order");
                }
                ContentPageChage($("#profile-tab-pane .page_btn"), number, result.page_Total);
            }
            if ($("#profile-tab-pane .btn_switchViewType").hasClass("d-none")) $("#profile-tab-pane .btn_switchViewType").removeClass("d-none")
            HistoryTemplateDataInsert(result.orderData)
        } else if (number != 1) {
            window.location.hash = "#order-1";
        } else {
            if ($("#profile-tab-pane .nodata").hasClass("d-none")) $("#profile-tab-pane .nodata").removeClass("d-none")
        }
    })
}
function HistoryTemplateDataInsert(Datas) {
    $("#profile-tab-pane .content").empty();
    $.each(Datas, function (index, data) {
        var order_header = data.orderHeader;
        var order_details = data.orderDetails;
        var frame = $($("#Template_Order_List").html()).clone();
        frame.find(".number").text(("000000000" + order_header.id).substring(order_header.id.length));
        frame.find(".date").text(((order_header.creationTime).substr(0, 16).replaceAll("-", "/")));
        frame.find(".amount").text(`$${(order_header.total).toLocaleString()}`);
        if (typeof (order_header.paymentIcon) != "undefined" && order_header.paymentIcon != "") {
            frame.find(".payment").append(`<img src="${order_header.paymentIcon}"/><span>${order_header.payment}</span>`);
        } else frame.find(".payment").text(order_header.payment);

        switch (order_header.action) {
            case "Cancel":
                if (![7, 8, 10, 15].includes(order_header.paymentCode)) frame.find(".state").prepend(`<span>${order_header.stateStr}</span><button class="btn_cancelOrder bg-transparent border-0 text-decoration-underline" title="取消此筆訂單">取消訂單</button>`)
                else frame.find(".state").prepend(`<span>${order_header.stateStr}</span>`)
                frame.find(".state button").data("ohid", order_header.id)
                frame.find(".state .btn_cancelOrder").on("click", function () {
                    var $this = $(this);
                    var confirm_text = [2, 6].includes(order_header.state) ? order_header.thirdParties != 1 ? "?(若已付款將退回款項)" : "？(退款事宜請聯繫客服處理)" : "?";
                    Coker.sweet.confirm("取消訂單", `確定要取消這筆訂單${confirm_text}`, "確定", "取消", function () {
                        Coker.sweet.loading();
                        Coker.Member.CancelOrder($this.data("ohid"), order_header.thirdParties).done(function (result) {
                            if (result.success) {
                                $this.parent(".state").addClass("text-danger fw-bold");
                                $this.parent(".state").text("已取消");
                                Coker.sweet.success(result.message, null, false);
                            } else {
                                Coker.sweet.error("取消訂單失敗", "取消訂單時發生錯誤，請聯繫客服協助處理。");
                            }
                        })
                    })
                });
                break
            case "Repay":
                frame.find(".state").prepend(`<span>${order_header.stateStr}</span><button class="btn_payAgain text-danger bg-transparent border-0 text-decoration-underline text-danger" title="取消此筆訂單">重新付款</button>`)
                frame.find(".state .btn_payAgain").on("click", function () {
                    var $this = $(this);
                    Coker.sweet.confirm("確定要重新付款？", "", "確定", "取消", function () {
                        Coker.sweet.loading();
                        Coker.Member.CheckOrder(order_header.id).done(function (result) {
                            if (result.success) {
                                if (result.message == "NoChange") {
                                    OrderRepay(result)
                                } else {
                                    Swal.close();
                                    reOrderAlertModal.show()
                                    var $frame = $("#ReOrderAlertModal .orderlist");
                                    var old_subtotal = parseInt(result.orderHeader.oldSubtotal);
                                    var freight = parseInt(result.orderHeader.freight.replaceAll(",", ""));
                                    var new_subtotal = parseInt(result.orderHeader.subtotal.replaceAll(",", ""));

                                    $frame.find(".oh_subtotal_old").text(old_subtotal.toLocaleString());
                                    $frame.find(".oh_subtotal_new").text(new_subtotal.toLocaleString());
                                    $frame.find(".oh_freight").text(freight.toLocaleString());
                                    $frame.find(".oh_total").text((new_subtotal + freight).toLocaleString());

                                    MemberTemplateDataInsert($("#ReOrderAlertModal .orderlist ul"), $("#RePayOrderListTemplate"), result.orderDetails)

                                    if (new_subtotal == 0) {
                                        freight = 0;
                                        $(".btn_repay").addClass("d-none")
                                    } else {
                                        $(".btn_repay").data("ohid", order_header.id)
                                        $(".btn_repay").data("thirdParties", order_header.thirdParties)
                                        $(".btn_repay").data("new_price", (new_subtotal + freight))
                                    }
                                    $("#ReOrderAlertModal .btn_repay").off("click")
                                    $("#ReOrderAlertModal .btn_repay").on("click", function () {
                                        Coker.sweet.loading();
                                        reOrderAlertModal.hide();
                                        OrderRepay(result)
                                    })
                                }
                            } else {
                                Coker.sweet.error("重新付款發生錯誤", result.message);
                            }
                        });
                    })
                });
                break;
            default:
                frame.find(".state").append(`<span>${order_header.stateStr}</span>`);
                break;
        }

        switch (order_header.state) {
            case 1:
            case 6:
                frame.find(".state span").addClass("bg-warning text-black");
                break;
            case 5:
                frame.find(".state span").addClass("bg-danger text-white");
                break;
            default:
                if (order_header.state != 4) frame.find(".state span").addClass("bg-success text-white");
                break;
        }

        frame.find(".collapse").addClass(`collapse_${order_header.id}`);
        frame.find(".btn_collapse").attr("data-bs-target", `.collapse_${order_header.id}`);

        frame.find(".btn_collapse").on("click", function () {
            if ($(this).hasClass("collapsed")) $(this).text("查看訂單明細");
            else $(this).text("關閉訂單明細");
        })

        frame.find(".btn_buyAgain").data("ohid", order_header.id);
        frame.find(".btn_buyAgain").on("click", function () {
            var $this = $(this);
            Coker.sweet.confirm("確定要再次購買？", "", "確定", "取消", function () {
                Coker.sweet.loading();
                Coker.Member.Reorder($this.data("ohid")).done(function (result) {
                    if (result.success) {
                        var ohidstr = `000000000${result.message}`.substring(result.message.length);
                        window.location.href = `/${OrgName}/ShoppingCar?reorder${ohidstr}`;
                    } else {
                        if (result.message == "該商品規格庫存量已在瀏覽期間被更動，按下確定後將重整頁面。") {
                            Coker.sweet.warning("商品庫存不足", result.message, null)
                        }
                    }
                });
            })
        })
        $.each(order_details, function (index, detail) {
            if (detail != null) {
                var list_frame = $($("#Template_Order_Details_List").html()).clone();
                list_frame.find("a").attr("href", `/${OrgName}/Member/product/${detail.pId}`);
                list_frame.find("a").attr("title", `連結至：${detail.title}`);
                detail.imagePath = detail.imagePath.replaceAll(`/${OrgName}/`, `/`)
                list_frame.find("img").attr("src", detail.imagePath);
                list_frame.find("img").attr("alt", `${detail.title}的主要圖片`);
                list_frame.find(".title").text(detail.title);
                if (detail.s1Title != "") list_frame.find(".spec").append(`<span class="border px-1 me-1">${detail.s1Title}</span>`)
                if (detail.s2Title != "") list_frame.find(".spec").append(`<span class="border px-1 me-1">${detail.s2Title}</span>`)
                list_frame.find(".price").text((detail.price).toLocaleString());
                list_frame.find(".quantity").text(detail.quantity);
                list_frame.find(".subtotal").text(((parseInt(detail.price)) * (parseInt(detail.quantity))).toLocaleString());
                frame.find(".list-group").append(list_frame);
            }
        })

        frame.find(".collapse .header_subtotal").text((order_header.subtotal).toLocaleString());
        frame.find(".collapse .header_freight").text((order_header.freight).toLocaleString());
        frame.find(".collapse .header_total").text((order_header.total).toLocaleString());

        $("#profile-tab-pane .content").append(frame);
    })
}
function OrderRepay(datas) {
    var data = {}, details = [];
    $.each(datas.orderDetails, function (index, detail) {
        var temp_detail = {};
        temp_detail['scid'] = detail.scId;
        temp_detail['psid'] = detail.prodStockId;
        temp_detail['Quantity'] = parseInt(detail.quantity);
        temp_detail['Price'] = detail.price;
        details.push(temp_detail);
    });
    data['ohid'] = datas.orderHeader.id;
    data['Subtotal'] = parseInt(datas.orderHeader.subtotal.replaceAll(",", ""));
    data['Details'] = details;
    Coker.Member.OrderRepay(data).done(function (result) {
        if (result.success) {
            Coker.ThirdParty.Request(datas.orderHeader.id, datas.orderHeader.thirdParties).done(function (result) {
                if (result.success) {
                    localStorage.setItem("lastSaveTime", new Date().toISOString())
                    window.location.replace(result.message);
                } else {
                    Coker.sweet.error("重新付款發生錯誤", result.message, null, false);
                }
            });
        } else {
            Coker.sweet.error("訂單更動發生錯誤", result.message);
        }
    });
}
function SetFavoritesPage(number) {
    Coker.Favorites.GetDisplay(number).done(function (result) {
        if (result.data.length > 0) {
            if (result.page_Total > 1) {
                if ($(".page_btn".length > 0)) $(".page_btn").removeClass("d-none");
                if (!$("#favorite-tab-pane .page_btn").data("init")) {
                    PageButtonInit($("#favorite-tab-pane .page_btn"), result.page_Total, "favorites");
                }
                ContentPageChage($("#favorite-tab-pane .page_btn"), number, result.page_Total);
            } else {
                if ($(".page_btn".length > 0)) $(".page_btn").addClass("d-none");
            }
            if ($("#favorite-tab-pane .btn_switchViewType").hasClass("d-none")) $("#favorite-tab-pane .btn_switchViewType").removeClass("d-none")
            MemberTemplateDataInsert($("#favorite-tab-pane .content"), $("#FavoriteTemplate"), result.data)
        } else if (number != 1) {
            window.location.hash = "#favorites-1";
        } else {
            if ($("#favorite-tab-pane .nodata").hasClass("d-none")) $("#favorite-tab-pane .nodata").removeClass("d-none")
        }
    })
}
function SetBrowsingHistoryPage(number) {
    Product.GetAll.History(number).done(function (result) {
        if (result.success && result.data.length > 0) {
            if (result.page_Total > 1) {
                if (!$("#history-tab-pane .page_btn").data("init")) {
                    PageButtonInit($("#history-tab-pane .page_btn"), result.page_Total, "browsing");
                }
                ContentPageChage($("#history-tab-pane .page_btn"), number, result.page_Total);
            }
            if ($("#history-tab-pane .btn_switchViewType").hasClass("d-none")) $("#history-tab-pane .btn_switchViewType").removeClass("d-none")
            MemberTemplateDataInsert($("#history-tab-pane .content"), $("#BrowsingTemplate"), result.data)
        } else if (number != 1) {
            window.location.hash = "#browsing-1";
        } else {
            if ($("#history-tab-pane .nodata").hasClass("d-none")) $("#history-tab-pane .nodata").removeClass("d-none")
        }
    })
}
function PageButtonInit($self, page_total, thishash) {
    $self.removeClass("d-none")
    for (var i = 1; i <= page_total; i++) {
        var html = "";
        if (i == page_total && page_total > 7) {
            html += `<li class="page-item btn_page endhide">
                                    <button class="d-none" title="..." disabled='disabled'>...</button>
                                </li>`;
        }
        html += `<li class="page-item btn_page">
                                    <button class="d-none" data-page='${i}' title="切換至第${i}頁">${i}</button>
                                </li>`;
        if (i == 1 && page_total > 7) {
            html += `<li class="page-item btn_page starthide">
                                    <button class="d-none" title="..." disabled='disabled'>...</button>
                                </li>`;
        }
        $self.find(".btn_next").before(html);
    }
    $self.data("init", true)
    $self.find(".btn_prev button").on("click", function () {
        $('html, body').animate({ scrollTop: 0 }, 0);
        var $btn = $(this);
        var page_now = window.location.hash.indexOf('-') < 0 ? 1 : parseInt(window.location.hash.substring(window.location.hash.indexOf('-') + 1));
        if (page_now > 1) page_now -= 1;
        ContentPageChage($btn.parent("li").parent("ul"), page_now, page_total);
        window.location.hash = `#${thishash}-${page_now}`;
    })
    $self.find(".btn_next button").on("click", function () {
        $('html, body').animate({ scrollTop: 0 }, 0);
        var $btn = $(this);
        var page_now = window.location.hash.indexOf('-') < 0 ? 1 : parseInt(window.location.hash.substring(window.location.hash.indexOf('-') + 1));
        if (page_now < page_total) page_now += 1;
        ContentPageChage($btn.parent("li").parent("ul"), page_now, page_total);
        window.location.hash = `#${thishash}-${page_now}`;
    })
    $self.find(".btn_page button").on("click", function () {
        $('html, body').animate({ scrollTop: 0 }, 0);
        var $btn = $(this);
        ContentPageChage($btn.parent("li").parent("ul"), $btn.data("page"), page_total);
        window.location.hash = `#${thishash}-${$btn.data("page")}`;
    })
}
function ContentPageChage($self, page, page_total) {
    $self.find("li").each(function () {
        var $this_li = $(this);
        var $this_btn = $this_li.find("button");
        if ($this_btn.data("page") == page) {
            if (!$this_btn.hasClass("focus")) $this_btn.addClass("focus")
            if (typeof ($this_btn.attr("disabled")) == "undefined") $this_btn.attr("disabled", "disabled")
        } else {
            if ($this_btn.hasClass("focus")) $this_btn.removeClass("focus")
            if (typeof ($this_btn.attr("disabled")) != "undefined") $this_btn.removeAttr("disabled")
        }
    });

    if (page_total > 7) {
        if (page < 4) {
            $self.find("li.btn_page").each(function () {
                var $this_li = $(this);
                var $this_btn = $this_li.find("button");
                if ($this_btn.data("page") <= 5 || $this_btn.data("page") == page_total) {
                    if ($this_btn.hasClass("d-none")) $this_btn.removeClass("d-none")
                } else {
                    if (!$this_btn.hasClass("d-none")) $this_btn.addClass("d-none")
                }
            });
        } else if (page > page_total - 3) {
            $self.find("li.btn_page").each(function () {
                var $this_li = $(this);
                var $this_btn = $this_li.find("button");
                if ($this_btn.data("page") >= page_total - 4 || $this_btn.data("page") == 1) {
                    if ($this_btn.hasClass("d-none")) $this_btn.removeClass("d-none")
                } else {
                    if (!$this_btn.hasClass("d-none")) $this_btn.addClass("d-none")
                }
            });
        } else {
            $self.find("li.btn_page").each(function () {
                var $this_li = $(this);
                var $this_btn = $this_li.find("button");
                if ((parseInt(page) + 2 >= $this_btn.data("page") && $this_btn.data("page") >= parseInt(page) - 2) || $this_btn.data("page") == 1 || $this_btn.data("page") == page_total) {
                    if ($this_btn.hasClass("d-none")) $this_btn.removeClass("d-none")
                } else {
                    if (!$this_btn.hasClass("d-none")) $this_btn.addClass("d-none")
                }
            });
        }
        if ($self.find(`li button[data-page=2]`).hasClass("d-none")) {
            if ($self.find("li.starthide button").hasClass("d-none")) $self.find("li.starthide button").removeClass("d-none");
        }
        if ($self.find(`li button[data-page=${page_total - 1}]`).hasClass("d-none")) {
            if ($self.find("li.endhide button").hasClass("d-none")) $self.find("li.endhide button").removeClass("d-none");
        }
    } else {
        $self.find("li").each(function () {
            var $this_li = $(this);
            var $this_btn = $this_li.find("button");
            if ($this_btn.hasClass("d-none")) $this_btn.removeClass("d-none")
        });
    }
}
function MemberTemplateDataInsert($content, $frame, datas) {
    $content.empty();
    $.each(datas, function (index, data) {
        var frame = $($frame.html()).clone();
        frame = MemberDataInsert(frame, data);
        if (frame.find(".btn_favorite").length > 0) FavoritesButtonInit(frame);
        if (frame.find(".shareBlock").length > 0) ShareButtonInit(frame.find(".shareBlock"));
        $content.append(frame);
    })
}
function MemberDataInsert(frame, data) {
    frame.data("Pid", data.pId);
    if (frame.find(".btn_favorite").length > 0 && typeof (data.fId) != undefined) frame.find(".btn_favorite").data("Fid", data.fId);
    frame.find("*").each(function () {
        var $self = $(this);
        if (typeof ($self.data("key")) != "undefined") {
            var key = $self.data("key");
            switch (key) {
                case "link":
                    $self.attr("href", `/${OrgName}/Member${data[key]}`);
                    $self.attr("title", `連結至：${data['title']}`);
                    break;
                case "image":
                case "imagePath":
                    data[key] = data[key].replaceAll(`/${OrgName}/`, `/`);
                    $self.attr("src", data[key]);
                    $self.attr("alt", `${data['title']}的主要照片`);
                    break;
                case "price":
                    switch (typeof (data[key])) {
                        case "object":
                            var prices = data[key];
                            if (prices == null) {
                                $self.text("");
                            } else {
                                if (prices.length > 1 && prices[0] != prices[prices.length - 1]) $self.html(`$${prices[0].toLocaleString()}<wbr>~<wbr>$${[prices[prices.length - 1].toLocaleString()]}`)
                                else $self.text(`$${prices[0].toLocaleString()}`)
                            }
                            break;
                        default:
                            $self.text(data[key].toLocaleString());
                            break;
                    }
                    break;
                case "describe":
                    if (data[key] == "商品已下架") {
                        $self.removeClass("d-none");
                        $self.siblings().addClass("d-none");
                    }
                    $self.text(data[key]);
                    break;
                case "s1Title":
                case "s2Title":
                    if (data[key] != "") $self.removeClass("d-none")
                    $self.text(data[key]);
                    break;
                case "oldPrice":
                    if (data[key] != 0 && data[key] != data['price']) {
                        $self.removeClass("d-none")
                        $self.text(data[key].toLocaleString());
                        $self.siblings().addClass("red_text");
                    }
                    break;
                case "oldQuantity":
                    if (data[key] != 0 && data[key] != data['quantity']) {
                        $self.removeClass("d-none")
                        $self.text(data[key]);
                        $self.siblings().addClass("red_text");
                    }
                    break;
                case "subtotal_old":
                    var price = data['oldPrice'] != 0 ? data['oldPrice'] : data['price'];
                    var quantity = data['oldQuantity'] != 0 ? data['oldQuantity'] : data['quantity'];
                    $self.text((price * quantity).toLocaleString());
                    break;
                case "subtotal_new":
                    var sbutotal = data['price'] * data['quantity'];
                    $self.text(sbutotal.toLocaleString());
                    break;
                default:
                    $self.text(data[key]);
                    break;
            }
        }
    });
    return frame;
}
function ShareButtonInit($ShareBlock) {
    $ShareBlock.hover(function () {
        $(this).addClass("show");
    }, function () {
        $(this).removeClass("show");
    })

    $ShareBlock.cShare({
        description: 'jQuery plugin - C Share buttons',
        showButtons: ['fb', 'line', 'plurk', 'twitter', 'email']
    });
}
function FavoritesButtonInit(frame) {
    var $btn_favorites = frame.find(".btn_favorite");
    if (typeof ($btn_favorites.data("Fid")) == "undefined") {
        Coker.Favorites.Check(frame.data("Pid")).done(function (check) {
            if (check.success) {
                $btn_favorites.data("Fid", check.message);
                $btn_favorites.find("i").addClass("fa-solid")
                $btn_favorites.find("i").removeClass("fa-regular")
                $btn_favorites.attr("title", "移除收藏")
            }
        });
    }
    $btn_favorites.on("click", function () {
        $self = $(this).find("i");
        if ($self.hasClass("fa-regular")) {
            Coker.Favorites.Add(frame.data("Pid")).done(function (result) {
                if (result.success) {
                    $btn_favorites.data("Fid", result.message);
                    $self.addClass("fa-solid")
                    $self.removeClass("fa-regular")
                    $btn_favorites.attr("title", "移除收藏");
                    Coker.sweet.success("成功將商品加入收藏", null, true);
                } else {
                    console.log(result.message)
                }
            });
        } else {
            if (typeof ($btn_favorites.data("Fid")) != "undefined" && typeof ($btn_favorites.data("Fid")) != "") {
                Coker.Favorites.Delete($btn_favorites.data("Fid")).done(function (result) {
                    if (result.success) {
                        $btn_favorites.data("Fid", "");
                        $self.addClass("fa-regular")
                        $self.removeClass("fa-solid")
                        $btn_favorites.attr("title", "加入收藏");
                        Coker.sweet.success("已將商品從收藏中移除", function () {
                            var pagenumber = window.location.hash.substring(window.location.hash.indexOf("-") + 1);
                            if (!isNaN(Number(pagenumber))) SetFavoritesPage(pagenumber);
                        }, false);
                    } else {
                        console.log(result.message)
                    }
                });
            }
        }
    })
}
function ResetmailAction(data) {
    var input_data = co.Form.getJson($("#ResetEmailForm").attr("id"));
    if (input_data.email == old_email) {
        Coker.sweet.info("新的電子郵件與舊的相同，不進行變更。", null)
        resetEmailModal.hide()
    } else {
        Coker.sweet.loading();
        Coker.User.EmailChange(input_data).done(function (result) {
            if (result.success) {
                Coker.sweet.success("電子郵件修改成功", function () {
                    location.reload()
                }, false);
            } else {
                NewCaptcha($ResetEmailImgCaptcha, $InputResetEmailVCode);
                switch (result.error) {
                    case "密碼錯誤":
                        Coker.sweet.confirm("密碼輸入錯誤", result.message, "忘記密碼?", "確定", function () {
                            $("#ResetModal .btn_resetforget").click();
                        })
                        break;
                    case "錯誤三次":
                        Coker.sweet.error(result.error, result.message, null, false);
                        break;
                    default:
                        Coker.sweet.error(result.error, result.message, null, false);
                        break;
                }
            }
        });
    }
}