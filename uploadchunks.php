<?php

$ds          = DIRECTORY_SEPARATOR;  //1

$storeFolder = 'uploads';   //2

$sessionFolderName = $_REQUEST['folderName'];


if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
}


if (!empty($_FILES)) {

    //Chunking Variables
	$Qx = $_FILES['file']['name'];
	$Rx = $_FILES['file']['tmp_name'];
	$Wx = $_POST['dzchunkindex'];
	$Tx = $_POST['dztotalchunkcount'];

    $tempFile = $_FILES['file']['tmp_name'];          //3

    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;  //4

    $targetFile =  $targetPath. $_FILES['file']['name'];  //5
    $targetFile =  $targetPath. $Wx. '_'. $_FILES['file']['name'];  //5 with chunk index added to name
    //move_uploaded_file($tempFile,$targetFile); //6
	echo($targetFile);
	echo( print_r($_FILES) );

	if ( move_uploaded_file ($tempFile,$targetFile)  ) {
		echo 'The file ' . $_FILES['file']['name'] . ' has been successfully uploaded.';
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
