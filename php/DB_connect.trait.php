<?php
trait DB_connect {
	
	private static function db_connect()
	{
		$host     = 'localhost';
		$login    = 'root';
		$password = '290980';
		$db_name  = 'ang-rest1';

		$options = [
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
		    // PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
		];

	    $db = new PDO('mysql:host='.$host.';dbname='.$db_name, $login, $password, $options);
	    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		return $db;
	}

	// стандартизированная обработка данных из форм (POST-параметров из форм и GET-параметров из адресной строки)
	public static function clear_data($data, $type="s")
	{
		switch ($type)
		{
			case 's':
				$data = trim($data);
				$data = strip_tags($data);
				$data = htmlspecialchars($data);
				$data = preg_replace('/\s+/', ' ',  $data);
				if (get_magic_quotes_gpc()) {
             		$data = stripslashes($data);
				}
				return $data;	// если тип переменной - строка (по умолчанию)
			case 'i':	return abs( (int) $data);							// если тип переменной - целое число
		}
	}

	// отладочный вывод информации
	public static function showDev($value = '')
	{
		echo '<pre>';
		print_r($value);
		echo '</pre>';
	}

	public static function isAuth()
	{
		$db = self::db_connect();
					
		$q = "SELECT `current` FROM auth WHERE id > 0";
		$query = $db->prepare($q);
		$query->execute();
		$res = $query->fetchAll();

		return (count($res)) ? true : false;
	}

	public static function logoutUser()
	{
		$db = self::db_connect();
					
		$q = "DELETE FROM auth";
		$query = $db->prepare($q);
		
		return $query->execute();
	}
}




