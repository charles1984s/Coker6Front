"use strict";
const setBGCanvas = function () {
    if (!!!$) setTimeout(setBGCanvas, 100);
    $.fn.extend({
        BGCanvas: function () {
            if (!isNaN($(this).data("type"))) {
                switch (parseInt($(this).data("type"))) {
                    case 1:
                        $(this).BGCanvasType1();
                        break;
                }
            }
            return $(this);
        },
        BGCanvasType1: function () {
            let $self = $(this);
            let $c = $(this);
            if ($self.length != 0 && $self.get(0).tagName.toLowerCase() != "canvas") {
                if ($self.find("canvas").length == 0) {
                    $c = $("<canvas>");
                    $self.append($c);
                }
            }
            if ($self.length == 0) return $self;
            var W, H, L, n = 15, c = 45, dc = 0.25;
            const { sin, cos, PI, sqrt, random, floor, ceil, round, abs } = Math;

            function initSet() {
                var cnv = $c.get(0);
                var ctx = cnv.getContext("2d");
                function init() {
                    W = $self.width();
                    H = $self.height();
                    cnv.width = W;
                    cnv.height = H;
                    L = (W < H ? W : H) / 2;
                    ctx.fillStyle = "rgba(245,251,251,0)";
                    ctx.fillRect(0, 0, W, H);
                }
                init();
                $self.find("img").on("load", function () {
                    init();
                });
                window.onresize = init;

                function Point() {
                    this.ang = 1.5 * PI * random();
                    this.dang = (-0.5 + random()) / 22;
                    this.r = 2.2 * L / 1.8;
                    this.x = W / 2 + this.r * cos(this.ang);
                    this.y = H / 2 + 1.25 * this.r * sin(this.ang);
                    this.update = function () {
                        this.ang += this.dang;
                        this.x = W / 2 + this.r * cos(this.ang);
                        this.y = H / 2 + 1.1 * this.r * sin(this.ang);
                    }
                }

                var ctrls = [];
                for (let i = 0; i < n; i++) {
                    ctrls.push(new Point());
                }

                function animate() {
                    ctx.fillStyle = "rgba(255,255,255,0.03)";
                    ctx.fillRect(0, 0, W, H);
                    ctx.beginPath();
                    ctx.moveTo((ctrls[0].x + ctrls[n - 1].x) / 2, (ctrls[0].y + ctrls[n - 1].y) / 2);
                    for (let p = 0; p < n; p++) {
                        let q = p + 1;
                        if (q == n) q = 0;
                        ctx.quadraticCurveTo(ctrls[p].x, ctrls[p].y, (ctrls[p].x + ctrls[q].x) / 2, (ctrls[p].y + ctrls[q].y) / 2);
                        ctrls[p].update();
                    }
                    ctx.strokeStyle = `hsl(${round(180 + c)}deg, 100%, 70%)`;
                    //ctx.shadowBlur = L * 25 / 432;
                    //ctx.shadowColor = `hsl(${round(180 + c)}deg, 100%, 50%)`;
                    ctx.lineWidth = L * 2 / 432;

                    ctx.stroke();
                    ctx.shadowColor = "transparent";
                    c += dc;
                    if (c >= 100 || c <= 45) dc = -dc;
                    if (c == 45) {
                        ctx.fillStyle = "rgba(0,0,0,0)";
                        ctx.fillRect(0, 0, W, H);
                    }
                    window.requestAnimationFrame(animate);
                }
                animate();
            }
            initSet();
            return $self;
        }
    });
}
setTimeout(setBGCanvas, 100);