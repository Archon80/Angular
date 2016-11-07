<?php
class Posts {
    
	use DB_connect;

	// получаем все посты
	public static function getAll()
	{
		
		$db = self::db_connect();

		/*$q =   "SELECT posts.id_post, posts.title, posts.message, users.id_user, users.name, users.email
				FROM posts LEFT JOIN users 
				USING (id_user)";*/

		$q =   "SELECT posts.id_post, posts.title, posts.message, posts.tags, users.id_user, users.name, users.email
				FROM posts, users 
				WHERE posts.id_user = users.id_user";

		$query = $db->prepare($q);
		$query->execute();

		$res = $query->fetchAll();


		// обрезаем статьи, т.к. выводим лишь привью
		$l = count($res);
		for ($i=0; $i < $l; $i++) { 
			if( mb_strlen($res[$i]['message'], 'UTF-8') > 100 ) {
				$res[$i]['message'] = substr($res[$i]['message'], 0, 99) . '...';
			}
		}

		$temp = [];
		for ($i=0, $j = count($res) - 1; $i < count($res); $i++,$j--) { 
			$temp[$j] = $res[$i];
		}
		return $temp;
	}

	// получаем отдельный пост по его айдишнику
	public static function getOnePost($id_post)
	{
		// self::showDev($id_post); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];

		try {
			if(!isset($id_post)) {
				$answer["status"] = "no_id_post";
				throw new PDOException('В функцию getOnePost не пришел параметр id_post.');
			}

			$id_post = self::clear_data($id_post, 'i');

			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}
		
			$q = "SELECT message FROM posts WHERE id_post=$id_post";
			$query = $db->prepare($q);
			$query->execute();
			$res = $query->fetchAll();
			
			// self::showDev(count($res)); exit();
			if(count($res) < 1) {
				throw new PDOException("Техническая ошибка базы данных. Не удалось получить пост по его идентификатору (".$id_post.")");
			}

			$answer["status"] = 'ok';
			$answer["data"]   = $res[0];
		}  
		catch(PDOException $e) {  
			$answer["data"] = $e->getMessage();
		}
		finally {
			return $answer;
		}
	}
	// добавляем пост
	public static function addPost($arrPost)
	{
		// self::showDev($arrPost); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];
		// self::showDev($arrUser);exit;

		try {
			// проверяем входной параметр
			if(!isset($arrPost)) {
				$answer["status"] = "no_data";
				throw new PDOException('В функцию addPost не пришел параметр arrPost.');
			}
			if( getType($arrPost) !== 'array') {
				$answer["status"] = "not_array";
				throw new PDOException('В функцию addPost в качестве параметра arrPost пришел не массив.');
			}
			// проверка прав на бекенде
			if(!self::isAuth()) {
				$answer["status"] = "not_auth";
				throw new PDOException('Неавторизированный пользователь не может добавлять комментарии');
			}
			// проверяем заголовок поста
			if(!isset($arrPost['post']['title'])) {
				$answer["status"] = "no_title";
				throw new PDOException("В функции addPost в массиве arrPost отсутствует поле 'title'.");
			}
			if( mb_strlen($arrPost['post']['title'], 'UTF-8') < 2 ) {
				$answer["status"] = "too_short_title";
				throw new PDOException("Слишком короткий заголовок. Длина заголовка должна быть не менее двух символов");
			}
			if( mb_strlen($arrPost['post']['title'], 'UTF-8') > 100 ) {
				$answer["status"] = "too_long_title";
				throw new PDOException("Слишком длинный заголовок. Длина заголовка не должна превышать 100 символов");
			}
			// проверяем тело поста
			if(!isset($arrPost['post']['message'])) {
				$answer["status"] = "no_message";
				throw new PDOException("В функции addPost в массиве arrPost отсутствует поле 'message'.");
			}
			if( mb_strlen($arrPost['post']['message'], 'UTF-8') < 2 ) {
				$answer["status"] = "too_short_message";
				throw new PDOException("Слишком короткое сообщение. Длина сообщения должна быть не менее двух символов");
			}
			if( mb_strlen($arrPost['post']['message'], 'UTF-8') > 1000 ) {
				$answer["status"] = "too_long_message";
				throw new PDOException("Слишком длинное сообщение. Длина сообщения не должна превышать 1000 символов");
			}
			// проверяем теги
			if(!isset($arrPost['post']['tags'])) {
				$arrPost['post']['tags'] = '';
			}
			if( isset($arrPost['post']['tags']) && $arrPost['post']['tags'] !== '' ) {

				if( mb_strlen($arrPost['post']['tags'], 'UTF-8') < 2 ) {
					$answer["status"] = "too_short_tags";
					throw new PDOException("Слишком короткий тег. Длина тега должна быть не менее двух символов");
				}
				if( mb_strlen($arrPost['post']['tags'], 'UTF-8') > 50 ) {
					$answer["status"] = "too_long_tags";
					throw new PDOException("Слишком длинный тег. Длина тега не должна превышать 50 символов");
				}

			}
			// проверяем идентификатор пользователя
			if( !isset($arrPost['id_user']) || mb_strlen($arrPost['id_user'], 'UTF-8') < 1 ) {
				$answer["status"] = "no_id_user";
				throw new PDOException("В функции addPost в массиве arrPost отсутствует поле 'id_user'.");
			}

			// обрабатываем полученые переменные
			$title 	 = self::clear_data($arrPost['post']['title'],  's');
			$message = self::clear_data($arrPost['post']['message'],'s');
			$tags    = ($arrPost['post']['tags'] !== '') ? self::clear_data($arrPost['post']['tags'],'s') : '';
			$id_user = self::clear_data($arrPost['id_user'],'i');

			// подключаемся
			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			// формируем запрос
			$q = "INSERT INTO posts(`title`, `message`, `tags`, `id_user`)
				  VALUES (\"$title\", \"$message\", \"$tags\", \"$id_user\")";
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
	} // addPost


	// редактируем пост
	public static function editPost($arrPost)
	{
		// self::showDev($arrPost); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];

		try {
			// проверяем входной параметр
			if(!isset($arrPost)) {
				$answer["status"] = "no_data";
				throw new PDOException('В функцию editPost не пришел параметр arrPost.');
			}
			if( getType($arrPost) !== 'array') {
				$answer["status"] = "not_array";
				throw new PDOException('В функцию editPost в качестве параметра arrPost пришел не массив.');
			}
			// проверка прав на бекенде
			if(!self::isAuth()) {
				$answer["status"] = "not_auth";
				throw new PDOException('Неавторизированный пользователь не может редактировать комментарии');
			}
			// проверяем идентификатор поста
			if(!isset($arrPost['id_post'])) {
				$answer["status"] = "no_id_post";
				throw new PDOException("В функции editPost в массиве arrPost отсутствует поле 'id_post'.");
			}
			// проверяем заголовок поста
			if(!isset($arrPost['title'])) {
				$answer["status"] = "no_title";
				throw new PDOException("В функции editPost в массиве arrPost отсутствует поле 'title'.");
			}
			if( mb_strlen($arrPost['title'], 'UTF-8') < 2 ) {
				$answer["status"] = "too_short_title";
				throw new PDOException("Слишком короткий заголовок. Длина заголовка должна быть не менее двух символов");
			}
			if( mb_strlen($arrPost['title'], 'UTF-8') > 100 ) {
				$answer["status"] = "too_long_title";
				throw new PDOException("Слишком длинный заголовок. Длина заголовка не должна превышать 100 символов");
			}
			// проверяем тело поста
			if(!isset($arrPost['message'])) {
				$answer["status"] = "no_message";
				throw new PDOException("В функции editPost в массиве arrPost отсутствует поле 'message'.");
			}
			if( mb_strlen($arrPost['message'], 'UTF-8') < 2 ) {
				$answer["status"] = "too_short_message";
				throw new PDOException("Слишком короткое сообщение. Длина сообщения должна быть не менее двух символов");
			}
			if(  mb_strlen($arrPost['message'], 'UTF-8') > 1000 ) {
				$answer["status"] = "too_long_message";
				throw new PDOException("Слишком длинное сообщение. Длина сообщения не должна превышать 1000 символов");
			}
			
			// проверяем теги
			if(!isset($arrPost['tags'])) {
				$arrPost['tags'] = '';
			}
			if( isset($arrPost['tags']) && $arrPost['tags'] !== '' ) {

				if( mb_strlen($arrPost['tags'], 'UTF-8') < 2 ) {
					$answer["status"] = "too_short_tags";
					throw new PDOException("Слишком короткий тег. Длина тега должна быть не менее двух символов");
				}
				if( mb_strlen($arrPost['tags'], 'UTF-8') > 50 ) {
					$answer["status"] = "too_long_tags";
					throw new PDOException("Слишком длинный тег. Длина тега не должна превышать 50 символов");
				}

			}

			// формируем переменные
			$id_post 	= self::clear_data($arrPost['id_post'], 's');
			$title 	  	= self::clear_data($arrPost['title'],   's');
			$message 	= self::clear_data($arrPost['message'], 's');
			$tags       = self::clear_data($arrPost['tags'],    's');

			// подключаемся
			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}

			// формируем запрос
			$t = "`id_post`=%d";
			$cond = sprintf($t, $id_post);

			$q =   "UPDATE posts
					SET `title`=\"$title\", `message`=\"$message\", `tags`=\"$tags\"
					WHERE $cond";

			// self::showDev($q); exit();
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
	} // editPost

	// удаление поста
	public static function deletePost($id_post)
	{
		// self::showDev($id); exit();
		$answer = [
			"status" => "",
			"data"   => ""
		];

		try {
			if(!isset($id_post)) {
				$answer["status"] = "no_id_post";
				throw new PDOException('В функцию deletePost не пришел параметр id_post.');
			}
			// проверка прав на бекенде
			if(!self::isAuth()) {
				$answer["status"] = "not_auth";
				throw new PDOException('Неавторизированный пользователь не может удалять комментарии');
			}

			$id_post = self::clear_data($id_post, 'i');

			$db = self::db_connect();
			if(!$db) {
				$answer["status"] = "no_database_connect";
				throw new PDOException("Не удалось подключение к БД.");
			}
		
			$q = "DELETE FROM posts WHERE id_post=$id_post";
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
	} // deletePost
}
