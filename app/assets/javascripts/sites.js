/*
 *	Sites controller javascript
 */
$(function() {
	// This will be included in all sites controller pages
	// Yet  we load Google Map API only for some of these, so we have to check
	// if it has been loaded
	if(typeof google != "undefined") {
		var MapForm = function() {
			var self = this;
		
			// Initialize Google map object (centered on Madrid)
			var madrid = new google.maps.LatLng(40.4, -3.6);
			self.map = new google.maps.Map(document.getElementById("site_map"), {
					center: madrid,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					zoom: self.getZoom()				
			});

			// Bind zoom change to update zoom field
			google.maps.event.addListener(self.map, "zoom_changed", function() {
				self.updateZoomFromMap();
			});

			// Initalize the marker object
			self.marker = new google.maps.Marker({
				position: madrid,
				map: self.map,
				title: self.getName(),
				draggable: true
			});
			
			// Bind mouse up (click release) on marker to update coordinates field
			google.maps.event.addListener(self.marker, "mouseup", function() {
				self.updateCoordinatesFromMap();
			});

			// Geocoder object
			self.geocoder = new google.maps.Geocoder();

			$("#site_name").change(function() {
				self.updateMapFromName();
			});

			$("#site_latitude").change(function() {
				self.updateMapFromCoordinates();
			});

			$("#site_longitude").change(function() {
				self.updateMapFromCoordinates();
			});

			$("#site_zoom").change(function() {
				self.updateMapZoom();
			});
		}

		// Field getters
		MapForm.prototype.getName = function() {
			return $("#site_name").val();
		}
		
		MapForm.prototype.getCoordinates = function() {
			var lat = parseFloat( $("#site_latitude").val() );
			var long = parseFloat( $("#site_longitude").val() );

			// If both are numbers, return coordinates
			if( !isNaN(lat + long) ) {
				return new google.maps.LatLng(lat, long);
			}
			// Else null
			else {
				return null;
			}
		}

		MapForm.prototype.getZoom = function() {
			var zoom = parseInt(  $("#site_zoom").val() );

			if( isNaN(zoom) ) {
				// Set a default zoom value (say 10)
				zoom = 10;
				this.setZoom(zoom);
			}
			
			return zoom;
		};

		// Field setters
		MapForm.prototype.setZoom = function( zoom ) {
			$("#site_zoom").val( zoom );
		}

		MapForm.prototype.setCoordinates = function( coords ) {
			$("#site_latitude").val( coords.lat() );
			$("#site_longitude").val( coords.lng() );
		}

		// Function to update map on coordinates update
		MapForm.prototype.updateMapFromCoordinates = function() {
			var coord = this.getCoordinates();

			if(coord != null) {
				this.marker.setPosition(coord);
				this.map.setCenter(coord);
			}
		};

		// Function to update map on name update
		MapForm.prototype.updateMapFromName = function() {
			var self = this,
				name = self.getName();

			// Geocode address and set coordinates
			self.geocoder.geocode({
				address: name
			}, function(result, status) {
				if(status == google.maps.GeocoderStatus.OK) {
					var latLng = result[0].geometry.location;
					self.setCoordinates(latLng);
					self.updateMapFromCoordinates();
				}
			});
		};

		// Function to update map zoom
		MapForm.prototype.updateMapZoom = function() {
			this.map.setZoom( this.getZoom() );
		};

		// Update longitude and latitude fields from marker position on the map
		MapForm.prototype.updateCoordinatesFromMap = function() {
			this.setCoordinates( this.marker.getPosition() );
		};

		// Update zoom field actual zoom value of map
		MapForm.prototype.updateZoomFromMap = function() {
			this.setZoom( this.map.getZoom() );
		};

		var form = new MapForm();

		if(form.getCoordinates() != null) {
			form.updateMapFromCoordinates();
		}
		else {
			form.updateMapFromName();
		}
		form.updateMapZoom();
	}
});
