<?php
include('util.php');
dbconnect();
$q = "select id, type, description, createdDate, changedDate from report where id=".$_REQUEST['id'];
$query_result = mysql_query($q);
if (mysql_errno()!=0) {
    error_log(' '.mysql_error().' ('.mysql_errno().')');
}
$report = mysql_fetch_assoc($query_result);

# fetch attachments
$qs = "select id, mimetype from attachment where report=".$report['id'];
$attachment_query_result = mysql_query($qs);
if (mysql_errno() != 0) {
    error_log(mysql_error());
} else {
    $attachment_array = array();
    while ($attachment = mysql_fetch_assoc($attachment_query_result)) {
        array_push($attachment_array, $attachment);
    }
    $report['attachments'] = $attachment_array;
}
echo json_encode($report);
dbclose();
?>