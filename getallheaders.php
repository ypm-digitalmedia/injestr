<?php
include_once "hosts.php";
echo "all headers: <br />";
$headers = apache_request_headers();

foreach ($headers as $header => $value) {
    echo "$header: $value <br />\n";
}
echo "<br /><br /><br />";

$hostname = $_SERVER['HTTP_HOST'];

if( in_array($hostname,$knownHosts) ) {
// if( $hostname == "10.5.33.98" ) {

    // get entire cookie string
    $cookie = $_SERVER['HTTP_COOKIE'];
    echo "entire cookie as string: <br />";
    echo $cookie;

    // separate cookie values into array
    $cookie_val = explode(";",$cookie);
    echo "<br /><br /><br />cookie value:<br />";
    echo print_r($cookie_val);

    // take first cookie value only
    $cookie_first = $cookie_val[0];
    echo "<br /><br /><br />first cookie value only (multiples occur):<br />";
    echo $cookie_first;

    // get value of first cookie
    $cookie_first = explode("=",$cookie_first);
    $cookie_key_first = $cookie_first[0];
    $cookie_val_first = $cookie_first[1];

    if( $cookie_key_first == "MOD_AUTH_CAS") {

        echo "<br /><br /><br />value of first cookie: <br />";
        echo $cookie_val_first;
        echo "<br /><br /><br />corresponding cookie file: <br />";

        // find corresponding cookie file
        $cookie_file = "../../../cache/httpd/mod_auth_cas/".$cookie_val_first;

        if( file_exists($cookie_file)) { 
            $get = file_get_contents($cookie_file);
            $arr = simplexml_load_string($get);
            print_r($arr);
    
            // get username
            echo "<br /><br /><br />user name from XML:<br />";
    
            $cas_username = (string) $arr->user[0];
            #$cas_username = $arr['user'];
            echo $cas_username;

        } else {
            #header("Location : bad_cas.php");
            echo "<br />BAD CAS LOGIN<br />";
            $cas_username = "am2946";
        }
    } else {
        #header("Location : bad_cas.php");
        echo "<br />BAD COOKIE FILE<br />";
        $cas_username = "am2946";
    }

} else {
    $cas_username = "am2946";
}


?>

