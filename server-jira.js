var express = require('express');
var fs = require('fs');
var http = require('http');
var request = require('request');
var parseUrl = require('url').parse;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var FormData = require('form-data');

var user = 'drende';
var password = 'jdadmin';
var port;

var app = express();

app.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

var mysql = require('mysql');
var mysqlPool;

// start with NODE_ENV=development
app.configure("development", function () {
    mysqlPool = mysql.createPool({
        host: 'localhost',
        user: 'reporter',
        password: '',
        database: 'reporterdev'
    });
    port = 3010;
});

// start with NODE_ENV=production
app.configure("production", function () {
    mysqlPool = mysql.createPool({
        host: 'localhost',
        user: 'reporter',
        password: '',
        database: 'reporter'
    });
    port = 3000;
});

app.use(express.bodyParser());
app.use(app.router);

function from_jira_issue_to_report(target, issue) {
    var attachments = [], hasImage = 0, hasAudio = 0;
    for (var i in issue.fields.attachment) {
        var att = issue.fields.attachment[i];
        attachments.push({id:att.id, mimetype:att.mimeType, inJira:true});
        if (/^image\//.test(att.mimeType)) {
            hasImage = 1;
        }
        if (/^audio\//.test(att.mimeType)) {
            hasAudio = 1;
        }
    }

    var report = {id: issue.id, target: target, type: issue.fields.issuetype.name, createdDate: issue.fields.created,
        changedDate: issue.fields.updated, description: issue.fields.summary,
        hasImage: hasImage, hasAudio: hasAudio,
        attachments: attachments
    };
    return  report;
}

function from_jira_search_result_to_reports(target, obj) {
    return obj.issues.map(function(issue) {return from_jira_issue_to_report(target, issue);});
}

// list reports by target
app.get('/ws/targets/:target/reports', function (req, res) {
    var target = req.params.target;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                res.send(from_jira_search_result_to_reports(target, eval('[' + xhr.responseText + ']')[0]));
            } else {
                console.log("Error", xhr.status, xhr.statusText, "reason:", xhr.responseText);
                res.send(xhr.status, xhr.statusText);
            }
        }
    };
    xhr.open("get", 'http://localhost:8580/jira/rest/api/2/search?jql=target~"' + target + '"&fields=id,summary,issuetype,created,updated,attachment', true);
    xhr.setRequestHeader('Authorization', make_basic_auth(user, password));
    xhr.send();
});

// get report by id as json list
app.get('/ws/reports/:id', function (req, res) {
    var id = req.params.id;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                res.send([from_jira_issue_to_report("", eval('[' + xhr.responseText + ']')[0])]);
            } else {
                console.log("Error", xhr.status, xhr.statusText, "reason:", xhr.responseText);
                res.send(xhr.status, xhr.statusText);
            }
        }
    };
    xhr.open("get", 'http://localhost:8580/jira/rest/api/2/issue/' + id, true);
    xhr.setRequestHeader('Authorization', make_basic_auth(user, password));
    xhr.send();
});

// create report from json
app.post('/ws/reports', function (req, res) {
//    console.log("post /ws/reports " + req.body);
    var report = req.body;
    var issue = {"fields": {
        "project": {"key": "REP"},
        "summary": report.description,
        "customfield_10000": report.target,
        "issuetype": {"name": report.type}
    }};

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                var jira_response = JSON.parse(xhr.responseText);
                report.id = jira_response.id;
                console.log("new issue=",jira_response);
                upload_attachments_to_jira(report);
                res.send(jira_response.id);
            } else {
                console.log("Error", xhr.status, xhr.statusText, "reason:", xhr.responseText);
                res.send(xhr.status, xhr.statusText);
            }
        }
    };
    xhr.open("post", "http://localhost:8580/jira/rest/api/2/issue", true);
    xhr.setRequestHeader('Authorization', make_basic_auth(user, password));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(issue));
});

// update report by id supplied as json
app.put('/ws/reports/:id', function (req, res) {
    var id = req.params.id;
    var issue = {"fields": {
        "summary": req.body.description,
        "issuetype": {"name": req.body.type}
    }};

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                // upload attachments identified by req.body.attachments
                upload_attachments_to_jira(req.body);

                res.send("ok");
            } else {
                console.log("Error", xhr.status, xhr.statusText, "reason:", xhr.responseText);
                res.send(xhr.status, xhr.statusText);
            }
        }
    };
    xhr.open("put", "http://localhost:8580/jira/rest/api/2/issue/" + id, true);
    xhr.setRequestHeader('Authorization', make_basic_auth(user, password));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(issue));
});

function upload_attachments_to_jira(report) {
    for (i in report.attachments) {
        var attachment = report.attachments[i];
        if (attachment.inJira == undefined) {
            console.log("upload_attachments_to_jira report.id=", report.id)
            var file = '/home/dag/reporterdev/uploads/' + attachment.id;
            var form = new FormData();
            form.append('file', fs.createReadStream(file),
                {filename: 'file.' + attachment.mimetype.split('/')[1], contentType: attachment.mimetype});
            var params = parseUrl("http://localhost:8580/jira/rest/api/2/issue/" + report.id + "/attachments");
            params.headers = form.getHeaders();
            params.headers['Authorization'] = make_basic_auth(user, password);
            params.headers['X-Atlassian-Token'] = 'nocheck';
            form.submit(params, function (err, res) {
                console.log('Done ', res.statusCode);
                if (res.statusCode == 200) {
                    attachment.inJira = true;
                }
            });
        }
    }
}

function test_err(err, res) {
    if (err) {
        res.send(500, err);
        throw err;
    }
}

// upload attachment return new attachment id
app.post('/ws/attachments', function (req, res) {
//    console.log("post /ws/attachments ", req.files);
    var file = req.files.afile;
    mysqlPool.query('insert into attachment (name, mimetype) values (?, ?)', [file.name, file.type], function (err, attachment) {
        test_err(err, res);
        var attachment_id = attachment.insertId;
        fs.rename(file.path, 'uploads/' + attachment_id, function (err) {
            test_err(err, res);
            res.send("" + attachment_id);

        });
    });
});

// download attachment raw (binary with specified mime type)
app.get('/ws/attachments/:id/raw', function (req, res) {
    var id = req.params.id;
    var url = 'http://localhost:8580/jira/secure/attachment/' + id + '/';
    var headers = {'Authorization': make_basic_auth(user, password)};
    request({url:url, encoding:null, headers:headers}, function (error, response, body) {
        res.set('content-type', response.headers['content-type']);
        res.send(body);
    });
});


app.use(express.static(__dirname));

app.listen(port);
console.log('Listening on port ' + port + '...');

function make_basic_auth(user, password) {
    var tok = user + ':' + password;
    var hash = Base64.encode(tok);
    return "Basic " + hash;
}

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
};

