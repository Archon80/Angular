<?php
class Comments {
    
	use DB_connect;

	// получение всех комментариев
	public static function getAllComments($id)
	{
		$db = self::db_connect();

		$id_post = self::clear_data($id, 'i');

		$q = 	"SELECT comments.id_comment, comments.author, comments.email, comments.message, comments.id_post, posts.id_post
				FROM comments, posts
				WHERE comments.id_post = posts.id_post
				AND posts.`id_post`=$id_post";


		$query = $db->prepare($q);
		$query->execute();

		return $query->fetchAll();
	}

	// добавление комментария
	public static function addComment($arrComment)
	{
		$db = self::db_connect();

		$author  = self::clear_data($arrComment['comment']['author'],'s');
		$email   = self::clear_data($arrComment['comment']['email'],'s');
		$message = self::clear_data($arrComment['comment']['message'],'s');
		$id_post = self::clear_data($arrComment['id_post'],'i');

		$q = "INSERT INTO comments(`author`, `email`, `message`, `id_post`)
				VALUES (\"$author\", \"$email\", \"$message\", \"$id_post\")";

		// self::showDev($q); exit();

		$query = $db->prepare($q);
		$query->execute();
		return intval($db->lastInsertId());
	}

	// удаление комментария
	public static function deleteComment($id)
	{
		$db = self::db_connect();

		$id_comment = self::clear_data($id, 'i');

		$q = "DELETE FROM comments WHERE id_comment=$id_comment";
		// self::showDev($q);exit;

		$query = $db->prepare($q);
		return $query->execute();
	}
}