<?php

require("utilities.php");

if( isset( $_SESSION['folderName'])) {
	$guid = $_SESSION['folderName'];
} else {
	$_SESSION['folderName'] = getGUID();
	$guid = $_SESSION['folderName'];
}
	echo json_encode($guid);

?>
