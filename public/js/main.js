//sidenav animation

function openNav() {
    $(".sidenav").css('left', "0");
    // $(".main_section").css('marginLeft', "290px");
}

function closeNav() {
    $(".sidenav").css('left', '-290px');
    // $(".main_section").css('marginLeft', 0);
}

//other navbar functions

function showElems(id) {
    var elem = $("#" + id),
        lis = elem.parent().siblings();
    for (var i = 0; i < lis.length; i++) {
        var tab = $(lis[i]).find('.nav_menu_options')[0];
        if (!$(tab).hasClass('hidden')) {
            $(tab).addClass('hidden');
        }
    }
    elem.toggleClass('hidden');
}

function changeRange(id) {
    var range = document.getElementById(id);
    if (range.nextElementSibling) {
        range.nextElementSibling.innerHTML = range.value + ' ingr.'
    }
    else {
        var span = document.createElement('span');
        span.innerHTML = range.value + ' ingr.';
        range.parentNode.appendChild(span);
    }
}

//constructor functions
//
// var containersCollection = document.querySelectorAll('.ingredients_container');
//
// for (var i = 0; i < containersCollection.length; i++){
//     containersCollection[i].addEventListener('click', function (){
//     var target = event.target;
//     while (target != this) {
//         if (target.tagName == 'LI') {
//             target.classList.toggle('pushedButton');
//             toggleIngredient(target);
//         }
//         target = target.parentNode;
//     }
// })}
//
// function toggleIngredient (ingredient){
//     var tabsContainer = document.getElementById('tabs'),
//         tabsCollection = tabsContainer.querySelectorAll('.singleTab'), // bug with this collection
//         data = ingredient.querySelector('span').innerHTML;
//     if(ingredient.className == 'pushedButton') {
//         var newElem = document.createElement('div');
//         newElem.innerHTML = data;
//         newElem.className = 'singleTab';
//         tabsContainer.appendChild(newElem);
//     }
//     else {
//         for (i = 0; i < tabsCollection.length; i++){
//             if(tabsCollection[i].innerHTML == data) tabsContainer.removeChild(tabsCollection[i]);
//         }
//     }
// }

//details of the recipe function !!! class and this function can be optimized if there would be more menus


$(function () {

    var cocktails = [], //global var for all the stuff
        previousHash,
        cocktails_grid_template_func;

    $.ajax({
        url: '/getcollection',
        method: 'GET',
        complete: function (jqXHR) {
            cocktails = JSON.parse(jqXHR.responseText);
            cocktails.forEach(function (item) {
                item.size = calculateSize(item);
            });
                generateAll();
                $(window).trigger('hashchange');
        }
    });


    // $.getJSON("db.json", function (data) {
    //     cocktails = data;
    //     console.log(cocktails);
    //     cocktails.forEach(function (item) {
    //         item.size = calculateSize(item);
    //     });
    //     generateAll();
    //     $(window).trigger('hashchange');
    // });

    $(window).on('hashchange', function () {
        if(getCookie('user')){
            signedIn(true, getCookie('user'))
        }
        else signedIn(false);
        render(decodeURI(window.location.hash));
    });

    function render(url) {
        var temp = url.split('/')[0];

        var map = {

            '': function () {
                generateCocktails(cocktails);
            },

            '#selected': function () {
                var index = url.split('#selected/')[1].trim();
                renderCocktailInfo(index, cocktails);
            },

            '#about': function () {
                showPage('#about_page');
            },

            // '#constructor': function(){
            //     showPage('#constructor');
            // },

            '#categories': function () {
                url = url.split('#categories/')[1].trim();
                renderCategory(url);
            },

            '#register': function () {
                if(getCookie('user')) return false;
                openRegisterForm();
            },

            '#add_cocktail': function () {
                $.ajax({
                    url: "/check_auth",
                    method: "GET",
                    statusCode: {
                        200: function () {
                            showPage('#add_cocktail');
                        },
                        401: function () {
                            generateErrorMessage('Sorry, you must register or log in first');
                            window.location.hash = previousHash || '';
                        }
                    }
                });
            }
        };

        if (map[temp]) {
            map[temp]();
            if ($(".sidenav").css('left', '0')) closeNav();
        }
    }

    function generateAll() {
        var theTemplateScript = $("#all-cocktails-template").html();

        cocktails_grid_template_func = _.template(theTemplateScript);

        var container = $('.catalogue');
        container.append(cocktails_grid_template_func(cocktails));
        setFilters();
        // generateConstructor();

        $('.filter').on('click', function (e) {
            if (e.target.tagName == 'BUTTON') {
                sort_cocktails(e.target)
            }
        });
        clickedDrinkListener();
    }

    function clickedDrinkListener() {
        $('.catalogue').find('.single_drink').on('click', function (e) {
            previousHash = window.location.hash;
            e.preventDefault();
            var id = $(this).data('id');

            window.location.hash = 'selected/' + id;
        });
    }

    function sort_cocktails(target) {
        var collection = $('.single_drink');
        if (target.name == 'name') {
            collection.sort(function (a, b) {
                var textA = $(a).find('.info_container').text(),
                    textB = $(b).find('.info_container').text();
                if (textA > textB) return 1;
                else if (textA < textB) return -1;
                return 0;
            })
        }
        else if ((target.name == 'size')) {
            collection.sort(function (a, b) {
                if ($(a).data('size') > $(b).data('size')) return 1;
                else if ($(a).data('size') < $(b).data('size')) return -1;
                return 0;
            })
        }
        var container = $('.catalogue');
        container.empty();
        container.append(collection);
        clickedDrinkListener();
    }

    function calculateSize(obj) {
        var quantitiesArray = [],
            overallSize = 0;
        obj.ingredients.forEach(function (item) {
            quantitiesArray.push(item.quantity);
        });
        quantitiesArray.forEach(function (item) {
            if (item.indexOf('ml') !== -1) overallSize += parseInt(item)
        });

        return overallSize;
    }

    // function generateConstructor() {
    //     var spirits = $('#baseSpirit').find('li'),
    //         base_spirit_template = $('#base_spirit_constructor').html(),
    //         compiled = _.template(base_spirit_template);
    //
    //     console.log(spirits);
    //
    //     var container = $('.ingredients_ul:nth-child(0)');
    //     container.append(compiled(spirits))
    // }

    function setFilters() {
        var ingredients = [];
        cocktails.forEach(function (item) {
            var ingrArray = item['ingredients'];
            _.each(ingrArray, function (obj) {
                if (ingredients.indexOf(obj['ingr']) == -1) {
                    ingredients.push(obj['ingr']);
                }
            });
        });

        ingredients = ingredients.sort();

        var theTemplateScript = $("#additional_filter").html(),
            theTemplate = _.template(theTemplateScript);

        var fieldset = $('#additional_filter_form').find("fieldset");
        fieldset.append(theTemplate(ingredients));
    }

    function generateCocktails(data) {
        var allCocktails = $('.single_drink');

        allCocktails.addClass('hidden');

        allCocktails.each(function () {

            var item = this;

            for (var i = 0; i < data.length; i++) {
                if (item.dataset.id == data[i]._id) {
                    item.classList.remove('hidden')
                }
            }
        });
        $('.main_section').children().addClass('hidden');
        $('#all_cocktails').removeClass('hidden');
    }

    function renderCocktailInfo(id, data) {
        var cocktailsWindow = $('#all_cocktails');
        if (cocktailsWindow.hasClass('.hidden')) {
            $('.main_section').children().addClass('hidden');
            cocktailsWindow.removeClass('hidden')
        }
        var container = $('.selected_cocktail'),
            parent = container.parent(),
            cocktail = {};

        data.forEach(function (item) {
            if (id == item._id) cocktail = item;
        });
        var theTemplateScript = $("#single_cocktail_template").html();

        var templateFunction = _.template(theTemplateScript);
        container.empty();
        container.append(templateFunction(cocktail));
        parent.removeClass('hidden');

        parent.on('click', function (e) {
            if (!parent.hasClass('hidden')) {
                var clicked = $(e.target);
                if (clicked.hasClass('closebtn') || clicked.hasClass('selected_cocktail_holder')) {
                    parent.addClass('hidden');
                    window.location.hash = previousHash || '';
                }
            }

        });

        $('.details').on('click', function () {
            this.classList.toggle('opened_details');
        });
    }

    function showPage(id) {
        $('.main_section').children().addClass('hidden');
        $(id).removeClass('hidden');
    }

    function renderCategory(data) {
        var category = data.split('/')[0],
            collection = [];

        if (data.split('/')[1]) {
            var value = data.split('/')[1];
            _.each(cocktails, function (obj) {
                var searchCategories = obj.search_categories;
                for (var i = 0; i < searchCategories[category].length; i++) {
                    if (searchCategories[category][i] == value) collection.push(obj);
                }
            });
        } else {
            _.each(cocktails, function (obj) {
                var alc = obj.search_categories.baseSpirit;
                if (alc == '-') collection.push(obj);
            });
        }
        generateCocktails(collection);
    }

    function openRegisterForm() {
        var container = $('.register_form_container');
        container.removeClass('hidden');

        $('body').on('click', function (e) {
            if (!container.hasClass('hidden')) {
                if (!e.target.closest('.register')) {
                    closeRegisterForm()
                }
            }
        });
    }
    function closeRegisterForm(){
        window.location.hash = previousHash || '';
        $('.register_form_container').addClass('hidden');
    }

    function generateErrorMessage(message) {
        var errorMessage = $(document.createElement('div'));
        errorMessage.text(message);
        errorMessage.addClass('errorMessage');
        errorMessage.dialog({
            modal: true,
            classes: {
                'ui-dialog': 'errorMessage'
            },
            buttons: {
                'Ok': function () {
                    $(this).dialog("close");
                }
            }
        })
    }

    $('.sidenav').on('click', function (e) {
        if (e.target.classList.contains('main_menu_links')) {
            switch (e.target.id) {
                case 'about_page_button':
                    window.location.hash = 'about';
                    break;

                case 'all_cocktails_button':
                    window.location.hash = '';
                    $("#cocktails_heading").text("All cocktails");
                    break;

                // case 'constructor_button':
                //     window.location.hash = 'constructor';
                //     break;
            }
        }
        else if (e.target.matches('#no-alc')) {
            window.location.hash = 'categories/' + e.target.id;
            $("#cocktails_heading").text(e.target.innerText);
        }
        else if (e.target.matches('.nav_menu_options span')) {
            var opts = e.target.closest('.nav_menu_options'),
                category = opts.id,
                value = e.target.dataset.hash;
            window.location.hash = 'categories/' + category + '/' + value + '/';
            $("#cocktails_heading").text(opts.previousElementSibling.innerHTML + ": " + e.target.innerHTML);
        }
        else if ($(e.target).hasClass('add_cocktail_button')) window.location.hash = 'add_cocktail';
    });

    var signedIn = function(bool){
        var form = $(document.forms.users_form);
        user = arguments[1] || '';
        if(bool) {
            form.html("Hello, " + user + '<br>');
            var resetButton = $(document.createElement('input'));
            resetButton
                .attr('type', 'submit')
                .attr('name', 'sign_out')
                .attr('value', 'Sign out');
            form.append(resetButton);

        } else{
            form.html("<span>Log in</span><br>" +
                "<input type='text' name='username' placeholder='username'><br>" +
                "<input type='password' name='login_password' placeholder='password'><br>" +
                "<input type='submit' value='Log in'>" +
                "<span class='register_proposition'>Not registered yet?" +
            "<button id='register_button' type='button'>Sign up now!</button>" +
            "</span>");

            $('.header_holder').find('#register_button').on('click', function (e) {
                e.preventDefault();
                previousHash = window.location.hash;

                window.location.hash = 'register/';
            });
        }
    };

    $(document.forms.users_form).on('submit', function () {  //sign in form submitting
        var form = $(this),
            submitButton = $('[type=submit]', form);
        if(submitButton.attr('value') == 'Log in') {
            $.ajax({
                url: "/login",
                data: form.serialize(),
                method: "POST",
                statusCode: {
                    200: function () {
                        var user = $('input[name=username]', form).val();
                        signedIn(true, user);
                        setCookie('user', user);
                    },
                    401: function () {
                        generateErrorMessage("Please enter a correct username and password.");
                    }
                }
                // complete: function (jqXHR) {
                //     var response = JSON.parse(jqXHR.responseText);
                //     if (response.status === 'OK') {
                //         signedIn(true, $('input[name=username]', form).val());
                //     }
                //     else if (response.status === 'error') {
                //         var errorMessage = $(document.createElement('div'));
                //         errorMessage.text(response.fieldError);
                //         // errorMessage.addClass('errorMessage');
                //         errorMessage.dialog({
                //             modal: true,
                //             classes: {
                //                 'ui-dialog': 'errorMessage'
                //             },
                //             buttons: {
                //                 Ok: function() {
                //                     $( this ).dialog( "close" );
                //                 }
                //             }
                //         })
                //     }
                // }
            });
            return false;
        }
        else if(submitButton.attr('value') == 'Sign out'){
            $.ajax({
                url: '/logout',
                method: "POST",
                statusCode: {
                    200: function () {
                        signedIn(false);
                        deleteCookie('user');
                        // if (window.location.hash == 'add_cocktails') {
                        //     window.location.hash = previousHash || '';
                        // }
                    }
                }
            });
            return false;
        }
    });

    $(document.forms.reg_form).on('submit', function () {  //sign in form submitting
        var form = $(this);
        // $(":submit", form).button("loading");
        $.ajax({
            url: "/register",
            data: form.serialize(),
            method: "POST",
            statusCode: {
                200: function() {
                    var user = $('input[name=username]', form).val();
                    signedIn(true, user);
                    setCookie('user', user);
                    closeRegisterForm();
                }
            }
        });
        return false;
    });

    $(document.forms.search_form).on('submit', function(){
        // var form = $(this);
    });

    $(document.forms.add_cocktail_form).on('submit', function () {
        var formData = new FormData(this);
        $.ajax({
            url: "/add_cocktail",
            data: formData,
            contentType: false,
            processData: false,
            method: "POST",
            statusCode: {
                200: function () {
                }
            }
        });
        return false;
    })
});

$(function () {
    var placeholder = null,
        input_text = $('input[type=text]');
    input_text.focus(function () {
        placeholder = $(this).attr("placeholder");
        $(this).attr("placeholder", "");
    });
    input_text.blur(function () {
        $(this).attr("placeholder", placeholder);
    });
});

$(function () {
    var file = $("input[type=file]")[0];
    file.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#add_img_preview").attr("src", e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
});