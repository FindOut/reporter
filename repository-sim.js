/**
   responsible for reading, storing and listing reports.
 */
angular.module('repository', []).
service('repo', function($location) {
    var fileId = 0;
    var list = [
        {id: 1, type:'problem', description: "ett", createdDate: '2013-11-01T16:15:16.525Z'},
        {id: 2, type:'problem', description: "två", createdDate: '2013-11-01T17:42:04.786Z'},
        {id: 3, type:'problem', description: "tre", createdDate: '2013-11-04T07:55:34.765Z'}
    ];
    var findIndexById = function(id) {
        for(i in list) {
            var r = list[i];
            if (id == r.$id) {
                return i;
            }
        }
        return undefined;
    };

    return {
        // uploads file f and when done, calls onReady with the created id for it
        uploadFile: function(f, onReady) {
            console.log("uploadFile", f);
            var newId = fileId++;
            if (onReady != undefined) {
                console.log("uploadFile.onReady", newId);
                onReady(newId);
            }
        },

        // returns the URL to get the file with the supplied fileId
        getFileUrl: function(fileId) {
            console.log("getFileUrl(" + fileId + ")")
            var fileUrl = "getFile.php?fileId=" + fileId;
            console.log("getFileUrl(" + fileId + ")=", fileUrl);
            return  fileUrl;
        },

        listReports: function(onReady) {
            if (onReady != undefined) {
                onReady(list);
            }
            return  list;
        },

        getReport: function(id, onReady) {
            var report = undefined;
            for(i in list) {
                var r = list[i];
                if (id == r.$id) {
                    report = r;
                    break;
                }
            }
            if (onReady != undefined) {
                onReady(report);
            }
            return report;
        },

        deleteReport: function(id, onReady) {
            var report = undefined;
            for(i in list) {
                var r = list[i];
                if (id == r.$id) {
                    report = r;
                    list.splice(i, 1);
                    break;
                }
            }
            if (onReady != undefined) {
                onReady(report);
            }
            return report;
        },

        addReport: function(report, onReady) {
            report.$id = list.length + 1;
            list.push(report);
            if (onReady != undefined) {
                onReady(report);
            }
        },

        saveReport: function(report, onReady) {
            var i = findIndexById(report.$id);
            if (i != undefined) {
                list[i] = angular.copy(report);
            }
            if (onReady != undefined) {
                onReady(report);
            }
        }
    };
});
