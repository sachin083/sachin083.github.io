var geocoder;
var map;
   
function initialize() {
    geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(0,0);  // Google map center will be this coordinates at the begining
    var properties = { zoom: 2, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP};  // personal properties for the map
    map = new google.maps.Map(document.getElementById("map_canvas"), properties);  // creating the map with the personalized properties
}

 
function search() {
	var address = document.getElementById("address").value;  // get the address specified by the user
    geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {    // calculating the boundary of the location specified
		var north = results[0].geometry.location.lat() + 1;
		var south = results[0].geometry.location.lat() - 1;
		var east = results[0].geometry.location.lng() + 1;
		var west = results[0].geometry.location.lng() - 1;
		//generating the url for the webservice based on input provided by user
		var earthquake = 'http://api.geonames.org/earthquakesJSON?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west + '&username=sachin083';  		
		map.setZoom(6);
		$.getJSON(earthquake, function(data) {    // calling the earthquake API
			$.each(data, function(key, val) {    // loop through the values returned by webservice and plot them on map
				for (var i = 0; i < data.earthquakes.length; i++) { 	
					var myLatlng = new google.maps.LatLng(val[i].lat,val[i].lng);
					var marker = new google.maps.Marker({
					map: map, 
					position: myLatlng,
					title:'Magnitude: ' + val[i].magnitude + ' Depth: ' + val[i].depth + ' Date: ' + val[i].datetime,
					});
					var infowindow = new google.maps.InfoWindow({    // information window with earthquake info on each marker
					content:"Magnitude: " + val[i].magnitude + " Depth: " + val[i].depth + " Date: " + val[i].datetime
					});
					infowindow.open(map,marker);
				}
				});
			});
        map.setCenter(results[0].geometry.location);   // set the map center location to the searched location
		} else {
        alert("Geocode was not successful for the following reason: " + status);
		}
	});
}  

 
function topEarthquakes()    // method to generate top ten earthquakes by magnitude in last 12 months
{
	initialize();  // to zoom out and clear markers set if the search is done before 
    var currentDate=new Date();
    var date=currentDate.getDate().toString();
    if(currentDate.getDate()<10)
    {
        date=0+date;     // prefeixing 0 to date if date is less than 10(single digit)
    }
    var month=(currentDate.getMonth()+1).toString();
    if(currentDate.getMonth()+1<10)
    {
        month=0+month;   // prefeixing 0 to month if month is less than 10(single digit)
    }
    var year=currentDate.getFullYear().toString();
    var present=parseInt(year+month+date);   // get todays entire date
    var past=parseInt((currentDate.getFullYear()-1).toString()+month+date);   // get last years entire date(obtained by subtracting 1 from the year value)
    var earthquaketop='http://api.geonames.org/earthquakesJSON?north=44.1&south=-9.9&east=-22.4&west=55.2&maxRows=500&username=sachin083';
    var count=1;
	var markers=[];  // array to hold all the markers
    $.getJSON(earthquaketop,function(data){
        for(var i=0;i<data.earthquakes.length;i++){
            if(count<11&&convert(data.earthquakes[i].datetime)>past&&convert(data.earthquakes[i].datetime)<=present)  // check if that earthquake happened during one year window
            {
				var latlng=new google.maps.LatLng(data.earthquakes[i].lat,data.earthquakes[i].lng);
				markers[i] = new google.maps.Marker({
                map: map, 
                position: latlng,
                title:'Date:'+data.earthquakes[i].datetime+'\n Magnitude:'+data.earthquakes[i].magnitude,
                html:'Earthquake Information \n\n Date/Time :\t'+data.earthquakes[i].datetime+'\n Magnitude:\t'+data.earthquakes[i].magnitude+'\n Depth: \t'+data.earthquakes[i].depth
                });
                google.maps.event.addListener(markers[i], "click", function () {
                    alert(this.html);    // popup displaying the earthquake information
                });
                count++;   // keep count of number of markers displayed
            }   
        }
    });
}


function convert(str)   // method to convert date returned by webservice into format easy for comparison
{						// Ex: 2011-03-11 04:46:23   to   20010311
	var res = str.split(" ",1);
    var arr=res[0].split("-");
    return parseInt(arr.join(""));
}
