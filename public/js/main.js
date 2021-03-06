//sidenav animation

$(window).on('load', function() {
    $(".loaderInner").fadeOut();
    $(".loader").delay(800).fadeOut("slow");
});

var openedNav = false;
function openNav() {
    $(".sidenav").addClass('opened');
    openedNav = true;
}

function closeNav() {
    $(".sidenav").removeClass('opened');
    openedNav = false;
}


//other navbar functions

$(document).tooltip();

$('.catalogue_list_items').on('click', 'button', function () {
    var parent = $(this).parent();
    _.each(parent.siblings().find('.nav_menu_options'), function (item) {
        if ($(item).css('display') == 'block') {
            $(item).slideUp();
        }
    });
    parent.find('.nav_menu_options').slideToggle();
});

//registered user dropdown

(function setDropdownListeners() {
    $('#users_dropdown_button').on('click', function(){
        $('.dropdown-content').slideToggle('fast');
    });

    $(document).on('click', function (e) {
        if(!e.target.closest('#users_dropdown_button')){
            $('.dropdown-content').slideUp('fast');
        }
    });
})();


$('#change_password_button').on('click', function () {
    var window = $('#change_password_window');
    window.removeClass('hidden');
    window.on('click', '.fa-times, .cancel', function () {
        window.addClass('hidden');
        window.unbind();
    });
});

$('#favorite_cocktails_button').on('click', function () {
    previousHash = window.location.hash;
    window.location.hash = '#favorites';
});

//constructor functions

var containersCollection = document.querySelectorAll('.ingredients_container');

for (var i = 0; i < containersCollection.length; i++) {
    containersCollection[i].addEventListener('click', function () {
        var target = event.target;
        while (target != this) {
            if (target.tagName == 'LI') {
                target.classList.toggle('pushedButton');
                toggleIngredient(target);
            }
            target = target.parentNode;
        }
    })
}

function toggleIngredient(ingredient) {
    var tabsContainer = document.getElementById('tabs'),
        tabsCollection = tabsContainer.querySelectorAll('.singleTab'),
        category = $(ingredient).parent().prev().text(),
        data = ingredient.querySelector('span').innerHTML;
    if (ingredient.className == 'pushedButton') {
        var newElem = document.createElement('div');
        newElem.innerHTML = data;
        if (category == "Base Spirit:") {
            newElem.dataset.baseSpirit = true;
        }
        newElem.classList.add('singleTab');
        tabsContainer.appendChild(newElem);
    }
    else {
        for (i = 0; i < tabsCollection.length; i++) {
            if (tabsCollection[i].innerHTML == data) tabsContainer.removeChild(tabsCollection[i]);
        }
    }
}

$(function () {
    var timer;
    $('#constructor_hint')
        .on('mouseenter', function(){timer = setTimeout(function () {
            $('.oval-thought').fadeIn();
        }, 700)})
            .on('mouseleave', function(){
                clearTimeout(timer);
                $('.oval-thought').fadeOut();});
});


//application functionality

var cocktails = [], //global var for all the stuff
    previousHash,
    cocktails_grid_template_func;

$.ajax({
    url: '/getcollection/',
    method: 'GET',
    complete: function (jqXHR) {
        generateCocktails(jqXHR);
        generateConstructor();
        $(window).trigger('hashchange');
    }
});

$.ajax({
    url: "/check_auth",
    method: "GET",
    complete: function(jqXHR){
        var response = JSON.parse(jqXHR.responseText).status;
        if(response == 'not registered') {
            deleteCookie('user');
        }
    }
});

function getCollection(path) {
    $.ajax({
        url: '/getcollection/' + path,
        method: 'GET',
        complete: function (jqXHR) {
            generateCocktails(jqXHR);
        }
    });
    hideViews();
    $('#all_cocktails').fadeIn();
}

function generateCocktails(data) {
    if(!data || !data.length) checkMatchedCocktails('Sorry, no cocktails matched your query');
    cocktails = JSON.parse(data.responseText);
    cocktails.forEach(function (item) {
        item.size = calculateSize(item);
        item.ingrQuantity = item.ingredients.length;
    });
    setCollectionHeading();
    compileAndListen();
}

function compileAndListen() {
    var theTemplateScript = $("#all-cocktails-template").html();

    cocktails_grid_template_func = _.template(theTemplateScript);

    var container = $('.catalogue');
    $('.single_drink', container).remove();
    container.append(cocktails_grid_template_func(cocktails));
    checkFilters();

    $('.filter').on('click', function (e) {
        if (e.target.tagName == 'BUTTON') {
            var hashArray = window.location.hash.split('/');
            if (e.target.name == 'sort') {
                var index;
                if (~window.location.hash.indexOf('sort')) {
                    for (var i = 0; i < hashArray.length; i++) {
                        if (hashArray[i].match(/sort/i)) index = i;
                    }
                    hashArray[index] = 'sort=' + e.target.value;
                    window.location.hash = hashArray.join('/');
                } else window.location.hash += '/sort=' + e.target.value;
            }
            else if (e.target.name == 'filter') {
                var i_quantity = $('#i_quantity').val();
                if (~window.location.hash.indexOf('ingredients_q')) {
                    for (i = 0; i < hashArray.length; i++) {
                        if (hashArray[i].match(/ingredients_q/i)) index = i;
                    }
                    if(!i_quantity) {
                        hashArray.splice(index, 1)
                    } else hashArray[index] = 'ingredients_q=' + i_quantity;
                    window.location.hash = hashArray.join('/');
                } else if(i_quantity)
                    window.location.hash += '/ingredients_q=' + i_quantity;
            }
            else if(e.target.name == 'clear_filters'){
                var hash = window.location.hash;
                window.location.hash = hash.replace(/\/sort=\w+|\/ingredients_q=\w+/i, "");
            }
        }
    });
    clickedDrinkListener();
}

function setCollectionHeading() {
    var pathArray = decodeURI(window.location.hash).split('/'),
        headingContainer = $("#cocktails_heading");

    if (pathArray[0] === "") {
        headingContainer.text("All cocktails");
    }
    else if (pathArray[0] === "#categories") {
        if (pathArray[1] === "no-alc") {
            headingContainer.text("Non-alcohol drinks");
        } else {
            var category = $('#' + pathArray[1]).prev().text(),
                value = $('[data-hash=\"' + pathArray[2] + '\"]').text();
            headingContainer.text(category + ": " + value);
        }
    }
    else if (pathArray[0].split('=')[0] === "#search") {
        headingContainer.text('Search results for \"' + pathArray[0].split('=')[1] + '\"');
    }
    else if (pathArray[0] === '#constructor' && pathArray[1]) {
        headingContainer.text('Cocktails that match your recipe:')
    } else if(pathArray[0] === "#favorites"){
        headingContainer.text('Favorites')
    }
}

function hideViews() {
    [   $('.error_page'),
        $('.selected_cocktail_holder'),
        $('.main_section').children()
    ].forEach(function (item) {
        item.fadeOut(0);
    });
    $('#register_window').addClass('hidden')
}

$(window).on('hashchange', function () {
    if (getCookie('user')) {
        signedIn(true, getCookie('user'))
    }
    else signedIn(false);
    render(decodeURI(window.location.hash));
});

function render(url) {
    var temp = url.split('/')[0],

        map = {
            '#': function () {
                getCollection('');
            },
            '': function () {
                getCollection('');
            },
            '#selected': function () {
                var index = url.split('#selected/')[1].trim();
                renderCocktailInfo(index, cocktails);
            },
            '#about': function () {
                showPage('#about_page');
            },
            '#constructor': function () {
                if (window.location.hash.split('#constructor')[1] !== '') {
                    searchRecipe();
                } else {
                    showPage('#constructor_page');
                }
            },
            '#categories': function () {
                var path = url.split('#')[1].trim();
                getCollection(path);
            },
            '#register': function () {
                if (getCookie('user')) return false;
                openRegisterForm();
            },
            '#add_cocktail': function () {
                generateMessage('Sorry, this function is currently unavailable');
                window.location.hash = previousHash || '';
                // $.ajax({
                //     url: "/check_auth",
                //     method: "GET",
                //     complete: function(jqXHR){
                //         var response = JSON.parse(jqXHR.responseText).status;
                //         if(response == 'not registered') {
                //             generateMessage('Sorry, you must register or log in first');
                //             window.location.hash = previousHash || '';
                //         }
                //         else showPage('#add_cocktail');
                //     }
                // });
            },
            '#favorites': function () {
                getFavoriteCocktails();
            }
        };

    if (map[temp]) {
        map[temp]();
    }
    else if (~temp.indexOf('search=')) {
        var query = temp.split('#')[1];
        getSearchQuery(query)
    } else {
        hideViews();
        $('.error_page').fadeIn();
    }

    if (openedNav) closeNav();
}

function clickedDrinkListener() {
    $('.catalogue').find('.single_drink').on('click', function (e) {
        e.preventDefault();
        previousHash = window.location.hash;
        var id = $(this).data('id');

        window.location.hash = 'selected/' + id;
    });
}

function checkFilters() {
    var hashArray = window.location.hash.split('/'),
        index;
    if (~window.location.hash.indexOf('sort')) {
        for (var i = 0; i < hashArray.length; i++) {
            if (hashArray[i].match(/sort/i)) index = i;
        }
        var sortBy = hashArray[index].split('=')[1];
        sortCocktails(sortBy);
    }
    if (~window.location.hash.indexOf('ingredients_q')) {
        for (i = 0; i < hashArray.length; i++) {
            if (hashArray[i].match(/ingredients_q/i)) index = i;
        }
        var quantity = hashArray[index].split('=')[1];
        filterByIngredientsQuantity(quantity);
    }
    if ($('.single_drink.hidden').length !== $('.single_drink').length) {
        $('.catalogue').find('p').remove();
    }
}

function checkMatchedCocktails(str) {
    if(!$.contains(document.querySelector('.catalogue'), document.querySelector('p'))) {
        var p = document.createElement('p');
        p.innerHTML = str;
        $('.catalogue').append(p);
    }
}

function sortCocktails(target) {
    var collection = $('.single_drink');
    if (target == 'name') {
        collection.sort(function (a, b) {
            var textA = $(a).find('.info_container').text(),
                textB = $(b).find('.info_container').text();
            if (textA > textB) return 1;
            else if (textA < textB) return -1;
            return 0;
        })
    }
    else if ((target == 'size')) {
        collection.sort(function (a, b) {
            if ($(a).data('size') > $(b).data('size')) return 1;
            else if ($(a).data('size') < $(b).data('size')) return -1;
            return 0;
        })
    }
    var container = $('.catalogue');
    $('.single_drink', container).remove();
    container.append(collection);
}

function filterByIngredientsQuantity(quantity) {
    var catalogue = $('.catalogue'),
        collection = $('.single_drink');
    _.each(collection, function (item) {
        if ($(item).hasClass('hidden')) {
            $(item).removeClass('hidden');
        }
        if (item.dataset.ingrQuantity !== quantity) {
            $(item).addClass('hidden');
        }
    });

    // if ($('.single_drink.hidden').length == collection.length) {
    //     checkMatchedCocktails('Sorry, no matched cocktails for your filter options')
    // }
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

function generateConstructor() {
    var spirits = document.querySelectorAll("#baseSpirit span"),
        theBaseSpiritTemplateScript = $('#base_spirit_constructor').html(),
        theBaseSpiritTemplate = _.template(theBaseSpiritTemplateScript);

    var containers = $('.ingredients_ul');
    $(containers[0]).html(theBaseSpiritTemplate(spirits));

    var allIngredients = [];
    cocktails.forEach(function (item) {
        var ingrArray = item['ingredients'];
        _.each(ingrArray, function (obj) {
            if (allIngredients.indexOf(obj['ingr']) == -1) {
                allIngredients.push(obj['ingr']);
            }
        });
    });

    allIngredients = allIngredients.sort();

    var theIngrTemplateScript = $("#additional_filter").html(),
        theIngrTemplate = _.template(theIngrTemplateScript);

    $(containers[1]).html(theIngrTemplate(allIngredients));
}

function renderCocktailInfo(id) {
        hideViews();
    var container = $('.selected_cocktail'),
        parent = container.parent();

    $.ajax({
        url: "/get_cocktail_details",
        data: {cocktail: id},
        method: "GET",
        complete: function (jqXHR) {
            var cocktailDetails = JSON.parse(jqXHR.responseText);
            var theTemplateScript = $("#single_cocktail_template").html();

            var templateFunction = _.template(theTemplateScript);
            container.empty();
            container.append(templateFunction(cocktailDetails));
            checkIfFavorite(id);
            parent.fadeIn();
        }
    }).then(function(){
        parent.on('click', function (e) {
            if (!(parent.css('display') == 'none')) {
                var clicked = $(e.target);
                if (clicked.hasClass('closebtn') || clicked.hasClass('selected_cocktail_holder')) {
                    parent.fadeOut(0);
                    window.location.hash = previousHash || '';
                }
            }

        });

        $('.details').on('click', function () {
            this.classList.toggle('opened_details');
        });

        $('.favorite_toggle_button').on('click', toggleFavorites);
    });
}

function showPage(id) {
    hideViews();
    $(id).fadeIn();
}

function openRegisterForm() {
    var container = $('#register_window');
    container.removeClass('hidden');

    $('body').on('click', function (e) {
        if (!container.hasClass('hidden')) {
            if (!e.target.closest('.dropdown_users_form')) {
                closeRegisterForm()
            }
        }
    });
}

function closeRegisterForm() {
    window.location.hash = previousHash || '';
    $('#register_window').addClass('hidden');
}

function generateMessage(message) {
    var jqMessage = $(document.createElement('div'));
    jqMessage.text(message);
    jqMessage.dialog({
        title: "Alert",
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            'Ok': function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            $(this).dialog('destroy')
        },
        show: {
            effect: "bounce",
            times: 1,
            duration: 'normal'
        },
        hide: {
            effect: "drop",
            direction: 'down',
            duration: 'fast'
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
                break;

            case 'constructor_button':
                window.location.hash = 'constructor';
                break;
        }
    }
    else if (e.target.matches('#no-alc')) {
        window.location.hash = 'categories/' + e.target.id;
    }
    else if (e.target.matches('.nav_menu_options span')) {
        var opts = e.target.closest('.nav_menu_options'),
            category = opts.id,
            value = e.target.dataset.hash;
        window.location.hash = 'categories/' + category + '/' + value + '/';
    }
    else if ($(e.target).hasClass('add_cocktail_button')) window.location.hash = 'add_cocktail';
});

function signedIn(bool, user) {
    var signInDiv = $(".sign_in_div"),
        signOutDiv = $(".sign_out_div");
    if (bool) {
        signOutDiv.find('#greetings').html("Hello, " + user + '<br>');
        signOutDiv.show();
        signInDiv.hide();
    } else {
        signOutDiv.hide();
        signInDiv.show();

        $('#register_button').unbind().on('click', function () {
            previousHash = window.location.hash;

            window.location.hash = 'register/';
        });
    }
}

function getSearchQuery(queryText) {
    $.ajax({
        url: "/search",
        data: queryText,
        method: "GET",
        complete: function (jqXHR) {
            showPage("#all_cocktails");
            generateCocktails(jqXHR)
        }
    });
}

function searchRecipe() {
    var filters = window.location.hash.split('/')[1];

    $.ajax({
        url: "/match_recipe",
        data: filters,
        method: "GET",
        complete: function (jqXHR) {
            generateCocktails(jqXHR);
            hideViews();
            $('#all_cocktails').fadeIn();

            var backButton = document.createElement('button');
            backButton.id = "back_to_constructor_button";
            $(backButton).html('<i class="fa fa-undo" aria-hidden="true"></i>')
                .attr('title', 'Back to the constructor')
                .addClass('constructor_nav_button');
            $('.catalogue').append(backButton);

            $(backButton).on('click', function () {
                $('#back_to_constructor_button').remove();
                window.location.hash = '#constructor';
            })
        }
    });
}

function registerUser(form) {  //uses jQuery plugin (plugins.js)
    $.ajax({
        url: "/register",
        data: $(form).serialize(),
        method: "POST",
        statusCode: {
            200: function () {
                var user = $('input[name=username]', form).val();
                signedIn(true, user);
                setCookie('user', user);
                closeRegisterForm();
            }
        }
    });
    return false;
}

function changePassword(form) {
    $.ajax({
        url: "/change_password",
        data: $(form).serialize(),
        method: "POST",
        complete: function (jqXHR) {
                var response = JSON.stringify(jqXHR.responseText);
                if(JSON.parse(response)){
                    generateMessage(JSON.parse(response))
                } else{
                    generateMessage("Password was changed successfully");
                    $('#change_password_window').addClass('hidden')
                        .unbind();
                    $('.dropdown-content').slideUp('fast');
                }
            }
    });
    return false;
}

$(document.forms.users_form).on('click', function (e) {
    var target = $(e.target);
    if (target.attr('value') == 'Log in') {
        var form = $(e.currentTarget);
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
                400: function () {
                    generateMessage('Please fill in all the form fields')
                },
                401: function () {
                    generateMessage("Please enter a correct username and password.")
                }
            }
        });
        return false;
    }
    else if ($(target).attr('id') == 'sign_out') {
        $.ajax({
            url: '/logout',
            method: "POST",
            statusCode: {
                200: function () {
                    if(window.location.hash == '#favorites') window.location.hash = '';
                    $('.dropdown-content').slideUp('fast');
                    signedIn(false);
                    deleteCookie('user');
                }
            }
        });
        return false;
    }
});

$(document.forms.search_form).on('submit', function () {
    window.location.hash = $(this).serialize();
    return false;
});

// $(document.forms.add_cocktail_form).on('submit', function () {
//     var formData = new FormData(this);
//     console.log(formData);
//     $.ajax({
//         url: "/add_cocktail",
//         data: formData,
//         contentType: false,
//         processData: false,
//         method: "POST",
//         statusCode: {
//             200: function () {
//                 window.location.hash = '';
//                 generateMessage('Well done! your cocktail was added to the database');
//             }
//         }
//     });
//     return false;
// });

$('#search_by_ingredients_button').on('click', function () {
    var tabs = $('.singleTab'),
        filters = {};
    if (!tabs.length) {
        return false
    }
    filters.ingredients = [];
    _.forEach(tabs, function (item) {
        if (item.dataset.baseSpirit) {
            filters.baseSpirit = item.innerHTML;
        } else filters.ingredients.push(item.innerHTML);
    });

    window.location.hash = '#constructor/' + $.param(filters);
});

function toggleFavorites() {
    var cocktailId = window.location.hash.split('selected/')[1];
    $.ajax({
        url: "/toggle_favorites",
        data: {cocktail: cocktailId},
        method: "POST",
        complete: function (jqXHR) {
            var response = JSON.parse(jqXHR.responseText);
            if(response.status == 'not registered'){
                generateMessage('You must register or sign in first')
            } else if(response.status == 'successfully added'){
                $('.favorite_toggle_button').addClass('active');
            } else if(response.status == 'successfully deleted'){
                $('.favorite_toggle_button').removeClass('active');
            }
        }
    });
}

function checkIfFavorite(id) {
    $.ajax({
        url: "/check_if_favorite",
        data: {cocktail: id},
        method: "GET",
        complete: function (jqXHR) {
            var response = JSON.parse(jqXHR.responseText);
            if(response.isFavorite){
                $('.favorite_toggle_button').addClass('active');
            } else{
                $('.favorite_toggle_button').removeClass('active');
            }
        }
    });
}

function getFavoriteCocktails() {
    $.ajax({
        url: "/getFavoriteCocktails",
        method: "GET",
        complete: function (jqXHR) {
            var response = JSON.parse(jqXHR.responseText);
            if(response.status == 'not registered'){
                generateMessage('You must register or sign in first');
                window.location.hash = previousHash || '';
            } else {
                showPage("#all_cocktails");
                generateCocktails(jqXHR)
            }
        }
    });
}

//placeholder and image preview functions

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
