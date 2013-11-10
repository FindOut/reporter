<?
# add row to attchment table
# store uploaded file in upload directory named by attachment id
# table info:
# create table attachment (id int(7) NOT NULL auto_increment, report int(7), name varchar(255) NOT NULL, mimetype varchar(100), PRIMARY KEY (id), UNIQUE id (id));
# row is created with null report field on upload
# project is set when creating the project containing this file
	include('util.php');

	dbconnect();

    $file_tmp_name = $_FILES['afile']['tmp_name'];
    $file_name = $_FILES['afile']['name'];
    $file_type = $_FILES['afile']['type'];
    $file_size = $_FILES['afile']['size'];
    $file_error = $_FILES['afile']['error'];

    error_log("file_name=$file_name");
    error_log("file_type=$file_type");
    error_log("file_size=$file_size");
    error_log("file_tmp_name=$file_tmp_name");
    error_log("file_error=$file_error");

    $result = array();
    $result['error'] = $file_error;
    $result['errorText'] = '';

    if ($file_error == 0) {
        $insertstmt = "insert into attachment (name, mimetype) values ('$file_name', '$file_type')";
        error_log($insertstmt);
        mysql_query($insertstmt);
        $id = mysql_insert_id();
        $result['fileId'] = $id;
        if (mysql_error()) {
            $result['error'] = mysql_errno();
            $result['errorText'] = mysql_error();
        } else {
            $target_path = "$uploaddir/$id";
            if (move_uploaded_file($file_tmp_name, $target_path)) {
            } else{
                $result['error'] = -1;
                $result['errorText'] = "could not store uploaded file $file_tmp_name in target path $target_path";
            }
        }
    }
    echo json_encode($result);
?>