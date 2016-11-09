-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Ноя 09 2016 г., 15:11
-- Версия сервера: 5.5.52-0ubuntu0.14.04.1
-- Версия PHP: 5.5.9-1ubuntu4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `ang-rest1`
--

-- --------------------------------------------------------

--
-- Структура таблицы `auth`
--

CREATE TABLE IF NOT EXISTS `auth` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `current` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Таблица авторизации' AUTO_INCREMENT=33 ;

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `id_comment` int(5) NOT NULL AUTO_INCREMENT,
  `author` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `message` text NOT NULL,
  `id_post` int(5) NOT NULL,
  PRIMARY KEY (`id_comment`),
  KEY `id_post` (`id_post`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Таблица комментариев' AUTO_INCREMENT=43 ;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id_comment`, `author`, `email`, `message`, `id_post`) VALUES
(10, 'Комментатор №1', 'a@b.ru', 'Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах на берегу Семантика большого языкового океана. Маленький ручеек Даль журчит по всей стране и обеспечивает ее всеми необходимыми правилами. Эта парадигматическая страна, в которой жаренные члены предложения залетают прямо в рот. Даже всемогущая пунктуация не имеет власти над рыбными текстами, ведущими безорфографичный образ жизни.', 12),
(12, 'Комментатор №2', 'c@d.ru', 'Душа моя озарена неземной радостью, как эти чудесные весенние утра, которыми я наслаждаюсь от всего сердца. Я совсем один и блаженствую в здешнем краю, словно созданном для таких, как я. Я так счастлив, мой друг, так упоен ощущением покоя, что искусство мое страдает от этого. Ни одного штриха не мог бы я сделать, а никогда не был таким большим художником, как в эти минуты.', 12),
(13, 'Комментатор №3', 'z@p.ru', 'На портрете была изображена дама в меховой шляпе и боа, она сидела очень прямо и протягивала зрителю тяжелую меховую муфту, в которой целиком исчезала ее рука. Затем взгляд Грегора устремился в окно, и пасмурная погода – слышно было, как по жести подоконника стучат капли дождя – привела его и вовсе в грустное настроение.', 16),
(14, 'Комментатор №4', 'c@c.ru', 'Очень много, и распределенных по небу более. Видимости между облаками пылевой материи после. Ожидает участь неотождествимости так. Прозрачна, радиоизлучение которого достаточно сильное тоже будет все-таки слишком. Открытия дискретных источников радиоизлучения определяется с источниками радиоизлучения показало. Близко друг к галактическому экватору радиоизлучения являются объектами входящими.', 16);

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `id_post` int(5) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `tags` varchar(50) DEFAULT NULL,
  `id_user` int(5) DEFAULT NULL,
  PRIMARY KEY (`id_post`),
  KEY `id_user` (`id_user`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Таблица постов' AUTO_INCREMENT=56 ;

--
-- Дамп данных таблицы `posts`
--

INSERT INTO `posts` (`id_post`, `title`, `message`, `tags`, `id_user`) VALUES
(12, 'Lorem ipsum 1', 'Cras eget finibus tortor. Vivamus vitae fermentum arcu, pulvinar commodo ex. Vivamus ullamcorper viverra diam scelerisque malesuada. Nam massa arcu, maximus elementum lacus at, lobortis dignissim augue. Suspendisse potenti. Proin ut ex efficitur felis convallis lobortis. Ut blandit ultrices lorem, eu suscipit ante hendrerit eget. Aliquam gravida dolor consequat posuere imperdiet. Nunc sed metus eu est volutpat aliquet vitae vel dolor. Nullam non felis rhoncus, mattis arcu ut, maximus augue. Aliquam faucibus, neque ut sollicitudin imperdiet, nibh orci fermentum tortor, non feugiat justo neque sit amet nulla. Praesent tempus velit dui, ac congue lectus tincidunt id.\r\n\r\nSed commodo ex non consectetur bibendum. Curabitur eget nunc libero. Sed pharetra nibh sem, consectetur imperdiet odio volutpat vel. Ut dolor eros, pulvinar eget mauris et, suscipit vulputate purus. Donec luctus ullamcorper dolor vitae cursus. Praesent pulvinar pellentesque nisi, sit amet ultricies elit lacinia vel. Aliquam cursus nibh quis tortor luctus ornare. Maecenas quis porta dolor. Quisque varius, sapien at tincidunt aliquam, risus lectus ullamcorper libero, ut vulputate sem lacus non erat. Duis et faucibus arcu, at accumsan diam.', 'lorem, ipsum', 1),
(16, 'Lorem ipsum 2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at maximus lacus. Mauris rutrum mi id sem condimentum, nec suscipit erat iaculis. Sed ut elit sagittis, congue quam quis, accumsan libero. Cras vel sagittis urna. Nulla dignissim non est a ullamcorper. Praesent lacinia in mi vel aliquam. Cras sit amet eleifend est. Nullam non tellus turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vivamus ac maximus orci, eu rhoncus arcu. Sed dignissim placerat purus nec sagittis. Nunc auctor, diam in placerat posuere, dolor ante suscipit nulla, ac rutrum lorem tellus ut ante. Morbi nibh orci, semper vitae interdum in, aliquam sed nibh.\r\n\r\nNunc imperdiet ut nulla eu iaculis. Aliquam erat volutpat. Nam sit amet nulla vitae dui venenatis ultricies. In pulvinar tortor ac enim consequat, sit amet ultrices ex interdum. Fusce dignissim condimentum tincidunt. Pellentesque accumsan odio sed lorem mattis, eget sollicitudin enim porttitor. Duis a turpis quis dui vestibulum suscipit eu mollis ligula. Proin eros dui, sagittis non nulla hendrerit, bibendum scelerisque turpis. Maecenas sed finibus lectus, id gravida lorem. Aenean auctor bibendum mi nec sollicitudin.', 'lorem', 2),
(53, '111', 'Всякая психическая функция в культурном развитии ребенка появляется на сцену дважды, в двух планах,— сперва социальном, потом — психологическом, следовательно интеллект пространственно выбирает социометрический код. Филогенез фундаментально отталкивает депрессивный эгоцентризм, как и предсказывают практические аспекты использования принципов гештальпсихологии в области восприятия, обучения, развития психики, социальных взаимоотношений. Л.С.Выготский понимал тот факт, что идентификация наблюдаема. Тест отражает генезис. Эриксоновский гипноз аннигилирует субъект. Коллективное бессознательное, в первом приближении, последовательно.', '111', 10);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Таблица пользователей' AUTO_INCREMENT=11 ;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id_user`, `name`, `email`, `password`) VALUES
(1, 'User_1', 'a@a.ru', '111'),
(2, 'User_2', 'b@b.ru', '222'),
(3, 'User_3', 'c@c.ru', '333'),
(4, 'root', 'root@mail.ru', '290980'),
(10, 'www', 'www@www.ru', '999999');

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`id_post`) REFERENCES `posts` (`id_post`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
