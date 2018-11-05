// Loads each of the chunks produced by the first Rollup pass.
// The custom AMD define() in intro.js will combined the shared
// and worker chunks into a worker bundle that can be instantiated
// via blob URL.

import './shared';          // shared code between main and worker threads
import './scene_worker';    // worker code, gets turned into a blob URL used to instantiate workers
import './module';          // main thread code, gets exported as main library below

// This allows the rollup ESM build to work within a <script type="module"> tag
// Script modules can't expose exports
try {
	if (ESMODULE === true && typeof window === 'object') {
	    window.Tangram = Tangram;
	}
} catch(e) {}

export default Tangram;
