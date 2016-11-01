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
			case 's':	return trim(htmlspecialchars(strip_tags($data)));	// если тип переменной - строка (по умолчанию)
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
}