// GLOBAL VAR

var __OMDB = '//www.omdbapi.com/?';
var __BASE = window.location;

$(function() {
  $(".input input").focus(function() {
    $(this).parent(".input").each(function() {
      $("label", this).css({
        "line-height": "18px",
        "font-size": "18px",
        "font-weight": "100",
        "top": "0px"
      });

      $(".spin", this).css({
        "width": "100%"
      });
    });
  }).blur(function() {
    $(".spin").css({
      "width": "0px"
    });

    if ($(this).val() === "") {
      $(this).parent(".input").each(function() {
        $("label", this).css({
          "line-height": "60px",
          "font-size": "24px",
          "font-weight": "300",
          "top": "10px"
        });
      });
    }
  });

  $(".button").click(function(e) {
    var pX = e.pageX,
      pY = e.pageY,
      oX = parseInt($(this).offset().left),
      oY = parseInt($(this).offset().top);

    $(this).append('<span class="click-effect x-' + oX + ' y-' + oY + '" style="margin-left:' + (pX - oX) + 'px;margin-top:' + (pY - oY) + 'px;"></span>');
    $('.x-' + oX + '.y-' + oY + '').animate({
      "width": "500px",
      "height": "500px",
      "top": "-250px",
      "left": "-250px",

    }, 600);
    $("button", this).addClass('active');
  });

  $('form').on('submit', function(event) {
    event.preventDefault();
    var form = $(this);
    var formData = form.serialize();
    var formArr = form.serializeArray();

    if (! formArr[0].value) {
      showEmptyError();
    } else {
      showResultsFlow(formData);
    }
  });

  // $('.result-list').on('click',  (arguments) => {})

  function showEmptyError() {
    $('.alert-container').find('.alert').text('Please enter your search keyword');
    $('.alert-container').fadeIn();
    resetFlow();
  }

  function showResultsFlow(formData) {
    $('.spinner-wrapper').show();

    $.ajax({
      type: 'POST',
      url: __OMDB + formData
    }).done(function(results) {
      $('.result-list').empty();
      resetFlow();

      if ('True' == results.Response) {
        $('.alert-container').fadeOut();
        listResults(results);
        addPaginationIfExists(results);
      } else {
        $('.result-list').html('<h2>' + results.Error + '</h2>');
      }
    });
  }

  function resetFlow() {
    $('form').trigger('reset');
    $('button.active').removeClass('active');
    $('span.click-effect').remove();
    $(".input input").trigger('blur');
    $('.spinner-wrapper').fadeOut('slow');
  }

  function listResults(results) {
    var list = [];
    var filmTitle, filmLink;

    for (var i in results.Search) {
      filmLink = $('<a/>', {
                            class: 'film-link',
                            href: __BASE.origin + '/movies/' + results.Search[i].imdbID,
                            text: results.Search[i].Title
                          });
      filmTitle = $('<h2/>',{
                          'data-imdb' : results.Search[i].imdbID,
                          html: filmLink
                      });

      list.push($('<li>', {
        html: filmTitle
      }));
    }

    $('.result-list').append(list);
  }

  // TODO
  function addPaginationIfExists(results) {
    var total = results.TotalResults;
  }
});
