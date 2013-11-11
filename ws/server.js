var express = require('express');
var app = express();
var fs = require('fs');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'reporter',
    password : '',
    database : 'reporter'
});

connection.connect(function(err) {
    // connected! (unless `err` is set)
});

function test_err(err, req, res) {
    if (err) {
        res.send(500);
        throw err;
    }
}

app.configure(function(){
    app.use(express.bodyParser());
    app.use(app.router);
});

// list reports by target
app.get('/ws/targets/:target/reports', function(req, res) {
//    console.log("get /ws/targets/" + req.params.target + "/reports");
    connection.query('select id, target, type, description, createdDate, changedDate ' +
        'from report where target=? order by changedDate desc', [req.params.target],
        function (err, result) {
            test_err(err, req, res);
            res.send(result);
        }
    );
});

// get report by id as json list
app.get('/ws/reports/:id', function(req, res) {
//    console.log("get /ws/reports/" + req.params.id);
    // query report by id
    connection.query('select id, target, type, description, createdDate, changedDate ' +
        'from report where id=?', [req.params.id],
        function (err, reports) {
            test_err(err, req, res);
            if (reports.length == 0) {
                send(404, 'report ' + req.params.id + ' not found');
            } else {
                // query all attachments for this report and put in a report attribute
                connection.query('select id, mimetype from attachment where report=?', [req.params.id],
                    function (err, attachments) {
                        test_err(err, req, res);
                        reports[0].attachments = attachments;
                        res.send(reports);
                    }
                );
            }
        }
    );
});

// create report from json
app.post('/ws/reports', function(req, res) {
//    console.log("post /ws/reports " + req.body);
    var now = new Date();
    connection.query('insert into report(target, type, description, createdDate, changedDate) ' +
        'values(?, ?, ?, ?, ?)', [req.body.target, req.body.type, req.body.description, now, now],
        function(err, result) {
            test_err(err, req, res);
            var report_id = result.insertId;
            if (req.body.attachments != undefined && req.body.attachments.length > 0) {
                connection.query('update attachment set report=? where id in (?)', [report_id, req.body.attachments.map(function(att) {return att.id;})],
                    function(err, result2) {
                        test_err(err, req, res);
                        res.send("" + report_id);
                    }
                );
            } else {
                res.send("" + report_id);
            }
        }
    );
});

// update report by id supplied as json
app.put('/ws/reports/:id', function(req, res) {
//    console.log("put /ws/reports/" + req.params.id, req.body);
    connection.query('update report set type=?, description=?, changedDate=? where id=?', [req.body.type, req.body.description, new Date(), req.body.id],
        function(err, result) {
            test_err(err, req, res);
            if (result.length == 0) {
                send(404, 'report ' + req.params.id + ' not found');
            } else {
                if (req.body.attachments != undefined && req.body.attachments.length > 0) {
                    connection.query('update attachment set report=? where id in (?)',
                            [req.body.id, req.body.attachments.map(function(att) {return att.id;})],
                        function(err, result2) {
                            test_err(err, req, res);
                            res.send("ok");
                        }
                    );
                } else {
                    res.send('ok');
                }
            }
        }
     );
});

// delete report by id
app.del('/ws/reports/:id', function(req, res) {
//    console.log("delete /ws/reports/" + req.params.id);
    connection.query('delete from report where id=?', [req.params.id],
        function (err, reports) {
            test_err(err, req, res);
        }
    );
});

// upload attachment return new attachment id
app.post('/ws/attachments', function(req, res) {
//    console.log("post /ws/attachments ", req.files);
    var file = req.files.afile;
    connection.query('insert into attachment (name, mimetype) values (?, ?)', [file.name, file.type], function (err, attachment) {
        test_err(err, req, res);
        var attachment_id = attachment.insertId;
        fs.rename(file.path, 'uploads/' + attachment_id, function(err) {
            if (err) throw err;
            res.send("" + attachment_id);
        });
    });
});

// download attachment raw (binary with specified mime type)
app.get('/ws/attachments/:id/raw', function(req, res) {
//    console.log("get /ws/attachments/" + req.params.id + '/raw');
    connection.query('select id, mimetype from attachment where id=?', [req.params.id],
        function (err, attachments) {
            test_err(err, req, res);
            if (attachments.length == 0) {
                send(404, 'attachment ' + req.params.id + ' not found');
            } else {
                res.type(attachments[0].mimetype);
                res.sendfile('uploads/' + req.params.id);
            }
        }
    );
});

app.use(express.static(__dirname + '/..'));

app.listen(3000);
console.log('Listening on port 3000...');
