<?php
include('util.php');
$report = json_decode($_REQUEST['report'], true);
dbconnect();
$q = "insert into report(type, description, createdDate, changedDate) values('".
    $report['type']."','".$report['description']."', now(), now())";
mysql_query($q);
if (mysql_errno()==0) {
    die(mysql_error().' ('.mysql_errno().')');
}
dbclose();
?>