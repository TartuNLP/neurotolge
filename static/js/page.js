/* TODO! Make JS refactoring to make code more modular */


function Renderer(parameters) {
    var innerContent = parameters.content;

    function renderTranslate() {
        return showTranslateMode(innerContent);
    }

    function renderPlay() {
        return showTranslateMode(innerContent);
    }

    return {
        renderTranslateMode: renderTranslate,
        renderPlayMode: renderPlay
    };
}


// TODO This class a bit odd, probably it has to be restructured
function ContentRenderer() {
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
        CleanTranslationTitle();
        CleanTranslationDivs();
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
        page: {
            erase: eraseAll
        }
    };
}


function TranslationsFormatter(parameters) {
    var innerContent = parameters.content;

    function Formatter(parameters) {
        var innerContent = parameters.content;

        function swap(parameters) {
            var index1 = parameters.index1,
                index2 = parameters.index2;

            if (innerContent.hasOwnProperty(index1) && innerContent.hasOwnProperty(index2)) {
                var temp = innerContent[index1];
                innerContent[index1] = innerContent[index2];
                innerContent[index2] = temp;
            }
        }

        function filterEmpty() {
            var cleanedContent = [];
            for (var prop in innerContent) {
                if (innerContent.hasOwnProperty(prop) &&
                    innerContent[prop].hasOwnProperty('translation') &&
                    innerContent[prop]['translation'] !== "") {
                    cleanedContent.push(innerContent[prop]);
                }
            }

            innerContent = cleanedContent;
        }

        function shuffleTranslations() {
            var NUM_SWAPS = 10;
            for (var num_swap = 0; num_swap < NUM_SWAPS; ++num_swap) {
                var index1 = Math.floor(Math.random() * innerContent.length),
                    index2 = Math.floor(Math.random() * innerContent.length);
                swap({index1: index1, index2: index2});
            }
        }

        function getContent() {
            return innerContent;
        }

        return {
            filter: filterEmpty,
            shuffle: shuffleTranslations,
            get: getContent
        }
    }

    function formatContent() {
        var formatter = new Formatter({content: innerContent});
        formatter.shuffle();
        formatter.filter();
        return formatter.get();
    }

    return {
        format: formatContent
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

/*TODO Method does not do what it supposed to*/
function CreateTranslationTitle() {
    $("#translation-title").removeClass("invisible");
}

function showTranslateMode(content, translation_title) {
    var contentRenderer = new ContentRenderer();
    contentRenderer.page.erase();

    CreateTranslationTitle();

    /// TODO This parts of code are duplications to some extend
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

    console.log("Before formatting", content);

    var formatter = new TranslationsFormatter({content: content});
    content = formatter.format();

    ///


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
    var contentRenderer = new ContentRenderer();
    contentRenderer.page.erase();

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


/*TODO Use or remove*/
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

    /*TODO Creation of parameters, isn't important for saveBestTranslation function*/
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

        /*TODO Collect it into the separate function *Helper*/
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

                    /*TODO Consider it to be collected in the signle function*/
                    var response_object = JSON.parse(response);

                    var translations = response_object["translations"];

                    var renderer = new Renderer({content: translations});

                    // TODO: Check if this variable is global?!
                    content = renderer.renderPlayMode();

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
                    var renderer = new Renderer({content: translations});

                    // TODO: Change `content` to be non-global
                    content = renderer.renderTranslateMode();
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