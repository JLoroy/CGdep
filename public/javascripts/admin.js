var app = angular.module('admin',[]);

/*app.controller('MainController', function($scope, $http) {
    $scope.data = {display:true};
    $http.get("admin/data").success(function(res){
        $scope.clients = res;
        console.log(res);
    });
});*/

app.controller('CommandeController', function($scope, $http){
    $scope.selectedMagasins = {};
    $scope.dateCreate = '';
    $scope.dateLivraison='';
    $scope.nbrResult=0;
    $scope.refresh = function(){
        $http.post("commandes", {
            selectedMagasins: $scope.selectedMagasins,
            dateCreate:$scope.dateCreate,
            dateLivraison:$scope.dateLivraison,
            nbrResult:$scope.nbrResult
        }).success(function(res){
            $scope.commandes = res;
        });
    };
    $http.post("magasins").success(function(res){
        $scope.magasins = res;
    });
});

app.controller('ClientController', function($scope, $http){
    $scope.data = {};
    $scope.data.query = '';
    $scope.getClients = function(){
        $http.post("clients", {
            nom: $scope.data.query
        }).success(function(res){
            $scope.clients = res;
        });
    };
});

app.controller('ProduitController', function($scope, $http){
    $scope.data = {};
    $scope.data.query = '';
    $scope.data.selectedCategories = {};
    $scope.getProduits = function(){
        $http.post("produits", {
            selectedCategories: $scope.data.selectedCategories,
            nom: $scope.data.query
        }).success(function(res){
            $scope.produits = res;
        });
    };
    $http.post("categories").success(function(res){
        $scope.categories = res;
    });
});

app.controller('CategoryController', function($scope, $http){
    $scope.new = '';
    $scope.data = {};
    $scope.data.query = '';
    $scope.getCategories = function(){
        $http.post("categories",{
            nom: $scope.data.query
        }).success(function(res){
            $scope.categories = res;
        });
    };
    $scope.add = function(){
        $http.post("newCategory", {
            nom: $scope.new
        });
    };
    $scope.getCategories();
});