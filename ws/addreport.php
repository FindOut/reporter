<?php
include('util.php');
$report = json_decode($_REQUEST['report'], true);
error_log($_REQUEST['report']);
dbconnect();
$q = "insert into report(target, type, description, createdDate, changedDate) values('".$report['target']."','".$report['type']."','".$report['description']."', now(), now())";
mysql_query($q);
if (mysql_errno()!=0) {
    die(mysql_error().' ('.mysql_errno().')');
}
$id = mysql_insert_id();
mysql_query("update attachment set report=".$id.' where id in('.join(',', array_map('attachmentIdString', $report['attachments'])).')');

dbclose();
?>