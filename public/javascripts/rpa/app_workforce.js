
	var map = L.map('jobAccess').setView([40.7155, -73.9582], 12);

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/conveyal.hml987j0/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map);

  // Disable scrolling & clicking on the legend
  L.DomEvent.disableScrollPropagation(document.querySelector('.legend-stack'));
  L.DomEvent.disableClickPropagation(document.querySelector('.legend-stack'));


  	var hideAttribue = {}
    var metadata;

    var metadatUrl = jsRoutes.controllers.Api.indicatorMetadata();

    $.getJSON(metadatUrl.url, function(data) {

    	metadata = data;

    	$('#type_indicators').html(type_template((metadata)));
    	$('#edu_indicators').html(edu_template((metadata)));
    

    	 $( ".legend-item" ).on( "click", function(evt) {
    		 
    		 var item = $(evt.target);
    		 if(!$(evt.target).hasClass('legend-item'))
    			 item =$(evt.target).parent();
    		 if(!item.hasClass('legend-item'))
    			 item =item.parent();
    		 if(!item.hasClass('legend-item'))
    			 item =item.parent();
    		 if(!item.hasClass('legend-item'))
    			 item =item.parent();
    		 
    		 if(item.hasClass("disabled-item")) {
    			 item.removeClass("disabled-item");
    			 hideAttribue[item.data("id")] = false;
    		 }
    		 else {
    			 item.addClass("disabled-item");
    			 
    			 hideAttribue[item.data("id")] = true;
    		 }
    		
    		 updateMap();
    		});
    	
    	loadSpt();

    });

    var timeSlider;
    var tileOverlay;
    var streetOverlay;

    var sptId;

    var timeLimit = 3600;
    var mapIndicatorId = "workforce_type";
    var mode = "TRANSIT"


    var marker = new L.marker([40.7155, -73.9582], {draggable:'true'});

    marker.on('dragend', function(event){

    	loadSpt();

   });

   map.addLayer(marker);

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

	  var indicatorUrl = jsRoutes.controllers.Api.indicator(sptId, "workforce_type,workforce_edu", timeLimit);

      $.getJSON(indicatorUrl.url, function(data) {

    	  if($('#mapType').hasClass('active')) {
    		  $('#type_indicators').show();
    		  $('#edu_indicators').hide();
    	  }
    	  else {
    		  $('#type_indicators').hide();
    		  $('#edu_indicators').show();
    	  }
    	  
    	  var i = 0;
         for(i in data['indicators']) {
        	 if(data['indicators'][i]['id'] == "workforce_type" || data['indicators'][i]['id'] == "workforce_edu") {

        		 var a = 0;
        		 
        		 var total = data['indicators'][i]['total']
        		 $('#total_' + data['indicators'][i]['id']).html(numberWithCommas(data['indicators'][i]['total']));
        		 
        		 for(a in data['indicators'][i]['attributes']) {

        			 var attributeId = data['indicators'][i]['attributes'][a]['id'];
        			 var subtotal  = data['indicators'][i]['attributes'][a]['total'];

        			 $('#stats_' + attributeId).html(numberWithCommas(subtotal));
        			 $('#stats_pct_' + attributeId).html(((subtotal /total) * 100).toFixed(1) + "%");

        		 }
        	 }
         }

      });

      updateMap();
  }

  function updateMap() {
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
      tileOverlay = L.tileLayer('/api/tile?z={z}&x={x}&y={y}&&indicatorId=' + mapIndicatorId + '&timeLimit=' + timeLimit + '&sptId=' + sptId + '&hiddenAttributes=' + hiddenStr , {
          attribution: 'US Cenus LODES'
      }).addTo(map);
      
      streetOverlay = L.tileLayer('https://{s}.tiles.mapbox.com/v3/conveyal.hp092m0g/{z}/{x}/{y}.png' , {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      
  }
  
  $( "#mapType" ).on( "click", function(evt) {
	  mapIndicatorId = "workforce_type"
	  $('#mapType').addClass('active');
	  $('#mapEdu').removeClass('active');
	  $('#type_indicators').show();
	  $('#edu_indicators').hide();
	  loadData();
	});
  

  $( "#mapEdu" ).on( "click", function(evt) {
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


  var source  = $("#workforce-type-indicator-template").html();
  var type_template = Handlebars.compile(source);

  source   = $("#workforce-edu-indicator-template").html();
  var edu_template = Handlebars.compile(source);

  $('#type_indicators').hide();
  $('#edu_indicators').hide();


  function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

