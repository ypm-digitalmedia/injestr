<?php

$ds          = DIRECTORY_SEPARATOR;
$storeFolder = 'uploads';
$sessionFolderName = $_POST['folderName'];
$targetType = $_POST['type'];
$targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds . $sessionFolderName . $ds;


$stuff = urldecode($_POST['data']);
$stuff_obj = json_decode($stuff);

//1. Parse manifest data & write assets to array
$assets = $stuff_obj->assets;
$assets_arr = array();

foreach( $assets as $a ) {
	$asset_path = $targetPath . $a->filename;
	$asset_chunked = $a->chunked;
	$aaa = array("filename"=>$a->filename,"path"=>$asset_path,"chunked"=>$asset_chunked);
	array_push($assets_arr, $aaa);
}
print_r("phase 1 complete. parsed manifest data:\n");
print_r($assets_arr);
print_r("\n");

//2. Iterate through assets
//Check if chunked or not, cat files with unix shell exec and move to guid folder
for( $i=0; $i<count($assets_arr); $i++ ) {
	
	$asset_path = $assets_arr[$i]['path'];
	$asset_filename = $assets_arr[$i]['filename'];
	$asset_chunked = $assets_arr[$i]['chunked'];
	
	if( $asset_chunked ) {
		print_r("CHUNKED FILE: " . $assets_arr[$i]['path'] . ": Merging chunks.\n");
		
		$catStatement = "cat " . escapeshellarg($asset_path . $ds) . "chunk* >> " . escapeshellarg($targetPath . "_" . $asset_filename);
//		print_r("\n\n" . $catStatement . "\n");
		shell_exec($catStatement);
		
		$deleteFolderStatement = "rm -rf " . escapeshellarg($asset_path);
//		print_r($deleteFolderStatement . "\n");
		shell_exec($deleteFolderStatement);
		
		$renameNewFileStatement = "mv " . escapeshellarg($targetPath . "_" . $asset_filename) . " " . escapeshellarg($asset_path);
//		print_r($renameNewFileStatement . "\n\n");
		shell_exec($renameNewFileStatement);
		
	} else {
		print_r("SINGLE FILE: " . $assets_arr[$i]['path'] . ": Skipping chunk merge.\n");
	}	
}
print_r("phase 2 complete.  chunked files merged and copied.\n");
print_r("\n");


//3. Iterate through assets again
//Run MD5 checksum on whole files
for( $i=0; $i<count($assets_arr); $i++ ) {
	
	$asset_path = $assets_arr[$i]['path'];
	$asset_chunked = $assets_arr[$i]['chunked'];
	
	if (strpos($_SERVER['SERVER_NAME'], 'localhost') !== false || strpos($_SERVER['SERVER_NAME'], '172.16.85.92') !== false) {
		$asset_checksum_output = shell_exec("md5 " . escapeshellarg($asset_path));
		$asset_checksum = explode(" = ",$asset_checksum_output)[1];
	} else {
		$asset_checksum_output = shell_exec("md5sum " . escapeshellarg($asset_path));
		$asset_checksum = explode(" ",$asset_checksum_output)[0];
	}
	$assets_arr[$i]["checksum"] = $asset_checksum;
}
print_r("phase 3 complete. checksums added:\n");
print_r($assets_arr);
print_r("\n");


$newstuff = json_encode($stuff_obj);

print_r("final data payload:\n");
print_r($newstuff);
print_r("\n");



?>
