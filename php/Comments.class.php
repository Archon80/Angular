<?php
class Comments {
    
	use DB_connect;

	// получение всех комментариев
	public static function getAllComments($id)
	{
		// self::showDev($arrPost); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];
		// self::showDev($arrUser);exit;

		try {
			// проверяем входной параметр
			if(!isset($id)) {
				$answer["status"] = "no_id_post";
				throw new PDOException('В функцию getAllComments не пришел параметр идентификатор поста. Поэтому нельзя получить все комменратии к этому посту.');
			}
			
			$id_post = self::clear_data($id, 'i');

			// подключаемся
			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			// формируем запрос
			$q = 	"SELECT comments.id_comment, comments.author, comments.email, comments.message, comments.id_post, posts.id_post
					FROM comments, posts
					WHERE comments.id_post = posts.id_post
					AND posts.`id_post`=$id_post";
			// self::showDev($q); exit();

			// выполняем запрос
			$query = $db->prepare($q);
			$query->execute();
			$res = $query->fetchAll();

			$answer["status"] = 'ok';
			$answer["data"]   = $res;
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	} // getAllComments

	// добавление комментария
	public static function addComment($arrComment)
	{
		// self::showDev($arrPost); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];
		// self::showDev($arrUser);exit;

		try {
			// проверяем входной параметр
			if(!isset($arrComment)) {
				$answer["status"] = "no_data";
				throw new PDOException('В функцию addComment не пришел параметр arrComment.');
			}
			if( getType($arrComment) !== 'array') {
				$answer["status"] = "not_array";
				throw new PDOException('В функцию addComment в качестве параметра arrComment пришел не массив.');
			}
			// проверяем идентификатор пользователя
			if( !isset($arrComment['id_post']) || strlen($arrComment['id_post']) < 1 ) {
				$answer["status"] = "no_id_post";
				throw new PDOException("В функции addComment в массиве arrPost отсутствует поле 'id_user'.");
			}

			if( getType($arrComment['id_post']) !== 'string' ) {
				$answer["status"] = "no_string_type_of_id_post";
				throw new PDOException("В функцию addComment по ключу id_post пришла не строка.");
			}

			// проверяем имя автора комментария
			if(!isset($arrComment['comment']['author'])) {
				$answer["status"] = "no_author";
				throw new PDOException("Необходимо заполнить поле 'Автор'.");
			}
			if( strlen($arrComment['comment']['author']) < 2 ) {
				$answer["status"] = "too_short_author";
				throw new PDOException("Слишком короткое имя автора (должно быть не менее двух символов)");
			}
			if( strlen($arrComment['comment']['author']) > 30 ) {
				$answer["status"] = "too_long_author";
				throw new PDOException("Слишком длинное имя автора (должно быть не более 30 символов");
			}

			// проверяем почту автора комменатария
			if(!isset($arrComment['comment']['email'])) {
				throw new PDOException("Необходимо ввести почтовый адрес.");
			}
			if( !self::emailValidation($arrComment['comment']['email']) ) {
				$answer["status"] = "not_valid_email";
				throw new PDOException("Некорректный почтовый адрес.");
			}
			if( strlen($arrComment['comment']['email']) > 30 ) {
				$answer["status"] = "too_long_email";
				throw new PDOException("Слишком длинный почтовый адрес (должен быть не более 30 символов");
			}

			// проверяем текст комментария
			if(!isset($arrComment['comment']['message'])) {
				$answer["status"] = "no_message";
				throw new PDOException("Необходимо заполнить поле'сообщение'.");
			}
			if( strlen($arrComment['comment']['message']) < 2 ) {
				$answer["status"] = "too_short_message";
				throw new PDOException("Слишком короткое сообщение (должно быть не менее двух символов)");
			}
			if( strlen($arrComment['comment']['message']) > 1000 ) {
				$answer["status"] = "too_long_message";
				throw new PDOException("Слишком длинное сообщение (должно быть не более 1000 символов");
			}
			
			$author  = self::clear_data($arrComment['comment']['author'], 's');
			$email   = self::clear_data($arrComment['comment']['email'],  's');
			$message = self::clear_data($arrComment['comment']['message'],'s');
			$id_post = self::clear_data($arrComment['id_post'],'i');

			// подключаемся
			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			$q = "INSERT INTO comments(`author`, `email`, `message`, `id_post`)
				VALUES (\"$author\", \"$email\", \"$message\", \"$id_post\")";

			// self::showDev($q); exit();

			// выполняем запрос
			$query = $db->prepare($q);
			$query->execute();

			$answer["status"] = 'ok';
			$answer["data"]   = intval($db->lastInsertId());
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	} // addComment

	// удаление комментария
	public static function deleteComment($id_comment)
	{
		// self::showDev($id); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];

		try {
			if(!isset($id_comment)) {
				$answer["status"] = "no_id_comment";
				throw new PDOException('В функцию deleteComment не пришел параметр id_comment.');
			}
			// проверка прав на бекенде
			if(!self::isAuth()) {
				$answer["status"] = "not_auth";
				throw new PDOException('Неавторизированный пользователь не может удалять комментарии');
			}

			$id_comment = self::clear_data($id_comment, 'i');

			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			$q = "DELETE FROM comments WHERE id_comment=$id_comment";
				// self::showDev($q);exit;
			$query = $db->prepare($q);
			$res = $query->execute();

			$answer["status"] = 'ok';
			$answer["data"]   = $res;
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	}

	public static function emailValidation($email)
	{
	    if(preg_match("/[0-9a-z_\.\-]+@[0-9a-z_\.\-]+\.[a-z]{2,4}/i", $email))
	    {
	        return true;
	    }
	}
}