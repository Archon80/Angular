<?php  

// только для отладки
ini_set('display_errors','On');
ini_set('error_reporting', E_ALL | E_STRICT);
ini_set("display_startup_errors","1");
error_reporting(E_ALL | E_STRICT);


header("Content-Type: text/html; charset=utf-8");

$params = json_decode(trim(file_get_contents('php://input')), true);

require_once __DIR__.'/DB_connect.trait.php';
require_once __DIR__.'/Comments.class.php';
require_once __DIR__.'/Posts.class.php';
require_once __DIR__.'/Users.class.php';
require_once __DIR__.'/API.class.php';

echo API::decodeUnicode(json_encode(API::listener($params)));