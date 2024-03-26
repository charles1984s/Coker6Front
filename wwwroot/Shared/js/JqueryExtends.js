$.fn.extend({
    imgCheck: function () {
        var $self = $(this);
        $self.each(function (i, item) {
            $(item).on("error", function () {
                $(item).attr("src", "/images/noImg.jpg");
            })
        });
        return $self;
    }
});