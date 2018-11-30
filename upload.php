<?php
//session_start();
//require("utilities.php");

$ds          = DIRECTORY_SEPARATOR;  //1

$storeFolder = 'uploads';   //2


//if( !isset($_SESSION['folderName']) ) { $_SESSION['folderName'] = getGUID(); }

$sessionFolderName = $_REQUEST['folderName'];
//$sessionFolderName = $_SESSION['folderName'];

// create GUID upload folder
//if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
//    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
//}

if (!empty($_FILES)) {
     
    $tempFile = $_FILES['file']['tmp_name'];          //3             
    
    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;  //4
     
    $targetFile =  $targetPath. $_FILES['file']['name'];  //5
 
//    move_uploaded_file($tempFile,$targetFile); //6
     
//	echo( print_r($_FILES) );
	
	
	
	if( isset($_REQUEST['dzchunkindex']) && isset($_REQUEST['dztotalchunkcount'])) {
	// CHUNKING (make subfolders or add index to filenames for large files)
		
		// check for & make chunk folder
		if (!file_exists($storeFolder . $ds . $sessionFolderName . $ds . $_FILES['file']['name'] )) {
			mkdir($storeFolder . $ds . $sessionFolderName . $ds . $_FILES['file']['name'], 0777, true);
		}
		
		// write chunk file
		
//		$targetChunkFile = $targetPath . $_FILES['file']['name'] . $ds . "[" . $_REQUEST['dzchunkindex'] . "-" . $_REQUEST['dztotalchunkcount'] . "]" . $_FILES['file']['name'];
		
		$index = intval($_REQUEST['dzchunkindex']);
		$indexActual = $index+1;
		
		$targetChunkFile = $targetPath . $_FILES['file']['name'] . $ds . "chunk[" . $indexActual . "-" . $_REQUEST['dztotalchunkcount'] . "]";
		
		if ( move_uploaded_file ($tempFile,$targetChunkFile)  ) {
			echo "The chunked file " . $_FILES['file']['name'] . " has been successfully uploaded.  Total chunks: " . $_REQUEST['dztotalchunkcount'];
			$statusText = "success";
		} else {
			switch ($_FILES['file']['error']) {  
				case 1:
					echo 'ERROR: The file is bigger than this PHP installation allows.';
					$statusText = "error|phpsizelimit";
					break;
				case 2:
					print 'ERROR: The file is bigger than this form allows';
					$statusText = "error|javascriptsizelimit";
					break;
				case 3:
					print 'ERROR: Only part of the file was uploaded';
					$statusText = "error|partial";
					break;
				case 4:
					print 'ERROR: No file was uploaded';
					$statusText = "error|empty";
					break;
				default: 
					print 'ERROR: FILE UNACCEPTABLE';
					$statusText = "error|notallowed";
					break;
			}
		}
		
		// write chunklog
		$logfilepath = $storeFolder . $ds . $sessionFolderName . $ds . "chunklog";
		if (!file_exists( $logfilepath )) {
			$header = "DATE" . "\t" . "FILE" . "\t" . "TOTAL SIZE" . "\t" . "CHUNK #" . "\t" . "CHUNK SIZE" . "\t" . "STATUS" . "\n";
			file_put_contents($logfilepath, $header) or die ("unable to initialize chunklog file.");
		}
		
		$txt = date("Y-m-d H:i:s") . "\t" . $_FILES['file']['name'] . "\t" . $_REQUEST['dztotalfilesize'] . "\t" . $indexActual . " of " . $_REQUEST['dztotalchunkcount'] ."\t" . $_REQUEST['dzchunksize'] . "\t" . $statusText;
		
//		file_put_contents($logfilepath, $txt) or die ("unable to write to chunklog file.");
		
		 $logfile = file_put_contents($logfilepath, $txt.PHP_EOL , FILE_APPEND | LOCK_EX);
		
		// assemble
		// delete chunk folder
		
		//
		//	NEXT, MAKE SURE GUID IS ONLY MINTED IN PHP SCRIPTS (CHECK MORPHOSOURCE & GRAPHICS PATH?)
		//
		
		
	} else {
	// SINGLE FILE (filesize smaller than chunksize)

		if ( move_uploaded_file ($tempFile,$targetFile)  ) {
			echo 'The file ' . $_FILES['file']['name'] . ' has been successfully uploaded.';
		} else {
			switch ($_FILES['file']['error']) {  
				case 1:
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
	
	
			
		
	// write lockfile (First time around)

	$lockfile = $storeFolder . $ds . $sessionFolderName . $ds . "lockfile";
	if (!file_exists( $lockfile )) {
		file_put_contents($lockfile, "") or die ("unable to create lockfile.");
	}
	
	
	
}




?>
