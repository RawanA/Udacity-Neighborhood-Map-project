// Declare Global Varaibles
var map;
var infoWindow;
var bounds;
var nytimesUrl;
var $nytElem = $('#nytimes-articles');
var defaultIcon;
var highlightedIcon;

console.log('MAP');
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 21.389303, lng: 39.869408},
    zoom: 14,
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#bdbdbd"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dadada"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c9c9c9"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      }
    ]

  });
  // set the color of the marker bafore and after clicking on it
  defaultIcon = makeMarkerIcon('5bf065');
  highlightedIcon = makeMarkerIcon('c74d3d');


  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();

// Start Bindind once the map in inslized
  ko.applyBindings(new ViewModel());

  }
  // Handle the Error of the map
  function googleMapsError() {
      $nytElem.text('An error occurred with Google Maps!');
  }

  var Location = function(data) {
  	this.title = data.title;
  	this.location = data.location;
  };

  var ViewModel = function(){


    var self = this;

    this.locationList = ko.observableArray([]);
    this.filteredLocations = ko.observableArray([]);
    this.filter = ko.observable('');


    initialLocations.forEach(function(locationItem){

      self.locationList.push(new Location(
			locationItem));

    });

    self.locationList().forEach(function(location){
      var marker = new google.maps.Marker({
  			map: map,
  			position: location.location,
  			title: location.title,
        icon: defaultIcon,
  			animation: google.maps.Animation.DROP
  		});

  		location.marker = marker;

      location.marker.addListener('click',function(){

        // for loop to set the other unclikced marker to the default aniamtion and color
        self.locationList().forEach(function(location){
          location.marker.setAnimation(null);
          location.marker.setIcon(defaultIcon);
          });

        populateInfoWindow(this, infoWindow);
        toggleBounce(this);
      });

      bounds.extend(location.marker.position);

    });
    map.fitBounds(bounds);

    // Location Information
    function populateInfoWindow(marker, infowindow){
      if(infowindow.marker != marker){
        infowindow.marker = marker;
        infowindow.setContent('<div>'+marker.title+'</div>');
        infowindow.open(map, marker);

        //Inof for the location from NY Times
        // Only articals subjects are displayed
        nytimesUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + marker.title + '&sort=newest&api-key=0e0a19c19d064fd48c71688306007eb3';
        $.getJSON(nytimesUrl, function(data){

            articles = data.response.docs;
            $nytElem.text('');
            if(articles == 0){
                $nytElem.text('New York Times Articles Could Not Be Found');
            }else{
              for (var i = 0; i < articles.length; i++) {
                  var article = articles[i];

                  $nytElem.append('<li class="article">'+
                      '<a href="'+article.web_url+'">'+article.headline.main+'</a></li>');
              };
            }


        }).error(function(e){
            $nytElem.text('New York Times Articles Could Not Be Loaded');
        });


        // marker property cleared when the window is close
        infowindow.addListener('closeclick', function(){
          infowindow.setMarker(null);
          $nytElem.text('');
        });
      }
  }

  // Marker Bounceing
  function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.setIcon(highlightedIcon);
        }
      }

  // Filtered Seached locations
  this.filteredLocations = ko.computed(function(){
    var filter = self.filter().toLowerCase();
    if(!filter){
      return self.locationList();
    }else{
      return ko.utils.arrayFilter(self.locationList(), function(location){
        return stringStartsWith(location.title.toLowerCase(), filter);
      });
    }
  });

  var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

}

function makeMarkerIcon(Color) {
  var markerImage = new google.maps.MarkerImage(
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|'+Color+'',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(20,35));
  return markerImage;
}
