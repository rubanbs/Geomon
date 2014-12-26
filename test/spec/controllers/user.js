describe('Unit Test UserController', function () {

    beforeEach(function () {
        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    beforeEach(module('neueuControllers'));
    beforeEach(module('neueuMap'));

    var ctrl, scope, $httpBackend, $httpHistory;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller) {
        $httpBackend = _$httpBackend_;

        $httpBackend.when('POST', 'user/load').
            respond([
                { _id: '1', name: 'Boris', iconVersion: 0, version: 0, lineFeature: null, shownTrace: null, lon: 55.0000, lat: 35.0000 },
                { _id: '2', name: 'Sarah', iconVersion: 0, version: 0, lineFeature: null, shownTrace: null, lon: 55.0000, lat: 35.0000 }]);

        scope = $rootScope.$new();
        ctrl = $controller('UserController', { $scope: scope });

    }));

    it('should create "users" model with 2 users fetched from xhr', function () {
        expect(scope.users).toBeUndefined();
        $httpBackend.flush();

        expect(scope.users).toEqualData([
            { _id: '1', name: 'Boris', iconVersion: 0, version: 0, lineFeature: null, shownTrace: null, lon: 55.0000, lat: 35.0000 },
            { _id: '2', name: 'Sarah', iconVersion: 0, version: 0, lineFeature: null, shownTrace: null, lon: 55.0000, lat: 35.0000 }]);

    });

    it('should init map.myself variable with first user in response', function () {
        expect(scope.users).toBeUndefined();
        $httpBackend.flush();

        expect(scope.myself).toEqualData(
            { _id: '1', name: 'Boris', iconVersion: 0, version: 0, lineFeature: null, shownTrace: null, lon: 55.0000, lat: 35.0000 }
        );
    })

    it('should place marker of the user to position obtained from xhr', function () {
        expect(scope.users).toBeUndefined();
        $httpBackend.flush();

        var mapMarker = scope.myself.getMarker();
        var position = [mapMarker.data.lon, mapMarker.data.lat];
        expect(position).toEqualData([55.0000, 35.0000]);
    })

    it('should load history from xhr and draw polyline connecting all the points on the map', function () {
        expect(scope.users).toBeUndefined();
        $httpBackend.flush();

        $httpBackend.when('POST', 'user/history').
          respond({
              user: {
                  _id: '2',
                  name: 'Sarah',
                  track: [{ lon: 10.0000, lat: 10.5000 }, { lon: 11.0000, lat: 11.5000 }, { lon: 12.0000, lat: 12.5000 }]
              }
          })
        scope.loadHistory(scope.users[1], -1);
        $httpBackend.flush();

        var vertices = scope.users[1].lineFeature.geometry.getVertices();
        var point = new OpenLayers.Geometry.Point(11.0000, 11.5000).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"))
        expect([vertices[1].x, vertices[1].y]).toEqualData([point.x, point.y])
        scope.hideHistory(scope.users[1])
        expect(scope.users[1].lineFeature).toBeNull()
    })

})