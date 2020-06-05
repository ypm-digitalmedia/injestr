<?php







function getGUID(){
    //mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
	$charid = strtolower(md5(uniqid(rand(), true)));
	$hyphen = chr(45);// "-"
	$uuid = substr($charid, 0, 8).$hyphen
		.substr($charid, 8, 4).$hyphen
		.substr($charid,12, 4).$hyphen
		.substr($charid,16, 4).$hyphen
		.substr($charid,20,12);
	return $uuid;
}





function file_get_contents_curl( $url ) {

	$ch = curl_init();
  
	curl_setopt( $ch, CURLOPT_AUTOREFERER, TRUE );
	curl_setopt( $ch, CURLOPT_HEADER, 0 );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt( $ch, CURLOPT_URL, $url );
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, TRUE );
  
	$data = curl_exec( $ch );
	curl_close( $ch );
  
	return $data;
  
  }







?>
