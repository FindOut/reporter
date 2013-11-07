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
        uploadFile: function(file, onReady) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "upload.php", true);
            xhr.onreadystatechange = function() {
                    console.log("xhr.readyState",xhr.readyState,"xhr.status",xhr.status); // handle response.
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (onReady != undefined) {
                        onReady(eval(this.responseText));
                    }
                }
            };
            var fd = new FormData();
            fd.append('hej', 'du glade');
            fd.append('afile', file);
            xhr.send(fd);

        },

        // returns the URL to get the file with the supplied fileId
        getFileUrl: function(fileId) {
            console.log("getFileUrl(" + fileId + ")")
            var fileUrl = "getFile.php?fileId=" + fileId;
            console.log("getFileUrl(" + fileId + ")=", fileUrl);
            return  fileUrl;
        },

        listReports: function(onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval(this.responseText));
                }
            };
            oReq.open("get", "listreports.php", true);
            oReq.send();
        },

        getReport: function(id, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval('['+this.responseText+']')[0]);
                }
            };
            oReq.open("get", "getreport.php?id=" + id, true);
            oReq.send();
        },

        deleteReport: function(id, onReady) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(eval('['+this.responseText+']')[0]);
                }
            };
            oReq.open("get", "deletereport.php?id=" + id, true);
            oReq.send();
        },

        addReport: function(report, onReady) {
            console.log("report=", JSON.stringify(report))
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(this.responseText);
                }
            };
            oReq.open("get", "addreport.php?report=" + encodeURIComponent(JSON.stringify(report)), true);
            oReq.send();
        },

        saveReport: function(report, onReady) {
            console.log("report=", JSON.stringify(report))
            var oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (onReady != undefined) {
                    onReady(this.responseText);
                }
            };
            oReq.open("get", "savereport.php?report=" + encodeURIComponent(JSON.stringify(report)), true);
            oReq.send();
       }
    };
});
