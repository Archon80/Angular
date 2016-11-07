<?php
/*
	АПИ сервера.
	Принимает данные с клиента, анализирует их, назначает соотв. обработчик.
*/
class API {

	//  раскодирование символов Unicode в PHP 
	public static function decodeUnicode($value)
	{
		$s = preg_replace('/\\\u0([0-9a-fA-F]{3})/','&#x\1;', $value);
		$s = html_entity_decode($s, ENT_NOQUOTES,'UTF-8');
		
		return $s;
	}

	// только для отладки
	public static function showDev($value)
	{
		echo '<pre>';
		print_r($value);
		echo '</pre>';
	}

	// функция ищет определенные параметры, и назначает им соотв. обработчики класса для работы с БД
	public static function listener($params)
	{
		switch($params['operation']) {
			case "addComment": 		return Comments::addComment($params['data']);
			case "addPost": 		return Posts::addPost($params['data']);
			case "editPost": 		return Posts::editPost($params['data']);
			case "deleteComment": 	return Comments::deleteComment($params['data']);
			case "deletePost": 		return Posts::deletePost($params['data']);
			case "getAllPosts": 	return Posts::getAll();
			case "getAllComments": 	return Comments::getAllComments($params['data']);
			case "getAllUserPosts": return Users::getAllUserPosts($params['data']);
			case "getAllUsers": 	return Users::getAllUsers();
			case "getPost": 		return Posts::getOnePost($params['data']);
			case "IsUserExists": 	return true;
			case "loginUser": 		return Users::loginUser($params['data']);
			case "logoutUser": 		return Users::logoutUser();
			case "signNewUser": 	return Users::signupNewUser($params['data']);
			default: 				return "Unknown params";
		}
	}
}
