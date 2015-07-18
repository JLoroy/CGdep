var selectCateg = [];
var refreshRate = 10000;
var timeToRefresh = setTimeout(startRefresh, refreshRate);

function startRefresh() {
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	refreshList();
}

function refreshList() {
	allCateg = ";";
	for (i = 0; i < selectCateg.length; i++) {
		allCateg = allCateg + selectCateg[i] + ";";
	}
	$.get("loo_refresh.py", {"selectCateg": allCateg, "date": $("#datepicker").val()}, function(content){
		$('#mainDiv').html(content);
	});
}

$('#datepicker').on('change', function(){
	clearTimeout(timeToRefresh);
	timeToRefresh = setTimeout(startRefresh, refreshRate);
	refreshList(selectCateg);
});

$('#selector').each(function() {
	$(this).on('change', function(){
		clearTimeout(timeToRefresh);
		timeToRefresh = setTimeout(startRefresh, refreshRate);
		selectCateg = [];
		$("#selector input[type='checkbox']:checked").each( function() {
			selectCateg.push($(this).val());
		});
		refreshList(selectCateg);
	});
});
