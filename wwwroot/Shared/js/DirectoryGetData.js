﻿var Directory = {
    getDirectoryData: function (data) {
        return $.ajax({
            url: "/api/Directory/GetReleInfo",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: "json"
        });
    },
    getDirectoryMenuData: function (data) {
        return $.ajax({
            url: "/api/Directory/GetReleMenu",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: "json"
        });
    }
}

function initElemntAndLoadDir($dir,page) {
    const $self = $dir || $(".catalog_frame,.menu_directory").first();
    const dirid = $self.attr("data-dirid") > 0 ? $self.attr("data-dirid") : 0;

    $self.data("prevdirid", dirid);
    const shownum = typeof ($self.data("shownum")) != "undefined" ? $self.data("shownum") : 12;
    const maxlen = typeof ($self.data("maxlen")) != "undefined" ? $self.data("maxlen") : 0;
    const hashPage = !!page? page.toString() : location.hash.replace("#", "");

    if (typeof ($self.data("page")) == "undefined" || $self.data("page") != hashPage) {
        if (isNaN(hashPage) || hashPage=="") page = "1";
        else page = hashPage;
        $self.find(".catalog>.template").remove();
        console.log(page);
        DirectoryDataGet($self,{
            Ids: [dirid],
            SiteId: typeof (SiteId) == "undefined" ? 0 : SiteId,
            Page: page,
            ShowNum: shownum,
            MaxLen: typeof (maxlen) == "undefined" ? 0 : maxlen
        });
        $self.data("page", page)
    }
    
}

function DirectoryGetDataInit() {
    const dirLength = $(".catalog_frame,.menu_directory").length;
    $(".catalog_frame").each(function () {
        const $self = $(this);
        const dirid = $self.attr("data-dirid") > 0 ? $self.attr("data-dirid") : 0;
        if (typeof ($self.data("prevdirid")) == "undefined" || dirid != $self.data("prevdirid")) initElemntAndLoadDir($(this));
    })
    $(".menu_directory").each(function () {
        var $self = $(this);
        var dirid = $self.attr("data-dirid") > 0 ? $self.attr("data-dirid") : 0;
        if (typeof ($self.data("prevdirid")) == "undefined" || dirid != $self.data("prevdirid")) {
            $self.data("prevdirid", dirid);
            $self.find(".title").text("");
            $self.find(".accordion").empty();
            Directory.getDirectoryMenuData({ Id: dirid, WebsiteId: typeof (SiteId) != "undefined" ? SiteId : 0 }).done(function (result) {
                if (typeof (result) != "undefined") {
                    $self.find(".title").text(result.title)
                    $.each(result.children, function (index, SecIItem) {
                        $self.find('.title').text(result.title);
                        if (SecIItem.children != null) {
                            var item = $($("#TemplateAccordionItem").html()).clone();
                            item.find(".sectitle").text(SecIItem.title);
                            item.find(".accordion-header").attr("id", `secheader${SecIItem.Id}`);
                            item.find(".accordion-collapse").attr({
                                "aria-labelledby": `secheader${SecIItem.Id}`,
                                "id": `seccollapse${SecIItem.Id}`
                            });
                            item.find(".accordion-button").attr({
                                "data-bs-target": `#seccollapse${SecIItem.Id}`,
                                "aria-controls": `seccollapse${SecIItem.Id}`,
                            });
                            var $body = item.find(".accordion-body");
                            $.each(SecIItem.children, function (index, ThirdIItem) {
                                $body.append(`<a href="${ThirdIItem.routerName}" title="連結至：${ThirdIItem.title}" class="list-group-item list-group-item-action border-0 py-3">${ThirdIItem.title}</a>`)
                            })
                            $self.find(".accordion").append(item);
                        } else {
                            var html = `<div class="accordion-item border-0 border-bottom px-1"><a href="${SecIItem.routerName}" title="連結至：${SecIItem.title}" class="list-group-item border-0 py-3 custom_h5 text-black">${SecIItem.title}</a></div>`
                            $self.find(".accordion").append(html);
                        }
                    })
                }
            });
        }
    })
    if (dirLength == 1) {
        if ("onhashchange" in window) {
            window.onhashchange = hashChangeDirectory;
        } else {
            setInterval(hashChangeDirectory, 1000);
        }
    }
}
function hashChangeDirectory(e) {
    if (!!e) {
        initElemntAndLoadDir();
        e.preventDefault();
    } else {
        console.log("HashChange錯誤")
    }
}

function DirectoryDataGet($item, option) {
    const dirLength = $(".catalog_frame,.menu_directory").length;
    let page = parseInt(option.Page);
    Directory.getDirectoryData(option).done(function (result) {
        let loadPageRange = 2;
        $item.find(".page-item").each(function () {
            var $self = $(this);
            if (!$self.hasClass("btn_prev") && !$self.hasClass("btn_next")) $self.remove();
        });
        if (result.totalPage <= 1) $item.find(".page_btn").addClass("d-none")
        else $item.find(".page_btn").removeClass("d-none")
        if (page > result.totalPage) page = result.totalPage;
        else if (page < 1) page = 1;

        if (page == 1) $item.find(".btn_prev").addClass("d-none");
        else $item.find(".btn_prev").removeClass("d-none");

        if (page == result.totalPage) $item.find(".btn_next").addClass("d-none");
        else $item.find(".btn_next").removeClass("d-none");

        if (page == 1 || page == result.totalPage) loadPageRange = 4;

        for (var i = 1; i <= result.totalPage; i++) {
            if (i == 1) {
                if (i == page) $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><span class="btn_page page-link text-black bg-secondary" data-page=${i}>1</span></li>`)
                else {
                    $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><button class="btn_page page-link text-black" title="第一頁" data-page=${i}>1</button></li>`);
                    if (page - loadPageRange - 1 > 0) {
                        $item.find(".page_btn").children(".btn_next").before(`<li class="page-item px-2">...</li>`);
                    }
                }
            } else if (i == result.totalPage) {
                if (i == page) $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><span class="btn_page page-link text-black bg-secondary" data-page=${i}>${result.totalPage}</span></li>`)
                else {
                    if (page + loadPageRange + 1 < result.totalPage) {
                        $item.find(".page_btn").children(".btn_next").before(`<li class="page-item px-2">...</li>`);
                    }
                    $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><button class="btn_page page-link text-black" title="最後一頁" data-page=${i}>${result.totalPage}</button></li>`);
                }
            } else if (i >= page - loadPageRange && i <= page + loadPageRange) {
                if (i == page) $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><span class="btn_page page-link text-black bg-secondary" data-page=${i}>${i}</span></li>`)
                else $item.find(".page_btn").children(".btn_next").before(`<li class="page-item"><button class="btn_page page-link text-black" title="移動至第${i}頁" data-page=${i}>${i}</button></li>`)
            }
        }
        $(`.btn_page`).off("click").on("click", function () {
            var $self = $(this);
            if (page != $self.data("page")) {
                page = $self.data("page");
                if (dirLength == 1 && window.location.hash != `#${page}`) window.location.hash = `#${page}`;
                else initElemntAndLoadDir($item, page)
            }
        })
        if (!$item.data("init")) {
            $item.find(`.btn_prev > button`).on("click", function () {
                page = parseInt($item.data("page")) - 1;
                if (page > 1) {
                    if (dirLength == 1 && window.location.hash != `#${page}`) window.location.hash = `#${page}`;
                    else initElemntAndLoadDir($item, $self.data("page"))
                }
            })

            $item.find(`.btn_next > button`).on("click", function () {
                page = parseInt($item.data("page")) + 1;
                if (page < result.totalPage) {
                    if (dirLength == 1 && window.location.hash != `#${page}`) window.location.hash = `#${page}`;
                    else initElemntAndLoadDir($item, $self.data("page"))
                }
            })
        }

        $item.data("init", "true");
        DirectoryDataInsert($item, result.releInfos);
    })
}

function DirectoryDataInsert($item, result) {
    result.forEach(function (data) {
        var content = $($item.find(".templatecontent").html()).clone();
        content.find("a").attr("href", window.location.pathname + data.link);
        content.find("a").attr("title", `連結至: ${data.title}`);
        var imglink = data.mainImage;
        if (typeof (IsFaPage) != "undefined" && typeof (OrgName) != "undefined" && IsFaPage != "True") imglink = imglink.replace("upload", `upload/${OrgName}`);
        content.find("img").attr("src", imglink);
        content.find("img").attr("alt", `${data.title}的主要圖片`);
        content.find(".title").text(data.title);
        content.find(".description").text(data.description);
        $item.find(".catalog").append(content);
        if (data.nodeDate != null && data.nodeDate != "") {
            var noteDate = new Date(data.nodeDate);
            content.find(".date").text(`${noteDate.getFullYear()}/${noteDate.getMonth() + 1}/${noteDate.getDate()}`);
            content.find(".date-month").text(`${noteDate.getMonth() + 1}月`);
            if (noteDate.getDate() < 10) {
                content.find(".date-day").text(`0${noteDate.getDate()}`);
            } else {
                content.find(".date-day").text(`${noteDate.getDate()}`);
            }
 
        }
    });

    HoverEffectInit();
}