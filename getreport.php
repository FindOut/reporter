<?php
include('util.php');
dbconnect();
$q = "select id, type, description, createdDate, changedDate from report where id=".$_REQUEST['id'];
$query_result = mysql_query($q);
if (mysql_errno()!=0) {
    die(mysql_error().' ('.mysql_errno().')');
}
echo json_encode(mysql_fetch_assoc($query_result));
dbclose();
?>