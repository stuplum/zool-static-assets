'use strict';

const PLUGIN_NAME = require('../../package.json').name;

const Hoek = require('hoek');
const join = require('path').join;

const internals = {};

internals.defaults = {
    debug: false
};

exports.register = function (server, options, next) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

    if (!settings.baseDir) {
        return next(new Error(`${PLUGIN_NAME} requires "baseDir" to be set`));
    }

    if (!settings.url) {
        return next(new Error(`${PLUGIN_NAME} requires "url" to be set`));
    }

    if (!settings.location) {
        return next(new Error(`${PLUGIN_NAME} requires "location" to be set`));
    }

    const fontsPath = `/${settings.url}/{param*}`;
    const fontsLocation = join(process.cwd(), settings.baseDir, settings.location);

    server.route({

        method: 'GET', path: fontsPath,
        handler: {
            directory: {
                path: fontsLocation,
                listing: true
            }
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('../../package.json')
};
