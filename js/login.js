// контроллер авторизации пользователя
app.controller("loginCtrl", function($scope, $http, serverURL, $location, Tools) {
    
    $scope.getError = Tools.getError;

    $scope.loginSubmit = function(newUser, isValid) {
        // проверка валидности заполнения формы средствами Angular.js
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true;
            return;
        }

        // проверяем имя пользователя
        if(newUser.name.length < 2) {
            alert("Слишком короткое имя. Длина имени должна быть не менее двух символов");
            loginForm.userName.value = '';
            return false;
        }
        if(newUser.name.length > 30) {
            alert("Слишком длинное имя. Длина имени не должна превышать 30 символов");
            loginForm.userName.value = '';
            return false;
        }

        // проверяем пароль пользователя
        if(newUser.password.length < 2) {
            alert("Слишком короткий пароль. Длина пароля должна быть не менее 6 символов");
            loginForm.userPassword.value = '';
            return false;
        }
        if(newUser.password.length > 30) {
            alert("Слишком длинный пароль. Длина пароля не должна превышать 30 символов");
            loginForm.userPassword.value = '';
            return false;
        }

        $http
            .post(serverURL, {
                operation: "loginUser",
                data: newUser
            })
            .success(function(res) {
                // console.log("Результат авторизации: ", res["data"]); return;

                // проверка входного параметра с сервера
                if(typeof res !== 'object') {
                    Tools.techErrorAlert();
                    console.log('Авторизация. С сервера пришел не объект.', res);
                    return;
                }
                if( res["status"] === 'undefined' ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, нет поля "status".');
                    return;
                }
                if( res["data"] === 'undefined' ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, нет поля "data".');
                    return;
                }

                if( res["data"].length === 'undefined' ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, в поле "data" содержится не массив.');
                    return;
                }
                if( res["data"].length !== 1 ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, в поле "data" содержится массив не из одного элемента.');
                    return;
                }
                if( res["data"][0]['id_user'] === 'undefined' ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, в поле "data" содержится массив, в котором нет поля "id_user".');
                    return;
                }
                if( res["data"][0]['name'] === 'undefined' ) {
                    Tools.techErrorAlert();
                    console.log('Авторизация. У объекта, который пришел с сервера, в поле "data" содержится массив, в котором нет поля "name".');
                    return;
                }

                // если авторизация прошла успешно
                if(res["status"] === 'ok') {
                    // console.log("Авторизация прошла успешно!"); return;
                    console.log(res["data"][0]['id_user']);
                    console.log(res["data"][0]['name']);
                    localStorage.setItem('loggedID', res["data"][0]['id_user']);
                    localStorage.setItem('loggedName', res["data"][0]['name']);
                    $location.path("/main");
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
                    // имя пользователя
                    else if(res["status"] === 'no_user_name') {
                        alert("Необходимо ввести имя пользователя.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_user_name') {
                        alert(res["data"]);
                        loginForm.userName.value = '';
                    }
                    else if(res["status"] === 'too_long_user_name') {
                        alert(res["data"]);
                        loginForm.userName.value = '';
                    }
                    // пароль пользователя
                    else if(res["status"] === 'no_user_password') {
                        alert("Необходимо ввести пароль.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_user_password') {
                        alert(res["data"]);
                        loginForm.userPassword.value = '';
                    }
                    else if(res["status"] === 'too_long_user_password') {
                        alert(res["data"]);
                        loginForm.userPassword.value = '';
                    }
                    // ошибка подключения к БД
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    // ошибка авторизации на сервере
                    else if(res["status"] === 'no_auth_on_back') {
                        alert("Произошла техническая ошибка при авторизации. Приносим свои извинения.");
                        console.log(res["data"]);
                    }
                    // самый неожиданный вариант
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                } // if

            }); // $http

    } // loginSubmit

    $scope.goToWelcome = function() {
        $location.path("/welcome");
    }

    $scope.message = "Ready";
});