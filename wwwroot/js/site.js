function ready() {
    typeof (PageReady) === "function" && PageReady();
    $("#Collapse_Button > i").on("click", collapse);
}

function collapse() {
    $("footer").toggleClass("footer_pack_up");
}