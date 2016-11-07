// контроллер регистрации пользователя
app.controller("signCtrl", function($scope, $http, serverURL, $location, Tools) {
    
    $scope.getError = Tools.getError;

    $scope.signupNewUser = function (newUser, isValid) {
        
        // проверка корректности заполнения формы средствами angular
        if(!isValid) {
            $scope.message = "Error";
            $scope.showError = true; // активация данного параметра запускает функцию getError
            return;
        }

        // проверяем имя пользователя
        if(newUser.name.length < 2) {
            alert("Слишком короткое имя. Длина имени должна быть не менее двух символов");
            signupForm.userName.value = '';
            return false;
        }
        if(newUser.name.length > 30) {
            alert("Слишком длинное имя. Длина имени не должна превышать 30 символов");
            signupForm.userName.value = '';
            return false;
        }

        // проверяем почту пользователя
        if( !Tools.isEmailValid(newUser.email) ) {
            alert("Некорректный почтовый адрес.");
            signupForm.userEmail.value = '';
            return;
        }
        if(newUser.email.length < 2) {
            alert("Слишком короткий почтовый адрес. Длина почтового адреса должна быть не менее 6 символов");
            signupForm.userEmail.value = '';
            return false;
        }
        if(newUser.email.length > 30) {
            alert("Слишком длинный почтовый адрес. Длина почтового адреса не должна превышать 30 символов");
            signupForm.userEmail.value = '';
            return false;
        }

        // проверяем пароль пользователя
        if(newUser.password.length < 6) {
            alert("Слишком короткий пароль. Длина пароля должна быть не менее 6 символов");
            signupForm.userPassword.value = '';
            return false;
        }
        if(newUser.password.length > 30) {
            alert("Слишком длинный пароль. Длина пароля не должна превышать 30 символов");
            signupForm.userPassword.value = '';
            return false;
        }
        if(newUser.password !== newUser.password2) {
            alert("Введенные пароли не совпадают.");
            signupForm.userPassword2.value = '';
            return;
        }
        
        // согласие с правилами поведения на форуме
        if(!newUser.agreed) {
            alert("Необходимо прочитать правила поведения на форуме и согласиться с ними.");
            signupForm.agreed.value = '';
            return;
        }

        $http
            .post(serverURL, {
                operation: "signNewUser",
                data: newUser
            })
            .success(function(res) {
                // console.log("Результат регистрации: ", res); return;
                
                // проверка входного параметра с сервера
                if(typeof res !== 'object') {
                    techErrorAlert();
                    console.log('Регистрация. С сервера пришел не объект.');
                }
                if( res["status"] === 'undefined' ) {
                    techErrorAlert();
                    console.log('Регистрация. У объекта, который пришел с сервера, нет поля "status".');
                }
                if( res["data"] === 'undefined' ) {
                    techErrorAlert();
                    console.log('Регистрация. У объекта, который пришел с сервера, нет поля "data".');
                }

                // если регистрация прошла успешно
                if(res["status"] == 'ok') {
                    console.log("Идентификатор зарегистрированного пользователя: ", res["data"]);
                    alert("Регистрация прошла успешно!");
                    $location.path("/login");
                }
                // если нет
                else {
                    // проблемы с передачей параметра на сервер
                    if(res["status"] === 'no_data') {
                        alert("Произошла техническая ошибка. Обратитесь за помощью к специалисту.");
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_array') {
                        alert("Произошла техническая ошибка. Обратитесь за помощью к специалисту.");
                        console.log(res["data"]);
                    }
                    // имя пользователя
                    else if(res["status"] === 'no_user_name') {
                        alert("Необходимо ввести имя пользователя.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_user_name') {
                        alert(res["data"]);
                        signupForm.userName.value = '';
                    }
                    else if(res["status"] === 'too_long_user_name') {
                        alert(res["data"]);
                        signupForm.userName.value = '';
                    }
                    // почтовый адрес
                    else if(res["status"] === 'no_user_email') {
                        alert("Необходимо ввести почтовый адрес.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'not_valid_user_email') {
                        alert(res["data"]);
                        signupForm.userEmail.value = '';
                    }
                    else if(res["status"] === 'too_short_user_email') {
                        alert(res["data"]);
                        signupForm.userEmail.value = '';
                    }
                    else if(res["status"] === 'too_long_user_email') {
                        alert(res["data"]);
                        signupForm.userEmail.value = '';
                    }
                    // пароль пользователя
                    else if(res["status"] === 'no_user_password') {
                        alert("Необходимо ввести пароль.")
                        console.log(res["data"]);
                    }
                    else if(res["status"] === 'too_short_user_password') {
                        alert(res["data"]);
                        signupForm.userPassword.value = '';
                        signupForm.userPassword2.value = '';
                    }
                    else if(res["status"] === 'too_long_user_password') {
                        alert(res["data"]);
                        signupForm.userPassword.value = '';
                        signupForm.userPassword2.value = '';
                    }
                    else if(res["status"] === 'different_passwords') {
                        alert(res["data"]);
                        signupForm.userPassword.value = '';
                        signupForm.userPassword2.value = '';
                    }
                    // дубликаты введенных данных
                    else if(res["status"] === 'already_name') {
                        alert(res["data"]);
                        signupForm.userName.value = '';

                    }
                    else if(res["status"] === 'already_email') {
                        alert(res["data"]);
                        signupForm.userEmail.value = '';
                    }
                    // согласие с правилами поведения на блоге
                    else if(res["status"] === 'no_user_agreed') {
                        alert(res["data"])
                    }
                    // ошибка подключения к БД
                    else if(res["status"] === 'no_database_connect') {
                        Tools.techErrorAlert();
                        console.log(res["data"]);
                    }
                    // самый неожиданный вариант
                    else {
                        Tools.techErrorAlert();
                        console.log("С сервера пришел неизвестный статус: ", res["status"]);
                    }
                    /*
                    // зачистка формы регистрации
                    signupForm.userName.value = '';
                    signupForm.userEmail.value = '';
                    signupForm.userPassword.value = '';
                    signupForm.userPassword2.value = '';
                    signupForm.agreed.checked = false;

                    $scope.newUser = {};
                    */

                } // if
            }); // success
    } // signupNewUser

    $scope.message = "Ready";  
});
