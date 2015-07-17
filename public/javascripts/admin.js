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

app.controller('MagasinController', function($scope, $http){
    $scope.new = {};
    $scope.data = {};
    $scope.data.query = '';
    $scope.getMagasins = function(){
        $http.post("magasins",{
            nom: $scope.data.query
        }).success(function(res){
            $scope.magasins = res;
        });
    };
    $scope.add = function(){
        //console.log("Add : "+$scope.new.name+" "+$scope.new.adress);
        $http.post("newMagasin", {
            nom: $scope.new.name,
            adresse: $scope.new.adress
        });
    };
    $scope.getMagasins();
});

app.controller('VendeuseController', function($scope, $http){
    $scope.new = {};
    $scope.data = {};
    $scope.data.query = '';
    $scope.getVendeuses = function(){
        $http.post("vendeuses",{
            nom: $scope.data.query
        }).success(function(res){
            $scope.vendeuses = res;
        });
    };
    $scope.add = function(){
        $http.post("newVendeuse", {
            nom: $scope.new.name,
        });
    };
    $scope.getVendeuses();
});

app.controller('TerminalController', function($scope, $http){
    $scope.new = {};
    $scope.data = {};
    $scope.data.query = '';
    $scope.selectedMagasins = {};
    $scope.getTerminals = function(){
        $http.post("terminals",{
            magasin: $scope.selectedMagasins
        }).success(function(res){
            $scope.terminals = res;
        });
    };
    $http.post("magasins").success(function(res){
        $scope.magasins = res;
    });
    $scope.add = function(){
        if($scope.new.magasin) {
            $http.post("newTerminal", {
                magasin: $scope.new.magasin
            });
        }
        $scope.new.magasin = '';
    };
    $scope.modify = function(toMod){
        console.log(toMod);
        console.log($scope.terminals);
        $http.post("modify/terminal", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/terminal",{
            toRemove: toRem
        });
    }
    $scope.getTerminals();
});

app.controller('FerieController', function($scope, $http){
    $scope.newdate;
    $scope.getFeries = function(){
        $http.post("feries",{
        }).success(function(res){
            $scope.feries = res;
        });
    };
    $scope.add = function(){
        if($scope.newdate) {
            console.log($scope.newdate);
            $http.post("newFerie",{
                date: $scope.newdate
            });
        }
        else{
            console.log("Enter a date")
        }
    };
    $scope.delete = function(toRem){
        $http.post("remove/ferie",{
            toRemove: toRem
        });
    }
    $scope.getFeries();
});