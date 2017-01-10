//sidenav animation

var openedNav = false;
function openNav() {
    $(".sidenav").css('left', "0");
    openedNav = true;
    // $(".main_section").css('marginLeft', "290px");
}

function closeNav() {
    $(".sidenav").css('left', '-290px');
    openedNav = false;
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

//details of the recipe function !!! class and this function can be optimized if there would be more menus


$(function () {

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

    function getCollection(path) {
        $.ajax({
            url: '/getcollection/' + path,
            method: 'GET',
            complete: function (jqXHR) {
                generateCocktails(jqXHR);
            }
        });
        hideViews();
        $('#all_cocktails').removeClass('hidden');
    }

    function generateCocktails(data) {
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

        $('.filter').on('click', function (e) {
            if (e.target.tagName == 'BUTTON') {
                var hashArray = window.location.hash.split('/');
                if (e.target.name == 'sort') {
                    var index;
                    if (~window.location.hash.indexOf('sort')) {
                        if (~hashArray.indexOf('sort=name')) {
                            index = hashArray.indexOf('sort=name')
                        }
                        else if (~hashArray.indexOf('sort=size')) {
                            index = hashArray.indexOf('sort=size')
                        }
                        hashArray[index] = 'sort=' + e.target.value;
                        window.location.hash = hashArray.join('/');
                    } else window.location.hash += '/sort=' + e.target.value;
                }
                else if (e.target.name == 'filter'){
                    if (~window.location.hash.indexOf('ingredients')){
                        for(var i = 0; i < hashArray.length; i++){
                            if(hashArray[i].match(/ingredients/i)) index = i;
                        }
                        hashArray[index] = 'ingredients=' + $('#i_quantity').val();
                        window.location.hash = hashArray.join('/');
                    } else window.location.hash += '/ingredients=' + $('#i_quantity').val();
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
        }
    }

    function hideViews() {
        [
            $('.register_form_container'),
            $('.selected_cocktail_holder'),
            $('.main_section').children()
        ].forEach(function (item) {
            item.addClass('hidden');
        })
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
                        showPage('#constructor');
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
                    $.ajax({
                        url: "/check_auth",
                        method: "GET",
                        statusCode: {
                            200: function () {
                                showPage('#add_cocktail');
                            },
                            401: function () {
                                generateMessage('Sorry, you must register or log in first');
                                window.location.hash = previousHash || '';
                            }
                        }
                    });
                }
            };

        if (map[temp]) {
            map[temp]();
        }
        else if (~temp.indexOf('search=')) {
            var query = temp.split('#')[1];
            getSearchQuery(query)
        }

        if (openedNav) closeNav();
    }

    function clickedDrinkListener() {
        $('.catalogue').find('.single_drink').on('click', function (e) {
            previousHash = window.location.hash;
            e.preventDefault();
            var id = $(this).data('id');

            window.location.hash = 'selected/' + id;
        });
    }

    function sortCocktails(target) {
        var collection = $('.single_drink');
        if (target.value == 'name') {
            collection.sort(function (a, b) {
                var textA = $(a).find('.info_container').text(),
                    textB = $(b).find('.info_container').text();
                if (textA > textB) return 1;
                else if (textA < textB) return -1;
                return 0;
            })
        }
        else if ((target.value == 'size')) {
            collection.sort(function (a, b) {
                if ($(a).data('size') > $(b).data('size')) return 1;
                else if ($(a).data('size') < $(b).data('size')) return -1;
                return 0;
            })
        }
        var container = $('.catalogue');
        $('.single_drink', container).remove();
        container.append(collection);
        clickedDrinkListener();
    }

    function filterByIngredientsQuantity() {
        var catalogue = $('.catalogue'),
            quantity = $('#i_quantity').val();
        if (catalogue.find('p')) {
            catalogue.find('p').remove();
        }
        var collection = $('.single_drink');
        _.each(collection, function (item) {
            if ($(item).hasClass('hidden')) {
                $(item).removeClass('hidden');
            }
            if (item.dataset.ingrQuantity !== quantity) {
                $(item).addClass('hidden');
            }
        });

        if ($('.single_drink.hidden').length === collection.length) {
            var p = document.createElement('p');
            p.innerHTML = 'Sorry, no matched cocktails for your filter options';
            catalogue.append(p);
        }
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
        hideViews();
        $(id).removeClass('hidden');
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

    function closeRegisterForm() {
        window.location.hash = previousHash || '';
        $('.register_form_container').addClass('hidden');
    }

    function generateMessage(message) {
        var jqMessage = $(document.createElement('div'));
        jqMessage.text(message);
        jqMessage.dialog({
            modal: true,
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

    var signedIn = function (bool) {
        var form = $(document.forms.users_form);
        user = arguments[1] || '';
        if (bool) {
            form.html("Hello, " + user + '<br>');
            var resetButton = $(document.createElement('input'));
            resetButton
                .attr('type', 'submit')
                .attr('name', 'sign_out')
                .attr('value', 'Sign out');
            form.append(resetButton);

        } else {
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

    function getSearchQuery(queryText) {
        $.ajax({
            url: "/search",
            data: queryText,
            method: "GET",
            complete: function (jqXHR) {
                generateCocktails(jqXHR)
            }
        });
    }

    function searchRecipe() {
        var filters = window.location.hash.split('#constructor/')[1];
        console.log(filters);

        $.ajax({
            url: "/match_recipe",
            data: filters,
            method: "GET",
            complete: function (jqXHR) {
                generateCocktails(jqXHR);
                hideViews();
                $('#all_cocktails').removeClass('hidden');

                var backButton = document.createElement('button');
                backButton.innerHTML = 'Return to the constructor';
                backButton.id = 'back_to_constructor_button';
                $('.main_section').append(backButton);

                $(backButton).on('click', function () {
                    window.location.hash = '#constructor';
                })
            }
        });
    }

    $(document.forms.users_form).on('submit', function () {  //sign in form submitting
        var form = $(this),
            submitButton = $('[type=submit]', form);
        if (submitButton.attr('value') == 'Log in') {
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
        else if (submitButton.attr('value') == 'Sign out') {
            $.ajax({
                url: '/logout',
                method: "POST",
                statusCode: {
                    200: function () {
                        signedIn(false);
                        deleteCookie('user');
                    }
                }
            });
            return false;
        }
    });

    $(document.forms.reg_form).on('submit', function () {  //sign in form submitting
        var form = $(this);
        $.ajax({
            url: "/register",
            data: form.serialize(),
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
    });

    $(document.forms.search_form).on('submit', function () {
        window.location.hash = $(this).serialize();
        return false;
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
                    window.location.hash = '';
                    generateMessage('Well done! your cocktail was added to the database');
                }
            }
        });
        return false;
    });

    $('#search_by_ingredients_button').on('click', function () {
        var tabs = $('.singleTab'),
            filters = {};
        filters.ingredients = [];
        _.forEach(tabs, function (item) {
            if (item.dataset.baseSpirit) {
                filters.baseSpirit = item.innerHTML;
            } else filters.ingredients.push(item.innerHTML);
        });

        window.location.hash = '#constructor/' + $.param(filters);
    });

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

// function checkFilters(){
//     var query = window.location.search;
//     if(query !== ''){
//         var filterQuery;
//         if(query.split('=')[0] == 'sort'){
//             filterQuery = query.split('=')[1];
//             sortCocktails(filterQuery);
//         } else if (query.split('=')[0] == 'quantity' && query.split('=')[1] != ""){
//             filterByIngredientsQuantity(window.location.search.split('=')[1])
//         }
//     }
// }
//
// function clearFilters(){
//     window.location.search = '';
// }