<?php
$ds          = DIRECTORY_SEPARATOR;  //1

function GUID()
{
    if (function_exists('com_create_guid') === true)
    {
        return trim(com_create_guid(), '{}');
    }

    return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
}


$storeFolder = 'uploads';   //2

//$sessionFolderName = $_REQUEST['folderName'];
//$sessionFolderName = GUID();
$sessionFolderName = $_REQUEST['dzuuid'];

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
