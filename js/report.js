angular.module('report', ['repository']).
    service('context',function ($location) {
        return function () {
        };
    }).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl, templateUrl: 'list.html'}).
            when('/edit/:reportId', {controller: EditCtrl, templateUrl: 'detail.html'}).
            when('/image/:attachmentId', {controller: ViewImageCtrl, templateUrl: 'image.html'}).
            when('/new', {controller: CreateCtrl, templateUrl: 'detail.html'}).
            otherwise({redirectTo: '/'});
    });

function MainCtrl($scope, $location, context) {
    context.target = getQueryParam('target');
    $scope.target = context.target;
    window.currentReportId = 0;
}

function ListCtrl($scope, repo, context, $location) {
    $scope.loading = true;
    $scope.formatDate = function (isoString) {
        var date = new Date(isoString);
        return date.format("yy-mm-dd HH:MM:ss");
    };
    $scope.context = context;
    repo.listReports(context.target, function (list) {
        $scope.reports = list;
        $scope.loading = false;
        $scope.$apply();
    });
    $scope.viewReport = function (id) {
        window.currentReportId = id;
        window.location.href = "#/edit/" + id;
    }
    $scope.selectedReport = function(id) {
        return id == window.currentReportId;
    }
}

function CreateCtrl($scope, $location, $timeout, context, repo) {
    addAttachmentHandler($scope, repo);
    $scope.save = function () {
        $scope.report.target = context.target;
        $scope.report.createdDate = new Date().toISOString();
        repo.addReport(angular.copy($scope.report), function (new_id) {
            $timeout(function () {
                window.currentReportId  = new_id;
                $location.path('/');
            });
        });
    }
}

function EditCtrl($scope, $location, $routeParams, repo) {
    repo.getReport($routeParams.reportId, function (report) {
        $scope.report = angular.copy(report);
        $scope.isClean = function () {
            return angular.equals(report, $scope.report);
        };
        $scope.imageByMime = function(mime) {
            if (/image\/.*/.test(mime)) {
                return "camera.png";
            } else {
                return "microphone.png";
            }
        };
        $scope.destroy = function () {
            repo.deleteReport($scope.report.id);
            $location.path('/');
        };
        $scope.save = function () {
            repo.saveReport($scope.report);
            $location.path('/');
        };
        addAttachmentHandler($scope, repo);
        $scope.viewImage = function (id) {
            window.location.href = "#/image/" + id;
        }
        $scope.$apply();
    });
}

function ViewImageCtrl($scope, $location, $routeParams, repo) {
    $scope.imageurl = repo.getFileUrl($routeParams.attachmentId);
}

function addAttachmentHandler($scope, repo) {
    $( "#progressbar" ).progressbar({
        value: 0
    });
    $('#bardiv').hide();
    var handleFileSelect = function (evt) {
        $('#bardiv').show();
        var f = evt.target.files[0];
        repo.uploadFile(f, function (attachment_id) {
            if ($scope.report.attachments == undefined) {
                $scope.report.attachments = [];
            }
            $scope.report.attachments.push({id: attachment_id, mimetype: f.type});
            $('#bardiv').hide();
            $scope.$apply();
        }, function(percent) {
            $("#progressbar").progressbar("option", "value", percent);
        });
    }
    document.getElementById("image-upload").addEventListener('change', handleFileSelect, false);
    document.getElementById("audio-upload").addEventListener('change', handleFileSelect, false);
}

function getQueryParam(key) {
    var temp = location.search.match(new RegExp(key + "=(.*?)($|\&)", "i"));
    if (!temp) {
        return undefined;
    }
    return temp[1];
}
