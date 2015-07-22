var app = angular.module('newSession',[]);

app.controller('newSessionController', function($scope, $http){
    $scope.data = {};
    $scope.sendSession = function(){
        console.log($scope.data);
        $http.post("/newsession",{
            data: $scope.data
        });
    };
    $http.post("get/terminal", {}).success(function(res){
        $scope.terminals = res;
    });
    $http.post("get/magasin", {}).success(function(res){
        $scope.magasins = res;
    });
});