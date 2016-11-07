// создаем модуль приложения
var app = angular.module("app", ["ngRoute"]);

// константы, используемые в приложении
app.constant("serverURL", "./php/server.php");

// всп. методы
app.factory("Tools", function() {
    return {
        clearComment: function(commentForm, currentComment) {
            commentForm.newCommentName.value = '';
            commentForm.newCommentEmail.value = '';
            commentForm.newCommentMessage.value = '';
            currentComment.author = '';
            currentComment.email = '';
            currentComment.message = '';
        },
        // универсальная функция обработки ошибки валидации
        getError: function (error) {
            if(!angular.isDefined(error)) {
                return;
            }
            if(error.required) {
                return "Поле не должно быть пустым";
            }
            if(error.email) {
                return "Введите правильный email";
            }
        },
        // проверка авторизации
        isAuth: function() {
            if(localStorage.getItem("loggedID")) {
                return true;
            }
        },
        // проверка корректно введенной почты
        isEmailValid: function(text) {
            var re = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i;
            return (re.test(text)) ? true : false;
        },
        // оповещение пользователя о технической ошибке
        techErrorAlert: function() {
            alert("Произошла техническая ошибка. Обратитесь за помощью к специалисту.");
        }
    }
});

// операции, связанные с переходами между "страницами"
app.factory("Nav", function() {
    return {
        gotoMain: function($scope, $location) {
            $scope.currentPost = {};
            $scope.currentUser = {};
            $scope.showAllPosts();
            $location.path("/main");
        },
        gotoShow: function($scope, $location) {
            $location.path("/show");
        },
        gotoNew: function($scope, $location) {
            $location.path("/new");
        },
        gotoEdit: function($scope, $location) {
            $location.path("/edit");
        },
        gotoUser: function($scope, $location) {
            $location.path("/user");
        },
        gotoWelcome: function($scope, $location) {
            $location.path("/welcome");
        }        
    }
});

// операции, связанные с текущим пользователем
app.factory("Users", function() {
    return {
        // сравнение идентификаторов текущего авторизированного юзера, и юзера, который написал данный пост
        compareUsersPosts: function(post) {
            if(post.id_user == localStorage.getItem("loggedID")) {
                return true;            
            }
        },
        // показ, кто сейчас на сайте
        userOnline:  function () {
            return localStorage.getItem("loggedName");
        },
        // получение данных текущего зарегистрированного юзера
        getCurrentUserData: function(cnt) {
            switch(cnt) {
                case "id"  : return localStorage.getItem("loggedID");
                case "name": return localStorage.getItem("loggedName");
                default:     return false;
            }
        }
    }
});

// операции, связанные с проверками данных
app.factory("Check", function() {
    return {
        // проверка на объект
        isPost: function(post, Tools) {
            if(typeof post !== 'object') {
                Tools.techErrorAlert();
                console.log('Из формы от пользователя пришел не объект.');
                
                return false;
            }
            return true;
        },
        // проверяем заголовок поста от клиента
        titleFromClient: function(post) {
            if( !post["title"] ) {
                alert("Необходимо заполнить поле 'Заголовок'.");
                return false;
            }
            else if(post.title.length < 2) {
                alert("Слишком короткое имя. Длина заголовка должна быть не менее двух символов");
                return false;
            }
            else if(post.title.length > 100) {
                alert("Слишком короткое имя. Длина заголовка должна быть не более 100 символов");
                return false;
            }

            return true;
        },
        // проверяем сообщение поста от клиента
        messageFromClient: function(post) {
            console.log('post.message.length = ', post.message.length);
            // проверяем тело поста
            if( !post["message"] ) {
                alert("Необходимо заполнить поле 'Сообщение'.");
                return false;
            }
            else if(post.message.length < 2) {
                alert("Слишком короткое сообщение. Длина сообщения должна быть не менее двух символов");
                return false;
            }
            else if(post.message.length > 1000) {
                
                alert("Слишком длинное сообщение. Длина сообщения должна быть не более 1000 символов");
                return false;
            }

            return true;
        },
        // проверяем теги поста от клиента
        tagsFromClient: function(post) {
            // обрабатываем теги
            if( !post["tags"]) {
                post["tags"] = "";
                return true;
            }
            else {
                if(post.tags.length < 2) {
                    alert("Слишком короткий тег. Длина тегов должна быть не менее двух символов");
                    return false;
                }
                if(post.tags.length > 50) {
                    alert("Слишком длинная строка тегов. Длина тегов должна быть не более 50 символов");
                    return false;
                }
            }
            return true;
        },
        // проверяем, валидный ли объект пришел с сервера
        dataFromServer:function (res, Tools) {
            if(typeof res !== 'object') {
                console.log('С сервера пришел не объект.', res);
                Tools.techErrorAlert();
                return false;
            }
            if( res["status"] === 'undefined' ) {
                console.log('У объекта, который пришел с сервера, нет поля "status".', res);
                Tools.techErrorAlert();
                return false;
            }
            if( res["data"] === 'undefined' ) {
                console.log('У объекта, который пришел с сервера, нет поля "data".', res);
                Tools.techErrorAlert();
                return false;
            }

            return true;
        }

    }
});

// операции, связанные с текущим пользователем
app.factory("Storage", function() {
    return {
        uSet: function(obj, name) {
            localStorage.setItem(name, JSON.stringify(obj));
        },
        uGet: function(name) {
            return JSON.parse(localStorage.getItem(name));
        },
        uDel: function() {
            localStorage.removeItem(name);
            return {};
        }
    }
});

// базовый контроллер приложения
app.controller("baseBlogCtrl", function($scope, $http, $location, serverURL, Tools, Nav, Users, Check, Storage){

    // навигация
    $scope.gotoMain   = function() { Nav.gotoMain($scope, $location); }                 // отмена изменений и возврат в представление basePage
    
    // работа с текущим пользователем
    $scope.userOnline = function() { return Users.userOnline(); }                       // показ, кто сейчас онлайн на сайте
    $scope.compareUsersPosts = function(post) { return Users.compareUsersPosts(post); } // сравнение идентификаторов текущего авторизированного юзера, и юзера, который написал данный пост


    // переменные контроллера
    $scope.currentPost = Storage.uDel('currentPost');
    $scope.allComments = Storage.uDel('allComments');
    $scope.currentComment = {};

    // $scope.allUsers = {};
    $scope.currentUser = {};

    // получение всех постов из таблицы
    $scope.showAllPosts = function() {
        $http
            .post(serverURL, {
                operation: "getAllPosts"
            })
            .success(function(res) {
                console.log('Все сообщения: ', res);//return;
                $scope.posts = res;
            });
    }

    // показываем текущий пост
    $scope.showPost = function(post) {
        if(!post.id_post) {
            alert("В данный момент невозможно просмотреть отдельный пост. Эта техническая проблема в скором времени будет устранена.");
            console.log("Не был получен идентификатор текущего поста. Поэтому не будет выполнен запрос, и просмотр текущего поста невозможен.");
            return;
        }

        $http
            .post(serverURL, {
                operation: "getPost",
                data: post.id_post
            })
            .success(function(res) {

                if( !Check.dataFromServer(res, Tools) ) { return; };   // проверка входного параметра с сервера

                // проверить res.data.message
                if(!res.data.message) {
                    Tools.techErrorAlert();
                    console.log('В объекте, который пришел с сервера, пустое поле message');
                }

                if(res["status"] == 'ok') {
                    post["message"] = res.data.message;

                    $scope.currentPost = post;// $scope.currentPost = angular.copy(post);
                    Storage.uSet(post, 'currentPost');
                    
                    $scope.getAllComments(post.id_post);
                    Nav.gotoShow($scope, $location);                    
                }
                else {
                    if(res["status"] === 'no_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    } // showPost


    // добавление нового поста
    $scope.addNewPost = function() {
        $scope.currentPost = {};
        Nav.gotoNew($scope, $location);
    }
    // сохранение нового элемента
    $scope.saveNewPost = function(post) {
        // console.log("Добавление поста: ", post); //return;

        if( !Check.isPost(post, Tools) )    { return; };   // проверка входного параметра от клиента
        if( !Check.titleFromClient(post) )  { return; };   // проверка валидности заполнения поля title
        if( !Check.messageFromClient(post) ){ return; };   // проверка валидности заполнения поля message
        if( !Check.tagsFromClient(post) )   { return; };   // проверка валидности заполнения поля tags

        $http
            .post(serverURL, {
                operation: "addPost",
                data: {
                    post: post,
                    id_user: Users.getCurrentUserData("id")
                }
            })
            .success(function(res) {
                if( !Check.dataFromServer(res, Tools) ) { return; };   // проверка входного параметра с сервера

                // если пост был успешно добавлен
                if(res["status"] == 'ok') {
                    // console.log("Добавление нового поста = ", res); alert(1); return;
                    console.log("Добавление нового поста = ", res);
                    $scope.showAllPosts();
                    
                    Nav.gotoMain($scope, $location);
                }
                // если нет
                else {
                    // проблемы с передачей параметра на сервер
                    if(res["status"] === 'no_data') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_auth') {
                        alert(res["data"]);
                    }
                    // заголовок
                    else if(res["status"] === 'no_title') {
                        alert("Необходимо заполнить поле 'Заголовок'.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_title') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_title') {
                        alert(res["data"]);
                    }
                    // тело поста
                    else if(res["status"] === 'no_message') {
                        alert("Необходимо заполнить поле 'Сообщение'.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_message') {
                        alert(res["data"]);
                    }
                    // теги
                    else if(res["status"] === 'too_short_tags') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_tags') {
                        alert(res["data"]);
                    }
                    // идентификатор пользователя
                    else if(res["status"] === 'no_id_user') {
                        Tools.techErrorAlert();
                    }
                    // ошибка подключения к БД
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    // обработка неожиданного и теоретически невозможного варианта
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }

                } // if
                
            }); // $http
    
    } // saveNewPost


    // клик по кнопке "Редактировать сообщение"
    $scope.editPost = function(post) {
        if(!post.id_post) {
            alert("В данный момент невозможно отредактировать отдельный пост. Эта техническая проблема в скором времени будет устранена.");
            console.log("Не был получен идентификатор текущего поста. Поэтому не будет выполнен запрос, и просмотр текущего поста невозможен.");
            return;
        }

        $http
            .post(serverURL, {
                operation: "getPost",
                data: post.id_post
            })
            .success(function(res) {

                if( !Check.dataFromServer(res, Tools) ) { return; };

                if(!res.data.message) {
                    Tools.techErrorAlert();
                    console.log('В объекте, который пришел с сервера, пустое поле message');
                }

                if(res["status"] == 'ok') {
                    post["message"] = res.data.message;
                    $scope.currentPost = post;// $scope.currentPost = angular.copy(post);
                    
                    Nav.gotoEdit($scope, $location);
                }
                else {
                    if(res["status"] === 'no_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    } // editPost

    // клик по кнопке "Сохранить изменения"
    $scope.saveEditPost = function(post) {

        if( !Check.isPost(post, Tools) )    { return; };
        if( !Check.titleFromClient(post) )  { return; };
        if( !Check.messageFromClient(post) ){ return; };
        if( !Check.tagsFromClient(post) )   { return; };

        $http
            .post(serverURL, {
                operation: "editPost",
                data: post
            })
            .success(function(res) {
                if( !Check.dataFromServer(res, Tools) ) { return; };   // проверка входного параметра с сервера

                if(res["status"] == 'ok') {
                    console.log("Редактирование нового поста = ", res);
                    $scope.showAllPosts();
                    Nav.gotoMain($scope, $location);
                }
                else {
                    if(res["status"] === 'no_data') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_auth') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_title') {
                        alert("Необходимо заполнить поле 'Заголовок'.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_title') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_title') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_message') {
                        alert("Необходимо заполнить поле 'Сообщение'.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_short_tags') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_tags') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    } // saveEditPost

    // удаление поста
    $scope.deletePost = function(post) {
        if(typeof post !== 'object') {
            Tools.techErrorAlert();
            console.log('Удаление поста. Из формы от пользователя пришел не объект.');
            return;
        }
        if( !post["id_post"] ) {
            Tools.techErrorAlert();
            console.log('Удаление поста. Из формы от пользователя пришел объект, у которого нет поля id_post.');
            return;
        }

        $http
            .post(serverURL, {
                operation: "deletePost",
                data: post.id_post
            })
            .success(function(res) {
                console.log("Ответ сервера при удалении поста: ", res);

                if( !Check.dataFromServer(res, Tools) ) { return; };

                if(res["status"] == 'ok') {
                    $scope.showAllPosts();
                }
                else {
                    if(res["status"] === 'no_data') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_auth') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    } // deletePost


    // обновляем все комментарии на странице
    $scope.getAllComments = function(id_post) {
        console.log('Начало работы функции getAllComments: ', id_post);
        $http
            .post(serverURL, {
                operation: "getAllComments",
                data: id_post
            })
            .success(function(res) {
                if( !Check.dataFromServer(res, Tools) ) { return; };

                if(res["status"] == 'ok') {
                    $scope.allComments = res.data;
                    Storage.uSet(res.data, 'allComments');
                }
                else {
                    if(res["status"] === 'no_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    }

    $scope.getCurrentPost = function() {
        $scope.currentPost = Storage.uGet('currentPost');
    }
    $scope.refreshAllComments = function() {
        $scope.allComments = Storage.uGet('allComments');
        // return Storage.uGet('allComments');
    }
    $scope.checkAllComments = function() {
        if(Storage.uGet('currentPost')) {
            return true;
        }
    }

    $scope.showAllPosts();
});


/*
    работа с комментариями
*/
app.controller("commentsCtrl", function($scope, $http, $routeParams, $location, serverURL, Tools, Check, Nav) {
    
    $scope.getError = Tools.getError;

    // только автор поста может удалять все комментарии к посту
    $scope.compareUsersComments = function(currentPost) {
        if(currentPost.id_user == localStorage.getItem("loggedID")) {
            return true;            
        }
    }

    // сохранение комментария
    $scope.addComment = function(addedComment, id_post, isValid) {
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true;// активация данного параметра запускает функцию getError
            return;
        }
        if(typeof addedComment !== 'object') {
            Tools.techErrorAlert();
            console.log('Из формы от пользователя пришел не объект.');
            return false;
        }
        // проверяем id_post
        if(!id_post) {
            Tools.techErrorAlert();
            console.log('В функцию addComment из формы от пользователя не пришел айдишник поста.');
            return false;
        }
        if(typeof id_post !== 'string') {
            Tools.techErrorAlert();
            console.log('Из формы от пользователя в качестве идентификатора комментария пришла не строка (возможно, это объект).');
            return false;
        }
        // проверяем поле "автор"
        if( !addedComment["author"] ) {
            alert("Необходимо заполнить поле 'Автор'.");
            return false;
        }
        else if(addedComment.author.length < 2) {
            alert("Слишком короткое имя автора. Длина имени автора должна быть не менее двух символов");
            return false;
        }
        else if(addedComment.author.length > 30) {
            alert("Слишком короткое имя автора. Длина имени автора должна быть не более 30 символов");
            return false;
        }
        // проверяем поле "почта"
        if(!Tools.isEmailValid(addedComment.email)) {
            alert("Некорректный почтовый адрес.");
            return false;
        }
        else if(addedComment.email.length > 30) {
            alert("Слишком длинный почтовый адрес. Длина почтового адреса должна быть не более 30 символов");
            return false;
        }
        // проверяем поле "сообщение"
        if( !addedComment["message"] ) {
            alert("Необходимо заполнить поле 'Сообщение'.");
            return false;
        }
        else if(addedComment.message.length < 2) {
            alert("Слишком короткое сообщение. Длина сообщения должна быть не менее двух символов");
            return false;
        }
        else if(addedComment.message.length > 1000) {
            alert("Слишком длинное сообщение. Длина сообщения должна быть не более 1000 символов");
            return false;
        }

        $http
            .post(serverURL, {
                operation: "addComment",
                data: {
                    comment : addedComment,
                    id_post : id_post
                }
            })
            .success(function(res) {
                if( !Check.dataFromServer(res, Tools) ) { return; };

                if(res["status"] == 'ok') {
                    console.log('Сохранение комментария: ', res);
                    $scope.getAllComments(id_post);
                    Tools.clearComment(commentForm, addedComment);

                }
                else {
                    if(res["status"] === 'no_data') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_id_post' || res["status"] === 'no_string_type_of_id_post') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_author') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_short_author') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_author') {
                        alert(res["data"]);
                    }
                    // почтовый адрес
                    else if(res["status"] === 'no_email') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'not_valid_email') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_email') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_short_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'too_long_message') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http

        $scope.message = "Ready";
    } // addComment

    // УДАЛЕНИЕ комментария
    $scope.deleteComment = function(id_comment, id_post) {
        $http
            .post(serverURL, {
                operation: "deleteComment",
                data: id_comment
            })
            .success(function(res) {
                if( !Check.dataFromServer(res, Tools) ) { return; };   // проверка входного параметра с сервера

                if(res["status"] == 'ok') {
                    $scope.getAllComments(id_post);
                }
                else {
                    if(res["status"] === 'no_data') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_auth') {
                        alert(res["data"]);
                    }
                    else if(res["status"] === 'no_id_comment') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if
            }); // $http
    } // deleteComment
});


/*
    работа с пользователями
*/
app.controller("usersCtrl", function($scope, $http, $location, serverURL, Tools, Users, Nav) {

    $scope.isAuth = Tools.isAuth;

    // показ юзера на отдельной странице
    $scope.showUser = function(post) {
        console.log("Пост текущего пользователя: ", post)
        var dataToServer = {
            operation: "getAllUserPosts",
            data: post.id_user
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                $scope.currentUser.name = post.name;
                $scope.currentUser.allPosts = res;

                Nav.gotoUser($scope, $location);
            });
    }


    $scope.logout = function() {
        $http
            .post(serverURL, {
                operation: "logoutUser"
            })
            .success(function(res) {
                // console.log('Результат логаута: ', res);// return;
                if(res) {
                    localStorage.removeItem('loggedID');
                    localStorage.removeItem('loggedName');
                    Users.userOnline();
                    Nav.gotoWelcome($scope, $location);
                }
            });
    }

    $scope.goToWelcome = function() {
        Nav.gotoWelcome($scope, $location);
    }
});
