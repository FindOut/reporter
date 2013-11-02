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
  $scope.project.attachments = [];
  addAttachMentHandler($scope.project);
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
        addAttachMentHandler($scope);
      });
}

function addAttachMentHandler($scope) {
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

function hidden() {
  var spinner = new Spinner({color: '#ddd'});

  function handleFileSelect(evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function(theFile) {
      return function(e) {
        var filePayload = e.target.result;
        // Generate a location that can't be guessed using the file's contents and a random number
        var hash = CryptoJS.SHA256(Math.random() + CryptoJS.SHA256(filePayload));
        var f = new Firebase(firebaseRef + 'pano/' + hash + '/filePayload');
        spinner.spin(document.getElementById('spin'));
        // Set the file payload to Firebase and register an onComplete handler to stop the spinner and show the preview
        f.set(filePayload, function() {
          spinner.stop();
          document.getElementById("pano").src = e.target.result;
          $('#file-upload').hide();
          // Update the location bar so the URL can be shared with others
          window.location.hash = hash;
        });
      };
    })(f);
    reader.readAsDataURL(f);
  }

  $(function() {
    $('#spin').append(spinner);

    var idx = window.location.href.indexOf('#');
    var hash = (idx > 0) ? window.location.href.slice(idx + 1) : '';
    if (hash === '') {
      // No hash found, so render the file upload button.
      $('#file-upload').show();
      document.getElementById("file-upload").addEventListener('change', handleFileSelect, false);
    } else {
      // A hash was passed in, so let's retrieve and render it.
      spinner.spin(document.getElementById('spin'));
      var f = new Firebase(firebaseRef + '/pano/' + hash + '/filePayload');
      f.once('value', function(snap) {
        var payload = snap.val();
        if (payload != null) {
          document.getElementById("pano").src = payload;
        } else {
          $('#body').append("Not found");
        }
        spinner.stop();
      });
    }
  });
}
