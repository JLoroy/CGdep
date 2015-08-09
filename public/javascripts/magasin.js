var app = angular.module('magasin',[]);

app.controller('magasinController', ['$scope', '$filter', '$http', function($scope, $filter, $http){

    //region Donnée
    $scope.magasins = {};
    $scope.categories = {};
    $scope.clients = {};$scope.params_clients = {};
    $scope.vendByMag = {};
    $scope.commandes = {};$scope.params_commandes = {date:''};
    $scope.produitTable = {};
    $scope.motscustoms = {};$scope.params_motscustoms = {};
    $scope.selectedMagasins = {};

    $scope.commande = {
        Creation:'',
        Livraison:'',
        date:'',
        heure:'',
        client:{Nom:'',Tel:'',Mail:'',TVA:''},
        produits:[],
        Remarque:'',
        PNP:'null',
        montant:0,
        vendeuse:{Nom:'', idVendeuse:''}
    };

    $scope.loadData = function(){
        $http.post("get/commande",{params:{}}).success(function(res){
            $scope.commandes = res;
        });
        $http.post("get/magasin",{}).success(function(res){
            $scope.magasins = res;
            for(m in $scope.magasins){
                $scope.selectedMagasins[m.idMagasin] = false;
            }
        });
        $http.post("get/category",{}).success(function(res){
            $scope.categories = res;
        });
        $http.post("complex/vendByMag",{}).success(function(res){
            $scope.vendByMag = res.vendByMag;
            $scope.activeMenu='vendeuse';
            $scope.activeMag = res.activeMag;
        });
        $http.post("complex/produitTable",{}).success(function(res){
            $scope.produitTable = res;
            $scope.activeCategorie = "1";
        });

    };
    $scope.loadData();
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
    $scope.init = function() {
        $scope.params_clients = {};
        $scope.params_commandes = {date: ''};
        $scope.params_motscustoms = {};

        $scope.commande = {
            Creation: '',
            Livraison: '',
            date: '',
            heure: '',
            client: {Nom: '', Tel: '', Mail: '', TVA: ''},
            produits: [],
            Remarque: '',
            PNP: 'null',
            montant: 0,
            vendeuse: {Nom: '', idVendeuse: ''}
        };
        $scope.loadData();
    };

    //DS = DateString
    $scope.DS = function(d){
        return $filter('date')(d, 'EEEE dd/MM/yyyy');
    };
    $scope.unDS = function(d){
        console.log("unDS");
        console.log(d);
        var arr = d.split(' ')[1].split('/');
        var x = new Date(arr[2],arr[1]-1,arr[0]);
        console.log(x.toString());
        return x;
    };
    //endregion

    //region Erreur
    $scope.messageErreur = "";
    $scope.displayErreur = false;
    $scope.erreur = function(message){
        $scope.messageErreur = message;
        $scope.displayErreur = true;
    }
    $scope.clearErreur = function(){
        $scope.messageErreur = "";
        $scope.displayErreur = false;
    }
    // endregion

    //region Navigation
    $scope.activeMenu = 'loading';
    $scope.setActiveMenu = function(menu){
        $scope.activeMenu = menu;
    };
    $scope.next = function (from) {
        var tab = from;
        switch(from){
            case 'vendeuse':
                if($scope.commande.vendeuse.idVendeuse!='') tab='main';
                else $scope.erreur("Vendeuse non valide");
                break;
            case 'consult_date':
                if($scope.params_commandes.dateCreate!='') tab='selectCommande';
                else $scope.erreur("Date non valide");
                break;
            case 'date':
                if($scope.commande.date!='') tab='heure';
                else $scope.erreur("Date non valide");
                break;
            case 'heure':
                if($scope.commande.heure!='')tab='client';
                else $scope.erreur("Heure non valide");
                break;
            case 'client':
                if($scope.commande.client.Nom!='')tab='produit';
                else $scope.erreur("Veuillez rentrer un nom et un numero de telephone");
                break;
            case 'produit':
                if($scope.commande.montant>0)tab='commentaire';
                else $scope.erreur("Veuillez entrer des produits");
                break;
            case 'commentaire':
                tab='payement';
                break;
            case 'payement':
                if($scope.commande.pnp!='null')tab='recap';
                else $scope.erreur("Payement non valide");
                break;
            case 'recap':
                tab='vendeuse';
                break;
            default:
                tab='vendeuse';
        }
        $scope.activeMenu = tab;

    };
    $scope.previous = function (from) {
        var tab = from;
        switch(from){
            case 'date':
                $scope.init();
                tab='vendeuse';
                break;
            case 'selectCommande':
                $scope.init();
                tab='vendeuse';
                break;
            case 'consult_print':
                tab='selectCommande';
                break;
            case 'consult_date':
                $scope.init();
                tab='vendeuse';
                break;
            case 'heure':
                tab='date';
                break;
            case 'client':
                tab='heure';
                break;
            case 'produit':
                tab='client';
                break;
            case 'commentaire':
                tab='produit';
                break;
            case 'payement':
                tab='commentaire';
                break;
            case 'recap':
                tab='payement';
                break;
            default:
                tab='date';
        }
        $scope.activeMenu = tab;

    };

    //endregion

    //region ng-class
    $scope.isActiveMenu = function(menu){
        if(menu=='commande'){
            return $scope.activeMenu in {
                date:1, heure:2, client:3, produit:4,
                commentaire:5, payement:6, recap:7}?"":"hidden";
        }
        return menu==$scope.activeMenu?"active":"hidden";
    }
    $scope.controlTab = function(tab){
        classes = "";
        if($scope.activeMenu == tab) classes += "active ";
        switch(tab){
            case "date":
                break;
            case "heure":
                classes += $scope.commande.date!=''?"":"disabled";
                break;
            case "client":
                classes += $scope.commande.heure!=''?"":"disabled";
                break;
            case "produit":
                classes += $scope.commande.client.Nom!=''?"":"disabled";
                break;
            case "commentaire":
                classes += $scope.commande.montant>0?"":"disabled";
                console.log($scope.commande.montant);
                break;
            case "payement":
                classes += $scope.commande.montant>0?"":"disabled";
                break;
            case "recap":
                classes += $scope.commande.PNP!=''?"":"disabled";
                break;
            default:
                console.log("Who are you?"+tab);
        }
        return classes;
    };
    //vendeuse
    $scope.isActiveMag = function(id) {
        //determine si le tab magasin selectioné est "id"
        return id == $scope.activeMag ? 'active' : '';
    };
    //date et heure
    $scope.activeDate = function(date){
        classes = "";
        if(date.getDay() == 0) classes += "dimanche";
        if(date.getDay() == 6) classes += "samedi";
        if($scope.commande.date == $scope.DS(date)) classes += "active activedate"
        return classes;
    };
    //permet de verifier si le bouton de l'heure a été celui cliqué. Si oui, on rajotue la classe active
    $scope.activeHeure = function(heure){
        return $scope.commande.heure == heure?"active activedate":"";
    };
    //produit
    $scope.tabCategorie = function(idCategorie){
        return idCategorie == $scope.activeCategorie?"active":"hidden";
    };
    $scope.buttonCategorie = function(idCategorie){
        return idCategorie == $scope.activeCategorie?"active btn-primary":"btn-default";
    };
    $scope.consultMagSelected = function(id){
        return $scope.selectedMagasins[id]?"btn-success":"btn-primary";
    }
    //endregion

    //region Vendeuse
    $scope.selectVendeuse = function(v){
        $scope.commande.vendeuse = v;
    };
    //endregion

    //region Menu
    $scope.toCommand = function(){$scope.activeMenu = "date";$scope.mode='Creation'};
    $scope.toConsult = function(){$scope.activeMenu = 'consult_date';$scope.mode='Consultation'};
    //endregion

    //region Date
    $scope.selectDate = function(date){
        $scope.commande.date = $scope.DS(date);
        console.log("set date :"+$scope.DS(date));
        $scope.next('date');
    };
    //endregion

    //region Heure
    //fonction qui set l'heure de la commande à l'heure cliquée
    $scope.selectHeure = function(heure){
        $scope.commande.heure = heure;
        $scope.next('heure');
    };
    // endregion

    //region CLIENT
    $scope.getClients = function(){
        $http.post("get/client", {
            params: {Nom:$scope.commande.client.Nom}
        }).success(function(res){
            $scope.clients = res;
        });
    }
    //endregion

    //region Produits
    $scope.selectCategorie = function(idCategorie){
        $scope.activeCategorie = idCategorie;
    };
    $scope.addProduit = function(toAdd, quantity, commentaire){
        if(toAdd.Nom != '' && toAdd.Categorie_idCategorie != '' && quantity >= 1) {
            $scope.modal = {prod: {}, qty: '', mode: '', commentaire: '',original:{prod:{},qty:1,commentaire:''}};
            $scope.commande.produits.push({prod: toAdd, qty: quantity, commentaire: commentaire});
            $scope.calculTotal();
        }
    };
    $scope.removeProduit = function(p){
        var index = $scope.commande.produits.indexOf(p);
        $scope.commande.produits.splice(index,1);
        $scope.calculTotal();
    };
    $scope.calculTotal = function(){
        var tot = 0;
        for(i = 0; i<$scope.commande.produits.length; i++){
            var p = $scope.commande.produits[i];
            if(!p.prod.Prix) p.prod.Prix = 1;
            tot += (p.qty * p.prod.Prix);
        }
        $scope.commande.montant = tot.toFixed(2);
        console.log($scope.commande.montant);
    };
    //endregion

    //region Modal Produit
    $scope.modal = {prod:{},qty:'',mode:'',commentaire:'',original:{prod:{},qty:1,commentaire:''}};
    $scope.openModalProduit = function(toAdd,qty,mode,commentaire){
        $scope.modal.mode = mode;
        $scope.modal.prod = toAdd;
        $scope.modal.qty = qty;
        $scope.modal.commentaire = commentaire;
        $scope.modal.original.prod = toAdd;
        $scope.modal.original.qty = qty;
        $scope.modal.original.commentaire = commentaire;
    };
    $scope.cancelModalProduit = function(){
        if($scope.modal.mode == 'modify'){
            $scope.addProduit($scope.modal.original.prod, $scope.modal.original.qty, $scope.modal.original.commentaire);
        }
        $scope.modal = {prod:{},qty:'',mode:'',commentaire:'',original:{prod:{},qty:1,commentaire:''}};
        $scope.calculTotal();
    };
    $scope.confirmModalProduit = function(){
        if( $scope.modal.prod.Nom !='' && $scope.modal.prod.idCategorie !=''){
            $scope.addProduit($scope.modal.prod, $scope.modal.qty, $scope.modal.commentaire);
        }
        else{
            $scope.modal.erreur = true
        }
    };
    //endregion

    //region Payement
    $scope.pnpTab = ['NP','P','AF','AFNP'];
    $scope.selectPNP = function(PNP){
        $scope.commande.PNP = PNP;
        $scope.next('payement');
    };
    $scope.activePNP = function(PNP){
        return $scope.commande.PNP == PNP?"active btn-success":"btn-primary";
    };
    //endregion

    //region Envoi Commande
    $scope.sendCommande = function() {
        $scope.commande.Livraison = new Date(($scope.unDS($scope.commande.date)).setHours($scope.commande.heure));
        $scope.commande.Creation = new Date();
        console.log($scope.commande);
        $http.post("/complex/commande", {params:$scope.commande}).success(function(res){
            console.log("COMMANDE SUCCESSFUL")
            $scope.init();
            $scope.next('recap');
        });
    };
    //endregion

    //region Consultation
    $scope.consultDate = function(date){
        var d = new Date(date);
        d = $filter('date')(d, 'yyyy-MM-dd');
        $scope.params_commandes.dateLivraison = d;
        $scope.refreshCommandes();
        $scope.next('consult_date');
    }
    $scope.refreshCommandes = function(){
        $scope.params_commandes.selectedMagasins = $scope.selectedMagasins;
        $http.post("get/commande", {params:$scope.params_commandes}).success(function(res){
            $scope.commandes = res;
        });
    };
    $scope.delete = function(commande){};
    $scope.modify = function(x){
        $http.post("complex/fullCommande", {params:{idCommande: x.idCommande}}).success(function(res){
            var vendeuse = $scope.commande.vendeuse;
            $scope.commande = res;
            $scope.commande.vendeuse = vendeuse;
            $scope.commande.heure = (new Date($scope.commande.Livraison)).getHours();
            $scope.commande.date =  $scope.DS(new Date($scope.commande.Livraison));
        });
        $scope.activeMenu = 'date';
    };
    //endregion

    //region PRINT
    $scope.printDiv = function(divName) {
        var printContents = document.getElementById(divName).innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open();
        popupWin.document.write('' +
            '<html>' +
            '<head><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js">' +
            '</script><script src="https://code.angularjs.org/1.3.15/i18n/angular-locale_fr-be.js">' +
            '</script><link href="/bootstrap/css/bootstrap.css" rel="stylesheet" /><link href="/stylesheets/magasin.css" rel="stylesheet" />' +
            '</head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();
    };

    $scope.getPrint = function(){
        $http.post('/complex/consultMagCommande',{params:{Livraison:$scope.params_commandes.dateLivraison}}).success(function(res){
            $scope.fullcommandes = res;

        });
    }
    //endregion

    //region DEBUGGING
    $scope.commandeDeTest = function(){
        $scope.commande = {
            date:$scope.DS(new Date(2015,7,10,12,0,0,0)),
            heure:12,
            PNP:0,
            montant:1,
            Remarque:"RAS",
            vendeuse:{idVendeuse:7,Nom:"VENDEUSENOM"},
            produits:[],
            client:{Nom:"Commande de Test",Tel:"",Mail:"",TVA:""},
        };
        $scope.commande.produits.push({
            prod: {
                idProduit:1,
                Nom:'Pistolet blanc',
                Categorie_idCategorie:1,
                Prix:1
            },
            qty: 3,
            commentaire:'chaud'
        });
        $scope.commande.produits.push({
            prod: {
                idProduit:1,
                Nom:'USAa nature',
                Categorie_idCategorie:4,
                custom:true,
                Prix:1
            },
            qty: 1,
            commentaire:''
        });
        $scope.sendCommande();
    };
    //endregion
}]);