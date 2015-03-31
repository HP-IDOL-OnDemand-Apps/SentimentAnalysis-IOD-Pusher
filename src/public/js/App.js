var app = angular.module('MyApp', ['ngRoute', 'appControllers']);
var appControllers = angular.module('appControllers', []);

//public variable to hold file URL to be used for speech recognition API call
var fileURL;

app.run(function($rootScope) {
    $rootScope.test = " ";
});

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/welcome', {
        templateUrl: 'partials/welcome.html',
        controller: 'MainCtrl'
      }).
      when('/learnmore', {
        templateUrl: 'partials/learnmore.html',
        controller: 'LearnMoreCtrl'
      }).
      when('/sentiment', {
        templateUrl: 'partials/sentiment.html',
        controller: 'SentimentCtrl'
      }).
      otherwise({
        redirectTo: '/welcome'
      });
  }]
);

