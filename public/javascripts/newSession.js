var app = angular.module('newSession',[]);

app.controller('newSessionController', function($scope, $http){
    $scope.data = {};
    $scope.sendSession = function(){
        console.log($scope.data);
        $http.post("/newsession",{
            data: $scope.data
        });
    };
    $http.post("/terminals", {}).success(function(res){
        $scope.terminals = res;
    });
    $http.post("/magasins", {}).success(function(res){
        $scope.magasins = res;
    });
});