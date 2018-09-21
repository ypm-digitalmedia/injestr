<?php
	$headers = apache_request_headers();
	
	$default_cas_username = "admin";

	foreach ($headers as $header => $value) {
		#echo "$header: $value <br />\n";
	}

	$hostname = $_SERVER['HTTP_HOST'];

	if( $hostname == "10.5.33.98" ) {
		
		$logoutUrl = "https://secure.its.yale.edu/cas/logout";
		
		// get entire cookie string
		$cookie = $_SERVER['HTTP_COOKIE'];

		// separate cookie values into array
		$cookie_val = explode(";",$cookie);

		// take first cookie value only
		$cookie_first = $cookie_val[0];

		// get value of first cookie
		$cookie_first = explode("=",$cookie_first);
		$cookie_key_first = $cookie_first[0];
		$cookie_val_first = $cookie_first[1];

		if( $cookie_key_first == "MOD_AUTH_CAS") {

			// find corresponding cookie file
			$cookie_file = "../../../cache/httpd/mod_auth_cas/".$cookie_val_first;

			if( file_exists($cookie_file)) { 
				$get = file_get_contents($cookie_file);
				$arr = simplexml_load_string($get);
				#print_r($arr);

				// get username    
				$cas_username = (string) $arr->user[0];
				#$cas_username = $arr['user'];

			} else {
				#header("Location : bad_cas.php");
				$cas_username = $default_cas_username;
			}
		} else {
			#header("Location : bad_cas.php");
			$cas_username = $default_cas_username;
		}

	} else {
		$cas_username = $default_cas_username;
		$logoutUrl = "javascript:location.reload()";
	}


?>
