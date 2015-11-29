angular.module('example-app', [
  'example-app.modules',
  'example-app.login',
  'templates-app',
  'ui.router'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '/',
        template: '<div>{{test.statement}}</div>',
        controller: 'TestCtrl as test'
      });

    $urlRouterProvider.otherwise('/');
  })
  .run(function (debug) {
    debug('say it is so.');
  })
  .controller('TestCtrl', function () {
    var test = this;
    test.statement = 'This is the application root.'
  })
;