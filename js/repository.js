/**
 responsible for reading, storing and listing reports accessible through a REST service.
 */
angular.module('repository', []).
    service('repo', function ($location) {
        return {
            listReports: function (target, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function (oEvent) {
                    console.log("statechange", xhr.readyState);
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (onReady != undefined) {
                                var response_obj = JSON.parse(xhr.responseText);
                                onReady(response_obj);
                                console.log("got list response", response_obj);
                            }
                        } else {
                            console.log("Error", xhr.status, xhr.statusText, "reason:", xhr.responseText);

                        }
                    }
                };
                xhr.open("get", "ws/targets/" + target + "/reports", true);
                xhr.send();
            },

            getReport: function (id, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (onReady != undefined) {
                        onReady(JSON.parse(this.responseText));
                    }
                };
                xhr.open("get", "ws/reports/" + id, true);
                xhr.send();
            },

            addReport: function (report, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (onReady != undefined) {
                        onReady(this.responseText);
                    }
                };
                xhr.open("post", "ws/reports", true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(report));
            },

            saveReport: function (report, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (onReady != undefined) {
                        onReady(this.responseText);
                    }
                };
                xhr.open("put", "ws/reports/" + report.id, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(report));
            },

            deleteReport: function (id, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (onReady != undefined) {
                        onReady(JSON.parse(this.responseText));
                    }
                };
                xhr.open("delete", "ws/reports/" + id, true);
                xhr.send();
            },

            deleteAttachment: function (id, onReady) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (onReady != undefined) {
                        onReady();
                    }
                };
                xhr.open("delete", "ws/attachments/" + id, true);
                xhr.send();
            },

            // uploads file f and when done, calls onReady with the created id for it
            uploadFile: function (file, onReady, showProgress) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "ws/attachments", true);
                if (showProgress != undefined) {
                    xhr.upload.addEventListener("progress", function(e) {
                        if (e.lengthComputable) {
                            var percentage = Math.round((e.loaded * 100) / e.total);
                            showProgress(percentage);
                        }
                    }, false);

                    xhr.upload.addEventListener("load", function(e){
                        showProgress(100);
                    }, false);
                }
                xhr.onreadystatechange = function () {
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
            getFileUrl: function (attachmentId) {
                return  'ws/attachments/' + attachmentId + '/raw';
            }
        };
    });
