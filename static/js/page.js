/* TODO! Make JS refactoring to make code more modular */

/* TODO Remove hard-code of available translators */
/**
 * @return {string}
 */
function CreateImagePath(company) {
  //console.log("CreateImagePath");
  var image_path = "/static/image/",
      extension = ".png",
      available_translators = ["google", "tilde", "ut"]; // "microsoft"

  for (var index in available_translators) {
      if (available_translators.hasOwnProperty(index) && company === available_translators[index]) {
          return image_path + company + extension;
      }
  }

  return image_path + "question_mark" + extension;
}

function CleanTranslationTitle() {
  //console.log("CleanTranslationTitle");
  $("#translation-title").addClass("invisible");
}

function CleanTranslationDivs() {
  //console.log("CleanTranslationDivs");
  var translation_choice = $("#translation-choice");
  translation_choice.empty();
  translation_choice.remove(".space1percent");
}

function CleanTranslationAll() {
  //console.log("CleanTranslationAll");
  CleanTranslationTitle();
  CleanTranslationDivs();
}

function CreateTranslationRow(image_path, translation_text, extra_class) {
  //console.log("CreateTranslationRow");

  var translation_div = document.createElement('div'),
      image_div = $(document.createElement('div')).addClass("col-lg-1 col-md-1 col-sm-1 col-xs-1 container-img" +
          " pointer"),
      text_div = $(document.createElement('div')).addClass("col-lg-offset-1 col-lg-11" +
          " col-md-offset-1 col-md-11" +
          " col-sm-offset-1 col-sm-11" +
          " col-xs-offset-1 col-xs-11" +
          " translation-text pointer container-text" + " " + extra_class),
      image = $(document.createElement('img')).addClass("img-responsive"); // icon-max-size

  if (image_path.includes("microsoft")) {
      image.addClass("microsoft-size");
  }
   if (image_path.includes("google")) {
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
  //console.log("Swap in");
  var temp = content[index1];
  content[index1] = content[index2];
  content[index2] = temp;
  //console.log("Swap out");
}

function RandomShuffle(content, num_swaps) {
  //console.log("RandomShuffle in");
  for(var num_swap = 0; num_swap < num_swaps; ++num_swap) {
      var index1 = Math.floor(Math.random() * content.length),
          index2 = Math.floor(Math.random() * content.length);
    Swap(content, index1, index2);
  }
  //console.log("RandomShuffle out");
  return content;
}

function CreateTranslationTitle(translation_title) {
  //console.log("CreateTranslationTitle in");
  $("#translation-title").removeClass("invisible");
  //console.log("CreateTranslationTitle out");
}

function FilterEmptyTranslations(content) {
  //console.log("FilterEmptyTranslations");
  var cleaned_content = [];
  for(var sub_content in content) {
    if(content.hasOwnProperty(sub_content) &&
       content[sub_content].hasOwnProperty('translation') &&
       content[sub_content]['translation'] !== "") {
      cleaned_content.push(content[sub_content]);
    }
    //console.log("i", sub_content);
  }

  return cleaned_content;
}


function ShowTranslation(content, translation_title) {
  //console.log("ShowTranslation in");
  CleanTranslationAll();
  CleanFooter();
  CreateTranslationTitle(translation_title);

  var num_translations = 0;
  for (var index in content) {
      if (content.hasOwnProperty(index) &&
          content[index].hasOwnProperty('translation') &&
          content[index].translation !== "") {
          num_translations++;
      }
  }

  //console.log("Number translations", num_translations);

  if (num_translations < 2) {
    translation_title = "";
    var translation_title = $('#translation-title');
    translation_title.addClass('invisible');
  }

  if (content === undefined) {
      return;
  }

  content = FilterEmptyTranslations(RandomShuffle(content, 10));

  for(var index in content) {
    var image_path = ((num_translations > 1) ? CreateImagePath('') : CreateImagePath(content[index].translator));
    //console.warn("Image path", image_path);
    CreateTranslationRow(image_path, content[index].translation, "");
  }

  CreateFooter();
  //console.log("ShowTranslation out");
  return content;
}

function ShowTranslatorsBasedOnTranslation(content, position) {
  //console.log("ShowTranslatorsBasedOnTranslation in");
  CleanTranslationAll();
  CleanFooter();

  for(var index in content) {
    var image_path = CreateImagePath(content[index].translator);
    //console.warn(index, position, typeof(index), typeof(position));
    if (Number(index) === position) {
        //console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!Equal!!!!!!!!!!!!!!!!!");
        CreateTranslationRow(image_path, content[index].translation, "general-info");
    }
    else {
        CreateTranslationRow(image_path, content[index].translation, "");
    }
  }

  CreateFooter();
  //console.log("ShowTranslatorsBasedOnTranslation out");
}

function RemoveListeners() {
  //console.log("RemoveListeners in");
  var elements = document.getElementsByClassName("pointer");
  for (var i = 0; i < elements.length; i++) {
    elements[i].removeEventListener('click',
                                 function() {
                                    //console.log("Inside event listener", content);
                                    ShowTranslatorsBasedOnTranslation(content);
                                 },
                                 false);
  }
  //console.log("Listeners removed out");
}

function AddListeners() {
  //console.log("AddListeners in");
  var elements = document.getElementsByClassName("pointer");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click',
                                 function() {
                                    //console.log("Inside event listener", content);

                                    var position = FindChosenTranslatorPosition(this);

                                    //var row = $('#translation-choice > .row')[position];
                                    //console.log("Row", row);
                                    //this.parent().addClass("invisible");

                                    //console.log("position", position);
                                    //console.log("corresponding content", content[position].translator);

                                    ShowTranslatorsBasedOnTranslation(content, position);

                                    SaveBestTranslator(content, position);
                                 },
                                 false);
    }
    //console.log("Listeners removed out");
}


function FindChosenTranslatorPosition(source) {
  //console.log("FindChosenTranslatorsPosition in");
  var clicked_row = $(source).parent(),
    rows = $('#translation-choice div.row'),
    position = -1;

  $.each(rows, function(index, row){
    if (clicked_row.is(row)) {
      position = index;
      //console.warn("Clicked row", clicked_row);
      clicked_row.addClass('text');
    }
  });
  //console.log("FindChosenTranslatorsPosition out");
  return position;
}

// TODO Rewrite this functionality
function SaveBestTranslator(content, position) {
  //console.log("SaveBestTranslator in");
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

  //console.log("param", param);
  $.ajax({
    url: '/',
    data: JSON.stringify(param, null, '\t'),
    type: 'POST',
    contentType: 'application/json;charset=UTF-8',
    success: function(response) {
      //console.log("response", response);
    },
    error: function(error) {
      //console.log("error", error);
    }
  });
  //console.log("SaveBestTranslator out");
}


function CreateFooter(about_url, contacts_url,about_text, contacts_text) {
  //console.log("CreateFooter");

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
  //console.log("CleanFooter in");
  $('.footer').empty();
  //console.log("CleanFooter out");
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
  //console.log("ShowMenu out");
}

$(function() {
    $('#playButton').click(function() {
        //console.log("Click play button");

        $('.translation-loader').removeClass('hidden');
        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        var param = {};
        param['source_text'] = source_text;
        param['translate_from'] = translate_from;
        param['translate_to'] = translate_to;

        //console.log("data", JSON.stringify(param, null, '\t'));

        $.ajax({
            url: '/play',
            type: 'GET',
            data: {
                from: translate_from,
                to: translate_to,
                q: source_text
            },
            cache: false,
            success: function(response) {
                translations = JSON.parse(response)["translations"];
                console.log("response", response);
                content = ShowTranslation(content=translations);
                $('.translation-loader').addClass('hidden');

                AddListeners.call(this);
            },
            error: function(error) {
                //console.log("error", error);
            }
        });
    });
});

// Need solve problem with waiting wheel
$(function() {
    $('#translateButton').click(function() {
        //console.warn("Click translate button");

        $('.translation-loader').removeClass('hidden');
        var translate_from = $('.translate-from').attr('name');
        var translate_to = $('.translate-to').attr('name');
        var source_text = $('textarea').val();

        $.ajax({
            url: '/translate',
            type: 'GET',
            data: {
                from: translate_from,
                to: translate_to,
                q: source_text
            },
            cache: false,
            success: function(response) {
                translations = JSON.parse(response)["translations"];
                //console.log("response", response);
                content = ShowTranslation(content=translations);
                $('.translation-loader').addClass('hidden');

                AddListeners.call(this);
            },
            error: function(error) {
                //console.log("error", error);
            }
        });
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