document.addEventListener('DOMContentLoaded', function() {
  Element.prototype.attr = function (name, value) {
    if (typeof value === "undefined") {
        return this.getAttribute(name);
    } else {
        return this.setAttribute(name, value);
    }
  };

  var _OMDB = function() {
    var request = new XMLHttpRequest(),
        _endpoint = '//www.omdbapi.com/?';

    return {
      getMovies: function(params, callback) {
        request.open('GET', _endpoint + params, true);
        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            callback(request.responseText);
          }
        };
        request.send();
      }
    };
  }();

  var _DOM = function() {
    var _dom = document;

    this.$ = function(el) {
      return _dom.querySelector(el);
    };

    return {
      create: function(selector) {
        return _dom.createElement(selector);
      },
      $: this.$,
      all: function(selector, callback) {
        [].forEach.call( _dom.querySelectorAll(selector), function(el) {
          return callback(el);
        });
      },
      trigger: function(ev, selector) {
        var event = _dom.createEvent('HTMLEvents');
        event.initEvent(ev, true, false);
        this.all(selector, function(el) {
          el.dispatchEvent(event);
        });
      },
      // TODO: This fade function still buggy
      fade: function(selector, type, ms) {
        var isIn = type === 'in',
          opacity = isIn ? 1 : 0,
          interval = 500,
          duration = ms || 5000,
          gap = interval / duration;

        if(isIn) {
          this.$(selector).style.display = 'block';
          this.$(selector).style.opacity = opacity;
        }

        function func() {
          opacity = isIn ? opacity + gap : opacity - gap;
          this.$(selector).style.opacity = opacity;

          if(opacity <= 0) this.$(selector).style.display = 'none';
          if(opacity <= 0 || opacity >= 1) window.clearInterval(fading);
        }

        var fading = window.setInterval(func, interval);
      }
    };
  }();

  var _SHARED = function(_omdb, _dom) {
    this.resetForm = function() {
      _dom.$('form').reset();
      _dom.trigger('blur', '.input input');
      _dom.fade('.paginator', 'out');
      if( _dom.$('button.active') ) _dom.$('button.active').classList.remove('active');
    };

    this.listResults = function(results, inFavorite) {
      var resultSpinner = _dom.$('.spinner-wrapper'),
          listObject = {},
          listsArr = [],
          movieList,
          favLink, favStar, movieTitle, movieLink, detailSection;


      for (var i in results) {
        var clonedSpinner = resultSpinner.cloneNode(true);

        if (0 === listsArr.length) {
          movieList = _dom.create('li');
          favLink = _dom.create('input');
          favStar = _dom.create('label');
          movieTitle = _dom.create('h2');
          movieLink = _dom.create('a');
          detailSection = _dom.create('section');
        } else {
          movieList = _dom.$('.movie-list').cloneNode(true);
          favLink = movieList.querySelector('.fav-link');
          favStar = movieList.querySelector('.fav-star');
          movieTitle = movieList.querySelector('.fav-link');
          movieLink = movieList.querySelector('.movie-link');
          detailSection = movieList.querySelector('.detail-section');
        }

        console.log(i, _dom.$('.movie-list'));

        listObject = {
          imdb_id: results[i].imdbID,
          title: results[i].Title
        };

        favLink.id = 'fav' + i;
        favLink.type = 'checkbox';
        favLink.setAttribute('class', 'hide fav-link');
        favLink.setAttribute('data-imdb', listObject.imdb_id);
        favLink.setAttribute('data-movie-title', listObject.title);
        favLink.setAttribute('data-in-favorite', 'false');

        favStar.setAttribute('class', 'fav-star');
        favStar.setAttribute('aria-hidden', 'true');
        favStar.setAttribute('data-icon', '★');
        favStar.setAttribute('for', favLink.id);

        movieLink.setAttribute('class', 'movie-link');
        movieLink.href = "#";
        movieLink.setAttribute('data-imdb', listObject.imdb_id);
        movieLink.innerHTML = listObject.title;

        movieTitle.appendChild(movieLink);
        movieTitle.setAttribute('class', 'movie-title');

        clonedSpinner.id = 'result-spinner-' + listObject.imdb_id;
        clonedSpinner.class = 'search-spinner';
        detailSection.appendChild(clonedSpinner);
        detailSection.setAttribute('class', 'detail-section');

        movieList.id = listObject.imdb_id;
        movieList.setAttribute('class', 'movie-list');
        movieList.appendChild(favLink);
        movieList.appendChild(favStar);
        movieList.appendChild(movieTitle);
        movieList.appendChild(detailSection);

        listsArr.push(movieList);
      }

      for (var list in listsArr) {
        _dom.$('.result-list').appendChild(listsArr[list]);
      }
    };

    return {
      resetForm: this.resetForm,
      listResults: this.listResults,
      // this function gets called to fill the error message placeholder
      showEmptyError: function(message) {
        _dom.all('.alert-container .alert', function(el) {
          el.textContent = message;
        });

        _dom.fade('.alert-container', 'in') ;
        this.resetForm();
      },
      showSearchResults: function(params, type) {
        _dom.fade('#search-spinner', 'in');

        _omdb.getMovies(params, function(results) {
          this.resetForm();
          results = JSON.parse(results);

          if ('True' === results.Response) {
            this.listResults(results.Search, false);

            // checkFavStatus();
            //
            // //if the trigger for this function comes from "search"
            // //reset back all the pagination
            // if(type === 'search') {
            //   resetPagination(results, params);
            // }
          } else {
            _dom.$('.result-list').innerHTML = '<h2>' + results.Error + '</h2>';
          }

          _dom.fade('.alert-container', 'out');
          _dom.fade('#search-spinner', 'out');
        });
      }
    };
  }(_OMDB, _DOM);

  // FORM Module, all interaction with the form will happen here
  (function($selector, $resultCtrl) {
    $selector.addEventListener('click', function(e) {
      e.preventDefault();

      // get request parameters from form
      var form = _DOM.$('form'),
          formData = serialize(form),
          formArr = serializeArray(form);

      // make sure the css doesn't flash 'active' (yellow)
      _DOM.$(".favorite").classList.remove('active');
      // console.log(formData, formArr);

      if ( ! formArr[0].value ) {
        $resultCtrl.showEmptyError('Please enter your search keyword');
      } else {
        $resultCtrl.showSearchResults(formData, 'search');
      }

    }, false);
  })(_DOM.$('.submit'), _SHARED);
});
