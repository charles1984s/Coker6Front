﻿var time = 0;
function HeaderInit() {

    var backgroundimgurl = "";

    if ($('body').hasClass('home')) {
        $(".titleimage").removeClass("d-none");
        $(".headernews").removeClass("d-none");
        $("link").each(function (index) {
            if (typeof ($(this).attr("data-orgname")) == "string") {
                backgroundimgurl = `url("/upload/${$(this).attr("data-orgname")}/backgroundtop.jpg")`;
                $("body").css("background-image", backgroundimgurl);
            }
        });
    }

    var marqueeSwiper = new Swiper(".marqueeSwiper", {
        direction: "vertical",
        allowTouchMove: false,
        autoplay: {
            delay: 3000,
        },
    });

    /* ThreeSwiper */
    var threeSwiper = new Swiper(".threeSwiper", {
        slidesPerView: 1,
        loop: true,
        navigation: {
            nextEl: ".threeSwiper>.swiper-button-next",
            prevEl: ".threeSwiper>.swiper-button-prev",
        },
        breakpoints: {
            768: {
                slidesPerView: 3,
                spaceBetween: 50,
                loop: false,
            },
        },
    });

    /*Planning Swiper */
    var planningSwiper = new Swiper(".planningSwiper", {
        loop: true,
        slidesPerView: 1,
        breakpoints: {
            768: {
                direction: "vertical",
                watchSlidesProgress: true,
                allowTouchMove: false,
            },
        },
        navigation: {
            nextEl: ".planningSwiper>.swiper-button-next",
            prevEl: ".planningSwiper>.swiper-button-prev",
        },
    });

    var planningThumbsSwiper = new Swiper(".planningThumbsSwiper", {
        allowTouchMove: true,
        direction: "vertical",
        effect: "coverflow",
        loop: true,
        slidesPerView: 2,
        centeredSlides: true,
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            scale: 0.9,
            modifier: 1,
            slideShadows: false,
        },
        navigation: {
            nextEl: ".planning>.swiper-button-next",
            prevEl: ".planning>.swiper-button-prev",
        },
        thumbs: {
            swiper: planningSwiper,
        },
    });

    /*Outcome Swiper */
    var outcomeswiper = new Swiper(".outcomeSwiper", {
        slidesPerView: 2,
        grid: {
            rows: 2,
        },
        breakpoints: {
            768: {
                slidesPerView: 4,
            },
        },
        pagination: {
            el: ".outcomeSwiper .swiper-pagination",
        },
        navigation: {
            nextEl: ".outcomeSwiper>.swiper-button-next",
            prevEl: ".outcomeSwiper>.swiper-button-prev",
        },
    });

    $(window).scroll(function () {
        $('.hideme').each(function (i) {
            var $self = $(this);
            var bottom_of_object = $self.offset().top + $self.outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            if (bottom_of_window > bottom_of_object) {
                $self.delay(time).animate({ 'opacity': '1' }, 500);
                time += 500;
            }
        });
    });
}