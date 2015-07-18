selectTab = $('#mainTab li.active a').attr("href");
var data = {};
var dataConsultation = {};
var dataSuppr = {};
var entryID = 0;
var oldNomCustom = "";
var oldcomcom = "";
var debugheure = "vide";

//MODAL SESS
$('#closeModalSess').on('click', function(e){
	e.preventDefault();
	var idTerminal = {'idTerminal': $("#tabSess div.active input:checked").val()};
	$.get("commande_sess.py", idTerminal, function(content){
		$("#popupSess").hide();
	});
});

//CHOIX VENDEUSE
$("#choixVendeuse td").on('click', function(){
	$(this).addClass('selectedVend');
	$("#enteteNom").html($(this).text());
	$("#choixVendeuse").hide(800);
	$("#mainMenu").show(800);
	$("#recapVendeuse").html($(this).text());
});

//MENU PRINCIPAL
$("#commandeBtn").on('click', function(){
	$("#mainMenu").hide();
	//$("#mainTab li:eq(0)").tab('show');
	$("#commandeAPP").show(500);
});

$("#consultationBtn").on('click', function(){
	var now = new Date();
	var mm = now.getMonth()+1;
	var dd = now.getDate();
	var dateStr = now.getFullYear()+"-"+(mm<10?'0'+mm:mm)+"-"+(dd<10?'0'+dd:dd);
	$("#dateConsultation").val(dateStr);
	$("#dateConsultation").trigger('changeDate');

	$("#mainMenu").hide();
	$("#divDateConsult").show(500);
});

//CONSULTATION APP
$(".btnDateCons").on('click', function(){
	var dateTmp = new Date(new Date().getTime() + parseInt($(this).val()*24*60*60*1000));
	var year = dateTmp.getFullYear() ;
	var month = ((dateTmp.getMonth()+1) < 10 ? "0" : "")+ String((dateTmp.getMonth()+1));
	var day = (dateTmp.getDate() < 10 ? "0" : "")+ String(dateTmp.getDate());
	
	$("#dateConsultation").val(year + "-" + month + "-" + day);
	$("#dateConsultation").trigger("change");

	$("#divDateConsult").hide();
	$("#consultationAPP").show(500);
});

$("#dateConsultation").on('change changeDate', function(){
	dataConsultation['date']=$(this).val();
	refreshConsultation();
});
$("#nomConsultation").on('change typeahead:selected', function(){
	dataConsultation['nom']=$(this).val();
	refreshConsultation();
});
$("#magasinConsultation").on('change', function(){
	refreshConsultation();
});

function refreshConsultation(){
	if(dataConsultation['date'] || dataConsultation['nom']){
		dataConsultation['magasin']=$("#magasinConsultation").val();
		$.getJSON('commande_consultation.py', dataConsultation, function(jsonData){
			$("#consultContent").html("");
			for (var i = 0; i < jsonData.length; i++) {
				$("#consultContent").append(Handlebars.compile($("#listCommande").html())(jsonData[i]));
				for (var j = 0; j < jsonData[i]['produits'].length; j++) {
					$("#tbody" + jsonData[i]['idCommande']).append(Handlebars.compile($("#listProduitCommande").html())(jsonData[i]['produits'][j]));
				}
			}
		});
	}
}

$("#retourConsultation").on('click', function(){
	$(".selectedVend").removeClass("selectedVend");
	$("#consultationAPP").hide();
	$("#choixVendeuse").show();
});

$("#retourDateConsultation").on('click', function(){
	$("#consultationAPP").hide();
	$("#divDateConsult").show();
});

$("#imprimerConsultation").on('click', function(){
	$("#consultContent tr").each(function(){
		$(this).collapse('show');
	});
	$("#toPrintConsultation").printThis({pageTitle: "Recapitulatif commandes"});
	$("#consultContent tr").each(function(){
		$(this).collapse('hide');
	});
});

$(document).on('click', ".supprimerConsultation", function(){
	dataSuppr['id'] = $(this).data('idcommande');
});

$("#launchSupressConsultation").on('click', function(){
	$.get('commande_supprimer.py', dataSuppr, function(dataReturn){
		refreshConsultation();
	});
});

$(document).on('click', ".modifierConsultation", function(){
	var idCommande = $(this).data('idcommande');
	data["modify"] = idCommande;
	$("#clientNom").val($("#dataCom"+idCommande+" td:eq(1)").text().trim());
	$("#clientNom").trigger('change');
	$("#clientTel").val($("#dataCom"+idCommande).data('telclient'));
	$("#clientTel").trigger('change');
	$("#clientMail").val($("#dataCom"+idCommande).data('mailclient'));
	$("#clientMail").trigger('change');
	$("#clientTVA").val($("#dataCom"+idCommande).data('tvaclient'));
	$("#clientTVA").trigger('change');
	$("#comcom").val($("#dataCom"+idCommande+" td:eq(3)").text().trim());
	$("#comcom").trigger('change');
	$("#dateLivraison").val($("#dataCom"+idCommande).data('date'));
	$("#dateLivraison").trigger('change');
	switch($("#dataCom"+idCommande+" td:eq(4)").text().trim()){
		case "P" :
			$("#payeCommande").addClass('active');
			$("#recapPayement").html($("#payeCommande").html());
			break;
		case "AF" :
			$("#payeFacture").addClass('active');
			$("#recapPayement").html($("#payeCommande").html());
			break;
		default :
			$("#payeReception").addClass('active');
			$("#recapPayement").html($("#payeCommande").html());
			break;
	}
	$(".heureLivraison").each(function(){
		$(this).removeClass("active");
	});
	debugheure = String($("#dataCom"+idCommande).data('heure'));
	switch(String($("#dataCom"+idCommande).data('heure'))){
		case "10" :
			$("#heure10").addClass("active");
			break;
		case "14" :
			$("#heure14").addClass("active");
			break;
		default :
			$("#heure07").addClass("active");
			break;
	}

	$("#tbody"+idCommande+" tr").each(function(){
		dataTmp = {};
		entryID ++;
		dataTmp["produitID"]=$(this).data('idproduit');
		dataTmp["produitNom"]=$(this).find("td:eq(0)").text().trim();
		dataTmp["produitPrix"]=$(this).data('prix');
		dataTmp["custom"]=$(this).data('custom');
		dataTmp["categCustom"]=$(this).data('categorie');
		dataTmp["entryID"]=entryID;
		$("#listProduit").append(Handlebars.compile($("#produitEntry").html())(dataTmp));
		$("#recapProduit").append(Handlebars.compile($("#produitEntryRecap").html())(dataTmp));
		$("#inputQuantiteProduit"+entryID).val($(this).find("td:eq(1)").text().trim());
		$("#inputQuantiteProduit"+entryID).trigger('change');
		$("#popupProduit"+entryID).find("textarea").val($(this).find("td:eq(2)").text());
	});

	$("#consultationAPP").hide(500);
	$("#mainTab li:eq(0)").trigger('click');
	selectTab = $('#mainTab li.active a').attr("href");
	$("#commandeAPP").show(500);
});


//COMMANDE APP
function checkTab () {
	switch(selectTab){
		case "#date" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			if($('#dateLivraison').val() != ""){
				var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
				$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			} else {
				var indexTmp = $("#mainTab a[href='"+selectTab+"']").parent().index();
				$("#suivant, #mainTab li:gt("+indexTmp+")").addClass('disabled');
			}
			break;
		case "#heure" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			if($('#heure .active').length){
				var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
				$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			} else {
				var indexTmp = $("#mainTab a[href='"+selectTab+"']").parent().index();
				$("#suivant, #mainTab li:gt("+indexTmp+")").addClass('disabled');
			}
			break;
		case "#client" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			if($('#clientNom').val() != "" && ($("#clientTVA").val().length == 0 || $("#clientTVA").val().length == 10)){
				var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
				$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			} else {
				var indexTmp = $("#mainTab a[href='"+selectTab+"']").parent().index();
				$("#suivant, #mainTab li:gt("+indexTmp+")").addClass('disabled');
			}
			break;
		case "#produit" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			if($("#listProduit").html().trim() != ""){
				var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
				$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			} else {
				var indexTmp = $("#mainTab a[href='"+selectTab+"']").parent().index();
				$("#suivant, #mainTab li:gt("+indexTmp+")").addClass('disabled');
			}
			break;
		case "#commentaire" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
			$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			break;
		case "#payement" :
			$("#suivant").html("Suivant");
			$("#suivant").attr('data-toggle', '');
			$("#suivant").attr('data-target', '');
			$('#retour').removeClass('disabled');
			if($("#payeCommande").hasClass("active") || $("#payeReception").hasClass("active") || $("#payeFacture").hasClass("active")){
				var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
				$("#suivant, #mainTab li:eq("+indexTmp+")").removeClass('disabled');
			} else {
				var indexTmp = $("#mainTab a[href='"+selectTab+"']").parent().index();
				$("#suivant, #mainTab li:gt("+indexTmp+")").addClass('disabled');
			}
			break;
			
			break;
		case "#recapitulatif" :
			$("#suivant").html("Valider");
			$("#suivant").attr('data-toggle', 'modal');
			$("#suivant").attr('data-target', '#popupResult');
			$('#retour').removeClass('disabled');
			$('#suivant').removeClass('disabled');
			
			break;
		default :
			break;
	}
}

$("#suivant").on('click', function(){
	checkTab();
	if (!$(this).hasClass('disabled')){
		if ($(this).html() == "Suivant") {
			var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
			$("#mainTab li:eq("+indexTmp+") a").tab('show');
		} else if ($(this).html() == "Valider") {
			data["vendeuse"] = $(".selectedVend").data('idvendeuse');
			data["clientNom"] = $("#recapNom").text();
			data["remarqueCommande"] = $("#recapCommentaire").text();
			var tlTmp = $("#recapTel").text();
			data["clientTel"] = (tlTmp == "Aucune" || tlTmp == undefined)?"":tlTmp;
			var mlTmp = $("#recapMail").text();
			data["clientMail"] = (mlTmp == "Aucune" || mlTmp == undefined)?"":mlTmp;
			var tvTmp = $("#recapTVA").text();
			data["clientTVA"] = (tvTmp == "Aucune" || tvTmp == undefined)?"":tvTmp;
			data["date"] = $("#recapDate").text() + " " + $("#recapHeure").text();
			data["total"] = $("#recapTotal").text().substring(0, $("#recapTotal").text().length - 4);;
			switch($("#recapPayement").html().trim()){
				case $("#payeCommande").html().trim() :
					data["pnp"] = "1";
					break;
				case $("#payeFacture").html().trim() :
					data["pnp"] = "2";
					break;
				default :
					data["pnp"] = "0";
					break;
			}
			data["produit"] = "";
			data["quantite"] = "";
			data["custom"] = "";
			data["categCustom"] = "";
			data["nom"] = "";
			data["prix"] = "";
			data["commProduit"] = "";
			$("#listProduit input").each(function(){
				data["produit"] = data["produit"] + ";" + $(this).data('idproduit');
				data["custom"] = data["custom"] + ";" + $(this).data('custom');
				data["categCustom"] = data["categCustom"] + ";" + $(this).data('categcustom');
				data["nom"] = data["nom"] + ";" + $(this).data('nom').trim();
				data["prix"] = data["prix"] + ";" + $(this).data('prix');
				data["quantite"] = data["quantite"] + ";" + $(this).val();
				var commTmp = $(this).closest('li').find('textarea').val().trim();
				data["commProduit"] = data["commProduit"] + ";" + ((commTmp == "")?"None":commTmp);
			});
	
			data["idTerminal"] = $("#tabSess div.active input:checked").val();
			$("#loadingCommandeDone").button('loading');
			$.get("commande_insert.py", data, function(content){
				$("#loadingCommandeDone").button('reset');
				$("#popupcontent").html(content);
				if(content.indexOf("Commande enregistr&eacutee") != -1){
					$("#pouce").show('700');
					setTimeout(function(){
						$("#popupResult").modal('hide');
					}, 3000);
				}
			});
		}
	}
});

function flushCommande(){
	data = {};
	entryID = 0;
	oldNomCustom = "";
	oldcomcom = "";
	$("#dateLivraison").val('');
	$(".btnDate").removeClass('active');
	$(".heureLivraison").removeClass("active");
	$("#clientNom").val('');
	$("#clientTel").val('');
	$("#clientMail").val('');
	$("#clientTVA").val('');
	$("#listProduit").html('');
	$("#prix").val('0 EUR');
	$("#prix2").val('0 EUR');
	$("#comcom").val("");
	$("#payeCommande").removeClass('active');
	$("#payeReception").removeClass('active');
	$("#payeFacture").removeClass('active');
	$("#recapNom").html('');
	$("#recapTel").html('');
	$("#recapMail").html('');
	$("#recapTVA").html('');
	$("#recapDate").html('');
	$("#recapProduit").html('');
	$("#recapTotal").html('');
	$("#recapCommentaire").html('');
	$("#recapPayement").html('');
	$("#mainTab li").each(function(){
		$(this).removeClass("active");
		$(this).addClass("disabled");
	});
	$("#allTabContentCommande > div").each(function(){
		$(this).removeClass("active");
		$(this).removeClass("in");
	});
	$("#mainTab li:eq(0)").removeClass("disabled");
	$("#mainTab li:eq(0)").addClass("active");
	$("#date").addClass("active");
	$("#date").addClass("in");
	selectTab = $('#mainTab li.active a').attr("href");
	
}

$("#retour").on('click', function(){
	if (selectTab == "#date") {
		$(".selectedVend").removeClass("selectedVend");
		$("#commandeAPP").hide();
		//FLUSH COMMANDE APP
		flushCommande();
		$("#choixVendeuse").show();
	} else{
		var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()-1);
		$("#mainTab li:eq("+indexTmp+") a").tab('show');
	}
});

$(document).on('click', '.clearInput', function(){
	$(this).prev().val('');
	$(this).prev().trigger('input');
	$(this).prev().trigger('change');
});

$(".btnDate").on('click', function(){
	var dateTmp = new Date(new Date().getTime() + parseInt($(this).val()*24*60*60*1000));
	var year = dateTmp.getFullYear() ;
	var month = ((dateTmp.getMonth()+1) < 10 ? "0" : "")+ String((dateTmp.getMonth()+1));
	var day = (dateTmp.getDate() < 10 ? "0" : "")+ String(dateTmp.getDate());
	$("#dateLivraison").val( year + "-" + month + "-" + day);
	$('#dateLivraison').data({date: dateTmp}).datepicker('update');
	$("#dateLivraison").trigger('change');
	$("#dateValidation").modal('show');
	$(".btnDate").removeClass('active');
	$(this).addClass('active');
});

$("#dateOK").on('click', function(){
	$("#suivant").trigger('click');
});

$("#popupResult").on('show.bs.modal', function(){
	$("#commandeAPP").hide();
});

$("#popupResult").on('hidden.bs.modal', function(){
	$("#pouce").hide();
	flushCommande();
	$("#choixVendeuse").show(500);
	//location.reload(true);
});

$("#mainTab a").on("click", function(e){
	if($(this).parent().hasClass("disabled")){
		e.preventDefault();
		return false;
	}
});

$('#mainTab').each(function() {
	$(this).on('shown.bs.tab', function() {
		selectTab = $('#mainTab li.active a').attr("href");
		checkTab();
	});
});

var searcherClient = function(){
	return function findMatches(q, cb){
		$.get("admin_client.py", {query: q}, function(content){
			var tmp = content.split(";");
			var strs = tmp[0].split("|");
			var num = tmp[1].split("|");
			var mail = tmp[2].split("|");
			var tva = tmp[3].split("|");
			var matches, substrRegex;
			matches = [];
			var pattern = new RegExp('([a-z]|[A-Z])', 'i');
			var mailPat = new RegExp('@', 'i');
			$.each(strs, function(i, str){
				if (pattern.test(str)){
					if (mailPat.test(mail[i])){
						matches.push({value: str, num: num[i], mail: mail[i], tva: (tva[i].trim()=="None")?"":tva[i]});
					} else {
						matches.push({value: str, num: num[i]});
					}
				}
			});
			cb(matches);
		});
	}
}
$("#clientNom").typeahead({
	hint: true,
	highlight: true,
	minLength: 1
	},
	{
	name: "Client",
	source: searcherClient(),
	templates: {
		suggestion: Handlebars.compile('<p><Strong>{{value}}</strong> - {{num}}</p>')
	}
});

$("div .patch-zoom-bug").on('click', function(){
	$(this).find(".patch-zoom-bug").focus();
});

$("#nomConsultation").typeahead({
	hint: true,
	highlight: true,
	minLength: 1
	},
	{
	name: "Client",
	source: searcherClient(),
	templates: {
		suggestion: Handlebars.compile('<p><Strong>{{value}}</strong> - {{num}}</p>')
	}
});

var searcherCustom = function(){
	return function findMatches(q, cb){
		$.get("commande_custom.py", {query: q}, function(content){
			var matches = [];
			var tmp = content.split("|");
			for (var i = 0; i < tmp.length; i++){
				matches.push({value: tmp[i].trim()});
			}
			cb(matches);
		});
	}
}

$("#nomCustom").typeahead({
	hint: true,
	highlight: true,
	minLength: 1
	},
	{
	name: "Custom",
	source: searcherCustom(),
	templates: {
		suggestion: Handlebars.compile('<p><Strong>{{value}}</strong></p>')
	}
});

$("#comcom").typeahead({
	hint: true,
	highlight: true,
	minLength: 1
	},
	{
	name: "Comcom",
	source: searcherCustom(),
	templates: {
		suggestion: Handlebars.compile('<p><Strong>{{value}}</strong></p>')
	}
});

$("#nomCustom").on('typeahead:selected', function(e, datum){
	oldNomCustom = oldNomCustom.substring(0, oldNomCustom.lastIndexOf(" ")+1) + datum["value"]+" ";
	$("#nomCustom").val(oldNomCustom);
	$("#nomCustom").trigger('change');
	e.preventDefault();
});

$("#comcom").on('typeahead:selected', function(e, datum){
	oldcomcom = oldcomcom.substring(0, oldcomcom.lastIndexOf(" ")+1) + datum["value"]+" ";
	$("#comcom").val(oldcomcom);
	$("#comcom").trigger('change');
	e.preventDefault();
});

$("#clientNom").on('typeahead:selected', function(e, datum){
	$("#clientTel").val(datum["num"]);
	$("#recapTel").html(datum["num"]);
	$("#clientMail").val(datum["mail"]);
	$("#recapMail").html(datum["mail"]);
	$("#clientTVA").val(datum["tva"]);
	$("#recapTVA").html(datum["tva"]);
});

$("#clientNom, #clientTel").on('change input typeahead:selected', function(){
	$("#recapNom").html($("#clientNom").val());
	$("#recapTel").html($("#clientTel").val());
	checkTab();
});

$("#clientMail").on('change', function(){
	$("#recapMail").html($("#clientMail").val());
});
$("#clientTVA").on('change', function(){
	//if($(this).val().length > 10) $(this).val($(this).val().substring(0, 10)); 
	$("#recapTVA").html("BE"+$("#clientTVA").val());
	checkTab();
});

$("#clientTVA").on('keydown', function(){
	return $(this).val().length <= 9
});

$("#dateLivraison").on('change changeDate', function(){
	$("#recapDate").html($(this).val());
	if ($(this).val() == "") {
		$(".enteteDate").each(function(){$(this).html("");});
	}else{
		var dateSplit = $(this).val().split("-");
		var d = new Date(parseInt(dateSplit[0]), parseInt(dateSplit[1])-1, parseInt(dateSplit[2]));
		var jour = "";
		var mois = "";
		switch(d.getDay()){
			case 1:
				jour = "Lundi";
				break;
			case 2:
				jour = "Mardi";
				break;
			case 3:
				jour = "Mercredi";
				break;
			case 4:
				jour = "Jeudi";
				break;
			case 5:
				jour = "Vendredi";
				break;
			case 6:
				jour = "Samedi";
				break;
			case 0:
				jour = "Dimanche";
				break;
			default:
				jour = "ERREUR";
				break;
		}
		switch(parseInt(dateSplit[1])){
			case 1:
				mois = "Janvier";
				break;
			case 2:
				mois = "Fervrier";
				break;
			case 3:
				mois = "Mars";
				break;
			case 4:
				mois = "Avril";
				break;
			case 5:
				mois = "Mai";
				break;
			case 6:
				mois = "Juin";
				break;
			case 7:
				mois = "Juillet";
				break;
			case 8:
				mois = "Aout";
				break;
			case 9:
				mois = "Septembre";
				break;
			case 10:
				mois = "Octobre";
				break;
			case 11:
				mois = "Novembre";
				break;
			case 12:
				mois = "Decembre";
				break;
			default:
				mois = "ERREUR";
				break;
		}
		$(".enteteDate").each(function(){
			$(this).html(jour + " le " + dateSplit[2] + " " + mois + " " + dateSplit[0]);
		});
	}
	checkTab();
});

$("#dateCancel").on('click', function(){
	$("#dateLivraison").val('');
	$(".btnDate").removeClass('active');
	checkTab();
});

$(".heureLivraison").on('click', function(){
	$("#recapHeure").html($(this).val());
	$(".heureLivraison").removeClass("active");
	$(this).addClass("active");
	checkTab();
	$("#suivant").trigger('click');
});

function rnd(str){
	return Math.round(100*(parseFloat(str)))/100;
}

function updateTot(){
	var newTot = 0;
	$("#listProduit input").each(function(){
		newTot = rnd(newTot + (rnd($(this).data('prix'))*$(this).val()));
	});
	$(".prixTot").each(function(){
		$(this).val(newTot.toString() + " EUR");
	});
	$(".prixTotP").each(function(){
		$(this).html(newTot.toString() + " EUR");
	});
}

$("#produitBtnDiv button").on('click', function(){
	dataTmp = {};
	entryID ++;
	dataTmp["produitID"]=$(this).val();
	dataTmp["produitNom"]=$(this).html();
	dataTmp["produitPrix"]=$(this).data('prix');
	dataTmp["custom"]="0";
	dataTmp["categCustom"]="0";
	dataTmp["entryID"]=entryID;
	$("#listProduit").append(Handlebars.compile($("#produitEntry").html())(dataTmp));
	$("#recapProduit").append(Handlebars.compile($("#produitEntryRecap").html())(dataTmp));
	updateTot();
	checkTab();
});

$(".btn-produit-categ").on('click', function(){
	$(".btn-produit-categ").removeClass('active');
	$(this).addClass('active');
});

function checkCustomVal(){
	if ($("#nomCustom").val() != "" && $("#categCustom").val() != ""){
		$("#confirmCustom").removeClass('disabled');

	} else {
		$("#confirmCustom").addClass('disabled');
	}
}

$("#customModal").on('hidden.bs.modal', function(){
	$("#nomCustom").val("");
	$("#prixCustom").val("");
	$("#categCustom").val("");
});

$("#categCustom").on('input change', function(){
	checkCustomVal();
});

$("#nomCustom").on('input change', function(){
	oldNomCustom = $(this).val();
	checkCustomVal();
});

$("#nomCustom").on('blur', function(e){
	$(this).val(oldNomCustom);
});

$("#prixCustom").on('input change', function(){
	var newVal = $(this).val();
	var test = new RegExp('([0-9]|\.|,)', 'g');
	newVal.replace(test, "");
	/*var test1 = new RegExp('([0-9]|\.|,)$');
	var test2 = new RegExp('^[0-9]+((\.|,)[0-9]{0,2})?$');
	if (!test1.test(newVal)){
		newVal = newVal.slice(0,newVal.length - 1);
	} else if (!test2.test(newVal)){
		newVal = "";
	}*/
	$(this).val(newVal);
	checkCustomVal();
});

$("#confirmCustom").on('click', function(){
	if ($("#prixCustom").val() == "") $("#prixCustom").val("0");
	dataTmp = {};
	entryID ++;
	dataTmp["produitID"]="0";
	dataTmp["produitNom"]=$("#nomCustom").val();
	dataTmp["produitPrix"]=$("#prixCustom").val();
	dataTmp["custom"]="1";
	dataTmp["categCustom"]=$("#categCustom").val();
	dataTmp["entryID"]=entryID;
	$("#listProduit").append(Handlebars.compile($("#produitEntry").html())(dataTmp));
	$("#recapProduit").append(Handlebars.compile($("#produitEntryRecap").html())(dataTmp));
	updateTot();
	checkTab();
	$("#customModal").modal('hide');
});

$(document).on('input change', '.inputComm', function(){
	if ($(this).val() == "") {
		$(this).parent().parent().find('.saveComm').addClass('disabled');
	} else {
		$(this).parent().parent().find('.saveComm').removeClass('disabled');
	}
});

$("#comcom").on('input change', function(){
	oldcomcom = $(this).val();
	$("#recapCommentaire").text($(this).val());
});

$("#comcom").on('blur', function(e){
	$(this).val(oldcomcom);
});

$(document).on('click', "#listProduit span", function(){
	if ($(this).hasClass("glyphicon-plus")){
		var inputQte = $(this).prev();
		var newVal = ((inputQte.val()=="")?0:parseInt(inputQte.val()))+1;
		newVal = (newVal<0)?0:newVal;
		inputQte.val(newVal);
		updateTot();
		$("#recapProduit tr:eq("+inputQte.closest('li').index()+") td:eq(2)").html(newVal);
		$("#recapProduit tr:eq("+inputQte.closest('li').index()+") td:eq(3)").html(newVal*Math.round(100*(parseFloat(inputQte.data('prix'))))/100);
	}
	if ($(this).hasClass("glyphicon-minus")){
		var inputQte = $(this).next();
		var newVal = ((inputQte.val()=="")?0:parseInt(inputQte.val()))-1;
		newVal = (newVal<0)?0:newVal;
		inputQte.val(newVal);
		updateTot();
		$("#recapProduit tr:eq("+inputQte.closest('li').index()+") td:eq(2)").html(newVal);
		$("#recapProduit tr:eq("+inputQte.closest('li').index()+") td:eq(3)").html(newVal*Math.round(100*(parseFloat(inputQte.data('prix'))))/100);
	}
	if ($(this).hasClass("glyphicon-remove")){
		var inputQte = $(this).prev().prev();
		$("#recapProduit tr:eq("+inputQte.closest('li').index()+")").remove();
		$(this).closest('li').remove();
		updateTot();
	}
	checkTab();
});
$(document).on('change', "#listProduit input", function(){
	var pattern = new RegExp('^[0-9]+$');
	if(pattern.test($(this).val())){
		updateTot();
	} else {
		$(this).val("1");
		updateTot();
	}
	$("#recapProduit tr:eq("+$(this).closest('li').index()+") td:eq(2)").html($(this).val());
	$("#recapProduit tr:eq("+$(this).closest('li').index()+") td:eq(3)").html(($(this).val()*Math.round(100*(parseFloat($(this).data('prix')))))/100);
	checkTab();
});

$(document).on('click', '.clearComm', function(){
	$(this).closest('.modal').find('textarea').val('');
});

$("#payeCommande").on('click', function(e){
	e.preventDefault();
	$("#recapPayement").html($(this).html());
	$("#payeReception").removeClass("active");
	$("#payeFacture").removeClass("active");
	$(this).addClass("active")
	checkTab();
	var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
	$("#mainTab li:eq("+indexTmp+") a").tab('show');
});

$("#payeReception").on('click', function(e){
	e.preventDefault();
	$("#recapPayement").html($(this).html());
	$("#payeCommande").removeClass("active");
	$("#payeFacture").removeClass("active");
	$(this).addClass("active")
	checkTab();
	var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
	$("#mainTab li:eq("+indexTmp+") a").tab('show');
});

$("#payeFacture").on('click', function(e){
	e.preventDefault();
	$("#recapPayement").html($(this).html());
	$("#payeCommande").removeClass("active");
	$("#payeReception").removeClass("active");
	$(this).addClass("active")
	checkTab();
	var indexTmp = ($("#mainTab a[href='"+selectTab+"']").parent().index()+1);
	$("#mainTab li:eq("+indexTmp+") a").tab('show');
});

$("#doPrint").on('click', function(){
	$('#toPrint').printThis({pageTitle: "Recapitulatif commande"});
});


//PATCH ZOOM input-typeahead
$(document).ready(function(){
	setTimeout(function(){
		$("span.twitter-typeahead").each(function(){
			toRemove = $(this).find("input").eq(0);
			if (toRemove.attr('id') == "" || !toRemove.attr('id')) toRemove.remove();
		});
		
	}, 50);
});









