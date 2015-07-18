var selectCateg = [];
var magasinSelect = "";
var dateSelect = "";
var modifOrder = false;
var refreshRate = 10000;
var longRefreshRate = 600000;
var seconds = 60;
var timeToRefresh;
var countdownTimer = setInterval('countdown()', 1000);

function startRefresh() {
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	seconds = refreshRate/1000;
	refreshList();
	
}

function refreshPrintOn(){
	//timeToPrint = setTimeout(refreshPrintOff, 1000);
	$('#printRefresh').show();
}
function refreshPrintOff(){
	$('#printRefresh').hide();
}
function countdown(){
	var minutes = Math.round((seconds - 30)/60);
	var remainingSeconds = seconds % 60;
	if (remainingSeconds < 10) {
		remainingSeconds = "0" + remainingSeconds; 
	}
	$('#countdown').html("Actualisation dans  " + minutes + ":" + remainingSeconds);
	if (seconds == 0) {
		$('#countdown').html("Actualisation...");
	} else {
		seconds--;
	}
}

function refreshList() {
	//if ($("#dpCommandeEnd").val() != "" && $("#dpCommandeStart").val() != ""){
	allCateg = ";";
	for (i = 0; i < selectCateg.length; i++) {
		allCateg = allCateg + selectCateg[i] + ";";
	}
	//Pour la réimplémentation datePicker start & end
	//$.get("consultation_refresh.py", {"magasin": magasinSelect, "selectCateg": allCateg, "dateStart": $("#dpCommandeStart").val(), "dateEnd": $("#dpCommandeEnd").val()}, function(content){
	$.get("consultation_refresh.py", {"magasin": magasinSelect, "selectCateg": allCateg, "date": dateSelect}, function(content){
		$('#mainDiv').html(content);
	});
	//}
}

//DIV MAGASIN
/*
$("#divMagasin td").on('click', function(){
	magasinSelect = $(this).data('idmagasin');
	$("#divMagasin").hide(500);
	if (modifOrder) {
		modifOrder = false;
		refreshList();
		timeToRefresh = setTimeout(startRefresh, refreshRate);
		seconds = refreshRate/1000;
		$("#divConsultation").show(500);
	} else $("#divDate").show(500);
});
*/

//DIV DATE
$(".btnDate").on('click', function(){
	var dateTmp = new Date(new Date().getTime() + parseInt($(this).val()*24*60*60*1000));
	var year = dateTmp.getFullYear() ;
	var month = ((dateTmp.getMonth()+1) < 10 ? "0" : "")+ String((dateTmp.getMonth()+1));
	var day = (dateTmp.getDate() < 10 ? "0" : "")+ String(dateTmp.getDate());
	dateSelect = year + "-" + month + "-" + day;
	$("#divDate").hide(500);
	$("#divConsultation").show(500);
	refreshList();
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	seconds = refreshRate/1000;
});

//DIV CONSULTATION
$("#imprimer").on('click', function(){
	$("#mainDiv tr").each(function(){
		$(this).collapse('show');
	});
	$("#toPrint").printThis({pageTitle: "Recapitulatif produits"});
	$("#mainDiv tr").each(function(){
		$(this).collapse('hide');
	});
});

$("#dateModif").on('click', function(){
	clearTimeout(timeToRefresh);
	$("#divConsultation").hide(500);
	$("#divDate").show(500);
});

/*
$("#magasinModif").on('click', function(){
	clearTimeout(timeToRefresh);
	modifOrder = true;
	$("#divConsultation").hide(500);
	$("#divMagasin").show(500);
});
*/

/*
//Pour la réimplémentation datePicker start & end
var nowTemp = new Date()
var now =  new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
var tomorrow =  new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate()+1, 0, 0, 0, 0);

$(document).ready(function() {
	var comStart = $('#dpCommandeStart').datepicker({
		format: "yyyy-mm-dd",
		clearBtn: true,
		autoclose: true,
		startDate: '-1d',
		beforeShowDay: function(date) {
			return date.valueOf() < now.valueOf(); //DOESN'T WORK
		}
	}).on('changeDate', function(ev) {
		if (ev.date.valueOf() > comEnd.date.valueOf()) {
			var newDate = new Date(ev.date)
			newDate.setDate(newDate.getDate() + 1);
			comEnd.setValue(newDate);
		}
		comStart.hide();
		$('#dpCommandeEnd').datepicker('update', ev.date.valueOf());
		$('#dpCommandeEnd').datepicker({
			startDate: ev.date()
		});
		$('#dpCommandeEnd')[0].focus();
	}).data('datepicker');

	comStart.setDate(now);

	var comEnd = $('#dpCommandeEnd').datepicker({
		format: "yyyy-mm-dd",
		clearBtn: true,
		autoclose: true,
		startDate: '-1d',
		beforeShowDay: function(date) {
			return date.valueOf() <= $('#dpCommandeStart').val();
		}
	}).data('datepicker');
	comEnd.setDate(tomorrow);
});

$(document).on('click', '.clearInput', function(){
	$(this).prev().val('');
	$(this).prev().trigger('input');
	$(this).prev().trigger('change');
});

$('#dpCommandeStart').on('change input typeahead:selected', function(){
	clearTimeout(timeToRefresh);
	refreshList(selectCateg);
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	seconds = refreshRate/1000;
});

$('#dpCommandeEnd').on('change input typeahead:selected', function(){
	clearTimeout(timeToRefresh);
	refreshList(selectCateg);
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	seconds = refreshRate/1000;
});*/

$("#selectorCategorie input[type='checkbox']:checked").each( function() {
	selectCateg.push($(this).val());
});

$('#selectorCategorie').each(function() {
	$(this).on('change', function(){
		clearTimeout(timeToRefresh);
		selectCateg = [];
		$("#selectorCategorie input[type='checkbox']:checked").each( function() {
			selectCateg.push($(this).val());
		});
		$("body").focus();
		refreshList(selectCateg);
		timeToRefresh = setTimeout(startRefresh, refreshRate);
		seconds = refreshRate/1000;
	});
});

$(document).on('show.bs.collapse', '.collapse', function(){
	clearTimeout(timeToRefresh);
	timeToRefresh = setTimeout(startRefresh, longRefreshRate);
	seconds = longRefreshRate/1000;
});

$(document).on('hide.bs.collapse', '.collapse', function(){
	if ($("tr.in").length >1 ){
		clearTimeout(timeToRefresh);
		timeToRefresh = setTimeout(startRefresh, longRefreshRate);
		seconds = longRefreshRate/1000;
	} else {
		clearTimeout(timeToRefresh);
		refreshList(selectCateg);
		timeToRefresh = setTimeout(startRefresh, refreshRate);
		seconds = refreshRate/1000;
	}
});





