/* TODO! Make JS refactoring to make code more modular */

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

function Swap(content, index1, index2) {
  var temp = content[index1];
  content[index1] = content[index2];
  content[index2] = temp;
}

function RandomShuffle(content, num_swaps) {
  for(var num_swap = 0; num_swap < num_swaps; ++num_swap) {
      var index1 = Math.floor(Math.random() * content.length),
          index2 = Math.floor(Math.random() * content.length);
    Swap(content, index1, index2);
  }
  return content;
}

function CreateTranslationTitle(translation_title) {
  $("#translation-title").removeClass("invisible");
}

function FilterEmptyTranslations(content) {
  var cleaned_content = [];
  for(var sub_content in content) {
    if(content.hasOwnProperty(sub_content) &&
       content[sub_content].hasOwnProperty('translation') &&
       content[sub_content]['translation'] !== "") {
      cleaned_content.push(content[sub_content]);
    }
  }

  return cleaned_content;
}


function ShowTranslation(content, translation_title) {
  CleanTranslationAll();
  CleanFooter();
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

  for(index in content) {
      if (content.hasOwnProperty(index)) {
          var image_path = ((num_translations > 1) ?
              CreateImagePath("", "") : CreateImagePath(content[index]['translator'], ""));
          CreateTranslationRow(image_path, content[index]['translation'], "");
      }
  }

  CreateFooter();
  return content;
}

function ShowTranslatorsBasedOnTranslation(content, position) {
  CleanTranslationAll();
  CleanFooter();

  for(var index in content) {
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

  CreateFooter();
}

function RemoveListeners() {
  var elements = document.getElementsByClassName("pointer");
  for (var i = 0; i < elements.length; i++) {
    elements[i].removeEventListener('click',
                                 function() {
                                    ShowTranslatorsBasedOnTranslation(content);
                                 },
                                 false);
  }
}

function AddListeners() {
  //console.log("AddListeners in");
  var elements = document.getElementsByClassName("pointer");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click',
                                 function() {
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

  $.each(rows, function(index, row){
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


function CreateFooter(about_url, contacts_url,about_text, contacts_text) {

  var about_div = document.createElement('div'),
      contacts_div = document.createElement('div'),
      about_link = document.createElement('a'),
      contacts_link = document.createElement('a');

  $(about_link).attr("href", about_url);
  $(about_link).text(about_text);
  $(about_div).append(about_link);
  $(about_div).addClass("hidden-xs col-sm-6 col-md-6 col-lg-6 text-right");

  $(contacts_link).attr("href", contacts_url);
  $(contacts_link).text(contacts_text);
  $(contacts_div).append(contacts_link);
  $(contacts_div).addClass("hidden-xs col-sm-6 col-md-6 col-lg-6 text-left");

  var footer = $(".footer");
  footer.append(about_div);
  footer.append(contacts_div);
}

function CleanFooter() {
  $('.footer').empty();
}

function ShowMenu() {
  //console.log("ShowMenu in");
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

$(function() {
    $('#playButton').click(function() {

        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        var param = {};
        param['source_text'] = source_text;
        param['translate_from'] = translate_from;
        param['translate_to'] = translate_to;

        if($.trim(source_text).length > 0) {
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
                    translations = JSON.parse(response)["translations"];
                    content = ShowTranslation(content = translations);
                    $('.translation-loader').addClass('hidden');

                    AddListeners.call(this);
                },
                error: function (error) {
                }
            });
        }
    });
});


$(function() {
    $('#translateButton').click(function() {

        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        // Reduce amount of symbols in input
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
                    translations = JSON.parse(response)["translations"];
                    content = ShowTranslation(content = translations);
                    $('.translation-loader').addClass('hidden');

                    AddListeners.call(this);
                },
                error: function (error) {
                }
            });
        }
    });
});

$(document).ready(function() {
    var max_text_length = 500;
    $('#translation-textarea-char-counter').html("0/" + max_text_length.toString());

    $('#translation-textarea').keyup(function() {
        var text_length = $('#translation-textarea').val().length;
        $('#translation-textarea-char-counter').html(text_length.toString() + "/" + max_text_length.toString());
    });
});