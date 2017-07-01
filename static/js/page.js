/* TODO! Make JS refactoring to make code more modular */


function Renderer() {
    function renderTranslate(data) {
        return showTranslateMode(data);
    }

    function renderPlay(data) {
        return showTranslateMode(data);
    }

    return {
        renderTranslateMode: renderTranslate,
        renderPlayMode: renderPlay
    };
}

// Rewrite current content creation with this functionality
function Content() {
    // Header
    function drawHeader() {
        return null;
    }

    function eraseHeader() {
        return CleanTranslationTitle();
    }

    // Body
    function drawBody() {
        return null;
    }

    function eraseBody() {
        return null;
    }

    // eraseAll
    function eraseAll() {
        return CleanTranslationAll();
    }

    return {
        header: {
            draw: null,
            erase: null
        },
        body: {
            draw: null,
            erase: null
        },
        content: eraseAll
    };
}


/* TODO Remove hard-code of available translators */
function CreateImagePath(company, color) {
    var image_path = "/static/image/",
        extension = ".png",
        available_translators = ["google", "tilde", "ut"]; // "microsoft"

    for (var index in available_translators) {
        if (available_translators.hasOwnProperty(index) && company === available_translators[index]) {
            return image_path + company + color + extension;
        }
    }

    return image_path + "question_mark" + extension;
}

function CleanTranslationTitle() {
    $("#translation-title").addClass("invisible");
}

function CleanTranslationDivs() {
    var translation_choice = $("#translation-choice");
    translation_choice.empty();
    translation_choice.remove(".space1percent");
}

function CleanTranslationAll() {
    CleanTranslationTitle();
    CleanTranslationDivs();
}

function CreateTranslationRow(image_path, translation_text, extra_class) {
    var translation_div = document.createElement('div'),
        image_div = $(document.createElement('div')).addClass("col-lg-1 col-md-1 col-sm-1 col-xs-1 container-img" +
            " pointer"),
        text_div = $(document.createElement('div')).addClass("col-lg-offset-1 col-lg-11" +
            " col-md-offset-1 col-md-11" +
            " col-sm-offset-1 col-sm-11" +
            " col-xs-offset-1 col-xs-11" +
            " translation-text pointer container-text" + " " + extra_class),
        image = $(document.createElement('img')).addClass("img-responsive"); // icon-max-size

    if ($.inArray("google", image_path)) {
        image.addClass("google-size");
    }

    // Add image + translation
    $(translation_div).addClass("row margin-left-10px");
    $(image).attr("src", image_path);
    $(text_div).text(translation_text);
    $(image).appendTo(image_div);
    $(translation_div).append(image_div);
    $(translation_div).append(text_div);

    var translation_choice = $("#translation-choice");
    translation_choice.append(translation_div);

    // Add space
    var space_div = document.createElement('div');
    $(space_div).addClass("space7percent");
    translation_choice.append(space_div);
}


/*TODO Refactor as a separate functionality*/
function Swap(content, index1, index2) {
    var temp = content[index1];
    content[index1] = content[index2];
    content[index2] = temp;
}

function RandomShuffle(content, num_swaps) {
    for (var num_swap = 0; num_swap < num_swaps; ++num_swap) {
        var index1 = Math.floor(Math.random() * content.length),
            index2 = Math.floor(Math.random() * content.length);
        Swap(content, index1, index2);
    }
    return content;
}


/*TODO Method does not do what it supposed to*/
function CreateTranslationTitle(translation_title) {
    $("#translation-title").removeClass("invisible");
}

function FilterEmptyTranslations(content) {
    var cleaned_content = [];
    for (var sub_content in content) {
        if (content.hasOwnProperty(sub_content) &&
            content[sub_content].hasOwnProperty('translation') &&
            content[sub_content]['translation'] !== "") {
            cleaned_content.push(content[sub_content]);
        }
    }

    return cleaned_content;
}


function showTranslateMode(content, translation_title) {
    CleanTranslationAll();
    CreateTranslationTitle(translation_title);

    var num_translations = 0, index;
    for (index in content) {
        if (content.hasOwnProperty(index) &&
            content[index].hasOwnProperty('translation') &&
            content[index]['translation'] !== "") {
            num_translations++;
        }
    }

    if (num_translations < 2) {
        translation_title = "";
        var translation_title = $('#translation-title');
        translation_title.addClass('invisible');
    }

    if (content === undefined) {
        return;
    }

    content = FilterEmptyTranslations(RandomShuffle(content, 10));

    for (index in content) {
        if (content.hasOwnProperty(index)) {
            var image_path = ((num_translations > 1) ?
                CreateImagePath("", "") : CreateImagePath(content[index]['translator'], ""));
            CreateTranslationRow(image_path, content[index]['translation'], "");
        }
    }

    return content;
}

function ShowTranslatorsBasedOnTranslation(content, position) {
    CleanTranslationAll();

    for (var index in content) {
        if (Number(index) === position) {
            var image_path = CreateImagePath(content[index].translator, "");
            if (content.length > 1) {
                CreateTranslationRow(image_path, content[index].translation, "general-info");
            }
            else {
                CreateTranslationRow(image_path, content[index].translation, "general-text-info");
            }
        }
        else {
            var image_path = CreateImagePath(content[index].translator, "_grey");
            CreateTranslationRow(image_path, content[index].translation, "");
        }
    }
}

function RemoveListeners() {
    var elements = document.getElementsByClassName("pointer");
    for (var i = 0; i < elements.length; i++) {
        elements[i].removeEventListener('click',
            function () {
                ShowTranslatorsBasedOnTranslation(content);
            },
            false);
    }
}

function AddListeners() {
    var elements = document.getElementsByClassName("pointer");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click',
            function () {
                var position = FindChosenTranslatorPosition(this);
                ShowTranslatorsBasedOnTranslation(content, position);
                SaveBestTranslator(content, position);
            },
            false);
    }
}


function FindChosenTranslatorPosition(source) {
    var clicked_row = $(source).parent(),
        rows = $('#translation-choice div.row'),
        position = -1;

    $.each(rows, function (index, row) {
        if (clicked_row.is(row)) {
            position = index;
            clicked_row.addClass('text');
        }
    });
    return position;
}

// TODO Rewrite this functionality
function SaveBestTranslator(content, position) {
    var param = {};
    for (var index in content) {
        if (content.hasOwnProperty(index) &&
            content[index].hasOwnProperty('translator') &&
            content[index].hasOwnProperty('translation')) {
            param[content[index].translator] = content[index].translation;
        }
    }

    var best_translator = content[position].translator;
    param['best_translator'] = best_translator;
    console.log(content);

    if (content.length > 1) {
        $.ajax({
            url: '/',
            data: JSON.stringify(param, null, '\t'),
            type: 'POST',
            contentType: 'application/json;charset=UTF-8',
            success: function (response) {
            },
            error: function (error) {
            }
        });
    }
}

function ShowMenu() {
    var menu_block = $('.menu-block'),
        main_block = $('.main-block');
    if (main_block.hasClass("hidden-xs")) {
        main_block.removeClass("hidden-xs");
        menu_block.addClass("hidden-xs");
    }
    else {
        main_block.addClass("hidden-xs");
        menu_block.removeClass("hidden-xs");
    }
}

$(function () {
    $('#playButton').click(function () {

        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        if ($.trim(source_text).length > 0) {
            $('.translation-loader').removeClass('hidden');
            $.ajax({
                url: '/play',
                type: 'GET',
                data: {
                    from: translate_from,
                    to: translate_to,
                    q: source_text
                },
                cache: false,
                success: function (response) {
                    var translations = JSON.parse(response)["translations"];
                    var renderer = new Renderer();
                    content = renderer.renderPlayMode(translations);
                    $('.translation-loader').addClass('hidden');

                    AddListeners.call(this);
                },
                error: function (error) {
                }
            });
        }
    });
});


$(function () {
    $('#translateButton').click(function () {

        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        // Remove spaces
        if ($.trim(source_text).length > 0) {
            $('.translation-loader').removeClass('hidden');
            $.ajax({
                url: '/translate',
                type: 'GET',
                data: {
                    from: translate_from,
                    to: translate_to,
                    q: source_text
                },
                cache: false,
                success: function (response) {
                    var translations = JSON.parse(response)["translations"];
                    var renderer = new Renderer();
                    content = renderer.renderTranslateMode(translations);
                    $('.translation-loader').addClass('hidden');

                    AddListeners.call(this);
                },
                error: function (error) {
                }
            });
        }
    });
});

$(document).ready(function () {
    var max_text_length = 500;
    $('#translation-textarea-char-counter').html("0/" + max_text_length.toString());

    $('#translation-textarea').keyup(function () {
        var text_length = $('#translation-textarea').val().length;
        $('#translation-textarea-char-counter').html(text_length.toString() + "/" + max_text_length.toString());
    });
});