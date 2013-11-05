<?php
$fileName = $_FILES['afile']['name'];
$fileType = $_FILES['afile']['type'];
$fileContent = file_get_contents($_FILES['afile']['tmp_name']);
$dataUrl = 'data:' . $fileType . ';base64,' . base64_encode($fileContent);

$json = json_encode(array(
  'name' => $fileName,
  'type' => $fileType,
  'dataUrl' => $dataUrl,
  'username' => $_REQUEST['username'],
  'accountnum' => $_REQUEST['accountnum']
));

file_put_contents('/home/dag/reporter-test/uploads/upload-log.txt', $json, FILE_APPEND);
?>