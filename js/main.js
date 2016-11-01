// создаем модуль приложения
var app = angular.module("app", ["ngRoute"]);

// роутинг приложения
app.config(function($routeProvider) {
    $routeProvider
        .when("/welcome", {
            templateUrl: "/app/view/welcome.html"
        })
        .when("/main", {
            templateUrl: "/app/view/base.html"
        })
        .when("/sign", {
            templateUrl: "/app/view/sign.html"
        })
        .when("/login", {
            templateUrl: "/app/view/login.html"
        })
        .when("/show", {
            templateUrl: "/app/view/show.html"
        })
        .when("/new", {
            resolve: { "check": checkAuth },
            templateUrl: "/app/view/new.html"
        })
        .when("/edit", {
            resolve: { "check": checkAuth },
            templateUrl: "/app/view/edit.html"
        })
        .when("/user", {
            templateUrl: "/app/view/user.html"
        })
        .otherwise({
            redirectTo: "/welcome"
        });

        function checkAuth($location, $rootScope) {
            if(!localStorage.getItem("loggedID")) {
                $location.path("/welcome");
            }
        }
});

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
        }
    }
});

// контроллер приветствия пользователя на главной странице
app.controller("startCtrl", function($scope, $location) {
    
    $scope.goToSignupPage = function() {
        $location.path("/sign");
    }

    $scope.goToLoginPage = function() {
        $location.path("/login");
    }
});

// контроллер регистрации пользователя
app.controller("signCtrl", function($scope, $http, $rootScope, serverURL, $location, Tools) {
    
    $scope.getError = Tools.getError;

    $scope.signupNewUser = function (newUser, isValid) {
        
        // проверка корректности заполнения формы
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true; // активация данного параметра запускает функцию getError
            return;
        }

        // проверка совпадения паролей
        if(newUser.password !== newUser.password2) {
            signupForm.userPassword2.value == '';
            alert("Введенные пароли не совпадают. Попробуйте еще раз.");
            return;
        }

        var dataToServer = {
            operation: "signNewUser",
            data: newUser
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log("Результат регистрации: ", res);// id добавленного пользователя

                if(res["success"]) {
                    alert("Регистрация прошла успешно!");
                    $location.path("/login");
                } else {
                    // объясняем пользователю причины ошибки регистрации (уже существует логин или почта)
                    if(res['body']) {
                        alert(res['body']);
                    }
                    // выводим в консоль информацию для разработчиков
                    if(res['error']) {
                        console.log(res['error']);
                    }
                }
            });
    }

    $scope.message = "Ready";  
});

// контроллер авторизации пользователя
app.controller("loginCtrl", function($scope, $http, $rootScope, serverURL, $location, Tools) {
    
    $scope.getError = Tools.getError;

    $scope.loginSubmit = function(newUser, isValid) {
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true;
            return;
        }

        var dataToServer = {
            operation: "loginUser",
            data: newUser
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                if(res["success"]) {
                    localStorage.setItem('loggedID', res["body"][0]['id_user']);
                    localStorage.setItem('loggedName', res["body"][0]['name']);
                    $location.path("/main");
                } else {
                    if(res['error']) {
                        console.log(res['error']);
                    }
                    alert('Неверный логин или пароль. Попробуйте еще раз.');
                }
            });
    }

    $scope.goToWelcome = function() {
        $location.path("/welcome");
    }

    $scope.message = "Ready";
});

// базовый контроллер приложения
app.controller("baseBlogCtrl", function($scope, $rootScope, $http, $routeParams, $location, serverURL){

    // пользователь может редактировать и удалять только свои посты
    $scope.compareUsersPosts = function(post) {
        if(post.id_user == localStorage.getItem("loggedID")) {
            return true;            
        }
    }

    // для отладки (в верхнем отладочном меню): узнать, авторизирован ли сейчас пользователь
    $scope.tttest = function () {
        return localStorage.getItem("loggedName");
    }

    $scope.currentPost = {};
    
    $scope.allComments = {};
    $scope.currentComment = {};

    $scope.allUsers = {};
    $scope.currentUser = {};

    // отмена изменений и возврат в представление basePage
    $scope.goToMain = function() {
        $scope.currentPost = {};
        $scope.currentUser = {};

        $location.path("/main");
    }

    // получение всех постов из таблицы
    $scope.showAllPosts = function() {
        var dataToServer = {
            operation: "getAllPosts"
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(result) {
                console.log('allЗosts = ', result);
                $scope.posts = result;
            });
    }

    // показываем текущий пост
    $scope.showPost = function(post) {
        console.log("Текущий пост R: ", post.id_post)
        var dataToServer = {
            operation: "getAllComments",
            data: post.id_post
        };

        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                // сохраняем ВСЕ комментарии к текущему посту - для последующего вывода на странице
                console.log('Получили все комментарии из функции showPost: ', res);
                $scope.allComments = res;
                $scope.showAllComments(post);

                // сохраняем ТЕКУЩИЙ пост - для последующего вывода на странице
                $scope.currentPost = post;
                console.log("Показываемый пост - ", post);
                $location.path("/show");
            });
    }

    // обновляем все комментарии на странице
    $scope.showAllComments = function(post) {
        var dataToServer = {
            operation: "getAllComments",
            data: post.id_post
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log("Все комментарии - ", res);
                $scope.allComments = res;
            });
    }

    // добавление нового поста
    $scope.addNewPost = function(post) {
        $scope.currentPost = {};
        $location.path("/new");
    }
    // сохранение нового элемента
    $scope.saveNewPost = function(post, currentUser) {
        var dataToServer = {
            operation: "addPost",
            data: {
                post: post,
                id_user: localStorage.getItem("loggedID")
            }
        };

        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log("Добавление нового поста = ", res);
                $scope.showAllPosts();
                $location.path("/main");
            });
    }


    // клик по кнопке "Редактировать сообщение"
    $scope.editPost = function(post) {
        $scope.currentPost = angular.copy(post);
        $location.path("/edit");
    }
    // клик по кнопке "Сохранить изменения"
    $scope.saveEditPost = function(post) {
        var dataToServer = {
            operation: "editPost",
            data: post
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                $scope.showAllPosts();
                $location.path("/main");
            });
    }

    // удаление элемента из модели
    $scope.deletePost = function(post) {
        var dataToServer = {
            operation: "deletePost",
            data: post.id_post
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log('deletePost = ', res);
                $scope.showAllPosts();
            });
    }

    $scope.getAllUsers = function() {
        var dataToServer = {
            operation: "getAllUsers"
        };
        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log("Все пользователи: ", res);
                $scope.allUsers = res;
            });
    };

    $scope.showAllPosts();
    $scope.getAllUsers();
});


/*
    работа с комментариями
*/
app.controller("commentsCtrl", function($scope, $http, $routeParams, $location, serverURL, $rootScope, Tools) {
    
    $scope.getError = Tools.getError;

    // только автор поста может удалять все комментарии к посту
    $scope.compareUsersComments = function(currentPost) {
        if(currentPost.id_user == localStorage.getItem("loggedID")) {
            return true;            
        }
    }

    // сохранение комментария
    $scope.addComment = function(currentComment, isValid) {
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true;// активация данного параметра запускает функцию getError
            return;
        }

        // готовим данные к отправке на сервер
        var dataToServer = {
            operation: "addComment",
            data: {
                comment : currentComment,
                id_post : $scope.currentPost.id_post
            }
        };

        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log('Сохранение комментария: ', res);
                $scope.showAllComments($scope.currentPost);
                Tools.clearComment(commentForm, currentComment);
            });

        $scope.message = "Ready";
    }

    // УДАЛЕНИЕ комментария
    $scope.deleteComment = function(comment) {
        console.log('Удаляемый комментарий: ', comment);
     
        var dataToServer = {
            operation: "deleteComment",
            data: comment.id_comment
        };

        $http
            .post(serverURL, dataToServer)
            .success(function(res) {
                console.log('Результат удаления комментария: ', res);
                $scope.showAllComments($scope.currentPost);
            });
    }
});


/*
    работа с пользователями
*/
app.controller("usersCtrl", function($scope, $http, $routeParams, $location, serverURL, $rootScope) {

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

                $location.path("/user");
            });
    }

    $scope.isAuth = function() {
        if(localStorage.getItem("loggedID")) {
            return true;
        }
    }

    $scope.logout = function() {
        localStorage.removeItem('loggedID');
        localStorage.removeItem('loggedName');
        $scope.tttest();
        $location.path("/welcome");
    }

    $scope.goToWelcome = function() {
        $location.path("/welcome");
    }
});
