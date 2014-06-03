var hideAttribue = {}
	    
var metadata;
var indicatorData;
var metadatUrl = jsRoutes.controllers.Api.indicatorMetadata();
    
var mapCenter = [40.74823233074709,-73.98837089538574];

var timeSlider;
var tileOverlay;
var streetOverlay;

var showAll = false;

var sptId;

var timeLimit = 3600;
var mapIndicatorId = "workforce_type";
var mode = "TRANSIT"

var marker, map;



$(document).ready(function() {
	
    marker = new L.marker(mapCenter, {draggable:'true'});

	map = L.map('jobAccess', {scrollWheelZoom: false, minZoom: 8, maxZoom: 15,}).setView(mapCenter, 11);

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/conveyal.hml987j0/{z}/{x}/{y}.png').addTo(map);
	
	// Disable scrolling & clicking on the legend
	L.DomEvent.disableScrollPropagation(document.querySelector('.legend-stack'));
	L.DomEvent.disableClickPropagation(document.querySelector('.legend-stack'));

    $.getJSON(metadatUrl.url, function(data) {

    	metadata = data;

    	$('#type_indicators').html(type_template((metadata)));
    	$('#edu_indicators').html(edu_template((metadata)));
    
    	$('.indicators').find("#showAll").on('click', function(evt) {
    		evt.stopImmediatePropagation();
    		evt.preventDefault();
    		
    		var target = $(evt.target).closest(".indicators").find('#type_indicators');
    		
    		if(mapIndicatorId == "workforce_edu") 
    			target = $(evt.target).closest(".indicators").find('#edu_indicators');
    		
    		target.find('.legend-item').each(function(i) {
    			var item = $(this);
    			item.removeClass("disabled-item");
	   			 item.find('.item-checkbox').show();
	   			 hideAttribue[item.data("id")] = false;
    		});
    		
    		updateMap();
    	});
    	
    	$('.indicators').find("#showNone").on('click', function(evt) {
    		evt.stopImmediatePropagation();
    		evt.preventDefault();
    		
    		var target = $(evt.target).closest(".indicators").find('#type_indicators');
    		
    		if(mapIndicatorId == "workforce_edu") 
    			target = $(evt.target).closest(".indicators").find('#edu_indicators');
    			
    		
    		
    		target.find('.legend-item').each(function(i) {
    			var item = $(this);
	   			 item.addClass("disabled-item");
	   			 item.find('.item-checkbox').hide();
	   			 hideAttribue[item.data("id")] = true;
    		});
    		
    		updateMap();    		
    	});
    	
    	infoBtn
    	$('#infoBtn').on("click", function(evt) {
    		evt.preventDefault();
    	});
    	
    	$('#downloadData').on("click", saveCsv);

    	$('#allWorkforce').on("click", toggleAllWorkforce);
    	
    	$(".legend-item").on( "click", function(evt) {
    		 
    		 var item = $(evt.target).closest('.legend-item');
    		 
    		 if(item.hasClass("disabled-item")) {
    			 item.removeClass("disabled-item");
    			 item.find('.item-checkbox').show();
    			 hideAttribue[item.data("id")] = false;
    		 }
    		 else {
    			 item.addClass("disabled-item");
    			 item.find('.item-checkbox').hide();
    			 hideAttribue[item.data("id")] = true;
    		 }
    		
    		 updateMap();
    		});
    	
    	loadSpt();

    });
   
    marker.on('dragend', function(event){
    	loadSpt();    	
    });

    map.addLayer(marker);
    
    $("#mapType").on( "click", function(evt) {
	  mapIndicatorId = "workforce_type"
	  $('#mapType').addClass('active');
	  $('#mapEdu').removeClass('active');
	  $('#type_indicators').show();
	  $('#edu_indicators').hide();
	  loadData();
	});
  
    $("#mapEdu").on( "click", function(evt) {
	  mapIndicatorId = "workforce_edu";
	  $('#mapEdu').addClass('active');
	  $('#mapType').removeClass('active');
	  $('#type_indicators').hide();
	  $('#edu_indicators').show();
	  loadData();
	});
  
    $('input[name=options]:radio').on('change', function(event) {
	  mode = $('input:radio[name=options]:checked').val();
	  loadSpt();
    });
    
    timeSlider = $('#timeSlider1').slider({
		formater: function(value) {
			$('#timeLimitValue').html(value + " mins");
			return value + " minutes";
		}
	}).on('slideStop', function(value) {

		loadData();
	}).data('slider');

    $('#mapType').addClass('active');
    $('#modeBus').addClass('active');
    
    var source  = $("#jobs-type-indicator-template").html();
    var type_template = Handlebars.compile(source);

    source   = $("#jobs-edu-indicator-template").html();
    var edu_template = Handlebars.compile(source);
    
    $('#type_indicators').show();
    $('#edu_indicators').hide();

});
    
function loadSpt() {
	var sptUrl = jsRoutes.controllers.Api.spt(marker.getLatLng().lat, marker.getLatLng().lng, mode);
    $.getJSON(sptUrl.url, function(data) {

  	  sptId = data.sptId;
  	  loadData();
    });
}



function loadData() {

    timeLimit = timeSlider.getValue() * 60;

    if(sptId == undefined || sptId == '')
    	return;
    
  	var sptQuery = sptId;
  	
  	if(showAll)
  		sptQuery = 'all';

    var indicatorUrl = jsRoutes.controllers.Api.indicator(sptQuery, "workforce_type,workforce_edu", timeLimit);

	$.getJSON(indicatorUrl.url, function(data) {
		
		if($('#mapType').hasClass('active')) {
			  $('#type_indicators').show();
			  $('#edu_indicators').hide();
		}
		else {
			  $('#type_indicators').hide();
			  $('#edu_indicators').show();
		}
		  
		indicatorData = data;
		updateStats();

	}).fail(function() {
		loadSpt()
	});

	updateMap();
}

function updateStats() {
	
	 var i = 0;
	 
	 if(!indicatorData)
		 return;
	 
     for(i in indicatorData['indicators']) {
    	 
    	 if(indicatorData['indicators'][i]['id'] == "workforce_type" || indicatorData['indicators'][i]['id'] == "workforce_edu") {

    		 var a = 0;
    
    		 var total = 0;
    		 
    		 if(mapIndicatorId == "workforce_edu")
    			 $('#total_asterisks').show();
    		 else
    			 $('#total_asterisks').hide();
    		 
    		 for(a in indicatorData['indicators'][i]['attributes']) {

    			 var attributeId = indicatorData['indicators'][i]['attributes'][a]['id'];
    			 var subtotal  =  Math.round( indicatorData['indicators'][i]['attributes'][a]['total'] / 1000) * 1000;
    			 
    			 if(!hideAttribue['legend_' + attributeId]) {
    				 total = total + subtotal;
    				 $('#stats_count_' + attributeId).html(numberWithCommas(subtotal));
    			 }
    			 else
    				 $('#stats_count_' + attributeId).html("");
    				 
    		 }
    		 
    		 total = Math.round(total / 1000) * 1000;
    		 
    		 if(mapIndicatorId == indicatorData['indicators'][i]['id'])
    		 $('#total_workforce').html(numberWithCommas(total));
    	 }
     }
}

function updateMap() {
  	
	updateStats();
	
  	if(tileOverlay && map.hasLayer(tileOverlay))
  		map.removeLayer(tileOverlay);
  	
  	if(streetOverlay && map.hasLayer(streetOverlay))
		map.removeLayer(streetOverlay);
  
  	var hidden = [];
	
  	for(var attributeId in hideAttribue) {
  		if(hideAttribue[attributeId])
  			hidden.push(attributeId.replace("legend_", ""));
  	}
  	
  	var hiddenStr = hidden.join(",");
	// add an OpenStreetMap tile layer
  	
  	var sptQuery = sptId;
  	
  	if(showAll)
  		sptQuery = 'all';
  	
	tileOverlay = L.tileLayer('/api/tile?z={z}&x={x}&y={y}&&indicatorId=' + mapIndicatorId + '&timeLimit=' + timeLimit + '&sptId=' + sptQuery + '&hiddenAttributes=' + hiddenStr , {
		attribution: 'US Cenus LODES'
		}).addTo(map);

	streetOverlay = L.tileLayer('https://{s}.tiles.mapbox.com/v3/conveyal.hp092m0g/{z}/{x}/{y}.png' , {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  		}).addTo(map);
}
  
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toggleAllWorkforce(evt) {

	
	if(showAll) {
		showAll = false;
		$('#timeControls').find('.btn').removeClass("disabled");
		timeSlider.enable();
	}
	else {
		showAll = true;
		$('#timeControls').find('.btn').addClass("disabled");
		timeSlider.disable();
	}
	
	loadData();
}


function saveCsv(evt) {
	
	evt.preventDefault();

	var lines = [];
	
	var jobTypeData = {};
	
	for(var i in metadata['workforce_type']) {
		
		var id = metadata['workforce_type'][i]['id'];
		var name = metadata['workforce_type'][i]['name'];
		
		jobTypeData[id] = {};
		jobTypeData[id]['name'] = name;
	}
	
	var jobEduData = {};
	
	for(var i in metadata['workforce_edu']) {
		
		var id = metadata['workforce_edu'][i]['id'];
		var name = metadata['workforce_edu'][i]['name'];
		
		jobEduData[id] = {};
		jobEduData[id]['name'] = name;
	}
	
	for(i in indicatorData['indicators']) {
		for(a in indicatorData['indicators'][i]['attributes']) {
			if(indicatorData['indicators'][i]['id'] == "workforce_type") {
				
				var attributeId = indicatorData['indicators'][i]['attributes'][a]['id'];
    			var subtotal  =  Math.round( indicatorData['indicators'][i]['attributes'][a]['total'] / 1000) * 1000;
    			
				jobTypeData[attributeId]['value'] = subtotal;
			}
			else if(indicatorData['indicators'][i]['id'] == "workforce_edu") {
				
				var attributeId = indicatorData['indicators'][i]['attributes'][a]['id'];
    			var subtotal  =  Math.round( indicatorData['indicators'][i]['attributes'][a]['total'] / 1000) * 1000;
    			
    			jobEduData[attributeId]['value'] = subtotal;
			}
		}
	}
	
	var typeLabels = [];
	var typeValue = [];
	
	for(var attribute in jobTypeData) {

		typeLabels.push(jobTypeData[attribute]['name']);
		typeValue.push(jobTypeData[attribute]['value']);
	
	}	
	
	var eduLabels = [];
	var eduValue = [];
	
	for(var attribute in jobEduData) {

		eduLabels.push(jobEduData[attribute]['name']);
		eduValue.push(jobEduData[attribute]['value']);
	
	}	

	if(showAll)
		lines.push(['All workforce in region'])
	else {
		lines.push(['mode','max travel time','lat','lon' ])
		lines.push([mode,timeSlider.getValue(),marker.getLatLng().lat,marker.getLatLng().lng])
	}
			
	lines.push(typeLabels);
	lines.push(typeValue);
	lines.push(eduLabels);
	lines.push(eduValue);

	var csvStr = lines.join('\n');

	var blob = new Blob([csvStr], {type: "text/csv;charset=utf-8"});
	saveAs(blob, "workforce_data.csv");

}

