<?php
include('util.php');
$report = json_decode($_REQUEST['report'], true);
dbconnect();
$q = "update report set type='".$report['type']."', description='".$report['description']."', changedDate=now() where id=".$report['id'];
mysql_query($q);
if (mysql_errno()!=0) {
    error_log(mysql_error().' ('.mysql_errno().')');
}

mysql_query("update attachment set report=".$report['id'].' where id in('.join(',', array_map('attachmentIdString', $report['attachments'])).')');
dbclose();
echo "ok";
?>