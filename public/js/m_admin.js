function login() {
    $(".cool-input-wrapper").removeClass("danger");
    $.ajax({
        url: "/login",
        cache: false,
        type: "POST",
        data: { "password": $("#inputPassword").val()},
        statusCode: {
            403: function (xhr) {
                $(".cool-input-wrapper").addClass("danger");
            }
        },
        success: function() {
            window.location = './manage';
        }
    });
}

$("#inputPassword").keyup(function (e) {
    if (e.keyCode == 13) {
        login();
    }
});
