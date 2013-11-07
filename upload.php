<?php
//$fileName = $_FILES['afile']['name'];
//$fileType = $_FILES['afile']['type'];
$fileContent = file_get_contents($_FILES['afile']['tmp_name']);
//$dataUrl = 'data:' . $fileType . ';base64,' . base64_encode($fileContent);
file_put_contents('/home/dag/public_html/reporter-test/uploads/file.png', $fileContent);



file_put_contents('/home/dag/public_html/reporter-test/uploads/upload-log.txt', json_encode($_FILES)."\n", FILE_APPEND);
file_put_contents('/home/dag/public_html/reporter-test/uploads/upload-log.txt', "size=".strlen($fileContent)."\n", FILE_APPEND);
echo "123";
?>phpgxLx5F