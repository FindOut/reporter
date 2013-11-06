angular.module('report', ['repository']).
service('context', function($location) {
  return function() {};
}).
config(function($routeProvider) {
  $routeProvider.
      when('/', {controller:ListCtrl, templateUrl:'list.html'}).
      when('/edit/:reportId', {controller:EditCtrl, templateUrl:'detail.html'}).
      when('/image/:reportId/:imageIndex', {controller:ViewImageCtrl, templateUrl:'image.html'}).
      when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
      otherwise({redirectTo:'/'});
});

function MainCtrl($scope, $location, context) {
  context.target = getQueryParam('target');
  $scope.target = context.target;
}

function ListCtrl($scope, repo, context, $location) {
  $scope.formatDate = function(isoString) {
    var date = new Date(isoString);
    return date.format("yy-mm-dd HH:MM:ss");
  };
  $scope.context = context;
  repo.listReports(function(list) {
      $scope.reports = list;
      $scope.$apply();
  });
  $scope.viewReport = function(id) {
    window.location.href ="#/edit/" + id;
  }
}

function CreateCtrl($scope, $location, $timeout, context, repo) {
  addAttachmentHandler($scope, repo);
  $scope.save = function() {
    $scope.report.target = context.target;
    $scope.report.createdDate = new Date().toISOString();
    repo.addReport(angular.copy($scope.report), function() {
      $timeout(function() { $location.path('/'); });
    });
  }
}

function EditCtrl($scope, $location, $routeParams, repo) {
  repo.getReport($routeParams.reportId, function(report) {
    $scope.report = angular.copy(report);
    $scope.isClean = function() {
      return angular.equals(report, $scope.report);
    };
    $scope.destroy = function() {
      repo.deleteReport($scope.report.id);
      $location.path('/');
    };
    $scope.save = function() {
      repo.saveReport($scope.report);
      $location.path('/');
    };
    addAttachmentHandler($scope, repo);
    $scope.viewImage = function(id, index) {
      window.location.href ="#/image/" + id + "/" + index;
    }
      $scope.$apply();
  });
}

function ViewImageCtrl($scope, $location, $routeParams, repo) {
  repo.getReport($routeParams.reportId, function(report) {
    $scope.report = report;
    $scope.imageUrl = repo.getFileUrl(0); //repo.getFileUrl($scope.report.attachments[parseInt($routeParams.imageIndex)]);
  });
}

function addAttachmentHandler($scope, repo) {
  var handleFileSelect = function(evt) {
    var f = evt.target.files[0];
    repo.uploadFile(f, function(fileId) {
        if ($scope.report.attachments == undefined)   {
          $scope.report.attachments = [];
        }
        $scope.report.attachments.push(fileId);
        $scope.$apply();
    });
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
