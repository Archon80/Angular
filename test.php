<?php
	function db_connect()
	{
		$host     = 'localhost';
		$login    = 'root';
		$password = '290980';
		$db_name  = 'ang-rest1';

		$options = [
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
		    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
		];

	    $db = new PDO('mysql:host='.$host.';dbname='.$db_name, $login, $password, $options);
	    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		return $db;
	}

	function getAll()
	{
		$db = db_connect();

		$q =   "SELECT posts.id_post, posts.title, posts.message, posts.tags, users.id_user, users.name, users.email
				FROM posts, users 
				WHERE posts.id_user = users.id_user";

		$query = $db->prepare($q);
		$query->execute();

		return $query->fetchAll();
	}

	function showDev($value = '')
	{
		echo '<pre>';
		print_r($value);
		echo '</pre>';
	}

	$all = getAll();
	/*
	if( strlen($res[$i]['message']) > 200 ) {
				$res[$i]['message'] = substr($res[$i]['message'], 0, 190) . ' ...';
			}
			*/

	// showDev($all);

	$word = '11111111111111111111111111';

	if( strlen($word) > 5 ) {
		$word = substr($word, 0, 4) . ' ...';
	}

	echo $word;

?>
<html>




</html>