# zool-static-assets

A Hapi.js plugin for serving static assets.

### Overview

This plugin will create a single (configurable) route on the server that will respond to requests for static assets. 


### Example usage:

```shell
$ npm install zool-static-assets --save
```

```javascript
const Hapi = require('hapi');
const ZoolStaticAssets = require('zool-static-assets')

const server = new Hapi.Server();
server.connection({ port: 1337 });

const options = {
    debug: true,
    baseDir: '/baseDir',
    url: '/url',
    location: '/location'
};

server.register({
        register: ZoolStaticAssets,
        options: options
    }
    , function (err) {
        if (err) throw err;
        server.start(function () {
            server.log("Hapi server started @ " + server.info.uri);
        });
    }
);
```

### Options:

* `debug`: used to print statements to the console. Defaults to `false`
* `baseDir`: the directory where all components are served from.
* `url`: the route to register with hapijs. 
* `location`: the location within the components directory where the static assets will be served from. 