<?php
include('util.php');
dbconnect();
$qs = "select id, mimetype from attachment where id=".$_REQUEST['id'];
$attachment_query_result = mysql_query($qs);
if (mysql_errno() != 0) {
    error_log(mysql_error());
} else {
    $attachment = mysql_fetch_assoc($attachment_query_result);
    $file = $uploaddir. "/" . $_REQUEST['id'];
    if (file_exists($file)) {
        header('Content-Type: '.$attachment['mimetype']);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Content-Length: ' . filesize($file));
        ob_clean();
        flush();
        readfile($file);
        exit;
    }
}
dbclose();
?>