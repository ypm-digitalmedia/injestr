<?php
$ds          = DIRECTORY_SEPARATOR;
$storeFolder = 'uploads';
$sessionFolderName = $_POST['folderName'];
$targetType = $_POST['type'];
$wasabiUploadType = $_POST['wasabiUploadType'];
$targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;

if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
}

$stuff = urldecode($_POST['data']);
$stuff_obj = json_decode($stuff);

//1. Parse manifest data & write assets to array
echo("=========== FINALIZATION SUMMARY ==========\n");
echo("===========================================\n");
echo("=========== Target Type: " . $targetType . "\n");
echo("=========== Upload Type: " . $wasabiUploadType . "\n");
echo("===========================================\n\n");
$assets = $stuff_obj->assets;
$numAssets = count($assets);
$assets_arr = array();

$handleFiles = true;
if( $targetType == "record") {
	if( $wasabiUploadType == "morphosource") {
		$handleFiles = false;
	}
}

if( $handleFiles == true ) {
	foreach( $assets as $a ) {
		$asset_path = $targetPath . $a->filename;
		$asset_chunked = $a->chunked;
		$aaa = array("filename"=>$a->filename,"path"=>$asset_path,"chunked"=>$asset_chunked);
		array_push($assets_arr, $aaa);
	}
}
//echo("phase 1 complete. parsed manifest data:\n");
//echo($assets_arr);
//echo("\n");

//2. Iterate through assets
//Check if chunked or not, cat files with unix shell exec and move to guid folder
//except for wasabi or morphosource records
$doChunkStuff = true;
if( $targetType == "record") {
	if( $wasabiUploadType == "batch" || $wasabiUploadType == "morphosource") {
		$doChunkStuff = false;
	}
}

if( $doChunkStuff == true ) {
	echo( date('Y-m-d H:i:s T') . " - performing chunking assembly routine.\n");
	
	for( $i=0; $i<count($assets_arr); $i++ ) {

		$asset_path = $assets_arr[$i]['path'];
		$asset_filename = $assets_arr[$i]['filename'];
		$asset_chunked = $assets_arr[$i]['chunked'];

		if( $asset_chunked ) {
			//echo("CHUNKED FILE: " . $assets_arr[$i]['path'] . ": Merging chunks.\n");

			$catStatement = "cat " . escapeshellarg($asset_path . $ds) . "chunk* >> " . escapeshellarg($targetPath . "_" . $asset_filename);
	//		echo("\n\n" . $catStatement . "\n");
			shell_exec($catStatement);

			$deleteFolderStatement = "rm -rf " . escapeshellarg($asset_path);
	//		echo($deleteFolderStatement . "\n");
			shell_exec($deleteFolderStatement);

			$renameNewFileStatement = "mv " . escapeshellarg($targetPath . "_" . $asset_filename) . " " . escapeshellarg($asset_path);
	//		echo($renameNewFileStatement . "\n\n");
			shell_exec($renameNewFileStatement);

		} else {
			//echo("SINGLE FILE: " . $assets_arr[$i]['path'] . ": Skipping chunk merge.\n");
		}	
	}
	echo( date('Y-m-d H:i:s T') . " - chunking assembly routine complete.\n");
} else {
	echo( date('Y-m-d H:i:s T') . " - chunking assembly not performed - no upload.\n");
}
//echo("phase 2 complete.  chunked files merged and copied.\n");
//echo("\n");


//3. Iterate through assets again
//Run MD5 checksum on whole files
//except for wasabi or morphosource records

$doMd5 = true;
if( $targetType == "record") {
	if( $wasabiUploadType == "batch" || $wasabiUploadType == "morphosource") {
		$doMd5 = false;
	}
}

if( $doMd5 == true ) {
	echo( date('Y-m-d H:i:s T') . " - performing MD5 checksum calculation.\n");
	for( $i=0; $i<count($assets_arr); $i++ ) {

		$asset_path = $assets_arr[$i]['path'];
		$asset_chunked = $assets_arr[$i]['chunked'];

		if (strpos($_SERVER['SERVER_NAME'], 'localhost') !== false || strpos($_SERVER['SERVER_NAME'], '172.16.85.92') !== false) {
			// test environment
			$asset_checksum_output = shell_exec("md5 -r " . escapeshellarg($asset_path));
	//		$asset_checksum = explode(" = ",$asset_checksum_output)[1];
		} else {
			// production environment
			$asset_checksum_output = shell_exec("md5sum " . escapeshellarg($asset_path));
		}
		$asset_checksum = explode(" ",$asset_checksum_output)[0];
		$assets_arr[$i]["checksum"] = $asset_checksum;
	}
	echo( date('Y-m-d H:i:s T') . " - MD5 checksum calculation complete.\n");
	//echo("phase 3 complete. checksums added:\n");
	//echo($assets_arr);
	//echo("\n");
} else {
	echo( date('Y-m-d H:i:s T') . " - MD5 checksum calculation not performed - no upload.\n");
}

//4. Add new data into data object

$stuff_obj = json_decode(json_encode($stuff_obj),true);
echo( date('Y-m-d H:i:s T') . " - Adding new data to manifest file.\n");
for( $i=0; $i<count($stuff_obj['assets']); $i++ ) {

	if( $doMd5 == true ) {
		for( $j=0; $j<count($assets_arr); $j++) {
			if( $assets_arr[$j]['filename'] == $stuff_obj['assets'][$i]['filename'] ) {
				$stuff_obj['assets'][$i]['md5_checksum'] = $assets_arr[$j]['checksum'];
			}

		}
	}
}


//5. Write manifest file with new data object

$newstuff = json_encode($stuff_obj);

//echo("final data payload:\n");
//echo($newstuff);
//echo("\n");

echo( date('Y-m-d H:i:s T') . " - Writing manifest file.\n");
$manifestfile = 'manifest.json';
$manifestfile_all = $storeFolder . $ds . $sessionFolderName . $ds . $manifestfile;
//file_put_contents($file_all, $stuff) or die ("unable to write manifest file.");
file_put_contents($manifestfile_all, $newstuff) or die ("unable to write manifest file.");
echo( date('Y-m-d H:i:s T') . " - Manifest file written.\n");

//Write readyfile
echo( date('Y-m-d H:i:s T') . " - Writing readyfile.\n");
$readyfile = 'ready';
$readyfile_all = $storeFolder . $ds . $sessionFolderName . $ds . $readyfile;
file_put_contents($readyfile_all, $targetType) or die ("unable to write readyfile.");
echo( date('Y-m-d H:i:s T') . " - Readyfile written.\n");

//Delete lockfile
echo( date('Y-m-d H:i:s T') . " - Deleting lockfile.\n");
$lockfile = $storeFolder . $ds . $sessionFolderName . $ds . "lockfile";
if (file_exists($lockfile)) {
        unlink($lockfile);
		echo( date('Y-m-d H:i:s T') . " - Lockfile deleted.\n");
    } else {
        // File not found.
    }

//print $stuff;
//print $sessionFolderName;

//session_unset('folderName');
//session_destroy();





//6. Force download of metadata file if this is a batch Wasabi upload
if( $targetType == "record" && $wasabiUploadType == "batch") {
	echo( date('Y-m-d H:i:s T') . " - Creating metadata file to download.\n");

	$targetAsset = $stuff_obj['assets'][0]['filename'];
	$catalogNum = $stuff_obj['target']['number'];
	$catalogNumDash = str_replace('.','-',$catalogNum);
	$newFileName = $targetAsset . '--' . $catalogNumDash . '.json';
	
	//Write metafile
	$metafile = $newFileName;
	$metafile_all = $storeFolder . $ds . $sessionFolderName . $ds . $metafile;
	file_put_contents($metafile_all, $newstuff) or die ("unable to write metafile.");
//	echo $metafile_all;
	echo( date('Y-m-d H:i:s T') . " - Metadata file written: ". $metafile_all . "\n");
	
	
	
	
	
}

echo( date('Y-m-d H:i:s T') . " - Finalize process complete.\n");








?>
