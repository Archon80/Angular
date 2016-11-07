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
			"status" => "",
			"data"  => ""
		];
		// self::showDev($arrUser);exit;

		try {
			// проверяем входной параметр
			if(!isset($arrUser)) {
				$answer["status"] = "no_data";
				throw new PDOException('В функцию signupNewUser не пришел параметр arrUser.');
			}
			if( getType($arrUser) !== 'array') {
				$answer["status"] = "not_array";
				throw new PDOException('В функцию signupNewUser в качестве параметра arrUser пришел не массив.');
			}
			// проверяем имя пользователя
			if(!isset($arrUser['name'])) {
				$answer["status"] = "no_user_name";
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['name'].");
			}
			if( strlen($arrUser['name']) < 2 ) {
				$answer["status"] = "too_short_user_name";
				throw new PDOException("Слишком короткое имя. Длина имени должна быть не менее двух символов");
			}
			if( strlen($arrUser['name']) > 30 ) {
				$answer["status"] = "too_long_user_name";
				throw new PDOException("Слишком длинное имя. Длина имени не должна превышать 30 символов");
			}
			// проверяем почту пользователя
			if(!isset($arrUser['email'])) {
				$answer["status"] = "no_user_email";
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['email'].");
			}
			if( !self::emailValidation($arrUser['email']) ) {
				$answer["status"] = "not_valid_user_email";
				throw new PDOException("Некорректный почтовый адрес.");
			}
			if( strlen($arrUser['email']) < 6 ) {
				$answer["status"] = "too_short_user_email";
				throw new PDOException("Слишком короткий почтовый адрес. Длина почтового адреса должна быть не менее 6 символов");
			}
			if( strlen($arrUser['email']) > 30 ) {
				$answer["status"] = "too_long_user_email";
				throw new PDOException("Слишком длинный почтовый адрес. Длина почтового адреса не должна превышать 30 символов");
			}
			// проверяем пароль пользователя
			if(!isset($arrUser['password'])) {
				$answer["status"] = "no_user_password";
				throw new PDOException("В функции signupNewUser в массиве arrUser отсутствует поле arrUser['password'].");
			}
			if( strlen($arrUser['password']) < 6 ) {
				$answer["status"] = "too_short_user_password";
				throw new PDOException("Слишком короткий пароль. Длина пароля должна быть не менее 6 символов");
			}
			if( strlen($arrUser['password']) > 30 ) {
				$answer["status"] = "too_long_user_password";
				throw new PDOException("Слишком длинный пароль. Длина пароля не должна превышать 30 символов");
			}
			// согласия с правилами
			if(!isset($arrUser['agreed'])) {
				$answer["status"] = "no_user_agreed";
				throw new PDOException("Необходимо прочитать правила поведения на форуме и согласиться с ними.");
			}

			$name      = self::clear_data($arrUser['name'],     's');
			$email     = self::clear_data($arrUser['email'],    's');
			$password  = self::clear_data($arrUser['password'], 's');
			$password2 = self::clear_data($arrUser['password2'],'s');

			if( $password !== $password2 ) {
				$answer["status"] = "different_passwords";
				throw new PDOException("Введенные пароли не совпадают.");
			}

			if(self::checkNewUserName($name)) {
				$answer["status"] = "already_name";
				throw new PDOException("Пользователь с таким именем уже существует");
			}
			if(self::checkNewUserEmail($email)) {
				$answer["status"] = "already_email";
				throw new PDOException("Пользователь с такой почтой уже существует");
			}

			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			$q = "INSERT INTO users(`name`, `email`, `password`)
					VALUES (\"$name\", \"$email\", \"$password\")";
			// self::showDev($q); exit();
			$query = $db->prepare($q);
			$query->execute();

			$answer["status"] = "ok";
			$answer["data"]   = intval($db->lastInsertId());
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	}

	public static function loginUser($arrUser)
	{
		$answer = [
			"status" => "",
			"data"  => ""
		];

		try {
			// проверяем входной параметр
			if(!isset($arrUser)) {
				$answer["status"] = "no_data";
				throw new PDOException('В функцию loginNewUser не пришел параметр arrUser.');
			}
			if( getType($arrUser) !== 'array') {
				$answer["status"] = "not_array";
				throw new PDOException('В функцию loginNewUser в качестве параметра arrUser пришел не массив.');
			}
			// проверяем имя пользователя
			if(!isset($arrUser['name'])) {
				$answer["status"] = "no_user_name";
				throw new PDOException("В функции loginNewUser в массиве arrUser отсутствует поле arrUser['name'].");
			}
			if( strlen($arrUser['name']) < 2 ) {
				$answer["status"] = "too_short_user_name";
				throw new PDOException("Слишком короткое имя. Длина имени должна быть не менее двух символов");
			}
			if( strlen($arrUser['name']) > 30 ) {
				$answer["status"] = "too_long_user_name";
				throw new PDOException("Слишком длинное имя. Длина имени не должна превышать 30 символов");
			}
			// проверяем пароль пользователя
			if(!isset($arrUser['password'])) {
				$answer["status"] = "no_user_password";
				throw new PDOException("В функции loginNewUser в массиве arrUser отсутствует поле arrUser['password'].");
			}
			if( strlen($arrUser['password']) < 6 ) {
				$answer["status"] = "too_short_user_password";
				throw new PDOException("Слишком короткий пароль. Длина пароля должна быть не менее 6 символов");
			}
			if( strlen($arrUser['password']) > 30 ) {
				$answer["status"] = "too_long_user_password";
				throw new PDOException("Слишком длинный пароль. Длина пароля не должна превышать 30 символов");
			}

			$name     = self::clear_data($arrUser['name'],    's');
			$password = self::clear_data($arrUser['password'],'s');

			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			$q = "SELECT * FROM `users` WHERE `name`=\"$name\" AND `password`=\"$password\"";

			$query = $db->prepare($q);
			$query->execute();

			$res = $query->fetchAll();

			if(count($res)) {
				// Добавить сюда авторизацию
				$r = "INSERT INTO auth(`current`) VALUES (\"yes\")";
				$query = $db->prepare($r);

				if($query->execute()) {
					$answer["status"] = 'ok';
					$answer["data"]   = $res;
				}
				else {
					$answer["status"] = "no_auth_on_back";
					throw new PDOException("Техническая ошибка при авторизации клиента на сервере");
				}
			}
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
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

	public static function emailValidation($email)
	{
	    if(preg_match("/[0-9a-z_\.\-]+@[0-9a-z_\.\-]+\.[a-z]{2,4}/i", $email))
	    {
	        return true;
	    }
	}
}