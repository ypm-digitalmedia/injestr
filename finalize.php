<?php
$ds          = DIRECTORY_SEPARATOR;  //1
 
$storeFolder = 'uploads';   //2

$sessionFolderName = $_POST['folderName'];
$targetType = $_POST['type'];

if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
}

//Write manifest file
$stuff = urldecode($_POST['data']);

$file = 'manifest.json';
$file_all = $storeFolder . $ds . $sessionFolderName . $ds . $file;
file_put_contents($file_all, $stuff) or die ("unable to write manifest file.");

//Write readyfile
$readyfile = 'ready';
$readyfile_all = $storeFolder . $ds . $sessionFolderName . $ds . $readyfile;
file_put_contents($readyfile_all, $targetType) or die ("unable to write readyfile.");

//Delete lockfile
$lockfile = $storeFolder . $ds . $sessionFolderName . $ds . "lockfile";
if (file_exists($lockfile)) {
        unlink($lockfile);
    } else {
        // File not found.
    }

//print $stuff;
print $sessionFolderName;

//session_unset('folderName');
//session_destroy();

?>
