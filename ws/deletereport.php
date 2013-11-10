<?php
include('util.php');
dbconnect();
$q = "delete from report where id=".$_REQUEST['id'];
mysql_query($q);
if (mysql_errno()!=0) {
    die(mysql_error().' ('.mysql_errno().')');
}
dbclose();
?>