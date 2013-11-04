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
          when('/image/:projectId/:imageIndex', {controller:ViewImageCtrl, templateUrl:'image.html'}).
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
  addAttachmentHandler($scope, createProjectInDb);
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
        addAttachmentHandler($scope);
        $scope.viewImage = function(id, index) {
          window.location.href ="#/image/" + id + "/" + index;
        }
      });
}

function ViewImageCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  angularFire(fbURL + $routeParams.projectId, $scope, 'remote', {}).
  then(function() {
    $scope.project = angular.copy($scope.remote);
    $scope.imageData = $scope.project.attachments[parseInt($routeParams.imageIndex)];
  });
}

function addAttachmentHandler($scope) {
  var handleFileSelect = function(evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function(theFile) {
      return function(e) {
        var filePayload = e.target.result;
        if ($scope.project.attachments == undefined)   {
          $scope.project.attachments = [];
        }
        $scope.project.attachments.push(filePayload);
        $scope.$apply();
      };
    })(f);
    reader.readAsDataURL(f);
  }
  document.getElementById("file-upload").addEventListener('change', handleFileSelect, false);
}

function getQueryParam(key){
  var temp = location.search.match(new RegExp(key + "=(.*?)($|\&)", "i"));
  if(!temp) {
    return undefined;
  }
  return temp[1];
}
