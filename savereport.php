<?php
include('util.php');
$report = json_decode($_REQUEST['report'], true);
dbconnect();
$q = "update report set type='".$report['type']."', description='".$report['description']."', changedDate=now()";
mysql_query($q);
if (mysql_errno()==0) {
    die(mysql_error().' ('.mysql_errno().')');
}
dbclose();
?>