<?php
session_start();
if( isset($_SESSION['folderName']) ) {
	session_unset();
}

for( $i=0; $i<10; $i++ ) {
	upload($i);
}

function getGUID(){
    if (function_exists('com_create_guid')){
        return com_create_guid();
    }else{
        mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
        $charid = strtolower(md5(uniqid(rand(), true)));
        $hyphen = chr(45);// "-"
        $uuid = substr($charid, 0, 8).$hyphen
            .substr($charid, 8, 4).$hyphen
            .substr($charid,12, 4).$hyphen
            .substr($charid,16, 4).$hyphen
            .substr($charid,20,12);
        return $uuid;
    }
}



function upload($i) {
	


	if( !isset($_SESSION['folderName']) ) {
		$_SESSION['folderName'] = getGUID();
	}
	
	echo($i . " | " . $_SESSION['folderName'] . "<br />");
	
}



?>
