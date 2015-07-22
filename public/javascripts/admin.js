var app = angular.module('admin',[]);

app.controller('CommandeController', function($scope, $http){
    $scope.params= {selectedMagasins:{},dateCreate:'',dateLivraison:'',nbrResult:0};
    $scope.refresh = function(){
        $http.post("get/commande", {
            params:$scope.params
        }).success(function(res){
            $scope.commandes = res;
        });
    };
    $http.post("get/magasin").success(function(res){
        $scope.magasins = res;
    });
    $scope.modify = function(toMod){
        console.log(toMod)
        $http.post("modify/commande", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/commande",{
            toRemove: toRem
        });
    }
    $scope.refresh();
});

app.controller('ClientController', function($scope, $http){
    $scope.params = {Nom:""};
    $scope.getClients = function(){
        $http.post("get/client", {
            params: $scope.params
        }).success(function(res){
            $scope.clients = res;
        });
    };
    $scope.modify = function(toMod){
        console.log(toMod)
        $http.post("modify/client", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/client",{
            toRemove: toRem
        });
    }
    $scope.getClients();
});

app.controller('ProduitController', function($scope, $http){
    $scope.params = {Nom:'',selectedCategories:{}};
    $scope.new = {};
    $scope.getProduits = function(){
        $http.post("get/produit", {
            params : $scope.params,
        }).success(function(res){
            $scope.produits = res;
        });
    };
    $http.post("get/category").success(function(res){
        $scope.categories = res;
    });
    $scope.add = function(){
        console.log($scope.new)
        $http.post("add/produit", {
            new: $scope.new
        })
        $scope.new={};
    };
    $scope.modify = function(toMod){
        console.log(toMod)
        $http.post("modify/produit", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/produit",{
            toRemove: toRem
        });
    }
});

app.controller('CategoryController', function($scope, $http){
    $scope.new = {};
    $scope.getCategories = function(){
        $http.post("get/category",{
        }).success(function(res){
            $scope.categories = res;
        });
    };
    $scope.add = function(){
        $http.post("add/category", {
            new: $scope.new
        });
        $scope.new={};
    };
    $scope.modify = function(toMod){
        console.log(toMod)
        $http.post("modify/category", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/category",{
            toRemove: toRem
        });
    }
    $scope.getCategories();
});

app.controller('MagasinController', function($scope, $http){
    $scope.new = {};
    $scope.getMagasins = function(){
        $http.post("get/magasin",{
        }).success(function(res){
            $scope.magasins = res;
        });
    };
    $scope.add = function(){
        $http.post("add/magasin", {
            new: $scope.new
        });
        $scope.new = {};
    };
    $scope.modify = function(toMod){
        $http.post("modify/magasin", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/magasin",{
            toRemove: toRem
        });
    }
    $scope.getMagasins();
});

app.controller('VendeuseController', function($scope, $http){
    $scope.new = {};
    $scope.params = {Nom:'', selectedMagasins:{}};
    $scope.getVendeuses = function(){
        $http.post("get/vendeuse",{
            params: $scope.params
        }).success(function(res){
            $scope.vendeuses = res;
        });
    };
    $scope.add = function(){
        $http.post("add/vendeuse", {
            new: $scope.new
        });
        $scope.new = {};
    };
    $scope.modify = function(toMod){
        $http.post("modify/vendeuse", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/vendeuse",{
            toRemove: toRem
        });
    };
    $http.post("get/magasin").success(function(res){
        $scope.magasins = res;
    });
    $scope.getVendeuses();
});

app.controller('TerminalController', function($scope, $http){
    $scope.new = {};
    $scope.params = {selectedMagasins:{}};
    $scope.getTerminals = function(){
        $http.post("get/terminal",{
            params: $scope.params
        }).success(function(res){
            $scope.terminals = res;
        });
    };
    $http.post("get/magasin").success(function(res){
        $scope.magasins = res;
    });
    $scope.add = function(){
        console.log("nouveau terminal : "+$scope.new.idMagasin);
        if($scope.new.Magasin_idMagasin) {
            $http.post("add/terminal", {
                new: $scope.new
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
    $scope.new= {};
    $scope.getFeries = function(){
        $http.post("get/ferie",{
        }).success(function(res){
            $scope.feries = res;
        });
    };
    $scope.add = function(){
        if($scope.newdate) {
            console.log($scope.newdate);
            $http.post("add/ferie",{
                new: $scope.new
            });
            $scope.new={};
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


app.controller('CustomController', function($scope, $http){
    $scope.new = {};
    $scope.getCustoms = function(){
        $http.post("get/custom",{params:{}
        }).success(function(res){
            $scope.customs = res;
        });
        $http.post("get/category",{
            }).success(function(res){
                $scope.categories = res;
            }
        )
    };
    $scope.add = function(){
        if($scope.new.Nom) {
            console.log($scope.new);
            $http.post("add/custom",{
                new: $scope.new
            });
            $scope.new={};
        }
        else{
            console.log("Missing informations")
        }
    };
    $scope.delete = function(toRem){
        $http.post("remove/custom",{
            toRemove: toRem
        });
    }
    $scope.modify = function(toMod){
        $http.post("modify/custom",{
            toModify: toMod
        });
    }
    $scope.getCustoms();
});