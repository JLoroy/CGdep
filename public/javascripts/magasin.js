var app = angular.module('magasin',[]);


app.factory('items', function ($rootScope, $http){
    $http.post("magasins", {}).success(function(res){
        //$rootScope.magasins = res;
    });
    $http.post("/getsession", {}).success(function(res){
        //$rootScope.sess = res;
        //console.log("session intiated");
    });
    return {mag: magasins, sess : session};
});

app.controller('rootScopeVisualController', function($scope, $rootScope, $http){

});

app.controller('choixVendeuse', function($scope, $rootScope, $http){
    $scope.ok = false;
    $scope.activeTab = 1;//items.sess.magasin.idMagasin;
    /*$http.post("magasins").success(function(res){
        $scope.magasins = res;
    });*/
    $http.post("magasins", {}).success(function(res){
        //$rootScope.magasins = res;
        $rootScope.magasins = res;
        $http.post("/getsession", {}).success(function(res){
            $rootScope.sess = res;
            $scope.activeTab = $rootScope.sess.magasin.idMagasin;
            $scope.ok = true;

            console.log("Loaded");
        });
    });
    $scope.activeClass = function(id) {
       return id == $scope.activeTab ? 'active' : '';
    };/*
    $scope.$watch(
        function value_to_watch(items){return items.sess.magasin.idMagasin;}
        function what_to_do(newValue, oldValue, scope){$scope.activeTab = newValue};
    );*/

});

/*app.controller('choixVendeuse', function($scope, $rootScope, $http){
    $rootscope.sess = {};
    $rootScope.sess.magasin.idMagasin = 1;
    console.log("xxx");
    console.log($rootScope.sess)
    console.log("xxx");
    $scope.activeTab = $rootScope.sess.magasin.idMagasin;
    $http.post("magasins").success(function(res){
        $scope.magasins = res;
    });
    $scope.$watch(
        function value_to_watch(rootScope){return rootScope.sess.magasin.idMagasin;}
    function what_to_do(newValue, oldValue, scope){$scope.activeTab = newValue};);

});*/



/*
app.factory('items', function(){
    var sess = {};
    var magasins = {};
    $http.post("magasins").success(function(res){
        magasins = res;
    });
});
app.run(function($rootScope, $http, items){
    $http.post("/getsession", {}).success(function(res){
        items.sess = res;
        console.log("---");
        console.log(res);
        console.log("---");
    });
});

app.controller('choixVendeuse', function($scope, $rootScope, $http){
    console.log($rootScope.sess)
    $scope.activeTab = 1;//$rootScope.sess.magasin.idMagasin;
});
*/
