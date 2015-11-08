var app = angular.module('admin',[]);

app.controller('CommandeController', ['$scope', '$filter', '$http', '$window', function($scope, $filter, $http, $window){
    $scope.params= {selectedMagasins:{},dateCreate:'',dateLivraison:'',nbrResult:0};
    $scope.refresh = function(){
        $http.post("get/commande", {
            params:$scope.params
        }).success(function(res){
            $scope.commandes = res;
            console.log(res.length);
        });
    };
    $scope.displayBool = function(x){
        if(x==1){
            return "OK";
        }
        else{
            return "SUPPRIMEE";
        }
    }
    $scope.ngclassDisplay = function(x){
        if(x==1){
            return "";
        }
        else{
            return "danger";
        }
    }
    $http.post("get/magasin").success(function(res){
        $scope.magasins = res;
    });
    $scope.modify = function(toMod){
        console.log(toMod);
        $http.post("modify/commande", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/commande",{
            toRemove: toRem
        }).success(function(){
            $scope.refresh();
            $scope.noDetails();
        });
    };
    $scope.refresh();
    //detail commande
    $scope.detailCommandeIsOn = false
    $scope.det_com = {}
    //DS = DateString
    $scope.DS = function(d){
        return $filter('date')(d, 'EEEE dd/MM/yyyy');
    };
    $scope.details = function(x){
        $http.post("complex/fullCommande", {params:{idCommande: x.idCommande}}).success(function(res){
            var vendeuse = {Nom:x.vendeuseNom}
            $scope.det_com = res;
            $scope.det_com.vendeuse = vendeuse;
            $scope.det_com.heure = (new Date($scope.det_com.Livraison)).getHours();
            $scope.det_com.date =  $scope.DS(new Date($scope.det_com.Livraison));
            $scope.detailCommandeIsOn = true;
            console.log("detailCommandeIsOn");
        });
    };
    $scope.noDetails = function(){
        $scope.detailCommandeIsOn = false
        $scope.det_com.idCommande = -1
    }
}]);

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
        console.log(toMod);
        $http.post("modify/client", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/client",{
            toRemove: toRem
        });
    };
    $scope.getClients();
});

app.controller('ProduitController', function($scope, $http){
    $scope.params = {Nom:'',selectedCategories:{}};
    $scope.new = {};
    $scope.getProduits = function(){
        $http.post("get/produit", {
            params : $scope.params
        }).success(function(res){
            $scope.produits = res;
        });
    };
    $http.post("get/category").success(function(res){
        $scope.categories = res;
    });
    $scope.getRegroupements = function(){
        $http.post("get/regroupement").success(function(res){
            $scope.regroupements = res;
        });
    };
    $scope.getRegroupements();
    $scope.checkCateg = function(prod){
        if(prod.regroupement_idRegroupement != ''){
            for(var i = 0;i<$scope.regroupements.length;i++){
                var R = $scope.regroupements[i];
                if(prod.regroupement_idRegroupement == R.idRegroupement){
                    return prod.Categorie_idCategorie == R.Categorie_idCategorie;
                }
            }
        }
        else return true;
    };
    $scope.getProdRegroupement =function(p){
        if(p.regroupement_idRegroupement != ''){
            for(i=0; i<$scope.regroupements.length;i++){
                if(p.regroupement_idRegroupement == $scope.regroupements[i].idRegroupement){
                    return $scope.regroupements[i].Nom;
                }
            }
            return '';
        }
        return '';
    };
    $scope.add = function(){
        console.log($scope.new);
        if($scope.checkCateg($scope.new)){
            $http.post("add/produit", {
                new: $scope.new
            });
            $scope.new={};
        }
    };
    $scope.modify = function(toMod){
        console.log(toMod);
        if($scope.checkCateg(toMod)){
            $http.post("modify/produit", {
                toModify: toMod
            })
        }
    };
    $scope.delete = function(toRem){
        $http.post("remove/produit",{
            toRemove: toRem
        });
    }

    //regroupements
    $scope.initNewRegroupement = function(){
        $scope.regroupementPanelIsOn = false;
        $scope.selection = [];
        $scope.newRegroupement = {Nom:"",Categorie_idCategorie:0};
    };
    $scope.initNewRegroupement();

    $scope.hasRegroupement = function(produit){
        if($scope.getProdRegroupement(produit) != ''){
            return true;
        }
        else{
            return false;
        }
    };
    $scope.checkNewRegroupement = function(){
        var ret = false;
        if($scope.newRegroupement.Nom != "" && $scope.selection.length > 1){
            ret = true;
            var categ = $scope.selection[0].Categorie_idCategorie;
            for (i = 1; i < $scope.produits.length; i++) {
                if($scope.produits[i].Categorie_idCategorie != categ){
                    ret = false;
                    console.log("mismatch categories");
                }
            }
        }
        return ret;
    };
    $scope.addRegroupement = function(){
        if($scope.checkNewRegroupement()){
            $scope.newRegroupement.Categorie_idCategorie = $scope.selection[0].Categorie_idCategorie;
            console.log($scope.newRegroupement);console.log($scope.selection);
            $http.post("complex/addRegroupement",{params:{
                Nom:$scope.newRegroupement.Nom,
                Categorie_idCategorie:$scope.newRegroupement.Categorie_idCategorie,
                produits:$scope.selection
            }}).success(function(){
                $scope.getProduits();
                $scope.getRegroupements()
                $scope.initNewRegroupement();
            });
        }
    }
    $scope.selectProduct= function(p){
        console.log("selectProduct")
        var dontdoit = false;
        if($scope.selection.length > 0){
            if($scope.selection[0].Categorie_idCategorie != p.Categorie_idCategorie){
                dontdoit = true;
                console.log("Wrong category");
                return -1;
            }
        }
        if(!dontdoit){
            $scope.selection.push(p);
            $scope.newRegroupement.Categorie_idCategorie = p.Categorie_idCategorie;
            $scope.regroupementPanelIsOn = true;
        }
    };
    $scope.cancelRegroupement = function(){
        $scope.initNewRegroupement();
    };
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
        console.log(toMod);
        $http.post("modify/category", {
            toModify: toMod
        })
    };
    $scope.delete = function(toRem){
        $http.post("remove/category",{
            toRemove: toRem
        });
    };
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
    };
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
        //todo rajouter cette ligne dans les autres controllers
        if($scope.new.Nom && $scope.new.Magasin_idMagasin) {
            $http.post("add/vendeuse", {
                new: $scope.new
            });
            $scope.new = {};
        }
        else{
            console.log('pas possible')
        }
        //todo : le else
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
    };
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
    };
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
    };
    $scope.modify = function(toMod){
        $http.post("modify/custom",{
            toModify: toMod
        });
    };
    $scope.getCustoms();
});


app.controller('RegroupementController', function($scope, $http){
    $scope.new = {};
    $scope.getRegroupement = function(){
        $http.post("complex/getRegroupement",{
        }).success(function(res){
            $scope.regroupements = res;
            console.log($scope.regroupements);
        });
        $http.post("get/category",{
        }).success(function(res){
                $scope.categories = res;
            }
        );
    };
    $scope.add = function(){
        $http.post("add/regroupement", {
            new: $scope.new
        }).success(function(res){
            $scope.new={};
            $scope.getRegroupement();
        });
    };
    $scope.modify = function(toMod){
        console.log(toMod);
       /*TODO $http.post("modifyRegroupement", {
            toModify: toMod
        })*/
    };
    $scope.delete = function(toRem){
        //params = {idRegroupement:idRegroupement}
        $http.post("complex/removeRegroupement",{
            params: toRem
        }).success(function(){$scope.getRegroupement();});
    };
    $scope.getRegroupement();
});
