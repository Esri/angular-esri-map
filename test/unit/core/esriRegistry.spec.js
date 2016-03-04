describe('esriRegistry', function() {

    // service we're testing
    var esriRegistry;

    // angular mocks
    var $rootScope;
    var deferred;

    // load the core module
    beforeEach(module('esri.core'));

    // inject modules and mocks
    beforeEach(inject(function(_$rootScope_, _$q_, _esriRegistry_) {
        esriRegistry = _esriRegistry_;
        $rootScope = _$rootScope_;
        deferred = _$q_.defer();
    }));

    describe('_register', function() {

        var removeHandle;
        var fakeMap;
        beforeEach(function() {
            fakeMap = {};
            removeHandle = esriRegistry._register('test', deferred.promise);
            deferred.resolve(fakeMap);
        });

        afterEach(function() {
            removeHandle();
        });

        it('should get the registerd promise', function() {
            esriRegistry.get('test').then(function(map) {
                expect(map).toEqual(fakeMap);
            });
            $rootScope.$digest();
        });

        it('should return a remove function', function() {
            expect(typeof removeHandle).toEqual('function');
        });

    });

});
