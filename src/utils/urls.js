import log from './log';

// Add a base URL for schemeless or protocol-less URLs
// Defaults to adding current window protocol and base, or adds a custom base if specified
// Maybe use https://github.com/medialize/URI.js if more robust functionality is needed
export function addBaseURL (url, base) {
    if (!url) {
        return;
    }

    // Schemeless, add protocol
    if (url.substr(0, 2) === '//') {
        url = window.location.protocol + url;
    }
    // No http(s) or data, add base
    else if (url.search(/^(http|https|data|blob):/) < 0) {
        var relative = (url[0] !== '/');
        var base_info;
        if (base) {
            base_info = document.createElement('a'); // use a temporary element to parse URL
            base_info.href = base;
        }
        else {
            base_info = window.location;
        }

        if (relative) {
            let path = pathForURL(base_info.href);
            url = path + url;
        }
        else {
            // Easy way
            if (base_info.origin) {
                url = base_info.origin + '/' + url;
            }
            // Hard way (IE11)
            else {
                var origin = url.match(/^((http|https|data|blob):\/\/[^\/]*\/)/);
                origin = (origin && origin.length > 1) ? origin[0] : '';
                url = origin + url;
            }
        }
    }
    return url;
}

export function pathForURL (url) {
    if (typeof url === 'string' && url.search(/^(data|blob):/) === -1) {
        let qs = url.indexOf('?');
        if (qs > -1) {
            url = url.substr(0, qs);
        }

        let hash = url.indexOf('#');
        if (hash > -1) {
            url = url.substr(0, hash);
        }

        return url.substr(0, url.lastIndexOf('/') + 1) || '';
    }
    return '';
}

export function extensionForURL (url) {
    url = url.split('/').pop();
    let last_dot = url.lastIndexOf('.');
    if (last_dot > -1) {
        return url.substring(last_dot + 1);
    }
}

export function isRelativeURL (url) {
    if (typeof url !== 'string') {
        return;
    }
    return !(url.search(/^(http|https|data|blob):/) > -1 || url.substr(0, 2) === '//');
}

// Resolves './' and '../' components from relative path, to get a "flattened" path
export function flattenRelativeURL (url) {
    let dirs = (url || '').split('/');
    for (let d = 1; d < dirs.length; d++) {
        if (dirs[d] === '.') {
            dirs.splice(d, 1);
            d--;
        }
        else if (dirs[d] === '..') {
            d = d + 0;
            dirs.splice(d-1, 2);
            d--;
        }
    }
    return dirs.join('/');
}

// Add a set of query string params to a URL
// params: hash of key/value pairs of query string parameters
export function addParamsToURL (url, params) {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    var qs_index = url.indexOf('?');
    var hash_index = url.indexOf('#');

    // Save and trim hash
    var hash = '';
    if (hash_index > -1) {
        hash = url.slice(hash_index);
        url = url.slice(0, hash_index);
    }

    // Start query string
    if (qs_index === -1) {
        qs_index = url.length;
        url += '?';
    }
    qs_index++; // advanced past '?'

    // Build query string params
    var url_params = '';
    for (var p in params) {
        url_params += `${p}=${params[p]}&`;
    }

    // Insert new query string params and restore hash
    // NOTE: doesn't replace any values already present on query string, just inserts dupe values
    url = url.slice(0, qs_index) + url_params + url.slice(qs_index) + hash;

    return url;
}

// Polyfill (for Safari compatibility)
let _createObjectURL;
export function createObjectURL (url) {
    if (_createObjectURL === undefined) {
        _createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);

        if (typeof _createObjectURL !== 'function') {
            _createObjectURL = null;
            log('warn', `window.URL.createObjectURL (or vendor prefix) not found, unable to create local blob URLs`);
        }
    }

    if (_createObjectURL) {
        return _createObjectURL(url);
    }
    else {
        return url;
    }
}

// Get URL that the current script was loaded from
// If currentScript is not available, loops through <script> elements searching for a list of provided paths
// e.g. findCurrentURL('tangram.debug.js', 'tangram.min.js');
export function findCurrentURL (...paths) {
    // Find currently executing script
    var script = document.currentScript;
    if (script) {
        return script.src;
    }
    else if (Array.isArray(paths)) {
        // Fallback on looping through <script> elements if document.currentScript is not supported
        var scripts = document.getElementsByTagName('script');
        for (var s=0; s < scripts.length; s++) {
            for (var path of paths) {
                if (scripts[s].src.indexOf(path) > -1) {
                   return scripts[s].src;
                }
            }
        }
    }
}
