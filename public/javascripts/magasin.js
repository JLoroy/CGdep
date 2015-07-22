var app = angular.module('magasin',[]);


app.run(function ($rootScope, $http){
    $rootScope.commande = {};
    $rootScope.activeMenu = "vendeuse";
    $rootScope.messageErreur = "";
    $rootScope.displayErreur = false;
    $rootScope.setActiveMenu = function(menu){
        $rootScope.activeMenu = menu;
    };
    $rootScope.isActiveMenu = function(menu){
        if(menu=='commande'){
            return $rootScope.activeMenu in {
                    date:1, heure:2, client:3, produit:4,
                commentaire:5, payement:6, recap:7}?"":"hidden";
        }
        return menu==$rootScope.activeMenu?"":"hidden";
    }
    $rootScope.erreur = function(message){
        $rootScope.messageErreur = message;
        $rootScope.displayErreur = true;
    }
    $rootScope.calculLivraison = function(){
        $rootScope.commande.Livraison=$rootScope.commande.dateLivraison+$rootScope.commande.heureLivraison
    };
});

app.controller('rootScopeVisualController', function($scope, $rootScope, $http){
    $scope.clearErreur = function(){
        $rootScope.messageErreur = "";
        $rootScope.displayErreur = false;
    };
});

app.controller('choixVendeuse', function($scope, $rootScope, $http){
    //
    $scope.ok = false;
    $scope.activeTab = 1;
    $scope.n_by_row = 5;
    $http.post("get/magasin", {}).success(function(res){
        //$rootScope.magasins = res;
        $rootScope.magasins = res;
        $http.post("/getsession", {}).success(function(res){
            $rootScope.sess = res;
            $scope.activeTab = $rootScope.sess.magasin.idMagasin;
            $scope.ok = true;
            console.log("Loaded");
        });
        $http.post("get/vendeuse",{params:{}}).success(function(res){
            $rootScope.vendeuses = res;
            $scope.vendByMag = {};
            for(mag in $rootScope.magasins){
                if($rootScope.magasins[mag].display == 1) {
                    $scope.vendByMag[$rootScope.magasins[mag].idMagasin] = {idMagasin:$rootScope.magasins[mag].idMagasin};
                    var indice = 0
                    for (vend in $rootScope.vendeuses) {
                        if ($rootScope.vendeuses[vend].Magasin_idMagasin == $rootScope.magasins[mag].idMagasin) {
                            if (indice % $scope.n_by_row == 0) $scope.vendByMag[$rootScope.magasins[mag].idMagasin][indice / $scope.n_by_row|0] = {};
                            $scope.vendByMag[$rootScope.magasins[mag].idMagasin][indice / $scope.n_by_row |0][indice % $scope.n_by_row] = $rootScope.vendeuses[vend];
                            indice++;
                        }
                    }
                }
            }
        });
    });
    $scope.selectVendeuse = function(v){
        $rootScope.commande.Vendeuse_idVendeuse = v.idVendeuse;
        $rootScope.commande.Vendeuse_NomVendeuse = v.Nom;
    };
    $scope.next = function(){
        $rootScope.activeMenu = "main";
    };
    $scope.activeClass = function(id) {
        //determine si le tab magasin selectioné est "id"
       return id == $scope.activeTab ? 'active' : '';
    };
});

app.controller('mainMenu', function($scope, $rootScope, $http){
    $scope.toCommand = function(){$rootScope.activeMenu = "date";};
    $scope.toConsult = function(){$rootScope.activeMenu = ''};

});


app.controller('commandeController', function($scope, $rootScope, $http){

    $scope.controlTab = function(tab){
        classes = "";
        if($rootScope.activeMenu == tab) classes += "active ";
        switch(tab){
            case "date":
                classes += $rootScope.commande.dateLivraison?"":"disabled";
                break;
            case "heure":
                classes += $rootScope.commande.heureLivraison?"":"disabled";
                break;
            case "client":
                classes += $rootScope.commande.client?"":"disabled";
                break;
            case "produit":
                classes += $rootScope.commande.Montant?"":"disabled";
                break;
            case "commentaire":
                classes += $rootScope.commande.Remarque?"":"disabled";
                break;
            case "payement":
                classes += $rootScope.commande.PNP?"":"disabled";
                break;
            case "recap":
                classes += $rootScope.commande.PNP?"":"disabled";
                break;
        }
        return classes;
    };
});
app.controller('comDate', function($scope, $rootScope, $http) {
    //verifier commande.Livraison
    $scope.isThisActive = function(date){
        return $rootScope.commande.dateLivraison == date?"active":"";
    };
    //fonction pour passer de date à heure
    $scope.next = function () {
        if ($rootScope.commande.dateLivraison) $rootScope.activeMenu = "heure";
        else $rootScope.erreur("Veuillez entrer une date");
        if ($rootScope.commande.dateLivraison && $rootScope.commande.heureLivraison) $rootScope.calculLivraison();
    };
    //fonction qui va set la date de la commande a la date choisie
    $scope.selectDate = function(date){
        $rootScope.commande.dateLivraison = date;
        $scope.next();
    };
    //creation du calendar
    $scope.calendar = {1:{},2:{},3:{},4:{}};
    $scope.today = new Date();
    $scope.day = new Date();
    var past = (($scope.today).getDay());
    $scope.day.setDate(($scope.today).getDate()+1-past);
    for(i=1; i<=4; i++) {
        for(j=1; j<=7; j++){
            $scope.calendar[i][j] = {};
            $scope.calendar[i][j].date = new Date($scope.day);
            if(past){//on disable les past premiers jours
                $scope.calendar[i][j].ok = false;
                past--;}
            else{$scope.calendar[i][j].ok = true;}
            $scope.day.setDate(($scope.day).getDate()+1);
        }
    }
    console.log($scope.calendar);
});
app.controller('comHeure', function($scope, $rootScope, $http){
    //verifier commande.Livraison

    //permet de verifier si le bouton de l'heure a été celui cliqué. Si oui, on rajotue la classe active
    $scope.isThisActive = function(heure){
        return $rootScope.commande.heureLivraison == heure?"active":"";
    };
    //fonction qui set l'heure de la commande à l'heure cliquée
    $scope.selectHeure = function(heure){
        $rootScope.commande.heureLivraison = heure;
        $scope.next();
    };
    //passer de heure à client
    $scope.next = function(){
        if($rootScope.commande.heureLivraison) $rootScope.activeMenu = "client";
        else $rootScope.erreur("Veuillez entrer une heure");
        if ($rootScope.commande.dateLivraison && $rootScope.commande.heureLivraison) $rootScope.calculLivraison();
    };
});
app.controller('comClient', function($scope, $rootScope, $http){
    $scope.client = {};
    $scope.selectClient = function(){
        if($scope.client.Nom) {
            $rootScope.commande.client = $scope.client;
            $scope.next();
        }
        else{$rootScope.erreur("Entrez un Client");}
    };
    $scope.next = function(){
        $rootScope.setActiveMenu('produit');
    };
});
app.controller('comProduit', function($scope, $rootScope, $http){
    $scope.n_by_row = 4;
    $scope.presentation = {};
    $scope.activeCategorie = "";
    $scope.listProduit = [];
    $scope.total = 0;
    $http.post("/get/produit", {params:{}}).success(function(res){
        $rootScope.produits = res;
        $http.post("/get/category", {params:{}}).success(function(res){
            $rootScope.categories = res;
            for(categ in res) {
                if(res[categ].display == 1){
                    $scope.presentation[res[categ].idCategorie] = {i:0,idCategorie:(res[categ].idCategorie)};
                }
            }
            for(prod in $rootScope.produits){
                thisProd = $rootScope.produits[prod];
                if($rootScope.produits[prod].display == 1){
                    i = $scope.presentation[thisProd.Categorie_idCategorie].i;
                    if(i%$scope.n_by_row == 0) $scope.presentation[thisProd.Categorie_idCategorie][i/$scope.n_by_row |0] = {};
                    $scope.presentation[thisProd.Categorie_idCategorie][i/$scope.n_by_row |0][i%$scope.n_by_row] = {thisProd:thisProd};
                    $scope.presentation[thisProd.Categorie_idCategorie].i= i+1;
                }
            }
            console.log($scope.presentation);
        });
    });
    $scope.selectCategorie = function(idCategorie){
        $scope.activeCategorie = idCategorie;
    };
        $scope.tabCategorie = function(idCategorie){
        return idCategorie == $scope.activeCategorie?"active":"hidden";
    };
    $scope.addProduit = function(toAdd){
        console.log($scope.listProduit.length);
        $scope.listProduit.push({prod:toAdd, qty:1});
        console.log($scope.listProduit.length);
        $scope.calculTotal();
    };
    $scope.calculTotal = function(){
        var tot = 0;
        for(i = 0; i<$scope.listProduit.length; i++){
            p = $scope.listProduit[i]
            tot += (p.qty * p.prod.Prix);
        }
        console.log("total :"+tot);
        $scope.total = tot.toFixed(2);
    };
    $scope.next = function(){
        $rootScope.commande.Montant = $scope.total;
        if($rootScope.commande.Montant >= 0) $rootScope.activeMenu = "commentaire";
        else $rootScope.erreur("Veuillez entrer des produits");
    };
});
app.controller('comCommentaire', function($scope, $rootScope, $http){
    $scope.commentaire = "";
    $scope.selectCommentaire = function(){
        $rootScope.commande.Remarque = $scope.commentaire;
        $scope.next();
    };
    $scope.next = function(){
        if(!($rootScope.commande.Remarque)) $rootScope.commande.Remarque = "";
        $rootScope.activeMenu = "payement";
    };
});
app.controller('comPayement', function($scope, $rootScope, $http){
    $scope.Montant = $rootScope.commande.Montant;
    $scope.selectPNP = function(PNP){
        $rootScope.commande.PNP = PNP;
        $scope.next();
    };
    $scope.next = function(){
        if($rootScope.commande.PNP) $rootScope.activeMenu = "recap";
        else $rootScope.erreur("choisir PNP");
    };
});
app.controller('comRecap', function($scope, $rootScope, $http){
    //$scope.commande = $rootScope.commande;
});