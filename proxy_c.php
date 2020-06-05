<?php
$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if(!$url) exit;


$referer = (isset($_SERVER['HTTP_REFERER'])) ? strtolower($_SERVER['HTTP_REFERER']) : false;
$is_allowed = $referer && strpos($referer, strtolower($_SERVER['SERVER_NAME'])) !== false; //deny abuse of your proxy from outside your site

$ch = curl_init();

curl_setopt( $ch, CURLOPT_AUTOREFERER, TRUE );
curl_setopt( $ch, CURLOPT_HEADER, 0 );
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
curl_setopt( $ch, CURLOPT_URL, $url );
curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, TRUE );

$msdata = curl_exec( $ch );
curl_close( $ch );

$string = ($is_allowed) ? $msdata : 'You are not allowed to use this proxy!';

$json = json_encode($string);
$callback = (isset($_GET['callback'])) ? $_GET['callback'] : false;
if($callback){
	$jsonp = "$callback($json)";
	header('Content-Type: application/javascript');
	echo $jsonp;
	exit;
}
echo $json;
