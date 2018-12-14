<?php

$total = disk_total_space("/");
$available = disk_free_space("/");
$percent_available = ($available/$total)*100;

$filesize_query = $_REQUEST['filesize'];


if (strpos($_SERVER['SERVER_NAME'], 'localhost') !== false || strpos($_SERVER['SERVER_NAME'], '172.16.85.92') !== false) {
		// test environment	
		$cutoff = 5; //percentage free space needed to continue
	} else {
		// production environment	
		$cutoff = 75; //percentage free space needed to continue
	}

//echo $available . " of " . $total . " bytes free (" . $percent_available . "%)";

//echo "\n\n";

if( isset($filesize_query) ) { 
//	echo "file in question: " . $filesize_query . " bytes";
}

if( $percent_available > $cutoff ) {
	$theStatus = "ok";
} else {
	$theStatus = "full";
}

$theResponse = $theStatus . "|" . $available . "|" . $total . "|" . $percent_available . "|" . $cutoff;

echo $theResponse;











?>