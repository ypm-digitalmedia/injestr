<?php
session_start();

$ds          = DIRECTORY_SEPARATOR;  //1

function getGUID(){
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


$storeFolder = 'uploads';   //2

if( !isset($_SESSION['folderName']) ) {
	$_SESSION['folderName'] = getGUID();
}

$sessionFolderName = $_SESSION['folderName'];

if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
}


if (!empty($_FILES)) {
     
    $tempFile = $_FILES['file']['tmp_name'];          //3             
    
    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;  //4
     
    $targetFile =  $targetPath. $_FILES['file']['name'];  //5
 
//    move_uploaded_file($tempFile,$targetFile); //6
     
	echo( print_r($_FILES) );
	
	if ( move_uploaded_file ($tempFile,$targetFile)  ) {  
		echo 'The file ' . $_FILES['file']['name'] . ' has been successfully uploaded.';
		
		echo("\n\nFolder name: " . $sessionFolderName);
		echo("\n\nRequest: ");
		print_r($_REQUEST);
		echo("\n\nSession: ");
		print_r($_SESSION);
		
		
//	     echo print_r($_REQUEST);
   } else {
        switch ($_FILES['file']['error'])
	 {  case 1:
			   echo 'ERROR: The file is bigger than this PHP installation allows.';
			   break;
		case 2:
			   print 'ERROR: The file is bigger than this form allows';
			   break;
		case 3:
			   print 'ERROR: Only part of the file was uploaded';
			   break;
		case 4:
			   print 'ERROR: No file was uploaded';
			   break;
	  default: 
	  		   print 'ERROR: FILE UNACCEPTABLE';
	  		   break;
	 }
   }
	
	
	
	
	
	
	
}
?>
