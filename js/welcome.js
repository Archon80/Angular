// контроллер приветствия пользователя на главной странице
app.controller("startCtrl", function($scope, $location) {
    
    $scope.goToSignupPage = function() {
        $location.path("/sign");
    }

    $scope.goToLoginPage = function() {
        $location.path("/login");
    }
});