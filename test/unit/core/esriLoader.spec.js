describe('esriLoader', function() {

    // service we're testing
    var esriLoader;

    // angular mocks
    var $rootScope;

    // load the core module
    beforeEach(module('esri.core'));

    // inject modules and mocks and
    beforeEach(inject(function(_$rootScope_, _$q_, _esriLoader_) {
        $rootScope = _$rootScope_;
        esriLoader = _esriLoader_;
    }));

    describe('isLoaded', function() {

        describe('when script not added to page', function() {
            it('should return false', function() {
                expect(esriLoader.isLoaded()).toBe(false);
            });
        });

    });

    describe('bootstrap', function() {

        describe('when not loaded', function() {

            // watch for appending a script
            beforeEach(function() {
                spyOn(document.body, 'appendChild');
            });

            describe('when not passing url in options', function() {
                it('should default to 4.3', function() {
                    var url = window.location.protocol + '//js.arcgis.com/4.3';
                    esriLoader.bootstrap();
                    expect(document.body.appendChild.calls.argsFor(0)[0].src).toEqual(url);
                });
            });

            describe('when passing url in options', function() {
                it('should have same url', function() {
                    var url = 'http://js.arcgis.com/3.14compact';
                    esriLoader.bootstrap({
                        url: url
                    });
                    expect(document.body.appendChild.calls.argsFor(0)[0].src).toEqual(url);
                });
            });
        });

        describe('when loaded', function() {

            // fake that JSAPI is loaded and mock dojo/require
            // and watch for appending a script
            beforeEach(function() {
                window.require = function() {
                    console.log(arguments);
                };
            });

            // clean up mocked requied
            afterEach(function() {
                delete window.require;
            });

            it('should reject the promise', function() {
                esriLoader.bootstrap().catch(function(err) {
                    expect(typeof err).toEqual('string');
                });
                $rootScope.$digest();
            });
        });

    });

    describe('require', function() {

        describe('when not loaded', function() {
            it('should reject the promise', function() {
                esriLoader.require('notARealModuleName').catch(function(err) {
                    expect(typeof err).toEqual('string');
                });
                $rootScope.$digest();
            });
        });

        describe('when loaded', function() {

            // fake that JSAPI is loaded and mock dojo/require
            beforeEach(function() {
                window.require = function(moduleNames, callback) {
                    var fakeModules = moduleNames.map(function(moduleName) {
                        return {
                            name: moduleName
                        };
                    });
                    callback.apply(window, fakeModules);
                };
                spyOn(window, 'require').and.callThrough();
            });

            // clean up mocked requied
            afterEach(function() {
                delete window.require;
            });

            describe('when passed a single module name as string', function() {
                describe('and a callback function', function() {
                    var callback;
                    beforeEach(function() {
                        callback = jasmine.createSpy();
                    });
                    it('should call require with an array of module names', function() {
                        esriLoader.require('notARealModuleName', callback);
                        expect(window.require.calls.argsFor(0)[0]).toEqual(['notARealModuleName']);
                    });
                    it('should call the callback with 1 argument', function() {
                        esriLoader.require('notARealModuleName', callback);
                        $rootScope.$digest();
                        expect(callback.calls.argsFor(0).length).toEqual(1);
                    });
                });
                describe('and no callback function', function() {
                    it('should call require with an array of module names', function() {
                        esriLoader.require('notARealModuleName').then(function() {
                            expect(window.require.calls.argsFor(0)[0]).toEqual(['notARealModuleName']);
                        });
                        $rootScope.$digest();
                    });
                    it('should resolve a single module', function() {
                        esriLoader.require('notARealModuleName').then(function(notARealModule) {
                            expect(notARealModule.name).toEqual('notARealModuleName');
                        });
                        $rootScope.$digest();
                    });
                });
            });

            describe('when passed an array of module names', function() {
                describe('and a callback function', function() {
                    var callback;
                    beforeEach(function() {
                        callback = jasmine.createSpy();
                    });
                    it('should call require with an array of module names', function() {
                        esriLoader.require(['notARealModuleName', 'anotherOne'], callback);
                        expect(window.require.calls.argsFor(0)[0]).toEqual(['notARealModuleName', 'anotherOne']);
                    });
                    it('should call the callback function with more than 1 argument', function() {
                        esriLoader.require(['notARealModuleName', 'anotherOne'], callback);
                        $rootScope.$digest();
                        expect(callback.calls.argsFor(0).length).toEqual(2);
                    });
                });
                describe('and no callback function', function() {
                    it('should call require with an array of module names', function() {
                        esriLoader.require(['notARealModuleName', 'anotherOne']).then(function() {
                            expect(window.require.calls.argsFor(0)[0]).toEqual(['notARealModuleName', 'anotherOne']);
                        });
                        $rootScope.$digest();
                    });
                    it('should resolve an array of modules', function() {
                        esriLoader.require(['notARealModuleName', 'anotherOne']).then(function(modules) {
                            expect(modules.length).toEqual(2);
                        });
                        $rootScope.$digest();
                    });
                });
            });

        });

    });

});
