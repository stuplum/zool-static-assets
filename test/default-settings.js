'use strict';

const Hapi = require('hapi');
const inert = require('inert');

describe('zool-static-assets: default settings', function () {

    const temp = new Temp('zool-static-assets-tests');

    let server;

    temp.create({
        '_assets/dave.txt': 'dave woz ere - shared',
        'dave/_assets/dave.txt': 'dave woz ere - component',
        'chaz/_assets/chaz.txt': 'chaz woz ere'
    });

    after(function (done) {
        temp.cleanUp();
        done();
    });

    beforeEach(function (done) {

        const config = {
            baseDir: temp.path,
            url: 'assets',
            location: '_assets'
        };

        server = new Hapi.Server();
        server.connection({ port: 8000 });

        server.register([{ register: inert }, { register: require('../').route, options: config }], done);
    });

    it('should return a 404 when asset not found', injectGET({ url: '/assets/unknown.txt' }, function (response) {

        expect(response.statusCode).to.be.equal(404);
        expect(response.result).to.contain('Not Found: /assets/unknown.txt');

    }));

    it('should return a static asset', injectGET({ url: '/assets/dave.txt' }, function (response) {

        expect(response.statusCode).to.be.equal(200);
        expect(response.result).to.contain('dave woz ere - shared');

    }));

    it('should return a static asset associated with a component', injectGET({ url: '/assets/chaz.txt', headers: { referer: 'http://example.com/chaz' } }, function (response) {

        expect(response.statusCode).to.be.equal(200);
        expect(response.result).to.contain('chaz woz ere');

    }));

    it('should return a static asset associated with a component when requested from css', injectGET({ url: '/assets/chaz.txt', headers: { referer: 'http://example.com/chaz.css' } }, function (response) {

        expect(response.statusCode).to.be.equal(200);
        expect(response.result).to.contain('chaz woz ere');

    }));

    function injectGET(serverOptions, cb) {
        return function (done) {
            server.inject(Object.assign({ method: 'GET' }, serverOptions), function (response) {
                cb(response);
                done();
            });
        }
    }

});
