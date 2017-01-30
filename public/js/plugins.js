// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

$(document).ready(function () {
    $('#reg_form').validate({
        rules: {
            firstname: {
                required: true,
                minlength: 2
            },
            lastname: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            username: {
                required: true,
                minlength: 4
            },
            password: {
                required: true,
                minlength: 5
            },
            password_confirm: {
                required: true,
                minlength: 5,
                equalTo: "#password"
            }
        },
        messages: {
            firstname: {
                required: "Please, enter your first name",
                minlength: "Your first name must consist of least 2 characters"
            },
            lastname: {
                required: "Please, enter your last name",
                minlength: "Your last name must consist of least 2 characters"
            },
            email: {
                required: "Enter your email here",
                email: "The email you entered is not valid"
            },
            username: {
                required: "Please, enter your username",
                minlength: "Your username must consist of least 4 characters"
            },
            password: {
                required: "Please, provide a password",
                minlength: "Your password must consist of least 5 characters"
            },
            password_confirm: {
                required: "Please, provide your password",
                minlength: "Your password must consist of least 5 characters",
                equalTo: "You must enter the same password as above"
            }
        },
        submitHandler: function (form) {
            registerUser(form);
        }
    });

});