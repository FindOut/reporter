<?php
$uploaddir = '/home/dag/public_html/reporter-test/uploads';

function dbconnect() {
	$user="reporter";
	$password="gleFFer";
	$database="reporter";
	mysql_connect('localhost',$user,$password);
	@mysql_select_db($database) or die( "Unable to select database ".$database);
}

function dbclose() {
	mysql_close();
}

function startsWith($s, $start) {
	if (strlen($s) >= strlen($start) && substr($s, 0, strlen($start)) == $start) {
		return true;
	}
	return false;
}

function xxxlog($s) {
    file_put_contents('/home/dag/public_html/reporter-test/uploads/upload-log.txt', $s."\n", FILE_APPEND);
}

?>