
var geomonMap = angular.module('geomonMap', []);

geomonMap.value("defaultCenter", { lon: 18.088500, lat: 59.310740, defaultZoom: 3, zoom: 15 })

geomonMap.service('map', Map)

function Map(defaultCenter) {

    this.personStyle = {
        graphicWidth: 51, graphicHeight: 51, graphicXOffset: -25, graphicYOffset: -54
    }

    this.strokeStyle = {
        strokeOpacity: 0.65, strokeWidth: 5
    }

    this.gripStyle = {
        graphicWidth: 8, graphicHeight: 8, pointRadius: 3, strokeWidth: 2, fillColor: '#ffffff'
    };

    this.users = null;

    this.myself = null;

    this.markers = [];

    this.osm = new OpenLayers.Map('map', {
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar({ panIcons: false })
        ]
    });
    this.osm.parentMapObject = this;
    this.mapLayer = new OpenLayers.Layer.OSM();
    this.fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    this.mapLayer.animationEnabled = false;
    this.osm.addLayer(this.mapLayer);
    this.pathLayer = new OpenLayers.Layer.Vector();
    this.pathLayer.animationEnabled = false;
    this.osm.addLayer(this.pathLayer);
    this.vectorLayer = new OpenLayers.Layer.Vector('Overlay', {});
    this.onFeatureSelect = function (feature) { this.map.parentMapObject.createPopup(feature); }
    this.onFeatureUnselect = function (feature) { this.map.parentMapObject.removePopup(feature); }
    var selectMarkerControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, { onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect });
    this.osm.addControl(selectMarkerControl);
    selectMarkerControl.activate();
    this.vectorLayer.animationEnabled = false;
    this.osm.addLayer(this.vectorLayer);

    this.setCenter = function (lon, lat, zoom) {
        if (typeof zoom === 'undefined')
            zoom = this.osm.getZoom()

        this.osm.setCenter(new OpenLayers.LonLat(lon, lat).transform(this.fromProjection, this.osm.getProjectionObject()), zoom);
    }
    this.setCenter(defaultCenter.lon, defaultCenter.lat, defaultCenter.defaultZoom);

    this.init = function (users, cb) {
        this.users = users;
        var instance = this;
        this.users.forEach(function (user) {
            user.version = user.iconVersion = 0;
            user.lineFeature = null;
            user.shownTrace = null;
            instance.addMarker(user._id, user.lon, user.lat);
            user.getMarker = function () {
                return instance.getMarker(this._id)
            }
        })
        if (this.users.length > 0) {
            this.myself = users[0];
        } else {
            this.myself = { name: 'test', updateInterval: 30, lon: defaultCenter.lon, lat: defaultCenter.lat }
        }
        this.setCenter(this.myself.lon, this.myself.lat, defaultCenter.zoom);
        cb();
    }

    this.addMarker = function (_id, lon, lat) {
        var myLocation = new OpenLayers.Geometry.Point(lon, lat).transform(this.fromProjection, this.osm.getProjectionObject());
        var feature = new OpenLayers.Feature.Vector(myLocation, { _id: _id, tooltip: 'OpenLayers', lon: lon, lat: lat });
        feature.style = $.extend(true, {}, this.personStyle);
        // TO+DO
        //feature assign proper icon
        feature.style.externalGraphic = 'img/man-icon.png';
        this.vectorLayer.addFeatures([feature]);
        this.markers.push(feature);
        return feature;
    }

    this.getMarker = function (_id) {
        var result = null;
        var instance = this;
        this.markers.forEach(function (marker) {
            if (marker.data._id == _id) {
                result = marker;
                return;
            }
        })
        return result;
    }

    this.moveMarker = function (marker, newLon, newLat) {
        var newLoc = new OpenLayers.LonLat(newLon, newLat).transform(this.fromProjection, this.osm.getProjectionObject())
        marker.data.lon = newLon;
        marker.data.lat = newLat;
        marker.move(newLoc);
        this.movePopup(marker);
        var user = this.getUser(marker.data._id);
        if (user) {
            // yesterday: shownTrace == 1
            if (user.lineFeature && user.shownTrace != 1 && user.shownTrace != -1) {
                var newPoint = new OpenLayers.Geometry.Point(newLon, newLat).transform(this.fromProjection, this.osm.getProjectionObject());
                user.lineFeature.geometry.addPoint(newPoint);
                this.pathLayer.redraw();
            }
        }
    }

    this.addGrip = function (user, lon, lat, update) {
        var myLocation = new OpenLayers.Geometry.Point(lon, lat).transform(this.fromProjection, this.osm.getProjectionObject());
        var feature = new OpenLayers.Feature.Vector(myLocation, { _id: user._id, tooltip: 'OpenLayers', lon: lon, lat: lat, update: update });
        feature.style = $.extend(true, {}, this.gripStyle);
        feature.style.strokeColor = user.color
        feature.parentTrack = user._id;
        this.vectorLayer.addFeatures([feature]);
    }

    // TO+DO implement update grips
    //this.updateGrips = function (user) {}

    this.removeGrips = function (user) {
        var grips = [];
        var instance = this;
        this.vectorLayer.features.forEach(function (item) {
            if (item.parentTrack == user._id) {
                grips.push(item);
                if (item.popup != null) {
                    instance.osm.removePopup(item.popup);
                    item.popup.destroy();
                    delete item.popup;
                }
            }
        });
        if (grips.length > 0) {
            this.vectorLayer.removeFeatures(grips);
        }
    }

    this.getUser = function (_id) {
        var result = null;
        var instance = this;
        this.users.forEach(function (user) {
            if (user._id == _id) {
                result = user;
                return;
            }
        })
        return result;
    }

    this.updatePosition = function (cb) {
        var instance = this;
        if (instance.myself) {
            // TO+DO check if navigator.geolocation is supported
            navigator.geolocation.getCurrentPosition(function (position) {
                var newLon = Math.floor(position.coords.longitude * 1e6) / 1e6;
                var newLat = Math.floor(position.coords.latitude * 1e6) / 1e6;

                instance.myself.lon = newLon;
                instance.myself.lat = newLat;
                var marker = instance.getMarker(instance.myself._id);
                instance.moveMarker(marker, newLon, newLat);

                cb({ lon: newLon, lat: newLat });
            });
        }
    }

    // TO+DO remove test method
    this.testPosition = function (lon, lat) {
        this.myself.lon = lon;
        this.myself.lat = lat;
        var marker = this.getMarker(this.myself._id);
        this.moveMarker(marker, lon, lat);

        $.ajax({
            type: 'post',
            url: 'user/update',
            data: { position: { lon: lon, lat: lat } }
        })
    }

    this.showHistory = function (userTrack) {
        var instance = this;
        var user = this.getUser(userTrack._id)
        if (user) {
            var points = [];
            userTrack.track.forEach(function (item) {
                instance.addGrip(user, item.lon, item.lat, item.update);
                points.push(new OpenLayers.Geometry.Point(item.lon, item.lat).transform(instance.fromProjection, instance.osm.getProjectionObject()));
            })
            var line = new OpenLayers.Geometry.LineString(points);
            var lineFeature = new OpenLayers.Feature.Vector(line, null, $.extend(true, {}, this.strokeStyle));
            if (user.lineFeature) {
                this.pathLayer.removeFeatures([user.lineFeature]);
            }
            lineFeature.style.strokeColor = user.color;
            user.lineFeature = lineFeature;
            // TO+DO implement periods
            user.shownTrace = 0;
            this.pathLayer.addFeatures([lineFeature]);
        }
    }

    this.hideHistory = function (_id) {
        var user = this.getUser(_id)
        if (user) {
            user.shownTrace = -1;
            if (user.lineFeature) {
                this.pathLayer.removeFeatures([user.lineFeature]);
                user.lineFeature = null;
            }
            this.removeGrips(user);
        }
    }

    this.createPopup = function (feature) {
        var user = this.getUser(feature.data._id)
        if (user) {
            if (feature.parentTrack) {
                var offset = new OpenLayers.Pixel(7, 15);
                var html = this.formatTipContent(user, feature.data.update);
                var relativePosition = function () { return 'tl'; };
            } else {
                var offset = new OpenLayers.Pixel(5, -27);
                var html = this.formatPopupContent(user);
                var relativePosition = function () { return 'tr'; };
            }
            var anchor = { 'size': new OpenLayers.Size(0, 0), 'offset': offset };
            var popup = new OpenLayers.Popup.FramedCloud('', feature.geometry.getBounds().getCenterLonLat(), null, html, anchor, false);
            popup.calculateRelativePosition = relativePosition;
            feature.popup = popup;
            this.osm.addPopup(popup);
            popup.show();
        }
    }

    this.removePopup = function (feature) {
        if (feature.popup != null) {
            this.osm.removePopup(feature.popup);
            feature.popup.destroy();
            delete feature.popup;
        }
    }

    this.movePopup = function (feature) {
        if (feature.popup != null) {
            this.removePopup(feature);
            this.createPopup(feature);
        }
    }

    this.formatTipContent = function (user, update) {
        var template =
 '<div class="cloud-frame point-info">\
                <span class="name">{0}</span> \
                <img src="/img/clock.svg" alt="" /> \
                <span class="update">{1}</span> \
            </div>';

        var html = String.format(template, user.name, update);

        return html;
    }

    this.formatPopupContent = function (user) {
        var template =
 '<div class="cloud-frame"> \
                <div class="column-1"> \
                    <span class="name">{0}</span> \
                    <img src="/img/clock.svg" alt="" /> \
                    <span class="update">(Online)</span> \
                </div> \
                <div class="column-2"> \
                    <img src="/img/man.svg"></img> \
                </div> \
            </div>';

        var html = String.format(template, user.name);

        return html;
    }

}