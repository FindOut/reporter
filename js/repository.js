/**
   responsible for reading, storing and listing reports.
 */
angular.module('repository', []).
service('repo', function($location) {
    return {
        listReports: function(target, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval(this.responseText));
                }
            };
            oReq.open("get", "ws/targets/" + target + "/reports", true);
            oReq.send();
        },

        getReport: function(id, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval(this.responseText)[0]);
                }
            };
            oReq.open("get", "ws/reports/" + id, true);
            oReq.send();
        },

        addReport: function(report, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(this.responseText);
                }
            };
            oReq.open("post", "ws/reports", true);
            oReq.setRequestHeader('Content-Type', 'application/json');
            oReq.send(JSON.stringify(report));
        },

        saveReport: function(report, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(this.responseText);
                }
            };
            oReq.open("put", "ws/reports/" + report.id, true);
            oReq.setRequestHeader('Content-Type', 'application/json');
            oReq.send(JSON.stringify(report));
        },

        deleteReport: function(id, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval('['+this.responseText+']')[0]);
                }
            };
            oReq.open("delete", "ws/reports/" + id, true);
            oReq.send();
        },

        // uploads file f and when done, calls onReady with the created id for it
        uploadFile: function(file, onReady) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "ws/attachments", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (onReady != undefined) {
                        onReady(this.responseText);
                    }
                }
            };
            var fd = new FormData();
            fd.append('afile', file);
            xhr.send(fd);

        },

        // returns the URL to get the file with the supplied fileId
        getFileUrl: function(attachmentId) {
            return  'ws/attachments/' + attachmentId + '/raw';
        }
    };
});
