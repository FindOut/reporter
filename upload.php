<?
# add row to attchment table
# store uploaded file in upload directory named by attachment id
# table info:
# create table attachment (id int(7) NOT NULL auto_increment, report int(7), name varchar(255) NOT NULL, mimetype varchar(100), PRIMARY KEY (id), UNIQUE id (id));
# row is created with null report field on upload
# project is set when creating the project containing this file
	include('util.php');

	dbconnect();

	$uploadedFile = $_FILES['afile']['name'];
#	$target_path = $uploaddir. "/" . basename( $uploadedFile);
    $tmp_name = $_FILES['afile']['tmp_name'];

#	header("Content-Type: text/plain");
#	echo "_FILES['afile']['name']=".$_FILES['afile']['name']."\n";
#	echo "_FILES['afile']['type']=".$_FILES['afile']['type']."\n";
#	echo "_FILES['afile']['size']=".$_FILES['afile']['size']."\n";
#	echo "_FILES['afile']['tmp_name']=".$_FILES['afile']['tmp_name']."\n";
#	echo "_FILES['afile']['error']=".$_FILES['afile']['error']."\n";

    $result = array();
    $result['error'] = 0;
    $result['errorText'] = '';

    $insertstmt = "insert into attachment (name, mimetype) values ('".$_FILES['afile']['name']."', '".$_FILES['afile']['type']."')";
    mysql_query($insertstmt);
    $id = mysql_insert_id();
    $result['fileId'] = $id;
    if (mysql_error()) {
        $result['error'] = mysql_error();
    } else {
        $target_path = $uploaddir."/".$id;
    	if (move_uploaded_file($_FILES['afile']['tmp_name'], $target_path)) {
        } else{
            $result['error'] = -1;
            $result['errorText'] = "could not store uploaded file ".$tmp_name." in target path ".$target_path;
        }
    }
    echo json_encode($result);
?>