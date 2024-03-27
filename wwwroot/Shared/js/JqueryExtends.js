﻿var FileApi = {
    insertNotFondFile: function (data) {
        return $.ajax({
            url: "/api/File/insertNotFondFile",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: "json"
        });
    }
}
function jqueryExtend() {
    $.fn.extend({
        imgCheck: function () {
            var $self = $(this);
            $self.each(function (i, item) {
                $(item).on("error", function () {
                    FileApi.insertNotFondFile({ Url: $(item).attr("src"), FK_WebsiteID: typeof (SiteId) == "undefined" ? 0 : SiteId });
                    $(item).attr("src", "/images/noImg.jpg");
                })
            });
            return $self;
        }
    });
}
