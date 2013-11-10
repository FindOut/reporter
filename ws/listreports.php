<?php
include('util.php');
/*CREATE TABLE report (id int(7) NOT NULL auto_increment, type varchar(100), description varchar(255) NOT NULL,
    createdDate date not null, changedDate date not null,PRIMARY KEY (id),UNIQUE id (id))
*/
dbconnect();
$q = "select id, target, type, description, createdDate, changedDate from report where target='".$_REQUEST['target']."' order by changedDate desc";
$reports = mysql_query($q);
if (mysql_errno()!=0) {
    die(mysql_error().' ('.mysql_errno().')');
}
$reportArray = array();
while ($report = mysql_fetch_assoc($reports)) {
    array_push($reportArray, $report);
}
dbclose();
echo json_encode($reportArray);
?>