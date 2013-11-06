<?php
$dir = '/home/fo/projects/downloadticket/files';

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

?>