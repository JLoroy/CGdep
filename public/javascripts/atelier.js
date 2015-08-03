var app = angular.module('atelier',[]);

app.controller('MainController', function($scope, $rootScope, $http){
    $scope.params = {
        dateLivraison: '',
        selectedCategories: {}
    };

    $rootScope.magasins = [];

    $scope.commandes = {};

    $scope.printDiv = function(divName) {
        var printContents = document.getElementById(divName).innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open()
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
        popupWin.document.close();
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

    $scope.getMagasins = function(){
        $http.post("get/magasin",{
        }).success(function(res){
            $rootScope.magasins = res;
            console.log(res);
        });
    };

    $scope.getMagasins();

    $scope.getCategories = function(){
        $http.post("get/category",{
        }).success(function(res){
            $scope.categories = res;
        });
    };

    $scope.getCategories();

    $scope.refresh = function(){
        $http.post("complex/produitCommande", {
            params:$scope.params
        }).success(function(res){
            $scope.commandes = res;
            console.log(res);
        });
    };
});