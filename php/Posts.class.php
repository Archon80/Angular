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

		$q =   "SELECT posts.id_post, posts.title, posts.message, users.id_user, users.name, users.email
				FROM posts, users 
				WHERE posts.id_user = users.id_user";

		$query = $db->prepare($q);
		$query->execute();

		$res = $query->fetchAll();

		// обрезаем статьи, т.к. выводим лишь привью
		for ($i=0; $i < count($res); $i++) { 
			if( strlen($res[$i]['message']) > 50 ) {
				$res[$i]['message'] = substr($res[$i]['message'], 0, 50) . '...';
			}
		}

		$temp = [];
		for ($i=0, $j = count($res) - 1; $i < count($res); $i++,$j--) { 
			$temp[$j] = $res[$i];
		}
		// self::showDev($answer);		exit();
		return $temp;
	}

	// добавляем пост
	public static function addPost($arrPost)
	{
		$db = self::db_connect();

		$title 	 = self::clear_data($arrPost['post']['title'],  's');
		$message = self::clear_data($arrPost['post']['message'],'s');
		$tags    = self::clear_data($arrPost['post']['tags'],'s');
		$id_user = self::clear_data($arrPost['id_user'],'i');

		$q = "INSERT INTO posts(`title`, `message`, `id_user`)
				VALUES (\"$title\", \"$message\", \"$id_user\")";
		// self::showDev($q); exit();

		$query = $db->prepare($q);
		$query->execute();
		return intval($db->lastInsertId());
	}

	// редактируем пост
	public static function editPost($arrPost)
	{
		$db = self::db_connect();

		$id_post 	= self::clear_data($arrPost['id_post'], 's');
		$title 	  	= self::clear_data($arrPost['title'], 's');
		$message 	= self::clear_data($arrPost['message'], 's');

		$t = "`id_post`=%d";
		$cond = sprintf($t, $id_post);

		$q =   "UPDATE
					posts
				SET
					`title`=\"$title\",
					`message`=\"$message\"
				WHERE $cond";

		$query = $db->prepare($q);
		return $query->execute();
	}

	// удаление поста
	public static function deletePost($id)
	{
		$db = self::db_connect();
		
		$q = "DELETE FROM posts WHERE id_post=$id";
		$query = $db->prepare($q);
		
		return $query->execute();
	}

}
