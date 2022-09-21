function ready() {
    typeof (PageReady) === "function" && PageReady();
    $("#Collapse_Button > i").on("click", collapse);
    $("#Floating_Objects").on("click", function () {
        $('html,body').stop().animate({
            scrollTop: 0
        }, 0)
    });
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
}

function collapse() {
    $("footer").toggleClass("footer_pack_up");
}