var app = angular.module('magasin',[]);


app.run(function ($rootScope, $http){
    $rootScope.vendeuse = {Nom:'', idVendeuse:''};
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
        return menu==$rootScope.activeMenu?"active":"hidden";
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

    //todo:REFACTOR this into complex/vendByMag
    $http.post("get/magasin", {}).success(function(res){
        $rootScope.magasins = res;
        $http.post("/getsession", {}).success(function(res){
            $rootScope.sess = res;
            $scope.activeTab = $rootScope.sess.magasin.idMagasin;
            $scope.ok = true;
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
        $rootScope.vendeuse = v;
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
    //object commande global (pour sortir du rootScope, sauf vendeuse)
    $scope.montant = "";
    $scope.commande = {
        date:'',
        heure:'',
        client:{Nom:'',Tel:'',Mail:'',TVA:''},
        produits:[],
        remarque:'',
        PNP:'',
        montant:''
    }

    $scope.controlTab = function(tab){
        classes = "";
        if($rootScope.activeMenu == tab) classes += "active ";
        switch(tab){
            case "date":
                classes += $scope.commande.date!=''?"":"disabled";
                break;
            case "heure":
                classes += $scope.commande.heure!=''?"":"disabled";
                break;
            case "client":
                classes += $scope.commande.client.Mail!=''?"":"disabled";
                break;
            case "produit":
                classes += $scope.commande.montant!=''?"":"disabled";
                break;
            case "commentaire":
                classes += $scope.commande.remarque!=''?"":"disabled";
                break;
            case "payement":
                classes += $scope.commande.PNP!=''?"":"disabled";
                break;
            case "recap":
                classes += $scope.commande.PNP!=''?"":"disabled";
                break;
            default:
                console.log("Who are you?"+tab);
        }
        return classes;
    };

    $scope.next = function (from) {
        var tab = '';
        switch(from){
            case 'date':
                tab='heure';
                break;
            case 'heure':
                tab='client';
                break;
            case 'client':
                tab='produit';
                break;
            case 'produit':
                tab='commentaire';
                break;
            case 'commentaire':
                tab='payement';
                break;
            case 'payement':
                tab='recap';
                break;
            default:
                tab='date';
        }
        $rootScope.activeMenu = tab;

    };

    //<!-- ONLY FOR DATE-->
    //rajoute la classe active si c'est la date active
    $scope.activeDate = function(date){
        return $scope.commande.date == date?"active btn-primary":"";
    };
    //fonction qui va set la date de la commande a la date choisie
    $scope.selectDate = function(date){
        $scope.commande.date = date;
        $scope.next('date');
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


    //<!-- ONLY FOR HER-->
    //permet de verifier si le bouton de l'heure a été celui cliqué. Si oui, on rajotue la classe active
    $scope.activeHeure = function(heure){
        return $scope.commande.heure == heure?"active btn-primary":"";
    };
    //fonction qui set l'heure de la commande à l'heure cliquée
    $scope.selectHeure = function(heure){
        $scope.commande.heure = heure;
        $scope.next('heure');
    };


    //<!-- ONLY FOR ClIENT-->
    $scope.selectClient = function(){
        if($scope.commande.client.Nom != '') {
            //todo : rajouter le tel obligatoire (ici)
            $scope.next('client');
        }
        else{$rootScope.erreur("Entrez un Client");}
    };
    $scope.getClients = function(){
        $http.post("get/client", {
         params: {Nom:$scope.commande.client.Nom}
         }).success(function(res){
         $scope.clients = res;
         });
    };


    //<!-- ONLY FOR PRODUIT-->
    $scope.n_by_row = 4;
    $scope.produitTable = {};
    $scope.activeCategorie = "1";//todo issue if categorie 1 is deleted
    $scope.total = 0;
    //todo:REFACTOR this into complex/produitTable
    $http.post("/get/produit", {params:{}}).success(function(res){
        $rootScope.produits = res;
        $http.post("/get/category", {params:{}}).success(function(res){
            $rootScope.categories = res;
            for(categ in res) {
                if(res[categ].display == 1){
                    $scope.produitTable[res[categ].idCategorie] = {i:0,idCategorie:(res[categ].idCategorie)};
                }
            }
            for(prod in $rootScope.produits){
                thisProd = $rootScope.produits[prod];
                if($rootScope.produits[prod].display == 1){
                    i = $scope.produitTable[thisProd.Categorie_idCategorie].i;
                    if(i%$scope.n_by_row == 0) $scope.produitTable[thisProd.Categorie_idCategorie][i/$scope.n_by_row |0] = {};
                    $scope.produitTable[thisProd.Categorie_idCategorie][i/$scope.n_by_row |0][i%$scope.n_by_row] = {thisProd:thisProd};
                    $scope.produitTable[thisProd.Categorie_idCategorie].i= i+1;
                }
            }
        });
    });
    $scope.selectCategorie = function(idCategorie){
        $scope.activeCategorie = idCategorie;
    };
    $scope.tabCategorie = function(idCategorie){
        return idCategorie == $scope.activeCategorie?"active":"hidden";
    };
    $scope.addProduit = function(toAdd, quantity){
        $scope.commande.produits.push({prod:toAdd, qty:quantity});
        $scope.calculTotal();
        console.log($scope.commande.produits);
    };
    $scope.calculTotal = function(){
        var tot = 0;
        for(i = 0; i<$scope.commande.produits.length; i++){
            var p = $scope.commande.produits[i];
            tot += (p.qty * p.prod.Prix);
        }
        console.log(tot);
        $scope.commande.montant = tot.toFixed(2);
    };
    $scope.confirmProduit = function(){
        if ($scope.commande.montant > 0 ) $scope.next('produit');
        else $rootScope.erreur("Veuillez entrer des produits");
    }

    //COMMENTAIRE
    $scope.selectCommentaire = function(){
        $scope.next('commentaire');
    };
    //PNP
    $scope.selectPNP = function(PNP){
        $scope.commande.PNP = PNP;
        $scope.next('payement');
    };
    $scope.activePNP = function(PNP){
        return $scope.commande.PNP == PNP?"active btn-success":"btn-primary";
    };
});