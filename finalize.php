<?php
$ds          = DIRECTORY_SEPARATOR;  //1
 
$storeFolder = 'uploads';   //2

$sessionFolderName = $_POST['folderName'];

if (!file_exists($storeFolder . $ds . $sessionFolderName )) {
    mkdir($storeFolder . $ds . $sessionFolderName, 0777, true);
}

//Write manifest file
$stuff = $_POST['data'];

$file = 'manifest.json';
$file_all = $storeFolder . $ds . $sessionFolderName . $ds . $file;
file_put_contents($file_all, $stuff) or die ("unable to write manifest file.");

//Write lockfile
$lockfile = 'ready';
$lockfile_all = $storeFolder . $ds . $sessionFolderName . $ds . $lockfile;
file_put_contents($lockfile_all, "") or die ("unable to write lockfile.");

//print $stuff;
print $sessionFolderName;

?>
