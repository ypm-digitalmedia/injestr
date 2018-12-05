<?php
//session_start();
//require("utilities.php");

$ds          = DIRECTORY_SEPARATOR;  //1

$storeFolder = 'uploads';   //2


//if( !isset($_SESSION['folderName']) ) { $_SESSION['folderName'] = getGUID(); }

$sessionFolderName = $_REQUEST['folderName'];
//$sessionFolderName = $_SESSION['folderName'];


// create GUID upload folder
if (!file_exists($storeFolder . $ds . $sessionFolderName )) { 
	mkdir($storeFolder . $ds . $sessionFolderName, 0777, true); 
}

//var_dump($_REQUEST);

if (!empty($_FILES)) {
     
    $tempFile = $_FILES['file']['tmp_name'];          //3
	$fileName = $_FILES['file']['name'];
    
    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;  //4
     
    $targetFile =  $targetPath . $fileName;  //5
 
	
	
	if( isset($_REQUEST['dzchunkindex']) && isset($_REQUEST['dztotalchunkcount'])) {
	// CHUNKING (make subfolders or add index to filenames for large files)
		
		// check for & make chunk folder
		if (!file_exists($storeFolder . $ds . $sessionFolderName . $ds . $fileName )) {
			mkdir($storeFolder . $ds . $sessionFolderName . $ds . $fileName, 0777, true);
		}
		
		// write chunk file
		
//		$targetChunkFile = $targetPath . $_FILES['file']['name'] . $ds . "[" . $_REQUEST['dzchunkindex'] . "-" . $_REQUEST['dztotalchunkcount'] . "]" . $_FILES['file']['name'];
		
		$index = intval($_REQUEST['dzchunkindex']);
		$indexActual = $index+1;
		
		
		$indexPadActual = str_pad($indexActual, 2, '0', STR_PAD_LEFT);
		$totalPad = str_pad($_REQUEST['dztotalchunkcount'], 2, '0', STR_PAD_LEFT);
		
		
		$targetChunkFile = $targetPath . $fileName . $ds . "chunk[" . $indexPadActual . "-" . $totalPad . "]";
		
		if ( move_uploaded_file ($tempFile,$targetChunkFile)  ) {
			echo "The chunked file " . $fileName . " has been successfully uploaded.  Total chunks: " . $_REQUEST['dztotalchunkcount'];
			$statusText = "success";
		} else {
			switch ($_FILES['file']['error']) {  
				case 1:
//					echo 'ERROR: The file is bigger than this PHP installation allows: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is larger than this server allows.';
					$statusText = "error|phpsizelimit";
					break;
				case 2:
//					echo 'ERROR: The file is bigger than this form allows: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is larger than this application allows.';
					$statusText = "error|javascriptsizelimit";
					break;
				case 3:
//					echo 'ERROR: Only part of the file was uploaded: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> was only partially uploaded.';
					$statusText = "error|partial";
					break;
				case 4:
//					echo 'ERROR: No file was uploaded: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> was not sent to the server, or there was a connectivity issue.';
					$statusText = "error|empty";
					break;
				case 6:
//					echo 'ERROR: Missing temporary folder: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> cannot be upload, because a temporary folder is missing on the server.';
					$statusText = "error|notempfolder";
					break;
				case 7:
//					echo 'ERROR: Cannot write to disk: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> cannot be written to disk, or the server is full.';
					$statusText = "error|cantwrite";
					break;
				case 8:
//					echo 'ERROR: Extension: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> has a bad extension or is an incorrect file type.';
					$statusText = "error|extension";
					break;
				default: 
//					echo 'ERROR: FILE UNACCEPTABLE: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is unacceptable.';
					$statusText = "error|notallowed";
					break;
			}
		}
		
		// write chunklog
		$logfilepath = $storeFolder . $ds . $sessionFolderName . $ds . "chunklog";
		if (!file_exists( $logfilepath )) {
			$headertxt = "DATE" . "\t" . "FILE" . "\t" . "TOTAL SIZE" . "\t" . "CHUNK #" . "\t" . "CHUNK SIZE" . "\t" . "STATUS" . "\n";
			file_put_contents($logfilepath, $headertxt) or die ("unable to initialize chunklog file.");
		}
		
		$txt = date("Y-m-d H:i:s") . "\t" . $fileName . "\t" . $_REQUEST['dztotalfilesize'] . "\t" . $indexActual . " of " . $_REQUEST['dztotalchunkcount'] ."\t" . $_REQUEST['dzchunksize'] . "\t" . $statusText;
		
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
			echo 'The file ' . $fileName . ' has been successfully uploaded.';
		} else {
			switch ($_FILES['file']['error']) {  
				case 1:
//					echo 'ERROR: The file is bigger than this PHP installation allows: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is larger than this server allows.';
					break;
				case 2:
//					echo 'ERROR: The file is bigger than this form allows: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is larger than this application allows.';
					break;
				case 3:
//					echo 'ERROR: Only part of the file was uploaded: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> was only partially uploaded.';
					break;
				case 4:
//					echo 'ERROR: No file was uploaded: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> was not sent to the server, or there was a connectivity issue.';
					break;
				case 6:
//					echo 'ERROR: Missing temporary folder: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> cannot be upload, because a temporary folder is missing on the server.';
					break;
				case 7:
//					echo 'ERROR: Cannot write to disk: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> cannot be written to disk, or the server is full.';
					break;
				case 8:
//					echo 'ERROR: Extension: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> has a bad extension or is an incorrect file type.';
					break;
				default: 
//					echo 'ERROR: FILE UNACCEPTABLE: ' . $fileName . ' ';
					echo 'error|The file <em>' . $fileName . '</em> is unacceptable.';
					break;
			}
		}
		
	}
	
	//var_dump($_FILES);
			
		
	// write lockfile (First time around)
	$locktext = "lock";
	$lockfile = $storeFolder . $ds . $sessionFolderName . $ds . "lockfile";
	if (!file_exists( $lockfile )) {
		file_put_contents($lockfile, $locktext) or die ("unable to create lockfile.");
	}
	
	
	
}




?>
