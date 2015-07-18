var app = angular.module('newSession',[]);

app.controller('newSessionController', function($scope, $http){
    $scope.data = {}
    $scope.sendSession = function(){
        $http.post("/newsession",{
            session: data
        })
    };
    $http.post("/terminals", function(req,res){}).success(function(res){
        $scope.terminals = res;
    });
    $http.post("/magasins", function(req,res){}).success(function(res){
        $scope.magasins = res;
    });
});