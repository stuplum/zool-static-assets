'use strict';

const PLUGIN_NAME = require('../../package.json').name;

const url = require('url');
const stat = require('fs').statSync;
const Path = require('path');
const join = Path.join;
const dirname = Path.dirname;
const extname = Path.extname;
const basename = Path.basename;
const normalize = Path.normalize;

const Boom = require('boom');
const Hoek = require('hoek');

const zoolUtils = require('zool-utils');
const onBoom = zoolUtils.onBoom;
const zoolLogger = zoolUtils.ZoolLogger;
const logger = zoolLogger(PLUGIN_NAME);

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

    server.ext('onPostHandler', onBoom((request, reply) => {

        const error = request.response;
        const errorPayload = request.response.output.payload;
        const statusCode = errorPayload.statusCode;
        const replyText = statusCode === 404 ? `${errorPayload.error}: ${request.path}` : error.message;

        if (settings.debug) {
            logger[statusCode === 404 ? 'warn' : 'error'](errorPayload.error, error.message);
        }

        return reply(replyText).code(statusCode);

    }, PLUGIN_NAME));

    server.route({ method: 'GET', path: `/${settings.url}/{param*}`, handler(request, reply) {

        let componentPath;
        let sharedPath;

        if (request.headers.referer) {

            const referer = url.parse(request.headers.referer);
            const componentFromReferer = join(dirname(referer.pathname), basename(referer.pathname, extname(referer.pathname)));
            const componentAssetsLocation = join(settings.baseDir, componentFromReferer, settings.location);

            if (settings.debug) {
                logger.debug('referred by', referer.pathname);
            }

            componentPath = normalize(`${componentAssetsLocation}/${request.params.param}`);

            if (settings.debug) {
                logger.debug('component asset path', componentPath);
            }
        }

        const staticAssetsLocation = join(settings.baseDir, settings.location);
        sharedPath = `${staticAssetsLocation}/${request.params.param}`;

        try {
            try {
                stat(componentPath);
                return reply.file(componentPath);
            } catch (ex) {

                if (settings.debug) {
                    logger.debug('not found', ex.message);
                }

                stat(sharedPath);
                return reply.file(sharedPath);
            }
        } catch (ex) {
            return reply(Boom.notFound(ex, { from: PLUGIN_NAME }));
        }

    } });

    next();
};

exports.register.attributes = {
    pkg: require('../../package.json')
};
