
// When not in slim mode, just import modules at build-time
/* @if SLIM !== true */
import jszipModule from 'jszip';
import yamlModule from 'js-yaml';
/* @endif */

// When in slim mode, setup functions to import modules at run-time
/* @if SLIM === true */
import currentExecutingScript from 'current-executing-script';

import * as URLs from './urls';
import { importModule } from './importModule';

function getCurrentScriptPath() {
    const script = currentExecutingScript() || {};
    return URLs.pathForURL(script.src);
}

const TANGRAM_PATH = getCurrentScriptPath();
/* @endif */

// module references loaded either sync or async (depending on slim mode)
let jszip;
let yaml;

// When not in slim mode, assign imported modules
/* @if SLIM !== true */
jszip = jszipModule;
yaml = yamlModule;
/* @endif */

// Functions to retrieve modules at run-time, either via build-time (non-slim) or run-time (slim) imports

export async function getYamlModule() {
    /* @if SLIM === true */
    if (!yaml) {
        yaml = await importModule(TANGRAM_PATH + 'tangram.yaml.mjs').then(m => m.default);
    }
    /* @endif */
    return yaml;
}

export async function getZipModule() {
    /* @if SLIM === true */
    if (!jszip) {
        jszip = await importModule(TANGRAM_PATH + 'tangram.zip.mjs').then(m => m.default);
    }
    /* @endif */
    return jszip;
}
