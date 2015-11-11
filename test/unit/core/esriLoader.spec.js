describe('esriLoader', function() {

    var esriLoader;
    beforeEach(module('esri.core'));
    beforeEach(inject(function(_$rootScope_, _$q_, _esriLoader_) {
        esriLoader = _esriLoader_;
    }));

    describe('isLoaded', function() {

        it('should not be loaded if script not added to page', function() {
            expect(esriLoader.isLoaded()).toBe(false);
        });

    });

});
