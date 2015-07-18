var app = angular.module('magasin',[]);

app.run(function($rootScope, $http){
    $http.post("/getsession", {}).success(function(res){
        $rootScope.sess = res;
    });
});

app.controller('choixVendeuse', function($scope, $http){
    $scope.activeTab = sess.idMagasin;
    $http.post("magasins").success(function(res){
        $scope.magasins = res;
    });
});
