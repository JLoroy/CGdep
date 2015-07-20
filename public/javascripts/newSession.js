var app = angular.module('newSession',[]);

app.controller('newSessionController', function($scope, $http){
    $scope.data = {};
    $scope.sendSession = function(){
        $http.post("/newsession",{
            session: data
        })
    };
    $http.post("/terminals", {}).success(function(res){
        $scope.terminals = res;
    });
    $http.post("/magasins", {}).success(function(res){
        $scope.magasins = res;
    });
});