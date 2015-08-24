describe('LearnJS', function() {
  it('can show a problem view', function() {
    learnjs.showView('#problem-1');
    expect($('.view-container .problem-view').length).toEqual(1);
  });

  it('shows the landing page view when there is no hash', function() {
    learnjs.showView('');
    expect($('.view-container .landing-view').length).toEqual(1);
  });

  it('passes the hash view parameter to the view function', function() {
    spyOn(learnjs, 'problemView');
    learnjs.showView('#problem-42');
    expect(learnjs.problemView).toHaveBeenCalledWith('42');
  });

  it('invokes the router when loaded', function() {
    spyOn(learnjs, 'showView');
    learnjs.appOnReady();
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  it('subscribes to the hash change event', function() {
    learnjs.appOnReady();
    spyOn(learnjs, 'showView');
    $(window).trigger('hashchange');
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  describe('problem view', function() {
    var view;
    beforeEach(function() {
      view = learnjs.problemView('1');
    });

    it('has a title that includes the problem number', function() {
      expect(view.find('.title').text()).toEqual('Problem #1');
    });

    it('shows the description', function() {
      expect(view.find('.description').text()).toEqual('What is truth?');
    });

    it('shows the problem code', function() {
      expect(view.find('.code').text()).toEqual("function problem() { return __; }");
    });

    it('can flash an element while setting the text', function() {
      var elem = $('<p>');
      spyOn(elem, 'fadeOut').and.callThrough();
      spyOn(elem, 'fadeIn');
      learnjs.flashElement(elem, "new text");
      expect(elem.text()).toEqual('new text');
      expect(elem.fadeOut).toHaveBeenCalled();
      expect(elem.fadeIn).toHaveBeenCalled();
    });

    it('can redirect to the main view after the last problem is answered', function() {
      var flash = learnjs.buildCorrectFlash(2);
      expect(flash.find('a').attr('href')).toEqual("");
      expect(flash.find('a').text()).toEqual("You're Finished!");
    });

    describe('when the answer is larger than the text area', function() {
      var answer;
      beforeEach(function() {
        answer = view.find('.answer');
        spyOn(learnjs, 'scrolling').and.returnValue(true);
      });

      xit('expands automatically when the user cannot resize', function() {
        spyOn(learnjs, 'canResize').and.returnValue(false);
        answer.keyup();
        expect(answer.attr('rows')).toEqual('5');
      });

      xit('does not expand when the user can resize themselves', function() {
        spyOn(learnjs, 'canResize').and.returnValue(true);
        answer.keyup();
        expect(answer.attr('rows')).toEqual('4');
      });
    });

    describe('answer section', function() {
      var resultFlash;

      beforeEach(function() {
        spyOn(learnjs, 'flashElement');
        resultFlash = view.find('.result');
      });

      it('can check a correct answer by hitting a button', function() {
        view.find('.answer').val("true");
        view.find('.check-btn').click();
        expect(learnjs.flashElement).toHaveBeenCalled();
      });

      it('rejects an incorrect answer', function() {
        view.find('.answer').val("false");
        view.find('.check-btn').click();
        expect(learnjs.flashElement).toHaveBeenCalledWith(resultFlash, 'Incorrect!');
      });

      it('has a polyfill for the vibrate API', function() {
        expect(window.navigator.vibrate).toBeDefined();
      });

      it('vibrates the device when the answer is wrong', function() {
        spyOn(navigator, 'vibrate');
        view.find('.answer').val('false');
        view.find('.check-btn').click();
        expect(navigator.vibrate).toHaveBeenCalledWith(200);
        expect().toEqual();
      });

      describe('when the answer is correct', function() {
        beforeEach(function() {
          view.find('.answer').val("true");
          view.find('.check-btn').click();
        });

        it('flashes the result', function() {
          var flashArgs = learnjs.flashElement.calls.argsFor(0);
          expect(flashArgs[0]).toEqual(resultFlash);
          expect(flashArgs[1].find('span').text()).toEqual("Correct!");
        });

        it('shows a link to the next problem', function() {
          var link = learnjs.flashElement.calls.argsFor(0)[1].find('a');
          expect(link.text()).toEqual("Next Problem");
          expect(link.attr("href")).toEqual("#problem-2");
        });
      });
    });
  });
});
