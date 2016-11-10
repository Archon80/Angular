// var globalPath = "/app/";
var globalPath = "";
// роутинг приложения
app.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    /*$locationProvaider.html5Mode({
        enabled: true,
        requreBase: false
    });*/
    $routeProvider
        .when("/welcome", {
            templateUrl: "view/welcome.html"
        })
        .when("/main", {
            templateUrl: "view/base.html"
        })
        .when("/sign", {
            templateUrl: "view/sign.html"
        })
        .when("/login", {
            templateUrl: "view/login.html"
        })
        .when("/show", {
            templateUrl: "view/show.html"
        })
        .when("/new", {
            resolve: { "check": checkAuth },
            templateUrl: "view/new.html"
        })
        .when("/edit", {
            resolve: { "check": checkAuth },
            templateUrl: "view/edit.html"
        })
        .when("/user", {
            templateUrl: "view/user.html"
        })
        .otherwise({
            redirectTo: "/welcome"
        });
        /*
        .when("/user", {
            templateUrl: globalPath + "view/user.html"
        })
        */

        function checkAuth($location) {
            if(!localStorage.getItem("loggedID")) {
                $location.path("/welcome");
            }
        }

});