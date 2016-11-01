<?php
class Users {
    
	use DB_connect;

	// получаем всех пользователей
	public static function getAllUsers()
	{
		$db = self::db_connect();

		$q =   "SELECT * FROM users";

		$query = $db->prepare($q);
		$query->execute();

		$answer = $query->fetchAll();

		$res = [];
		for($i = 0; $i < count($answer); $i++) {
			array_unshift($res, $answer[$i]);
		}
		return $res;

	}

	public static function getAllUserPosts($id)
	{
		$db = self::db_connect();

		$id_user = self::clear_data($id, 'i');

		$q =   "SELECT * FROM posts WHERE id_user=$id_user";
		// self::showDev($q);exit;

		$query = $db->prepare($q);
		$query->execute();

		$answer = $query->fetchAll();

		return count($answer);
	}

	public static function signupNewUser($arrUser)
	{
		$answer = [
			"success" => false,
			"body"    => '',
			"error"   => ''
		];

		try {
			if(!isset($arrUser)) {
				throw new PDOException('В функцию signupNewUser не пришел параметр arrUser.');
			}
			if(!isset($arrUser['name'])) {
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['name'].");
			}
			if(!isset($arrUser['email'])) {
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['email'].");
			}
			if(!isset($arrUser['password'])) {
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['password'].");
			}

			$name     = self::clear_data($arrUser['name'],    's');
			$email    = self::clear_data($arrUser['email'],   's');
			$password = self::clear_data($arrUser['password'],'s');

			if(self::checkNewUserName($name)) {
				$answer["success"] = false;
				$answer["body"]    = 'Пользователь с таким именем уже существует';
			}
			else if(self::checkNewUserEmail($email)) {
				$answer["success"] = false;
				$answer["body"]    = 'Пользователь с такой почтой уже существует';
			}
			else {
				$db = self::db_connect();

				$q = "INSERT INTO users(`name`, `email`, `password`)
						VALUES (\"$name\", \"$email\", \"$password\")";

				// self::showDev($q);
				// exit();

				$query = $db->prepare($q);
				$query->execute();

				$answer["success"] = true;
				$answer["body"]    = intval($db->lastInsertId());
			}			

		}  
		catch(PDOException $e) {  
			$answer["error"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	}

	public static function loginUser($arrUser)
	{
		$answer = [
			"success" => false,
			"body"    => '',
			"error"   => ''
		];

		try {
			if(!isset($arrUser)) {
				throw new PDOException('В функцию loginNewUser не пришел параметр arrUser.');
			}
			if(!isset($arrUser['name'])) {
				throw new PDOException("В функции loginNewUser в массиве arrUser отсутствует поле arrUser['name'].");
			}
			if(!isset($arrUser['password'])) {
				throw new PDOException("В функции loginNewUser в массиве arrUser отсутствует поле arrUser['password'].");
			}

			$name  = self::clear_data($arrUser['name'], 's');
			$password = self::clear_data($arrUser['password'],'s');

			$db = self::db_connect();

			$q = "SELECT * FROM `users` WHERE `name`=\"$name\" AND `password`=\"$password\"";

			$query = $db->prepare($q);
			$query->execute();

			$answer = $query->fetchAll();

			if(count($answer)) {
				$answer["success"] = true;
				$answer["body"]    = $answer;
			}
		}  
		catch(PDOException $e) {  
			$answer["error"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	}

	/******************************************************************************/

	public static function checkNewUserName($name)
	{
		$db = self::db_connect();

		$q = "SELECT * FROM `users` WHERE `name`=\"$name\"";

		$query = $db->prepare($q);
		$query->execute();

		$answer = $query->fetchAll();

		return count($answer);
	}

	public static function checkNewUserEmail($email)
	{
		$db = self::db_connect();

		$q = "SELECT * FROM `users` WHERE `email`=\"$email\"";

		$query = $db->prepare($q);
		$query->execute();

		$answer = $query->fetchAll();

		return count($answer);
	}
}