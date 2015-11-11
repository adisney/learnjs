"use strict"

var learnjs = {};

learnjs.problems = [
  {
    description: "What is truth?",
    code: "function problem() { return __; }"
  },
  {
    description: "Simple Math",
    code: "function problem() { return 42 === 6 * __; }"
  }
];

learnjs.applyObject = function(obj, elem) {
  for (var key in obj) {
    elem.find('.' + key).text(obj[key]);
  }
};

learnjs.flashElement = function(elem, content) {
  elem.fadeOut('fast', function() {
    elem.html(content);
    elem.fadeIn();
  });
}

learnjs.template = function(name) {
  return $('.templates .' + name).clone();
}

learnjs.landingView = function() {
  return learnjs.template('landing-view');
}

learnjs.buildCorrectFlash = function(problemNum) {
  var correctFlash = learnjs.template('correct-flash');
  var link = correctFlash.find('a');
  if(problemNum < learnjs.problems.length) {
    link.attr('href', '#problem-' + (problemNum + 1));
  } else {
    link.attr('href', '');
    link.text("You're Finished!");
  }
  return correctFlash;
}

learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = $('.templates .problem-view').clone();
  var problemData = learnjs.problems[problemNumber - 1];
  var resultFlash = view.find('.result');

  function checkAnswer() {
    var answer = view.find('.answer').val();
    var test = problemData.code.replace('__', answer) + "; problem();";
    return eval(test);
  }

  function checkAnswerClick() {
    if (checkAnswer()) {
      var flashContent = learnjs.buildCorrectFlash(problemNumber);
      learnjs.flashElement(resultFlash, flashContent);
    } else {
      learnjs.flashElement(resultFlash, 'Incorrect!');
      navigator.vibrate(200);
    }
    return false;
  }
  function resizeArea() {
    console.log("thing");
    if (!learnjs.canResize() && learnjs.scrolling(view.find('.answer'))) {
      answer.attr('rows', parseInt(answer.attr('rows'), 10) + 1);
    }
  }
  $('.answer').keyup(resizeArea);

  view.find('.check-btn').click(checkAnswerClick);
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(learnjs.problems[problemNumber - 1], view);
  return view;
};

learnjs.showView = function(hash) {
  var routes = {
    "#problem": learnjs.problemView,
    '': learnjs.landingView
  };
  var hashParts = hash.split('-');
  var viewFn = routes[hashParts[0]]
  if (viewFn) {
    $('.view-container').empty().append(viewFn(hashParts[1]));
  }
};

learnjs.poolId = "us-east-1:06075491-e16b-4211-aa73-88d803584c71"

learnjs.appOnReady = function() {
  AWS.config.region = 'us-east-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Make my id
    IdentityPoolId: "us-east-1:06075491-e16b-4211-aa73-88d803584c71"
  });
  learnjs.showView(window.location.hash);
};

learnjs.canResize = function() {
  return 'resize' in document.body.style;
}

learnjs.scrolling = function(elem) {
  return elem.clientHeight < elem.scrollHeight;
}

navigator.vibrate = navigator.vibrate ||
  navigator.webkitVibrate ||
  navigator.mozVibrate ||
  navigator.msVibrate ||
  function () { return false; };

function googleSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: learnjs.poolId,
    logins: {
      'accounts.google.com': id_token
    }
  });
  learnjs.profile = googleUser.getBasicProfile();
  AWS.config.credentials.get(function() {
    learnjs.showView(window.location.hash);
  });
}
