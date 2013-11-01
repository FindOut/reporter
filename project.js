angular.module('project', ['firebase']).
    value('fbURL', 'https://reporter.firebaseio.com/').
    factory('Projects', function(angularFireCollection, fbURL) {
      return angularFireCollection(fbURL);
    }).
    service('context', function($location) {
      return function() {};
    }).
    config(function($routeProvider) {
      $routeProvider.
          when('/', {controller:ListCtrl, templateUrl:'list.html'}).
          when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
          when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
          otherwise({redirectTo:'/'});
    });

function MainCtrl($scope, $location, context) {
  context.target = getQueryParam('target');
  $scope.target = context.target;
}

function ListCtrl($scope, Projects, context, $location) {
  $scope.formatDate = function(isoString) {
    var date = new Date(isoString);
    return date.format("yy-mm-dd HH:MM:ss");
  };
  $scope.context = context;
  $scope.projects = Projects;
  $scope.viewReport = function(id) {
    window.location.href ="#/edit/" + id;
  }
}

function CreateCtrl($scope, $location, $timeout, context, Projects) {
  $scope.save = function() {
    $scope.project.target = context.target;
    $scope.project.createdDate = new Date().toISOString();
    Projects.add($scope.project, function() {
      $timeout(function() { $location.path('/'); });
    });
  }
}

function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  angularFire(fbURL + $routeParams.projectId, $scope, 'remote', {}).
      then(function() {
        $scope.project = angular.copy($scope.remote);
        console.log("createDate", $scope.project.createdDate);
        $scope.project.$id = $routeParams.projectId;
        $scope.isClean = function() {
          return angular.equals($scope.remote, $scope.project);
        };
        $scope.destroy = function() {
          $scope.remote = null;
          $location.path('/');
        };
        $scope.save = function() {
          $scope.remote = angular.copy($scope.project);
          $location.path('/');
        };
      });
}

function getQueryParam(key){
  var temp = location.search.match(new RegExp(key + "=(.*?)($|\&)", "i"));
  if(!temp) {
    return undefined;
  }
  return temp[1];
}

