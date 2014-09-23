/**
 * Copyright 2000, Silicon Graphics, Inc. All Rights Reserved.
 * Copyright 2012, Google Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice including the dates of first publication and
 * either this permission notice or a reference to http://oss.sgi.com/projects/FreeB/
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * SILICON GRAPHICS, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Original Code. The Original Code is: OpenGL Sample Implementation,
 * Version 1.2.1, released January 26, 2000, developed by Silicon Graphics,
 * Inc. The Original Code is Copyright (c) 1991-2000 Silicon Graphics, Inc.
 * Copyright in any portions created by third parties is as indicated
 * elsewhere herein. All Rights Reserved.
 */

/**
 * @author Eric Veach, July 1994
 * @author Brendan Kenny
 */

/**
 * Base namespace.
 */
var libtess = libtess || {};

/**
 * @define {boolean} [DEBUG description]
 */
libtess.DEBUG = false;


/**
 * Checks if the condition evaluates to true if libtess.DEBUG is true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
libtess.assert = function(condition, opt_message) {
  if (libtess.DEBUG && !condition) {
    throw new Error('Assertion failed' + (opt_message ? ': ' + opt_message : ''));
  }
};

/**
 * [sweepDebugEvent description]
 * @param {libtess.GluTesselator} tess
 */
libtess.sweepDebugEvent = function(tess) {
  // TODO(bckenny)
  // sweep event updated
};

/**
 * [GLU_TESS_MAX_COORD description]
 * @type {number}
 * @const
 */
libtess.GLU_TESS_MAX_COORD = 1e150;
// NOTE(bckenny): from glu.pl generator

/**
 * [TRUE_PROJECT description]
 * TODO(bckenny): see alg-outline for description
 *
 * @type {boolean}
 */
libtess.TRUE_PROJECT = false;

/**
 * We cache vertex data for single-contour polygons so that we can
 * try a quick-and-dirty decomposition first.
 * @type {number}
 * @const
 */
libtess.TESS_MAX_CACHE = 100;

/**
 * [GLU_TESS_DEFAULT_TOLERANCE description]
 * @type {number}
 * @const
 */
libtess.GLU_TESS_DEFAULT_TOLERANCE = 0.0;

/**
 * The begin/end calls must be properly nested. We keep track of
 * the current state to enforce the ordering.
 *
 * @enum {number}
 */
libtess.tessState = {
  // TODO(bckenny): only used in GluTesselator, probably move there
  T_DORMANT: 0,
  T_IN_POLYGON: 1,
  T_IN_CONTOUR: 2
};

/**
 * The input contours parition the plane into regions. A winding
 * rule determines which of these regions are inside the polygon.
 *
 * For a single contour C, the winding number of a point x is simply
 * the signed number of revolutions we make around x as we travel
 * once around C (where CCW is positive). When there are several
 * contours, the individual winding numbers are summed.  This
 * procedure associates a signed integer value with each point x in
 * the plane. Note that the winding number is the same for all
 * points in a single region.
 *
 * The winding rule classifies a region as "inside" if its winding
 * number belongs to the chosen category (odd, nonzero, positive,
 * negative, or absolute value of at least two).  The current GLU
 * tesselator implements the "odd" rule.  The "nonzero" rule is another
 * common way to define the interior. The other three rules are
 * useful for polygon CSG operations.
 *
 * @enum {number}
 */
libtess.windingRule = {
  // NOTE(bckenny): values from enumglu.spec
  // TODO(bckenny): need to export when compiled
  GLU_TESS_WINDING_ODD: 100130,
  GLU_TESS_WINDING_NONZERO: 100131,
  GLU_TESS_WINDING_POSITIVE: 100132,
  GLU_TESS_WINDING_NEGATIVE: 100133,
  GLU_TESS_WINDING_ABS_GEQ_TWO: 100134
};

/**
 * The type of primitive return from a "begin" callback. GL_LINE_LOOP is only
 * returned when GLU_TESS_BOUNDARY_ONLY is true. Values of enum match WebGL
 * constants.
 *
 * @enum {number}
 */
libtess.primitiveType = {
  // TODO(bckenny): doc types
  // TODO(bckenny): need to export when compiled, but can just use webgl constants when available
  GL_LINE_LOOP: 2,
  GL_TRIANGLES: 4,
  GL_TRIANGLE_STRIP: 5,
  GL_TRIANGLE_FAN: 6
};

/**
 * The types of errors provided to error callback.
 * @enum {number}
 */
libtess.errorType = {
  // TODO(bckenny) doc types
  // NOTE(bckenny): values from enumglu.spec
  GLU_TESS_MISSING_BEGIN_POLYGON: 100151,
  GLU_TESS_MISSING_END_POLYGON: 100153,
  GLU_TESS_MISSING_BEGIN_CONTOUR: 100152,
  GLU_TESS_MISSING_END_CONTOUR: 100154,
  GLU_TESS_COORD_TOO_LARGE: 100155,
  GLU_TESS_NEED_COMBINE_CALLBACK: 100156
};

/**
 * GLU enums necessary for this project.
 * see enumglu.spec
 * TODO(bckenny): better source for these?
 *
 * @enum {number}
 */
libtess.gluEnum = {
  // NOTE(bckenny): values from enumglu.spec
  // TODO(bckenny): most enums under here? drop GLU? or rename in other ways
  GLU_TESS_MESH: 100112,  // from tess.c
  GLU_TESS_TOLERANCE: 100142,
  GLU_TESS_WINDING_RULE: 100140,
  GLU_TESS_BOUNDARY_ONLY: 100141,

  // TODO(bckenny): should this live in errorType?
  GLU_INVALID_ENUM: 100900,
  GLU_INVALID_VALUE: 100901,

  GLU_TESS_BEGIN: 100100,
  GLU_TESS_VERTEX: 100101,
  GLU_TESS_END: 100102,
  GLU_TESS_ERROR: 100103,
  GLU_TESS_EDGE_FLAG: 100104,
  GLU_TESS_COMBINE: 100105,
  GLU_TESS_BEGIN_DATA: 100106,
  GLU_TESS_VERTEX_DATA: 100107,
  GLU_TESS_END_DATA: 100108,
  GLU_TESS_ERROR_DATA: 100109,
  GLU_TESS_EDGE_FLAG_DATA: 100110,
  GLU_TESS_COMBINE_DATA: 100111
};

/** @typedef {number} */
libtess.PQHandle;

// TODO(bckenny): better typing on key?
/** @typedef {Object} */
libtess.PQKey;

// require libtess
/*global libtess */

/**
 * Cached vertex data for single-countour polygons for quick-and-dirty
 * decomposition.
 * @constructor
 */
libtess.CachedVertex = function() {
  /**
   * [coords description]
   * @type {Array.<number>}
   */
  this.coords = [0, 0, 0];
  // TODO(bckenny): better way to init?
  
  /**
   * [data description]
   * @type {Object}
   */
  this.data = null;
};


// require libtess
// require libtess.mesh
// require libtess.tessmono
// require libtess.render
// require libtess.normal
// require libtess.sweep
/*global libtess */

// TODO(bckenny): options for just triangles, just tristrips, single tristrip w/ resets
// other primitives with index buffer? would have to add a better tristrip extractor
// monotone poly -> tristrip seems possible...

// TODO(bckenny): create more javascript-y API, e.g. make gluTessEndPolygon async,
// don't require so many temp objects created

/**
 * [GluTesselator description]
 *
 * @constructor
 */
libtess.GluTesselator = function() {
  // Only initialize fields which can be changed by the api. Other fields
  // are initialized where they are used.

  // TODO(bckenny): many of these can be made private
  // TODO(bckenny): can we combine call* and call*Data functions?

  /*** state needed for collecting the input data ***/

  /**
   * what begin/end calls have we seen?
   * @type {libtess.tessState}
   */
  this.state = libtess.tessState.T_DORMANT;

  /**
   * lastEdge_.org is the most recent vertex
   * @private
   * @type {libtess.GluHalfEdge}
   */
  this.lastEdge_ = null;

  /**
   * stores the input contours, and eventually the tessellation itself
   * @type {libtess.GluMesh}
   */
  this.mesh = null;
  // NOTE(bckenny): initialized in this.emptyCache_

  /**
   * Error callback.
   * @private
   * @type {?function((libtess.errorType|libtess.gluEnum))}
   */
  this.callError_ = null;


  /*** state needed for projecting onto the sweep plane ***/

  /**
   * user-specified normal (if provided)
   * @type {Array.<number>}
   */
  this.normal = [0, 0, 0];
  // TODO(bckenny): better way to init these arrays?
  
  /**
   * unit vector in s-direction (debugging)
   * @type {Array.<number>}
   */
  this.sUnit = [0, 0, 0];
  
  /**
   * unit vector in t-direction (debugging)
   * @type {Array.<number>}
   */
  this.tUnit = [0, 0, 0];

  /*** state needed for the line sweep ***/
  // TODO(bckenny): this could be moved to a sweep state object of some sort

  /**
   * tolerance for merging features
   * @type {number}
   */
  this.relTolerance = libtess.GLU_TESS_DEFAULT_TOLERANCE;

  /**
   * rule for determining polygon interior
   * @type {libtess.windingRule}
   */
  this.windingRule = libtess.windingRule.GLU_TESS_WINDING_ODD;

  /**
   * fatal error: needed combine callback
   * @type {boolean}
   */
  this.fatalError = false;

  /**
   * edge dictionary for sweep line
   * @type {libtess.Dict}
   */
  this.dict = null;
  // NOTE(bckenny): dict initialized in sweep.initEdgeDict_, removed in sweep.doneEdgeDict_

  /**
   * priority queue of vertex events
   * @type {libtess.PriorityQ}
   */
  this.pq = null;
  // NOTE(bckenny): pq initialized in sweep.initPriorityQ

  /**
   * current sweep event being processed
   * @type {libtess.GluVertex}
   */
  this.event = null;

  /**
   * Combine callback.
   * @private
   * @type {?function(Array.<number>, Array.<Object>, Array.<number>): Object}
   */
  this.callCombine_ = null;

  /*** state needed for rendering callbacks (see render.js) ***/

  /**
   * mark boundary edges (use EdgeFlag)
   * @type {boolean}
   */
  this.flagBoundary = false;

  /**
   * Extract contours, not triangles
   * @type {boolean}
   */
  this.boundaryOnly = false;

  /**
   * list of triangles which could not be rendered as strips or fans
   * @type {libtess.GluFace}
   */
  this.lonelyTriList = null;

  /**
   * Begin callback.
   * @private
   * @type {?function(libtess.primitiveType)}
   */
  this.callBegin_ = null;

  /**
   * Edge flag callback.
   * @private
   * @type {?function(boolean)}
   */
  this.callEdgeFlag_ = null;

  /**
   * Vertex callback.
   * @private
   * @type {?function(Object)}
   */
  this.callVertex_ = null;

  /**
   * End callback.
   * @private
   * @type {?function()}
   */
  this.callEnd_ = null;

  /**
   * Mesh callback.
   * @private
   * @type {?function(libtess.GluMesh)}
   */
  this.callMesh_ = null;

  /*** rendering callbacks that also pass polygon data  ***/
  /**
   * BeginData callback.
   * @private
   * @type {?function(libtess.primitiveType, Object)}
   */
  this.callBeginData_ = null;

  /**
   * EdgeFlagData callback.
   * @private
   * @type {?function(boolean, Object)}
   */
  this.callEdgeFlagData_ = null;

  /**
   * VertexData callback.
   * @private
   * @type {?function(Object, Object)}
   */
  this.callVertexData_ = null;

  /**
   * EndData callback.
   * @private
   * @type {?function(Object)}
   */
  this.callEndData_ = null;

  /**
   * ErrorData callback.
   * @private
   * @type {?function((libtess.errorType|libtess.gluEnum), Object)}
   */
  this.callErrorData_ = null;

  /**
   * CombineData callback.
   * @private
   * @type {?function(Array.<number>, Array.<Object>, Array.<number>, Object): Object}
   */
  this.callCombineData_ = null;

  /**
   * client data for current polygon
   * @private
   * @type {Object}
   */
  this.polygonData_ = null;

  /*** state needed to cache single-contour polygons for renderCache() ***/
  /**
   * empty cache on next vertex() call
   * @type {boolean}
   */
  this.emptyCache = false;
  // TODO(bckenny): possibly rename to be clear it's a boolean
  
  /**
   * number of cached vertices
   * @type {number}
   */
  this.cacheCount = 0;

  /**
   * the vertex data
   * @type {Array.<libtess.CachedVertex>}
   */
  this.cache = new Array(libtess.TESS_MAX_CACHE);

  // TODO(bckenny): fill now? or init on demand
  for (var i = 0; i < libtess.TESS_MAX_CACHE; i++) {
    this.cache[i] = new libtess.CachedVertex();
  }
};

/**
 * Destory the tesselator object. See README.
 */
libtess.GluTesselator.prototype.gluDeleteTess = function() {
  // TODO(bckenny): do we need a public API for this still?
  this.requireState_(libtess.tessState.T_DORMANT);
  // memFree(tess); TODO(bckenny)
};

/**
 * Set properties for control over tesselation. See README.
 * @param {libtess.gluEnum} which [description]
 * @param {number|boolean} value [description]
 */
libtess.GluTesselator.prototype.gluTessProperty = function(which, value) {
  // TODO(bckenny): split into more setters?
  // TODO(bckenny): in any case, we can do better than this switch statement

  switch (which) {
    case libtess.gluEnum.GLU_TESS_TOLERANCE:
      if (value < 0 || value > 1) {
        break;
      }
      this.relTolerance = /** @type {number} */(value);
      return;

    case libtess.gluEnum.GLU_TESS_WINDING_RULE:
      var windingRule = /** @type {libtess.windingRule} */(value);

      switch (windingRule) {
        case libtess.windingRule.GLU_TESS_WINDING_ODD:
        case libtess.windingRule.GLU_TESS_WINDING_NONZERO:
        case libtess.windingRule.GLU_TESS_WINDING_POSITIVE:
        case libtess.windingRule.GLU_TESS_WINDING_NEGATIVE:
        case libtess.windingRule.GLU_TESS_WINDING_ABS_GEQ_TWO:
          this.windingRule = windingRule;
          return;
        default:
      }
      break;

    case libtess.gluEnum.GLU_TESS_BOUNDARY_ONLY:
      // TODO(bckenny): added boolean param type. make sure ok.
      this.boundaryOnly = !!value;
      return;

    default:
      this.callErrorOrErrorData(libtess.gluEnum.GLU_INVALID_ENUM);
      return;
  }
  this.callErrorOrErrorData(libtess.gluEnum.GLU_INVALID_VALUE);
};

/**
 * Returns tessellator property
 * @param {libtess.gluEnum} which [description]
 * @return {number|boolean} [description]
 */
libtess.GluTesselator.prototype.gluGetTessProperty = function(which) {
  // TODO(bckenny): as above, split into more getters? and improve on switch statement
  // why are these being asserted in getter but not setter?

  switch (which) {
    case libtess.gluEnum.GLU_TESS_TOLERANCE:
      // tolerance should be in range [0..1]
      libtess.assert(0 <= this.relTolerance && this.relTolerance <= 1);
      return this.relTolerance;

    case libtess.gluEnum.GLU_TESS_WINDING_RULE:
      var rule = this.windingRule;
      libtess.assert(rule === libtess.windingRule.GLU_TESS_WINDING_ODD ||
          rule === libtess.windingRule.GLU_TESS_WINDING_NONZERO ||
          rule === libtess.windingRule.GLU_TESS_WINDING_POSITIVE ||
          rule === libtess.windingRule.GLU_TESS_WINDING_NEGATIVE ||
          rule === libtess.windingRule.GLU_TESS_WINDING_ABS_GEQ_TWO);
      return rule;

    case libtess.gluEnum.GLU_TESS_BOUNDARY_ONLY:
      libtess.assert(this.boundaryOnly === true || this.boundaryOnly === false);
      return this.boundaryOnly;

    default:
      this.callErrorOrErrorData(libtess.gluEnum.GLU_INVALID_ENUM);
      break;
   }
   return false;
};

/**
 * Lets the user supply the polygon normal, if known.  All input data
 * is projected into a plane perpendicular to the normal before
 * tesselation. All output triangles are oriented CCW with
 * respect to the normal (CW orientation can be obtained by
 * reversing the sign of the supplied normal). For example, if
 * you know that all polygons lie in the x-y plane, call
 * "tess.gluTessNormal(0.0, 0.0, 1.0)" before rendering any polygons.
 *
 * @param {number} x [description]
 * @param {number} y [description]
 * @param {number} z [description]
 */
libtess.GluTesselator.prototype.gluTessNormal = function(x, y, z) {
  this.normal[0] = x;
  this.normal[1] = y;
  this.normal[2] = z;
};

/**
 * Specify callbacks. See README. A null or undefined opt_fn removes current callback.
 *
 * @param {libtess.gluEnum} which [description]
 * @param {?function()=} opt_fn [description]
 */
libtess.GluTesselator.prototype.gluTessCallback = function(which, opt_fn) {
  var fn = !opt_fn ? null : opt_fn;
  // TODO(bckenny): better opt_fn typing?

  switch(which) {
    case libtess.gluEnum.GLU_TESS_BEGIN:
      this.callBegin_ = /** @type {function(libtess.primitiveType)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_BEGIN_DATA:
      this.callBeginData_ =
          /** @type {function(libtess.primitiveType, Object)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_EDGE_FLAG:
      this.callEdgeFlag_ = /** @type {function(boolean)} */ (fn);
      // If the client wants boundary edges to be flagged,
      // we render everything as separate triangles (no strips or fans).
      this.flagBoundary = (!!fn);
      return;

    case libtess.gluEnum.GLU_TESS_EDGE_FLAG_DATA:
      this.callEdgeFlagData_ = /** @type {function(boolean, Object)} */ (fn);
      // If the client wants boundary edges to be flagged,
      // we render everything as separate triangles (no strips or fans).
      this.flagBoundary = (!!fn);
      return;

    case libtess.gluEnum.GLU_TESS_VERTEX:
      this.callVertex_ = /** @type {function(Object)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_VERTEX_DATA:
      this.callVertexData_ = /** @type {function(Object, Object)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_END:
      this.callEnd_ = /** @type {function()} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_END_DATA:
      this.callEndData_ = /** @type {function(Object)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_ERROR:
      this.callError_ = /** @type {function((libtess.errorType|libtess.gluEnum))} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_ERROR_DATA:
      this.callErrorData_ =
          /** @type {function((libtess.errorType|libtess.gluEnum), Object)} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_COMBINE:
      this.callCombine_ = /** @type {function(Array.<number>, Array.<Object>, Array.<number>): Object} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_COMBINE_DATA:
      this.callCombineData_ = /** @type {function(Array.<number>, Array.<Object>, Array.<number>, Object): Object} */ (fn);
      return;

    case libtess.gluEnum.GLU_TESS_MESH:
      this.callMesh_ = /** @type {function(libtess.GluMesh)} */ (fn);
      return;

    default:
      this.callErrorOrErrorData(libtess.gluEnum.GLU_INVALID_ENUM);
      return;
  }
};

/**
 * Specify a vertex and associated data. Must be within calls to
 * beginContour/endContour. See README.
 *
 * @param {Array.<number>} coords [description]
 * @param {Object} data [description]
 */
libtess.GluTesselator.prototype.gluTessVertex = function(coords, data) {
  var tooLarge = false;

  // TODO(bckenny): pool allocation?
  var clamped = [0, 0, 0];

  this.requireState_(libtess.tessState.T_IN_CONTOUR);

  if (this.emptyCache) {
    this.emptyCache_();
    this.lastEdge_ = null;
  }

  for (var i = 0; i < 3; ++i) {
    var x = coords[i];
    if (x < -libtess.GLU_TESS_MAX_COORD) {
      x = -libtess.GLU_TESS_MAX_COORD;
      tooLarge = true;
    }
    if (x > libtess.GLU_TESS_MAX_COORD) {
      x = libtess.GLU_TESS_MAX_COORD;
      tooLarge = true;
    }
    clamped[i] = x;
  }

  if (tooLarge) {
    this.callErrorOrErrorData(libtess.errorType.GLU_TESS_COORD_TOO_LARGE);
  }

  if (this.mesh === null) {
    if (this.cacheCount < libtess.TESS_MAX_CACHE) {
      this.cacheVertex_(clamped, data);
      return;
    }

    // cache is full, create mesh and add cached verts to it
    this.emptyCache_();
  }

  this.addVertex_(clamped, data);
};

/**
 * [gluTessBeginPolygon description]
 * @param {Object} data Client data for current polygon
 */
libtess.GluTesselator.prototype.gluTessBeginPolygon = function(data) {
  this.requireState_(libtess.tessState.T_DORMANT);

  this.state = libtess.tessState.T_IN_POLYGON;
  this.cacheCount = 0;
  this.emptyCache = false;
  this.mesh = null;

  this.polygonData_ = data;
};

/**
 * [gluTessBeginContour description]
 */
libtess.GluTesselator.prototype.gluTessBeginContour = function() {
  this.requireState_(libtess.tessState.T_IN_POLYGON);

  this.state = libtess.tessState.T_IN_CONTOUR;
  this.lastEdge_ = null;
  if (this.cacheCount > 0) {
    // Just set a flag so we don't get confused by empty contours
    // -- these can be generated accidentally with the obsolete
    // NextContour() interface.
    // TODO(bckenny): we aren't implementing NextContour() interface.
    this.emptyCache = true;
  }
};

/**
 * [gluTessEndContour description]
 */
libtess.GluTesselator.prototype.gluTessEndContour = function() {
  this.requireState_(libtess.tessState.T_IN_CONTOUR);
  this.state = libtess.tessState.T_IN_POLYGON;
};

/**
 * [gluTessEndPolygon description]
 */
libtess.GluTesselator.prototype.gluTessEndPolygon = function() {
  this.requireState_(libtess.tessState.T_IN_POLYGON);
  this.state = libtess.tessState.T_DORMANT;

  if (this.mesh === null) {
    if (!this.flagBoundary && !this.callMesh_) {
      // Try some special code to make the easy cases go quickly
      // (eg. convex polygons). This code does NOT handle multiple contours,
      // intersections, edge flags, and of course it does not generate
      // an explicit mesh either.
      if (libtess.render.renderCache(this)) {
        // TODO(bckenny): why only clear polygonData? does more need to be cleared?
        this.polygonData_ = null;
        return;
      }
    }
    this.emptyCache_();
  }

  // Determine the polygon normal and project vertices onto the plane
  // of the polygon.
  libtess.normal.projectPolygon(this);

  // computeInterior(tess) computes the planar arrangement specified
  // by the given contours, and further subdivides this arrangement
  // into regions. Each region is marked "inside" if it belongs
  // to the polygon, according to the rule given by this.windingRule.
  // Each interior region is guaranteed be monotone.
  libtess.sweep.computeInterior(this);

  if (!this.fatalError) {
    // If the user wants only the boundary contours, we throw away all edges
    // except those which separate the interior from the exterior.
    // Otherwise we tessellate all the regions marked "inside".
    if (this.boundaryOnly) {
      libtess.tessmono.setWindingNumber(this.mesh, 1, true);

    } else {
      libtess.tessmono.tessellateInterior(this.mesh);
    }

    this.mesh.checkMesh();

    if (this.callBegin_ || this.callEnd_ || this.callVertex_ ||
        this.callEdgeFlag_ || this.callBeginData_ || this.callEndData_ ||
        this.callVertexData_ || this.callEdgeFlagData_) {

      if (this.boundaryOnly) {
        // output boundary contours
        libtess.render.renderBoundary(this, this.mesh);

      } else {
        // output strips and fans
        libtess.render.renderMesh(this, this.mesh);
      }
    }

    if (this.callMesh_) {
      // Throw away the exterior faces, so that all faces are interior.
      // This way the user doesn't have to check the "inside" flag,
      // and we don't need to even reveal its existence. It also leaves
      // the freedom for an implementation to not generate the exterior
      // faces in the first place.
      libtess.tessmono.discardExterior(this.mesh);
      // user wants the mesh itself
      this.callMesh_(this.mesh);

      this.mesh = null;
      this.polygonData_ = null;
      return;
    }
  }

  libtess.mesh.deleteMesh(this.mesh);
  this.polygonData_ = null;
  this.mesh = null;
};

/**
 * Return the tessellator to its original dormant state.
 * @private
 */
libtess.GluTesselator.prototype.makeDormant_ = function() {
  if (this.mesh) {
    libtess.mesh.deleteMesh(this.mesh);
  }
  this.state = libtess.tessState.T_DORMANT;
  this.lastEdge_ = null;
  this.mesh = null;
};

/**
 * [requireState_ description]
 * @private
 * @param {libtess.tessState} state [description]
 */
libtess.GluTesselator.prototype.requireState_ = function(state) {
  if (this.state !== state) {
    this.gotoState_(state);
  }
};

/**
 * [gotoState_ description]
 * @private
 * @param  {libtess.tessState} newState [description]
 */
libtess.GluTesselator.prototype.gotoState_ = function(newState) {
  while (this.state !== newState) {
    // We change the current state one level at a time, to get to the desired
    // state.
    if (this.state < newState) {
      switch (this.state) {
        case libtess.tessState.T_DORMANT:
          this.callErrorOrErrorData(
              libtess.errorType.GLU_TESS_MISSING_BEGIN_POLYGON);
          this.gluTessBeginPolygon(null);
          break;

        case libtess.tessState.T_IN_POLYGON:
          this.callErrorOrErrorData(
              libtess.errorType.GLU_TESS_MISSING_BEGIN_CONTOUR);
          this.gluTessBeginContour();
          break;
      }

    } else {
      switch (this.state) {
        case libtess.tessState.T_IN_CONTOUR:
          this.callErrorOrErrorData(
              libtess.errorType.GLU_TESS_MISSING_END_CONTOUR);
          this.gluTessEndContour();
          break;

        case libtess.tessState.T_IN_POLYGON:
          this.callErrorOrErrorData(
              libtess.errorType.GLU_TESS_MISSING_END_POLYGON);
          // this.gluTessEndPolygon() is too much work!
          this.makeDormant_();
          break;
      }
    }
  }
};

/**
 * [addVertex_ description]
 * @private
 * @param {Array.<number>} coords [description]
 * @param {Object} data [description]
 */
libtess.GluTesselator.prototype.addVertex_ = function(coords, data) {
  var e = this.lastEdge_;
  if (e === null) {
    // Make a self-loop (one vertex, one edge).
    e = libtess.mesh.makeEdge(this.mesh);
    libtess.mesh.meshSplice(e, e.sym);

  } else {
    // Create a new vertex and edge which immediately follow e
    // in the ordering around the left face.
    libtess.mesh.splitEdge(e);
    e = e.lNext;
  }

  // The new vertex is now e.org.
  e.org.data = data;
  e.org.coords[0] = coords[0];
  e.org.coords[1] = coords[1];
  e.org.coords[2] = coords[2];
  
  // The winding of an edge says how the winding number changes as we
  // cross from the edge''s right face to its left face.  We add the
  // vertices in such an order that a CCW contour will add +1 to
  // the winding number of the region inside the contour.
  e.winding = 1;
  e.sym.winding = -1;

  this.lastEdge_ = e;
};

/**
 * [cacheVertex_ description]
 * @private
 * @param {Array.<number>} coords [description]
 * @param {Object} data [description]
 */
libtess.GluTesselator.prototype.cacheVertex_ = function(coords, data) {
  var v = this.cache[this.cacheCount];

  v.data = data;
  v.coords[0] = coords[0];
  v.coords[1] = coords[1];
  v.coords[2] = coords[2];
  ++this.cacheCount;
};

/**
 * [emptyCache_ description]
 * @private
 */
libtess.GluTesselator.prototype.emptyCache_ = function() {
  // NOTE(bckenny): surprise!
  this.mesh = new libtess.GluMesh();

  for (var i = 0; i < this.cacheCount; i++) {
    var v = this.cache[i];
    this.addVertex_(v.coords, v.data);
  }

  this.cacheCount = 0;
  this.emptyCache = false;
};

// TODO(bckenny): all following conditional callbacks could be simplified
// TODO(bckenny): using null for now, but may rework
// TODO(bckenny): should add documentation that references in callback are volatile (or make a copy)
// see README callback descriptions
/**
 * [callBeginOrBeginData description]
 * @param {libtess.primitiveType} type [description]
 */
libtess.GluTesselator.prototype.callBeginOrBeginData = function(type) {
  if (this.callBeginData_) {
    this.callBeginData_(type, this.polygonData_);

  } else if (this.callBegin_) {
    this.callBegin_(type);
  }
};

/**
 * [callVertexOrVertexData description]
 * @param {Object} data [description]
 */
libtess.GluTesselator.prototype.callVertexOrVertexData = function(data) {
  if (this.callVertexData_) {
    this.callVertexData_(data, this.polygonData_);

  } else if (this.callVertex_) {
    this.callVertex_(data);
  }
};

/**
 * [callEdgeFlagOrEdgeFlagData description]
 * @param {boolean} flag [description]
 */
libtess.GluTesselator.prototype.callEdgeFlagOrEdgeFlagData = function(flag) {
  if (this.callEdgeFlagData_) {
    this.callEdgeFlagData_(flag, this.polygonData_);

  } else if (this.callEdgeFlag_) {
    this.callEdgeFlag_(flag);
  }
};

/**
 * [callEndOrEndData description]
 */
libtess.GluTesselator.prototype.callEndOrEndData = function() {
  if (this.callEndData_) {
    this.callEndData_(this.polygonData_);

  } else if (this.callEnd_) {
    this.callEnd_();
  }
};

/**
 * [callCombineOrCombineData description]
 * @param {Array.<number>} coords [description]
 * @param {Array.<Object>} data [description]
 * @param {Array.<number>} weight [description]
 * @return {Object} Interpolated vertex
 */
libtess.GluTesselator.prototype.callCombineOrCombineData =
    function(coords, data, weight) {

  var interpData;
  if (this.callCombineData_) {
    interpData = this.callCombineData_(coords, data, weight, this.polygonData_);

  } else if (this.callCombine_) {
    interpData = this.callCombine_(coords, data, weight);
  }

  // TODO(bckenny): can't be undefined
  if (interpData === undefined) {
    interpData = null;
  }
  return interpData;
};

// TODO(bckenny): combine the enums in libtess
/**
 * [callErrorOrErrorData description]
 * @param {(libtess.errorType|libtess.gluEnum)} errno [description]
 */
libtess.GluTesselator.prototype.callErrorOrErrorData = function(errno) {
  if (this.callErrorData_) {
    this.callErrorData_(errno, this.polygonData_);

  } else if (this.callError_) {
    this.callError_(errno);
  }
};


// require libtess
// require libtess.Dict
/*global libtess */

// TODO(bckenny): better typing for DictKey?

/**
 * [DictNode description]
 * @constructor
 */
libtess.DictNode = function() {
  // TODO(bckenny): could probably move all three properties to opt params
  /**
   * [key description]
   * @type {libtess.dictKey}
   */
  this.key = null;

  /**
   * [next description]
   * @type {libtess.DictNode}
   */
  this.next = null;
  
  /**
   * [prev description]
   * @type {libtess.DictNode}
   */
  this.prev = null;
};

/**
 * [getKey description]
 * @return {libtess.dictKey} [description]
 */
libtess.DictNode.prototype.getKey = function() {
  return this.key;
};

/**
 * [getSucc description]
 * @return {libtess.DictNode} [description]
 */
libtess.DictNode.prototype.getSucc = function() {
  // TODO(bckenny): unabreviated naming?
  return this.next;
};

/**
 * [getPred description]
 * @return {libtess.DictNode} [description]
 */
libtess.DictNode.prototype.getPred = function() {
  // TODO(bckenny): unabreviated naming?
  return this.prev;
};


// require libtess
/*global libtess */

// TODO(bckenny): better typing for DictKey? actually libtess.ActiveRegion
/** @typedef {Object} */
libtess.dictKey;

// TODO(bckenny): better typing for all of this, really. no need not to eg use tess as frame directly

/**
 * [Dict description]
 *
 * @constructor
 * @param {Object} frame [description]
 * @param {function(Object, Object, Object): boolean} leq [description]
 */
libtess.Dict = function(frame, leq) {
  /**
   * [head description]
   * @type {libtess.DictNode}
   */
  this.head = new libtess.DictNode();
  this.head.next = this.head;
  this.head.prev = this.head;

  // TODO(bckenny): better typing? see above
  /**
   * [frame description]
   * @type {Object}
   */
  this.frame = frame;

  /**
   * [leq_ description]
   * @private
   * @type {function(Object, libtess.dictKey, libtess.dictKey): boolean}
   */
  this.leq_ = /** @type {function(Object, libtess.dictKey, libtess.dictKey): boolean} */(leq);
};

/**
 * [deleteDict description]
 */
libtess.Dict.prototype.deleteDict = function() {
  // TODO(bckenny): unnecessary, I think.
  // for (var node = libtess.head.next; node !== libtess.head; node = node.next) {
    // memFree(node);
  // }
  // memFree(dict);
  
  // NOTE(bckenny): nulled at callsite (sweep.doneEdgeDict_)
};

/**
 * [insertBefore description]
 * @param {libtess.DictNode} node [description]
 * @param {Object} key [description]
 * @return {libtess.DictNode} [description]
 */
libtess.Dict.prototype.insertBefore = function(node, key) {
  do {
    node = node.prev;
  } while(node.key !== null && !this.leq_(this.frame, node.key, key));

  var newNode = new libtess.DictNode();

  newNode.key = key;
  newNode.next = node.next;
  node.next.prev = newNode;
  newNode.prev = node;
  node.next = newNode;

  return newNode;
};

/**
 * [insert description]
 * @param {Object} key [description]
 * @return {libtess.DictNode} [description]
 */
libtess.Dict.prototype.insert = function(key) {
  // NOTE(bckenny): from a macro in dict.h/dict-list.h
  return this.insertBefore(this.head, key);
};

/**
 * [deleteNode description]
 * @param {libtess.DictNode} node [description]
 */
libtess.Dict.prototype.deleteNode = function(node) {
  // NOTE(bckenny): nulled at callsite (sweep.deleteRegion_)
  node.next.prev = node.prev;
  node.prev.next = node.next;
  // memFree( node ); TODO(bckenny)
};

/**
 * Search returns the node with the smallest key greater than or equal
 * to the given key. If there is no such key, returns a node whose
 * key is null. Similarly, max(d).getSucc() has a null key, etc.
 *
 * @param {Object} key [description]
 * @return {libtess.DictNode} [description]
 */
libtess.Dict.prototype.search = function(key) {
  var node = this.head;

  do {
    node = node.next;
  } while(node.key !== null && !this.leq_(this.frame, key, node.key));

  return node;
};

/**
 * [getMin description]
 * @return {libtess.DictNode} [description]
 */
libtess.Dict.prototype.getMin = function() {
  // NOTE(bckenny): from a macro in dict.h/dict-list.h
  return this.head.next;
};

/**
 * [getMax description]
 * @return {libtess.DictNode} [description]
 */
libtess.Dict.prototype.getMax = function() {
  // NOTE(bckenny): from a macro in dict.h/dict-list.h
  return this.head.prev;
};


// require libtess
/*global libtess */

// TODO(bckenny): maybe just have these created inline as literals
// (or unboxed directly - PQHandle is just an array index number)

/**
 * [PQNode description]
 * @constructor
 */
libtess.PQNode = function() {
  /**
   * [handle description]
   * @type {libtess.PQHandle}
   */
  this.handle = 0;
};

/**
 * Allocate a PQNode array of size size. If oldArray is not null, its contents
 * are copied to the beginning of the new array. The rest of the array is
 * filled with new PQNodes.
 *
 * @param {?Array.<libtess.PQNode>} oldArray [description]
 * @param {number} size [description]
 * @return {Array.<libtess.PQNode>} [description]
 */
libtess.PQNode.realloc = function(oldArray, size) {
  var newArray = new Array(size);

  // TODO(bckenny): better to reallocate array? or grow array?
  var index = 0;
  if (oldArray !== null) {
    for (; index < oldArray.length; index++) {
      newArray[index] = oldArray[index];
    }
  }

  for (; index < size; index++) {
    newArray[index] = new libtess.PQNode();
  }

  return newArray;
};


// require libtess
/*global libtess */

// TODO(bckenny): more specific typing on key

/**
 * [PQHandleElem description]
 * @constructor
 */
libtess.PQHandleElem = function() {
  // TODO(bckenny): if key could instead be an indexed into another store, makes heap storage a lot easier

  /**
   * [key description]
   * @type {libtess.PQKey}
   */
  this.key = null;
  
  /**
   * [node description]
   * @type {libtess.PQHandle}
   */
  this.node = 0;
};

/**
 * Allocate a PQHandleElem array of size size. If oldArray is not null, its
 * contents are copied to the beginning of the new array. The rest of the array
 * is filled with new PQHandleElems.
 *
 * @param {?Array.<libtess.PQHandleElem>} oldArray [description]
 * @param {number} size [description]
 * @return {Array.<libtess.PQHandleElem>} [description]
 */
libtess.PQHandleElem.realloc = function(oldArray, size) {
  var newArray = new Array(size);

  // TODO(bckenny): better to reallocate array? or grow array?
  var index = 0;
  if (oldArray !== null) {
    for (; index < oldArray.length; index++) {
      newArray[index] = oldArray[index];
    }
  }

  for (; index < size; index++) {
    newArray[index] = new libtess.PQHandleElem();
  }

  return newArray;
};


// require libtess
// require libtess.PQNode
// require libtess.PQHandleElem
/*global libtess */

// TODO(bckenny): keys appear to always be GluVertex in this case?

/**
 * [PriorityQHeap description]
 * @constructor
 * @param {function(libtess.PQKey, libtess.PQKey): boolean} leq [description]
 */
libtess.PriorityQHeap = function(leq) {
  /**
   * The heap itself. Active nodes are stored in the range 1..size. Each node
   * stores only an index into handles.
   * @private
   * @type {Array.<libtess.PQNode>}
   */
  this.nodes_ = libtess.PQNode.realloc(null, libtess.PriorityQHeap.INIT_SIZE_ + 1);

  /**
   * Each handle stores a key, plus a pointer back to the node which currently
   * represents that key (ie. nodes[handles[i].node].handle == i).
   * @private
   * @type {Array.<libtess.PQHandleElem>}
   */
  this.handles_ = libtess.PQHandleElem.realloc(null, libtess.PriorityQHeap.INIT_SIZE_ + 1);

  // TODO(bckenny): size and max should probably be libtess.PQHandle for correct typing (see PriorityQ.js)
  /**
   * The size of the queue.
   * @private
   * @type {number}
   */
  this.size_ = 0;

  /**
   * The queue's current allocated space.
   * @private
   * @type {number}
   */
  this.max_ = libtess.PriorityQHeap.INIT_SIZE_;

  /**
   * The index of the next free hole in the handles array. Handle in that slot
   * has next item in freeList in its node propert. If there are no holes,
   * freeList === 0 and one at the end of handles must be use.
   * @private
   * @type {libtess.PQHandle}
   */
  this.freeList_ = 0;

  /**
   * Indicates that the heap has been initialized via init. If false, inserts
   * are fast insertions at the end of a list. If true, all inserts will now be
   * correctly ordered in the queue before returning.
   * @private
   * @type {boolean}
   */
  this.initialized_ = false;

  // TODO(bckenny): leq was inlined by define in original, but appears to
  // be vertLeq, as passed. Using injected version, but is it better just to manually inline?
  /**
   * [leq description]
   * @private
   * @type {function(libtess.PQKey, libtess.PQKey): boolean}
   */
  this.leq_ = leq;
  
  // so that minimum returns null
  this.nodes_[1].handle = 1;
};

/**
 * [INIT_SIZE_ description]
 * @private
 * @const
 * @type {number}
 */
libtess.PriorityQHeap.INIT_SIZE_ = 32;

/**
 * [deleteHeap description]
 */
libtess.PriorityQHeap.prototype.deleteHeap = function() {
  // TODO(bckenny): unnecessary, I think.
  this.handles_ = null;
  this.nodes_ = null;
  // NOTE(bckenny): nulled at callsite in PriorityQ.deleteQ
};

/**
 * Initializing ordering of the heap. Must be called before any method other than
 * insert is called to ensure correctness when removing or querying.
 */
libtess.PriorityQHeap.prototype.init = function() {
  // This method of building a heap is O(n), rather than O(n lg n).
  for(var i = this.size_; i >= 1; --i) {
    this.floatDown_(i);
  }

  this.initialized_ = true;
};

/**
 * Insert a new key into the heap.
 * @param {libtess.PQKey} keyNew The key to insert.
 * @return {libtess.PQHandle} A handle that can be used to remove the key.
 */
libtess.PriorityQHeap.prototype.insert = function(keyNew) {
  var curr = ++this.size_;

  // if the heap overflows, double its size.
  if ((curr*2) > this.max_) {
    this.max_ *= 2;
    this.nodes_ = libtess.PQNode.realloc(this.nodes_, this.max_ + 1);
    this.handles_ = libtess.PQHandleElem.realloc(this.handles_, this.max_ + 1);
  }

  var free;
  if (this.freeList_ === 0) {
    free = curr;
  } else {
    free = this.freeList_;
    this.freeList_ = this.handles_[free].node;
  }

  this.nodes_[curr].handle = free;
  this.handles_[free].node = curr;
  this.handles_[free].key = keyNew;

  if (this.initialized_) {
    this.floatUp_(curr);
  }

  return free;
};

/**
 * @return {boolean} Whether the heap is empty.
 */
libtess.PriorityQHeap.prototype.isEmpty = function() {
  return this.size_ === 0;
};

/**
 * Returns the minimum key in the heap. If the heap is empty, null will be
 * returned.
 * @return {libtess.PQKey} [description]
 */
libtess.PriorityQHeap.prototype.minimum = function() {
  return this.handles_[this.nodes_[1].handle].key;
};

/**
 * Removes the minimum key from the heap and returns it. If the heap is empty,
 * null will be returned.
 * @return {libtess.PQKey} [description]
 */
libtess.PriorityQHeap.prototype.extractMin = function() {
  var n = this.nodes_;
  var h = this.handles_;
  var hMin = n[1].handle;
  var min = h[hMin].key;

  if (this.size_ > 0) {
    n[1].handle = n[this.size_].handle;
    h[n[1].handle].node = 1;

    h[hMin].key = null;
    h[hMin].node = this.freeList_;
    this.freeList_ = hMin;

    if (--this.size_ > 0 ) {
      this.floatDown_(1);
    }
  }

  return min;
};

/**
 * Remove key associated with handle hCurr (returned from insert) from heap.
 * @param {libtess.PQHandle} hCurr [description]
 */
libtess.PriorityQHeap.prototype.remove = function(hCurr) {
  var n = this.nodes_;
  var h = this.handles_;

  libtess.assert(hCurr >= 1 && hCurr <= this.max_ && h[hCurr].key !== null);

  var curr = h[hCurr].node;
  n[curr].handle = n[this.size_].handle;
  h[n[curr].handle].node = curr;

  if (curr <= --this.size_) {
    if (curr <= 1 || this.leq_(h[n[curr>>1].handle].key, h[n[curr].handle].key)) {
      this.floatDown_(curr);
    } else {
      this.floatUp_(curr);
    }
  }

  h[hCurr].key = null;
  h[hCurr].node = this.freeList_;
  this.freeList_ = hCurr;
};

/**
 * [floatDown_ description]
 * @private
 * @param {libtess.PQHandle} curr [description]
 */
libtess.PriorityQHeap.prototype.floatDown_ = function(curr) {
  var n = this.nodes_;
  var h = this.handles_;

  var hCurr = n[curr].handle;
  for( ;; ) {
    // The children of node i are nodes 2i and 2i+1.
    // set child to the index of the child with the minimum key
    var child = curr << 1;
    if (child < this.size_ && this.leq_(h[n[child+1].handle].key, h[n[child].handle].key)) {
      ++child;
    }

    libtess.assert(child <= this.max_);

    var hChild = n[child].handle;
    if (child > this.size_ || this.leq_(h[hCurr].key, h[hChild].key)) {
      n[curr].handle = hCurr;
      h[hCurr].node = curr;
      break;
    }
    n[curr].handle = hChild;
    h[hChild].node = curr;
    curr = child;
  }
};

/**
 * [floatUp_ description]
 * @private
 * @param {libtess.PQHandle} curr [description]
 */
libtess.PriorityQHeap.prototype.floatUp_ = function(curr) {
  var n = this.nodes_;
  var h = this.handles_;

  var hCurr = n[curr].handle;
  for( ;; ) {
    var parent = curr >> 1;
    var hParent = n[parent].handle;
    if (parent === 0 || this.leq_(h[hParent].key, h[hCurr].key)) {
      n[curr].handle = hCurr;
      h[hCurr].node = curr;
      break;
    }

    n[curr].handle = hParent;
    h[hParent].node = curr;
    curr = parent;
  }
};


// require libtess
// require libtess.PriorityQHeap
/*global libtess */

// TODO(bckenny): preallocating arrays may actually be hurting us in sort
// performance (esp if theres some undefs in there)

/**
 * [PriorityQ description]
 * @constructor
 * @param {function(Object, Object): boolean} leq [description]
 */
libtess.PriorityQ = function(leq) {
  /**
   * [keys description]
   * @private
   * @type {Array.<libtess.PQKey>}
   */
  this.keys_ = libtess.PriorityQ.prototype.PQKeyRealloc_(null, libtess.PriorityQ.INIT_SIZE_);
  
  /**
   * Array of indexes into this.keys_
   * @private
   * @type {Array.<number>}
   */
  this.order_ = null;
  
  /**
   * [size description]
   * @private
   * @type {number}
   */
  this.size_ = 0;
  
  /**
   * [max_ description]
   * @private
   * @type {number}
   */
  this.max_ = libtess.PriorityQ.INIT_SIZE_;

  /**
   * [initialized description]
   * @private
   * @type {boolean}
   */
  this.initialized_ = false;

  // TODO(bckenny): leq was inlined by define in original, but appears to just
  // be vertLeq, as passed. keep an eye on this as to why its not used.
  /**
   * [leq description]
   * @private
   * @type {function(libtess.PQKey, libtess.PQKey): boolean}
   */
  this.leq_ = /** @type {function(libtess.PQKey, libtess.PQKey): boolean} */(leq);

  /**
   * [heap_ description]
   * @private
   * @type {libtess.PriorityQHeap}
   */
  this.heap_ = new libtess.PriorityQHeap(this.leq_);
};

/**
 * [INIT_SIZE_ description]
 * @private
 * @const
 * @type {number}
 */
libtess.PriorityQ.INIT_SIZE_ = 32;

/**
 * [deleteQ description]
 */
libtess.PriorityQ.prototype.deleteQ = function() {
  // TODO(bckenny): unnecessary, I think.
  this.heap_.deleteHeap();
  this.heap_ = null;
  this.order_ = null;
  this.keys_ = null;
  // NOTE(bckenny): nulled at callsite (sweep.donePriorityQ_)
};

/**
 * [init description]
 */
libtess.PriorityQ.prototype.init = function() {
  // TODO(bckenny): reuse. in theory, we don't have to empty this, as access is
  // dictated by this.size_, but array.sort doesn't know that
  this.order_ = [];

  // Create an array of indirect pointers to the keys, so that
  // the handles we have returned are still valid.
  // TODO(bckenny): valid for when? it appears we can just store indexes into keys_, but what did this mean?
  for (var i = 0; i < this.size_; i++) {
    this.order_[i] = i;
  }

  // sort the indirect pointers in descending order of the keys themselves
  // TODO(bckenny): make sure it's ok that keys[a] === keys[b] returns 1
  // TODO(bckenny): unstable sort means we may get slightly different polys in different
  // browsers, but only when passing in equal points
  // TODO(bckenny): make less awkward closure?
  var comparator = (function(keys, leq) {
    return function(a, b) {
      return leq(keys[a], keys[b]) ? 1 : -1;
    };
  })(this.keys_, this.leq_);
  this.order_.sort(comparator);

  this.max_ = this.size_;
  this.initialized_ = true;
  this.heap_.init();

  // TODO(bckenny):
  // #ifndef NDEBUG
  if (libtess.DEBUG) {
    var p = 0;
    var r = p + this.size_ - 1;
    for (i = p; i < r; ++i) {
      libtess.assert(this.leq_(this.keys_[this.order_[i+1]], this.keys_[this.order_[i]]));
    }
  }
  // #endif
};

/**
 * [insert description]
 * @param {libtess.PQKey} keyNew [description]
 * @return {libtess.PQHandle} [description]
 */
libtess.PriorityQ.prototype.insert = function(keyNew) {
  // NOTE(bckenny): originally returned LONG_MAX as alloc failure signal. no longer does.
  if (this.initialized_) {
    return this.heap_.insert(keyNew);
  }

  var curr = this.size_;
  if (++this.size_ >= this.max_) {
    // If the heap overflows, double its size.
    this.max_ *= 2;
    this.keys_ = libtess.PriorityQ.prototype.PQKeyRealloc_(this.keys_, this.max_);
  }

  this.keys_[curr] = keyNew;

  // Negative handles index the sorted array.
  return -(curr+1);
};

/**
 * Allocate a PQKey array of size size. If oldArray is not null, its
 * contents are copied to the beginning of the new array. The rest of the array
 * is filled with nulls.
 *
 * @private
 * @param {?Array.<libtess.PQKey>} oldArray [description]
 * @param {number} size [description]
 * @return {Array.<(?libtess.PQKey)>} [description]
 */
libtess.PriorityQ.prototype.PQKeyRealloc_ = function(oldArray, size) {
  // TODO(bckenny): double check return type. can we have ? there?
  var newArray = new Array(size);

  // TODO(bckenny): better to reallocate array? or grow array?
  var index = 0;
  if (oldArray !== null) {
    for (; index < oldArray.length; index++) {
      newArray[index] = oldArray[index];
    }
  }

  for (; index < size; index++) {
    newArray[index] = null;
  }

  return newArray;
};

/**
 * [keyLessThan_ description]
 * @private
 * @param {number} x [description]
 * @param {number} y [description]
 * @return {boolean} [description]
 */
libtess.PriorityQ.prototype.keyLessThan_ = function(x, y) {
  // NOTE(bckenny): was macro LT
  var keyX = this.keys_[x];
  var keyY = this.keys_[y];
  return !this.leq_(keyY, keyX);
};

/**
 * [keyGreaterThan_ description]
 * @private
 * @param {number} x [description]
 * @param {number} y [description]
 * @return {boolean} [description]
 */
libtess.PriorityQ.prototype.keyGreaterThan_ = function(x, y) {
  // NOTE(bckenny): was macro GT
  var keyX = this.keys_[x];
  var keyY = this.keys_[y];
  return !this.leq_(keyX, keyY);
};

/**
 * [extractMin description]
 * @return {libtess.PQKey} [description]
 */
libtess.PriorityQ.prototype.extractMin = function() {
  if (this.size_ === 0) {
    return this.heap_.extractMin();
  }

  var sortMin = this.keys_[this.order_[this.size_-1]];
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum();
    if (this.leq_(heapMin, sortMin)) {
      return this.heap_.extractMin();
    }
  }

  do {
    --this.size_;
  } while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === null);

  return sortMin;
};

/**
 * [minimum description]
 * @return {libtess.PQKey} [description]
 */
libtess.PriorityQ.prototype.minimum = function() {
  if (this.size_ === 0) {
    return this.heap_.minimum();
  }

  var sortMin = this.keys_[this.order_[this.size_-1]];
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum();
    if (this.leq_(heapMin, sortMin)) {
      return heapMin;
    }
  }

  return sortMin;
};

/**
 * [isEmpty description]
 * @return {boolean} [description]
 */
libtess.PriorityQ.prototype.isEmpty = function() {
  return (this.size_ === 0) && this.heap_.isEmpty();
};

/**
 * [remove description]
 * @param {libtess.PQHandle} curr [description]
 */
libtess.PriorityQ.prototype.remove = function(curr) {
  if (curr >= 0) {
    this.heap_.remove(curr);
    return;
  }
  curr = -(curr+1);

  libtess.assert(curr < this.max_ && this.keys_[curr] !== null);

  this.keys_[curr] = null;
  while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === null) {
    --this.size_;
  }
};


// require libtess
// require libtess.GluFace
// require libtess.GluHalfEdge
// require libtess.GluMesh
// require libtess.GluVertex
/*global libtess */

// TODO(bckenny): could maybe merge GluMesh and mesh.js since these are
// operations on the mesh

libtess.mesh = function() {

};

/****************** Basic Edge Operations **********************/

/**
 * makeEdge creates one edge, two vertices, and a loop (face).
 * The loop consists of the two new half-edges.
 *
 * @param {libtess.GluMesh} mesh [description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.mesh.makeEdge = function(mesh) {
  // TODO(bckenny): probably move to GluMesh, but needs Make* methods with it

  var e = libtess.mesh.makeEdgePair_(mesh.eHead);

  // complete edge with vertices and face (see mesh.makeEdgePair_)
  libtess.mesh.makeVertex_(e, mesh.vHead);
  libtess.mesh.makeVertex_(e.sym, mesh.vHead );
  libtess.mesh.makeFace_(e, mesh.fHead);

  return e;
};

/**
 * meshSplice(eOrg, eDst) is the basic operation for changing the
 * mesh connectivity and topology. It changes the mesh so that
 *  eOrg.oNext <- OLD( eDst.oNext )
 *  eDst.oNext <- OLD( eOrg.oNext )
 * where OLD(...) means the value before the meshSplice operation.
 *
 * This can have two effects on the vertex structure:
 *  - if eOrg.org != eDst.org, the two vertices are merged together
 *  - if eOrg.org == eDst.org, the origin is split into two vertices
 * In both cases, eDst.org is changed and eOrg.org is untouched.
 *
 * Similarly (and independently) for the face structure,
 *  - if eOrg.lFace == eDst.lFace, one loop is split into two
 *  - if eOrg.lFace != eDst.lFace, two distinct loops are joined into one
 * In both cases, eDst.lFace is changed and eOrg.lFace is unaffected.
 *
 * Some special cases:
 * If eDst == eOrg, the operation has no effect.
 * If eDst == eOrg.lNext, the new face will have a single edge.
 * If eDst == eOrg.lPrev(), the old face will have a single edge.
 * If eDst == eOrg.oNext, the new vertex will have a single edge.
 * If eDst == eOrg.oPrev(), the old vertex will have a single edge.
 *
 * @param {libtess.GluHalfEdge} eOrg [description]
 * @param {libtess.GluHalfEdge} eDst [description]
 */
libtess.mesh.meshSplice = function(eOrg, eDst) {
  // TODO: more descriptive name?

  var joiningLoops = false;
  var joiningVertices = false;

  if (eOrg === eDst) {
    return;
  }

  if (eDst.org !== eOrg.org) {
    // We are merging two disjoint vertices -- destroy eDst.org
    joiningVertices = true;
    libtess.mesh.killVertex_(eDst.org, eOrg.org);
  }

  if (eDst.lFace !== eOrg.lFace) {
    // We are connecting two disjoint loops -- destroy eDst.lFace
    joiningLoops = true;
    libtess.mesh.killFace_(eDst.lFace, eOrg.lFace);
  }

  // Change the edge structure
  libtess.mesh.splice_(eDst, eOrg);

  if (!joiningVertices) {
    // We split one vertex into two -- the new vertex is eDst.org.
    // Make sure the old vertex points to a valid half-edge.
    libtess.mesh.makeVertex_(eDst, eOrg.org);
    eOrg.org.anEdge = eOrg;
  }

  if (!joiningLoops) {
    // We split one loop into two -- the new loop is eDst.lFace.
    // Make sure the old face points to a valid half-edge.
    libtess.mesh.makeFace_(eDst, eOrg.lFace);
    eOrg.lFace.anEdge = eOrg;
  }
};

/**
 * deleteEdge(eDel) removes the edge eDel. There are several cases:
 * if (eDel.lFace != eDel.rFace()), we join two loops into one; the loop
 * eDel.lFace is deleted. Otherwise, we are splitting one loop into two;
 * the newly created loop will contain eDel.dst(). If the deletion of eDel
 * would create isolated vertices, those are deleted as well.
 *
 * This function could be implemented as two calls to __gl_meshSplice
 * plus a few calls to memFree, but this would allocate and delete
 * unnecessary vertices and faces.
 *
 * @param {libtess.GluHalfEdge} eDel [description]
 */
libtess.mesh.deleteEdge = function(eDel) {
  var eDelSym = eDel.sym;
  var joiningLoops = false;

  // First step: disconnect the origin vertex eDel.org.  We make all
  // changes to get a consistent mesh in this "intermediate" state.
  if (eDel.lFace !== eDel.rFace()) {
    // We are joining two loops into one -- remove the left face
    joiningLoops = true;
    libtess.mesh.killFace_(eDel.lFace, eDel.rFace());
  }

  if (eDel.oNext === eDel ) {
    libtess.mesh.killVertex_(eDel.org, null);

  } else {
    // Make sure that eDel.org and eDel.rFace() point to valid half-edges
    eDel.rFace().anEdge = eDel.oPrev();
    eDel.org.anEdge = eDel.oNext;

    libtess.mesh.splice_(eDel, eDel.oPrev());

    if (!joiningLoops) {
      // We are splitting one loop into two -- create a new loop for eDel.
      libtess.mesh.makeFace_(eDel, eDel.lFace);
    }
  }

  // Claim: the mesh is now in a consistent state, except that eDel.org
  // may have been deleted.  Now we disconnect eDel.dst().
  if (eDelSym.oNext === eDelSym ) {
    libtess.mesh.killVertex_(eDelSym.org, null);
    libtess.mesh.killFace_(eDelSym.lFace, null);

  } else {
    // Make sure that eDel.dst() and eDel.lFace point to valid half-edges
    eDel.lFace.anEdge = eDelSym.oPrev();
    eDelSym.org.anEdge = eDelSym.oNext;
    libtess.mesh.splice_(eDelSym, eDelSym.oPrev());
  }

  // Any isolated vertices or faces have already been freed.
  libtess.mesh.killEdge_(eDel);
};

/******************** Other Edge Operations **********************/

/* All these routines can be implemented with the basic edge
 * operations above.  They are provided for convenience and efficiency.
 */

/**
 * addEdgeVertex(eOrg) creates a new edge eNew such that
 * eNew == eOrg.lNext, and eNew.dst() is a newly created vertex.
 * eOrg and eNew will have the same left face.
 *
 * @param {libtess.GluHalfEdge} eOrg [description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.mesh.addEdgeVertex = function(eOrg) {
  // TODO(bckenny): why is it named this?

  var eNew = libtess.mesh.makeEdgePair_(eOrg);
  var eNewSym = eNew.sym;

  // Connect the new edge appropriately
  libtess.mesh.splice_(eNew, eOrg.lNext);

  // Set the vertex and face information
  eNew.org = eOrg.dst();

  libtess.mesh.makeVertex_(eNewSym, eNew.org );

  eNew.lFace = eNewSym.lFace = eOrg.lFace;

  return eNew;
};

/**
 * splitEdge(eOrg) splits eOrg into two edges eOrg and eNew,
 * such that eNew == eOrg.lNext. The new vertex is eOrg.dst() == eNew.org.
 * eOrg and eNew will have the same left face.
 *
 * @param {libtess.GluHalfEdge} eOrg [description]
 * @return {!libtess.GluHalfEdge} [description]
 */
libtess.mesh.splitEdge = function(eOrg) {
  var tempHalfEdge = libtess.mesh.addEdgeVertex(eOrg);
  var eNew = tempHalfEdge.sym;

  // Disconnect eOrg from eOrg.dst() and connect it to eNew.org
  libtess.mesh.splice_(eOrg.sym, eOrg.sym.oPrev());
  libtess.mesh.splice_(eOrg.sym, eNew);

  // Set the vertex and face information
  eOrg.sym.org = eNew.org; // NOTE(bckenny): assignment to dst
  eNew.dst().anEdge = eNew.sym;  // may have pointed to eOrg.sym
  eNew.sym.lFace = eOrg.rFace(); // NOTE(bckenny): assignment to rFace
  eNew.winding = eOrg.winding;  // copy old winding information
  eNew.sym.winding = eOrg.sym.winding;

  return eNew;
};

/**
 * connect(eOrg, eDst) creates a new edge from eOrg.dst()
 * to eDst.org, and returns the corresponding half-edge eNew.
 * If eOrg.lFace == eDst.lFace, this splits one loop into two,
 * and the newly created loop is eNew.lFace. Otherwise, two disjoint
 * loops are merged into one, and the loop eDst.lFace is destroyed.
 *
 * If (eOrg == eDst), the new face will have only two edges.
 * If (eOrg.lNext == eDst), the old face is reduced to a single edge.
 * If (eOrg.lNext.lNext == eDst), the old face is reduced to two edges.
 *
 * @param {libtess.GluHalfEdge} eOrg [description]
 * @param {libtess.GluHalfEdge} eDst [description]
 * @return {!libtess.GluHalfEdge} [description]
 */
libtess.mesh.connect = function(eOrg, eDst) {
  var joiningLoops = false;
  var eNew = libtess.mesh.makeEdgePair_(eOrg);
  var eNewSym = eNew.sym;

  if (eDst.lFace !== eOrg.lFace) {
    // We are connecting two disjoint loops -- destroy eDst.lFace
    joiningLoops = true;
    libtess.mesh.killFace_(eDst.lFace, eOrg.lFace);
  }

  // Connect the new edge appropriately
  libtess.mesh.splice_(eNew, eOrg.lNext);
  libtess.mesh.splice_(eNewSym, eDst);

  // Set the vertex and face information
  eNew.org = eOrg.dst();
  eNewSym.org = eDst.org;
  eNew.lFace = eNewSym.lFace = eOrg.lFace;

  // Make sure the old face points to a valid half-edge
  eOrg.lFace.anEdge = eNewSym;

  if (!joiningLoops) {
    // We split one loop into two -- the new loop is eNew.lFace
    libtess.mesh.makeFace_(eNew, eOrg.lFace );
  }
  return eNew;
};

/******************** Other Operations **********************/

/**
 * zapFace(fZap) destroys a face and removes it from the
 * global face list. All edges of fZap will have a null pointer as their
 * left face. Any edges which also have a null pointer as their right face
 * are deleted entirely (along with any isolated vertices this produces).
 * An entire mesh can be deleted by zapping its faces, one at a time,
 * in any order. Zapped faces cannot be used in further mesh operations!
 *
 * @param {libtess.GluFace} fZap [description]
 */
libtess.mesh.zapFace = function(fZap) {
  var eStart = fZap.anEdge;

  // walk around face, deleting edges whose right face is also NULL
  var eNext = eStart.lNext;
  var e;
  do {
    e = eNext;
    eNext = e.lNext;

    e.lFace = null;
    if (e.rFace() === null) {
      // delete the edge -- see mesh.deleteEdge above
      if (e.oNext === e) {
        libtess.mesh.killVertex_(e.org, null);

      } else {
        // Make sure that e.org points to a valid half-edge
        e.org.anEdge = e.oNext;
        libtess.mesh.splice_(e, e.oPrev());
      }

      var eSym = e.sym;

      if (eSym.oNext === eSym) {
        libtess.mesh.killVertex_(eSym.org, null);

      } else {
        // Make sure that eSym.org points to a valid half-edge
        eSym.org.anEdge = eSym.oNext;
        libtess.mesh.splice_(eSym, eSym.oPrev());
      }
      libtess.mesh.killEdge_(e);
    }
  } while(e !== eStart);

  // delete from circular doubly-linked list
  var fPrev = fZap.prev;
  var fNext = fZap.next;
  fNext.prev = fPrev;
  fPrev.next = fNext;

  // TODO(bckenny): memFree( fZap );
  // TODO(bckenny): probably null at callsite
};

/**
 * meshUnion() forms the union of all structures in
 * both meshes, and returns the new mesh (the old meshes are destroyed).
 *
 * @param {libtess.GluMesh} mesh1 [description]
 * @param {libtess.GluMesh} mesh2 [description]
 * @return {libtess.GluMesh} [description]
 */
libtess.mesh.meshUnion = function(mesh1, mesh2) {
  // TODO(bceknny): probably move to GluMesh method
  var f1 = mesh1.fHead;
  var v1 = mesh1.vHead;
  var e1 = mesh1.eHead;

  var f2 = mesh2.fHead;
  var v2 = mesh2.vHead;
  var e2 = mesh2.eHead;

  // Add the faces, vertices, and edges of mesh2 to those of mesh1
  if (f2.next !== f2) {
    f1.prev.next = f2.next;
    f2.next.prev = f1.prev;
    f2.prev.next = f1;
    f1.prev = f2.prev;
  }

  if (v2.next !== v2) {
    v1.prev.next = v2.next;
    v2.next.prev = v1.prev;
    v2.prev.next = v1;
    v1.prev = v2.prev;
  }

  if (e2.next !== e2) {
    e1.sym.next.sym.next = e2.next;
    e2.next.sym.next = e1.sym.next;
    e2.sym.next.sym.next = e1;
    e1.sym.next = e2.sym.next;
  }

  // TODO(bckenny): memFree(mesh2);
  // TODO(bckenny): probably null at callsite
  return mesh1;
};

/**
 * deleteMesh(mesh) will free all storage for any valid mesh.
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.mesh.deleteMesh = function(mesh) {
  // TODO(bckenny): unnecessary, I think.
  // TODO(bckenny): might want to explicitly null at callsite
  // lots of memFrees. see also DELETE_BY_ZAPPING
};

/************************ Utility Routines ************************/

/**
 * Creates a new pair of half-edges which form their own loop.
 * No vertex or face structures are allocated, but these must be assigned
 * before the current edge operation is completed.
 *
 * TODO(bckenny): warning about eNext strictly being first of pair? (see code)
 *
 * @private
 * @param {libtess.GluHalfEdge} eNext [description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.mesh.makeEdgePair_ = function(eNext) {
  var e = new libtess.GluHalfEdge();
  var eSym = new libtess.GluHalfEdge();

  // TODO(bckenny): how do we ensure this? see above comment in jsdoc
  // Make sure eNext points to the first edge of the edge pair
  // if (eNext->Sym < eNext ) { eNext = eNext->Sym; }
  
  // NOTE(bckenny): check this for bugs in current implementation!

  // Insert in circular doubly-linked list before eNext.
  // Note that the prev pointer is stored in sym.next.
  var ePrev = eNext.sym.next;
  eSym.next = ePrev;
  ePrev.sym.next = e;
  e.next = eNext;
  eNext.sym.next = eSym;

  e.sym = eSym;
  e.oNext = e;
  e.lNext = eSym;

  eSym.sym = e;
  eSym.oNext = eSym;
  eSym.lNext = e;

  return e;
};

/**
 * splice_ is best described by the Guibas/Stolfi paper or the
 * CS348a notes. Basically, it modifies the mesh so that
 * a.oNext and b.oNext are exchanged. This can have various effects
 * depending on whether a and b belong to different face or vertex rings.
 * For more explanation see mesh.meshSplice below.
 *
 * @private
 * @param {libtess.GluHalfEdge} a [description]
 * @param {libtess.GluHalfEdge} b [description]
 */
libtess.mesh.splice_ = function(a, b) {
  var aONext = a.oNext;
  var bONext = b.oNext;

  aONext.sym.lNext = b;
  bONext.sym.lNext = a;
  a.oNext = bONext;
  b.oNext = aONext;
};

/**
 * makeVertex_(eOrig, vNext) attaches a new vertex and makes it the
 * origin of all edges in the vertex loop to which eOrig belongs. "vNext" gives
 * a place to insert the new vertex in the global vertex list.  We insert
 * the new vertex *before* vNext so that algorithms which walk the vertex
 * list will not see the newly created vertices.
 *
 * NOTE: unlike original, acutally allocates new vertex.
 *
 * @private
 * @param {libtess.GluHalfEdge} eOrig [description]
 * @param {libtess.GluVertex} vNext [description]
 */
libtess.mesh.makeVertex_ = function(eOrig, vNext) {
  // insert in circular doubly-linked list before vNext
  var vPrev = vNext.prev;
  var vNew = new libtess.GluVertex(vNext, vPrev);
  vPrev.next = vNew;
  vNext.prev = vNew;

  vNew.anEdge = eOrig;
  // leave coords, s, t undefined
  // TODO(bckenny): does above line mean 0 specifically, or does it matter?

  // fix other edges on this vertex loop
  var e = eOrig;
  do {
    e.org = vNew;
    e = e.oNext;
  } while(e !== eOrig);
};

/**
 * makeFace_(eOrig, fNext) attaches a new face and makes it the left
 * face of all edges in the face loop to which eOrig belongs. "fNext" gives
 * a place to insert the new face in the global face list.  We insert
 * the new face *before* fNext so that algorithms which walk the face
 * list will not see the newly created faces.
 *
 * NOTE: unlike original, acutally allocates new face.
 *
 * @private
 * @param {libtess.GluHalfEdge} eOrig [description]
 * @param {libtess.GluFace} fNext [description]
 */
libtess.mesh.makeFace_ = function(eOrig, fNext) {
  // insert in circular doubly-linked list before fNext
  var fPrev = fNext.prev;
  var fNew = new libtess.GluFace(fNext, fPrev);
  fPrev.next = fNew;
  fNext.prev = fNew;

  fNew.anEdge = eOrig;

  // The new face is marked "inside" if the old one was.  This is a
  // convenience for the common case where a face has been split in two.
  fNew.inside = fNext.inside;

  // fix other edges on this face loop
  var e = eOrig;
  do {
    e.lFace = fNew;
    e = e.lNext;
  } while(e !== eOrig);
};

/**
 * killEdge_ destroys an edge (the half-edges eDel and eDel.sym),
 * and removes from the global edge list.
 *
 * @private
 * @param {libtess.GluHalfEdge} eDel [description]
 */
libtess.mesh.killEdge_ = function(eDel) {
  // TODO(bckenny): in this case, no need to worry(?), but check when checking mesh.makeEdgePair_
  // Half-edges are allocated in pairs, see EdgePair above
  // if (eDel->Sym < eDel ) { eDel = eDel->Sym; }

  // delete from circular doubly-linked list
  var eNext = eDel.next;
  var ePrev = eDel.sym.next;
  eNext.sym.next = ePrev;
  ePrev.sym.next = eNext;

  // TODO(bckenny): memFree( eDel ); (which also frees eDel.sym)
  // TODO(bckenny): need to null at callsites?
};

/**
 * killVertex_ destroys a vertex and removes it from the global
 * vertex list. It updates the vertex loop to point to a given new vertex.
 *
 * @private
 * @param {libtess.GluVertex} vDel [description]
 * @param {libtess.GluVertex} newOrg [description]
 */
libtess.mesh.killVertex_ = function(vDel, newOrg) {
  var eStart = vDel.anEdge;

  // change the origin of all affected edges
  var e = eStart;
  do {
    e.org = newOrg;
    e = e.oNext;
  } while(e !== eStart);

  // delete from circular doubly-linked list
  var vPrev = vDel.prev;
  var vNext = vDel.next;
  vNext.prev = vPrev;
  vPrev.next = vNext;

  // TODO(bckenny): memFree( vDel );
  // TODO(bckenny): need to null at callsites?
};

/**
 * killFace_ destroys a face and removes it from the global face
 * list. It updates the face loop to point to a given new face.
 *
 * @private
 * @param {libtess.GluFace} fDel [description]
 * @param {libtess.GluFace} newLFace [description]
 */
libtess.mesh.killFace_ = function(fDel, newLFace) {
  var eStart = fDel.anEdge;

  // change the left face of all affected edges
  var e = eStart;
  do {
    e.lFace = newLFace;
    e = e.lNext;
  } while(e !== eStart);

  // delete from circular doubly-linked list
  var fPrev = fDel.prev;
  var fNext = fDel.next;
  fNext.prev = fPrev;
  fPrev.next = fNext;

  // TODO(bckenny): memFree( fDel );
  // TODO(bckenny): need to null at callsites?
};


// require libtess
// requre libtess.GluHalfEdge
/*global libtess */

/**
 * Each face has a pointer to the next and previous faces in the
 * circular list, and a pointer to a half-edge with this face as
 * the left face (null if this is the dummy header). There is also
 * a field "data" for client data.
 *
 * @param {libtess.GluFace=} opt_nextFace [description]
 * @param {libtess.GluFace=} opt_prevFace [description]
 * @constructor
 */
libtess.GluFace = function(opt_nextFace, opt_prevFace) {
  // TODO(bckenny): reverse order of params?

  /**
   * next face (never null)
   * @type {!libtess.GluFace}
   */
  this.next = opt_nextFace || this;

  /**
   * previous face (never NULL)
   * @type {!libtess.GluFace}
   */
  this.prev = opt_prevFace || this;

  /**
   * A half edge with this left face.
   * @type {libtess.GluHalfEdge}
   */
  this.anEdge = null;
  
  /**
   * room for client's data
   * @type {Object}
   */
  this.data = null;

  /**
   * "stack" for conversion to strips
   * @type {libtess.GluFace}
   */
  this.trail = null;
  
  /**
   * Flag for conversion to strips.
   * @type {boolean}
   */
  this.marked = false;
  
  /**
   * This face is in the polygon interior.
   * @type {boolean}
   */
  this.inside = false;
};


// require libtess
// require libtess.GluFace
// require libtess.GluVertex
// require libtess.ActiveRegion
/*global libtess */

/**
 * The fundamental data structure is the "half-edge". Two half-edges
 * go together to make an edge, but they point in opposite directions.
 * Each half-edge has a pointer to its mate (the "symmetric" half-edge sym),
 * its origin vertex (org), the face on its left side (lFace), and the
 * adjacent half-edges in the CCW direction around the origin vertex
 * (oNext) and around the left face (lNext). There is also a "next"
 * pointer for the global edge list (see below).
 *
 * The notation used for mesh navigation:
 *  sym   = the mate of a half-edge (same edge, but opposite direction)
 *  oNext = edge CCW around origin vertex (keep same origin)
 *  dNext = edge CCW around destination vertex (keep same dest)
 *  lNext = edge CCW around left face (dest becomes new origin)
 *  rNext = edge CCW around right face (origin becomes new dest)
 *
 * "prev" means to substitute CW for CCW in the definitions above.
 *
 * The circular edge list is special; since half-edges always occur
 * in pairs (e and e.sym), each half-edge stores a pointer in only
 * one direction. Starting at eHead and following the e.next pointers
 * will visit each *edge* once (ie. e or e.sym, but not both).
 * e.sym stores a pointer in the opposite direction, thus it is
 * always true that e.sym.next.sym.next === e.
 *
 * @param {libtess.GluHalfEdge=} opt_nextEdge [description]
 * @constructor
 */
libtess.GluHalfEdge = function(opt_nextEdge) {
  // TODO(bckenny): are these the right defaults? (from gl_meshNewMesh requirements)
  
  /**
   * doubly-linked list (prev==sym->next)
   * @type {!libtess.GluHalfEdge}
   */
  this.next = opt_nextEdge || this;

  // TODO(bckenny): how can this be required if created in pairs? move to factory creation only?
  /**
   * same edge, opposite direction
   * @type {libtess.GluHalfEdge}
   */
  this.sym = null;

  /**
   * next edge CCW around origin
   * @type {libtess.GluHalfEdge}
   */
  this.oNext = null;

  /**
   * next edge CCW around left face
   * @type {libtess.GluHalfEdge}
   */
  this.lNext = null;

  /**
   * origin vertex (oVertex too long)
   * @type {libtess.GluVertex}
   */
  this.org = null;

  /**
   * left face
   * @type {libtess.GluFace}
   */
  this.lFace = null;

  // Internal data (keep hidden)
  // NOTE(bckenny): can't be private, though...
  
  /**
   * a region with this upper edge (see sweep.js)
   * @type {libtess.ActiveRegion}
   */
  this.activeRegion = null;

  /**
   * change in winding number when crossing from the right face to the left face
   * @type {number}
   */
  this.winding = 0;
};

// NOTE(bckenny): the following came from macros in mesh
// TODO(bckenny): using methods as aliases for sym connections for now.
// not sure about this approach. getters? renames?

/**
 * [rFace description]
 * @return {libtess.GluFace} [description]
 */
libtess.GluHalfEdge.prototype.rFace = function() {
  return this.sym.lFace;
};

/**
 * [dst description]
 * @return {libtess.GluVertex} [description]
 */
libtess.GluHalfEdge.prototype.dst = function() {
  return this.sym.org;
};

/**
 * [oPrev description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.oPrev = function() {
  return this.sym.lNext;
};

/**
 * [lPrev description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.lPrev = function() {
  return this.oNext.sym;
};

/**
 * [dPrev description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.dPrev = function() {
  return this.lNext.sym;
};

/**
 * [rPrev description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.rPrev = function() {
  return this.sym.oNext;
};

/**
 * [dNext description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.dNext = function() {
  return this.rPrev().sym;
};

/**
 * [rNext description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.GluHalfEdge.prototype.rNext = function() {
  return this.oPrev().sym;
};


// requre libtess.GluHalfEdge
/*global libtess */

/**
 * Each vertex has a pointer to next and previous vertices in the
 * circular list, and a pointer to a half-edge with this vertex as
 * the origin (null if this is the dummy header). There is also a
 * field "data" for client data.
 *
 * @param {libtess.GluVertex=} opt_nextVertex [description]
 * @param {libtess.GluVertex=} opt_prevVertex [description]
 * @constructor
 */
libtess.GluVertex = function(opt_nextVertex, opt_prevVertex) {
  // TODO(bckenny): reverse order of params?

  /**
   * Next vertex (never null).
   * @type {!libtess.GluVertex}
   */
  this.next = opt_nextVertex || this;

  /**
   * Previous vertex (never null).
   * @type {!libtess.GluVertex}
   */
  this.prev = opt_prevVertex || this;

  /**
   * A half-edge with this origin.
   * @type {libtess.GluHalfEdge}
   */
  this.anEdge = null;
  
  /**
   * The client's data.
   * @type {Object}
   */
  this.data = null;

  /**
   * The vertex location in 3D.
   * @type {Array.<number>}
   */
  this.coords = [0, 0, 0];
  // TODO(bckenny): we may want to rethink coords, either eliminate (using s
  // and t and user data) or index into contiguous storage?

  /**
   * Component of projection onto the sweep plane.
   * @type {number}
   */
  this.s = 0;

  /**
   * Component of projection onto the sweep plane.
   * @type {number}
   */
  this.t = 0;

  /**
   * To allow deletion from priority queue.
   * @type {?libtess.PQHandle}
   */
  this.pqHandle = null;
  // NOTE(bckenny): pqHandle inited in sweep
  // TODO(bckenny): can we have a numeric default value? null may do bad things
};


// require libtess.GluFace
// require libtess.GluHalfEdge
// require libtess.GluVertex
/*global libtess */

/**
 * Creates a new mesh with no edges, no vertices,
 * and no loops (what we usually call a "face").
 *
 * @constructor
 */
libtess.GluMesh = function() {
  /**
   * dummy header for vertex list
   * @type {libtess.GluVertex}
   */
  this.vHead = new libtess.GluVertex();

  /**
   * dummy header for face list
   * @type {libtess.GluFace}
   */
  this.fHead = new libtess.GluFace();

  /**
   * dummy header for edge list
   * @type {libtess.GluHalfEdge}
   */
  this.eHead = new libtess.GluHalfEdge();
  
  /**
   * and its symmetric counterpart
   * @type {libtess.GluHalfEdge}
   */
  this.eHeadSym = new libtess.GluHalfEdge();

  // TODO(bckenny): better way to pair these?
  this.eHead.sym = this.eHeadSym;
  this.eHeadSym.sym = this.eHead;
};

// TODO(bckenny): #ifndef NDEBUG
/**
 * Checks mesh for self-consistency.
 */
libtess.GluMesh.prototype.checkMesh = function() {
  if (!libtess.DEBUG) {
    return;
  }

  var fHead = this.fHead;
  var vHead = this.vHead;
  var eHead = this.eHead;
  
  var e;

  // faces
  var f;
  var fPrev = fHead;
  for (fPrev = fHead; (f = fPrev.next) !== fHead; fPrev = f) {
    libtess.assert(f.prev === fPrev);
    e = f.anEdge;
    do {
      libtess.assert(e.sym !== e);
      libtess.assert(e.sym.sym === e);
      libtess.assert(e.lNext.oNext.sym === e);
      libtess.assert(e.oNext.sym.lNext === e);
      libtess.assert(e.lFace === f);
      e = e.lNext;
    } while(e !== f.anEdge);
  }
  libtess.assert(f.prev === fPrev && f.anEdge === null && f.data === null);

  // vertices
  var v;
  var vPrev = vHead;
  for (vPrev = vHead; (v = vPrev.next) !== vHead; vPrev = v) {
    libtess.assert(v.prev === vPrev);
    e = v.anEdge;
    do {
      libtess.assert(e.sym !== e);
      libtess.assert(e.sym.sym === e);
      libtess.assert(e.lNext.oNext.sym === e);
      libtess.assert(e.oNext.sym.lNext === e);
      libtess.assert(e.org === v);
      e = e.oNext;
    } while(e !== v.anEdge);
  }
  libtess.assert(v.prev === vPrev && v.anEdge === null && v.data === null);

  // edges
  var ePrev = eHead;
  for (ePrev = eHead; (e = ePrev.next) !== eHead; ePrev = e) {
    libtess.assert(e.sym.next === ePrev.sym);
    libtess.assert(e.sym !== e);
    libtess.assert(e.sym.sym === e);
    libtess.assert(e.org !== null);
    libtess.assert(e.dst() !== null);
    libtess.assert(e.lNext.oNext.sym === e);
    libtess.assert(e.oNext.sym.lNext === e);
  }
  libtess.assert(e.sym.next === ePrev.sym &&
      e.sym === this.eHeadSym &&
      e.sym.sym === e &&
      e.org === null && e.dst() === null &&
      e.lFace === null && e.rFace() === null);
};


// require libtess.mesh
// require libtess.geom
// require libtess.Dict
// require libtess.PriorityQ
/*global libtess */

// TODO(bckenny): a number of these never return null (as opposed to original) and should be typed appropriately

/*
 * Invariants for the Edge Dictionary.
 * - each pair of adjacent edges e2=succ(e1) satisfies edgeLeq_(e1,e2)
 *   at any valid location of the sweep event
 * - if edgeLeq_(e2,e1) as well (at any valid sweep event), then e1 and e2
 *   share a common endpoint
 * - for each e, e.dst() has been processed, but not e.org
 * - each edge e satisfies vertLeq(e.dst(),event) && vertLeq(event,e.org)
 *   where "event" is the current sweep line event.
 * - no edge e has zero length
 *
 * Invariants for the Mesh (the processed portion).
 * - the portion of the mesh left of the sweep line is a planar graph,
 *   ie. there is *some* way to embed it in the plane
 * - no processed edge has zero length
 * - no two processed vertices have identical coordinates
 * - each "inside" region is monotone, ie. can be broken into two chains
 *   of monotonically increasing vertices according to VertLeq(v1,v2)
 *   - a non-invariant: these chains may intersect (very slightly)
 *
 * Invariants for the Sweep.
 * - if none of the edges incident to the event vertex have an activeRegion
 *   (ie. none of these edges are in the edge dictionary), then the vertex
 *   has only right-going edges.
 * - if an edge is marked "fixUpperEdge" (it is a temporary edge introduced
 *   by ConnectRightVertex), then it is the only right-going edge from
 *   its associated vertex.  (This says that these edges exist only
 *   when it is necessary.)
 */

libtess.sweep = function() {

};

/**
 * Make the sentinel coordinates big enough that they will never be
 * merged with real input features.  (Even with the largest possible
 * input contour and the maximum tolerance of 1.0, no merging will be
 * done with coordinates larger than 3 * libtess.GLU_TESS_MAX_COORD).
 * @private
 * @const
 * @type {number}
 */
libtess.sweep.SENTINEL_COORD_ = 4 * libtess.GLU_TESS_MAX_COORD;

/**
 * Because vertices at exactly the same location are merged together
 * before we process the sweep event, some degenerate cases can't occur.
 * However if someone eventually makes the modifications required to
 * merge features which are close together, the cases below marked
 * TOLERANCE_NONZERO will be useful.  They were debugged before the
 * code to merge identical vertices in the main loop was added.
 * @private
 * @const
 * @type {boolean}
 */
libtess.sweep.TOLERANCE_NONZERO_ = false;

/**
 * computeInterior(tess) computes the planar arrangement specified
 * by the given contours, and further subdivides this arrangement
 * into regions. Each region is marked "inside" if it belongs
 * to the polygon, according to the rule given by tess.windingRule.
 * Each interior region is guaranteed be monotone.
 *
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.computeInterior = function(tess) {
  tess.fatalError = false;

  // Each vertex defines an event for our sweep line. Start by inserting
  // all the vertices in a priority queue. Events are processed in
  // lexicographic order, ie.
  // e1 < e2  iff  e1.x < e2.x || (e1.x == e2.x && e1.y < e2.y)
  libtess.sweep.removeDegenerateEdges_(tess);
  libtess.sweep.initPriorityQ_(tess);
  libtess.sweep.initEdgeDict_(tess);

  // TODO(bckenny): don't need the cast if pq's key is better typed
  var v;
  while ((v = /** @type {libtess.GluVertex} */(tess.pq.extractMin())) !== null) {
    for ( ;; ) {
      var vNext = /** @type {libtess.GluVertex} */(tess.pq.minimum());
      if (vNext === null || !libtess.geom.vertEq(vNext, v)) {
        break;
      }
      
      /* Merge together all vertices at exactly the same location.
       * This is more efficient than processing them one at a time,
       * simplifies the code (see connectLeftDegenerate), and is also
       * important for correct handling of certain degenerate cases.
       * For example, suppose there are two identical edges A and B
       * that belong to different contours (so without this code they would
       * be processed by separate sweep events).  Suppose another edge C
       * crosses A and B from above.  When A is processed, we split it
       * at its intersection point with C.  However this also splits C,
       * so when we insert B we may compute a slightly different
       * intersection point.  This might leave two edges with a small
       * gap between them.  This kind of error is especially obvious
       * when using boundary extraction (GLU_TESS_BOUNDARY_ONLY).
       */
      vNext = /** @type {libtess.GluVertex} */(tess.pq.extractMin());
      libtess.sweep.spliceMergeVertices_(tess, v.anEdge, vNext.anEdge);
    }
    libtess.sweep.sweepEvent_(tess, v);
  }

  // TODO(bckenny): what does the next comment mean? can we eliminate event except when debugging?
  // Set tess.event for debugging purposes
  // TODO(bckenny): can we elminate cast? intermediate tmpReg added for clarity
  var tmpReg = /** @type {libtess.ActiveRegion} */(tess.dict.getMin().getKey());
  tess.event = tmpReg.eUp.org;
  libtess.sweepDebugEvent(tess);
  libtess.sweep.doneEdgeDict_(tess);
  libtess.sweep.donePriorityQ_(tess);

  libtess.sweep.removeDegenerateFaces_(tess.mesh);
  tess.mesh.checkMesh(); // TODO(bckenny): just for debug?
};



/**
 * When we merge two edges into one, we need to compute the combined
 * winding of the new edge.
 * @private
 * @param {libtess.GluHalfEdge} eDst [description]
 * @param {libtess.GluHalfEdge} eSrc [description]
 */
libtess.sweep.addWinding_ = function(eDst, eSrc) {
  // NOTE(bckenny): from AddWinding macro
  eDst.winding += eSrc.winding;
  eDst.sym.winding += eSrc.sym.winding;
};

/**
 * Both edges must be directed from right to left (this is the canonical
 * direction for the upper edge of each region).
 *
 * The strategy is to evaluate a "t" value for each edge at the
 * current sweep line position, given by tess.event.  The calculations
 * are designed to be very stable, but of course they are not perfect.
 *
 * Special case: if both edge destinations are at the sweep event,
 * we sort the edges by slope (they would otherwise compare equally).
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} reg1 [description]
 * @param {libtess.ActiveRegion} reg2 [description]
 * @return {boolean} [description]
 */
libtess.sweep.edgeLeq_ = function(tess, reg1, reg2) {
  var event = tess.event;
  var e1 = reg1.eUp;
  var e2 = reg2.eUp;

  if (e1.dst() === event) {
    if (e2.dst() === event) {
      // Two edges right of the sweep line which meet at the sweep event.
      // Sort them by slope.
      if (libtess.geom.vertLeq(e1.org, e2.org)) {
        return libtess.geom.edgeSign(e2.dst(), e1.org, e2.org) <= 0;
      }

      return libtess.geom.edgeSign(e1.dst(), e2.org, e1.org) >= 0;
    }

    return libtess.geom.edgeSign(e2.dst(), event, e2.org) <= 0;
  }

  if (e2.dst() === event) {
    return libtess.geom.edgeSign(e1.dst(), event, e1.org) >= 0;
  }

  // General case - compute signed distance *from* e1, e2 to event
  var t1 = libtess.geom.edgeEval(e1.dst(), event, e1.org);
  var t2 = libtess.geom.edgeEval(e2.dst(), event, e2.org);
  return (t1 >= t2);
};

/**
 * [deleteRegion_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} reg [description]
 */
libtess.sweep.deleteRegion_ = function(tess, reg) {
  if (reg.fixUpperEdge) {
    // It was created with zero winding number, so it better be
    // deleted with zero winding number (ie. it better not get merged
    // with a real edge).
    libtess.assert(reg.eUp.winding === 0);
  }

  reg.eUp.activeRegion = null;

  tess.dict.deleteNode(reg.nodeUp);
  reg.nodeUp = null;

  // memFree( reg ); TODO(bckenny)
  // TODO(bckenny): may need to null at callsite
};

/**
 * Replace an upper edge which needs fixing (see connectRightVertex).
 * @private
 * @param {libtess.ActiveRegion} reg [description]
 * @param {libtess.GluHalfEdge} newEdge [description]
 */
libtess.sweep.fixUpperEdge_ = function(reg, newEdge) {
  libtess.assert(reg.fixUpperEdge);
  libtess.mesh.deleteEdge(reg.eUp);

  reg.fixUpperEdge = false;
  reg.eUp = newEdge;
  newEdge.activeRegion = reg;
};

/**
 * Find the region above the uppermost edge with the same origin.
 * @private
 * @param {libtess.ActiveRegion} reg [description]
 * @return {libtess.ActiveRegion} [description]
 */
libtess.sweep.topLeftRegion_ = function(reg) {
  var org = reg.eUp.org;

  // Find the region above the uppermost edge with the same origin
  do {
    reg = reg.regionAbove();
  } while (reg.eUp.org === org);

  // If the edge above was a temporary edge introduced by connectRightVertex,
  // now is the time to fix it.
  if (reg.fixUpperEdge) {
    var e = libtess.mesh.connect(reg.regionBelow().eUp.sym, reg.eUp.lNext);
    libtess.sweep.fixUpperEdge_(reg, e);
    reg = reg.regionAbove();
  }

  return reg;
};

/**
 * Find the region above the uppermost edge with the same destination.
 * @private
 * @param {libtess.ActiveRegion} reg [description]
 * @return {libtess.ActiveRegion} [description]
 */
libtess.sweep.topRightRegion_ = function(reg) {
  var dst = reg.eUp.dst();

  do {
    reg = reg.regionAbove();
  } while (reg.eUp.dst() === dst);

  return reg;
};

/**
 * Add a new active region to the sweep line, *somewhere* below "regAbove"
 * (according to where the new edge belongs in the sweep-line dictionary).
 * The upper edge of the new region will be "eNewUp".
 * Winding number and "inside" flag are not updated.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regAbove [description]
 * @param {libtess.GluHalfEdge} eNewUp [description]
 */
libtess.sweep.addRegionBelow_ = function(tess, regAbove, eNewUp) {
  var regNew = new libtess.ActiveRegion();

  regNew.eUp = eNewUp;
  regNew.nodeUp = tess.dict.insertBefore(regAbove.nodeUp, regNew);
  eNewUp.activeRegion = regNew;

  return regNew;
};

/**
 * [isWindingInside_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {number} n int
 * @return {boolean} [description]
 */
libtess.sweep.isWindingInside_ = function(tess, n) {
  switch(tess.windingRule) {
    case libtess.windingRule.GLU_TESS_WINDING_ODD:
      return ((n & 1) !== 0);
    case libtess.windingRule.GLU_TESS_WINDING_NONZERO:
      return (n !== 0);
    case libtess.windingRule.GLU_TESS_WINDING_POSITIVE:
      return (n > 0);
    case libtess.windingRule.GLU_TESS_WINDING_NEGATIVE:
      return (n < 0);
    case libtess.windingRule.GLU_TESS_WINDING_ABS_GEQ_TWO:
      return (n >= 2) || (n <= -2);
  }

  // TODO(bckenny): not reached
  libtess.assert(false);
  return false;
};

/**
 * [computeWinding_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} reg [description]
 */
libtess.sweep.computeWinding_ = function(tess, reg) {
  reg.windingNumber = reg.regionAbove().windingNumber + reg.eUp.winding;
  reg.inside = libtess.sweep.isWindingInside_(tess, reg.windingNumber);
};

/**
 * Delete a region from the sweep line. This happens when the upper
 * and lower chains of a region meet (at a vertex on the sweep line).
 * The "inside" flag is copied to the appropriate mesh face (we could
 * not do this before -- since the structure of the mesh is always
 * changing, this face may not have even existed until now).
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} reg [description]
 */
libtess.sweep.finishRegion_ = function(tess, reg) {
  // TODO(bckenny): may need to null reg at callsite

  var e = reg.eUp;
  var f = e.lFace;

  f.inside = reg.inside;
  f.anEdge = e;   // optimization for tessmono.tessellateMonoRegion() // TODO(bckenny): how so?
  libtess.sweep.deleteRegion_(tess, reg);
};

/**
 * We are given a vertex with one or more left-going edges. All affected
 * edges should be in the edge dictionary. Starting at regFirst.eUp,
 * we walk down deleting all regions where both edges have the same
 * origin vOrg. At the same time we copy the "inside" flag from the
 * active region to the face, since at this point each face will belong
 * to at most one region (this was not necessarily true until this point
 * in the sweep). The walk stops at the region above regLast; if regLast
 * is null we walk as far as possible. At the same time we relink the
 * mesh if necessary, so that the ordering of edges around vOrg is the
 * same as in the dictionary.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regFirst [description]
 * @param {libtess.ActiveRegion} regLast [description]
 * @return {libtess.GluHalfEdge} [description]
 */
libtess.sweep.finishLeftRegions_ = function(tess, regFirst, regLast) {
  var regPrev = regFirst;
  var ePrev = regFirst.eUp;
  while (regPrev !== regLast) {
    // placement was OK
    regPrev.fixUpperEdge = false;
    var reg = regPrev.regionBelow();
    var e = reg.eUp;
    if (e.org !== ePrev.org) {
      if (!reg.fixUpperEdge) {
        /* Remove the last left-going edge. Even though there are no further
         * edges in the dictionary with this origin, there may be further
         * such edges in the mesh (if we are adding left edges to a vertex
         * that has already been processed). Thus it is important to call
         * finishRegion rather than just deleteRegion.
         */
        libtess.sweep.finishRegion_(tess, regPrev);
        break;
      }

      // If the edge below was a temporary edge introduced by
      // connectRightVertex, now is the time to fix it.
      e = libtess.mesh.connect(ePrev.lPrev(), e.sym);
      libtess.sweep.fixUpperEdge_(reg, e);
    }

    // Relink edges so that ePrev.oNext === e
    if (ePrev.oNext !== e) {
      libtess.mesh.meshSplice(e.oPrev(), e);
      libtess.mesh.meshSplice(ePrev, e);
    }

    // may change reg.eUp
    libtess.sweep.finishRegion_(tess, regPrev);
    ePrev = reg.eUp;
    regPrev = reg;
  }

  return ePrev;
};

/**
 * Purpose: insert right-going edges into the edge dictionary, and update
 * winding numbers and mesh connectivity appropriately. All right-going
 * edges share a common origin vOrg. Edges are inserted CCW starting at
 * eFirst; the last edge inserted is eLast.oPrev. If vOrg has any
 * left-going edges already processed, then eTopLeft must be the edge
 * such that an imaginary upward vertical segment from vOrg would be
 * contained between eTopLeft.oPrev and eTopLeft; otherwise eTopLeft
 * should be null.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @param {libtess.GluHalfEdge} eFirst [description]
 * @param {libtess.GluHalfEdge} eLast [description]
 * @param {libtess.GluHalfEdge} eTopLeft [description]
 * @param {boolean} cleanUp [description]
 */
libtess.sweep.addRightEdges_ = function(tess, regUp, eFirst, eLast, eTopLeft, cleanUp) {
  var firstTime = true;

  // Insert the new right-going edges in the dictionary
  var e = eFirst;
  do {
    libtess.assert(libtess.geom.vertLeq(e.org, e.dst()));
    libtess.sweep.addRegionBelow_(tess, regUp, e.sym);
    e = e.oNext;
  } while (e !== eLast);

  // Walk *all* right-going edges from e.org, in the dictionary order,
  // updating the winding numbers of each region, and re-linking the mesh
  // edges to match the dictionary ordering (if necessary).
  if (eTopLeft === null) {
    eTopLeft = regUp.regionBelow().eUp.rPrev();
  }
  var regPrev = regUp;
  var ePrev = eTopLeft;
  var reg;
  for( ;; ) {
    reg = regPrev.regionBelow();
    e = reg.eUp.sym;
    if (e.org !== ePrev.org) {
      break;
    }

    if (e.oNext !== ePrev) {
      // Unlink e from its current position, and relink below ePrev
      libtess.mesh.meshSplice(e.oPrev(), e);
      libtess.mesh.meshSplice(ePrev.oPrev(), e);
    }
    // Compute the winding number and "inside" flag for the new regions
    reg.windingNumber = regPrev.windingNumber - e.winding;
    reg.inside = libtess.sweep.isWindingInside_(tess, reg.windingNumber);

    // Check for two outgoing edges with same slope -- process these
    // before any intersection tests (see example in libtess.sweep.computeInterior).
    regPrev.dirty = true;
    if (!firstTime && libtess.sweep.checkForRightSplice_(tess, regPrev)) {
      libtess.sweep.addWinding_(e, ePrev);
      libtess.sweep.deleteRegion_(tess, regPrev); // TODO(bckenny): need to null regPrev anywhere else?
      libtess.mesh.deleteEdge(ePrev);
    }
    firstTime = false;
    regPrev = reg;
    ePrev = e;
  }

  regPrev.dirty = true;
  libtess.assert(regPrev.windingNumber - e.winding === reg.windingNumber);

  if (cleanUp) {
    // Check for intersections between newly adjacent edges.
    libtess.sweep.walkDirtyRegions_(tess, regPrev);
  }
};

/**
 * [callCombine_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluVertex} isect [description]
 * @param {Array.<Object>} data [description]
 * @param {Array.<number>} weights [description]
 * @param {boolean} needed [description]
 */
libtess.sweep.callCombine_ = function(tess, isect, data, weights, needed) {
  // Copy coord data in case the callback changes it.
  var coords = [
    isect.coords[0],
    isect.coords[1],
    isect.coords[2]
  ];

  isect.data = null;
  isect.data = tess.callCombineOrCombineData(coords, data, weights);
  if (isect.data === null) {
    if (!needed) {
      // not needed, so just use data from first vertex
      isect.data = data[0];

    } else if (!tess.fatalError) {
      // The only way fatal error is when two edges are found to intersect,
      // but the user has not provided the callback necessary to handle
      // generated intersection points.
      tess.callErrorOrErrorData(libtess.errorType.GLU_TESS_NEED_COMBINE_CALLBACK);
      tess.fatalError = true;
    }
  }
};

/**
 * Two vertices with idential coordinates are combined into one.
 * e1.org is kept, while e2.org is discarded.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluHalfEdge} e1 [description]
 * @param {libtess.GluHalfEdge} e2 [description]
 */
libtess.sweep.spliceMergeVertices_ = function(tess, e1, e2) {
  // TODO(bckenny): better way to init these? save them?
  var data = [null, null, null, null];
  var weights = [0.5, 0.5, 0, 0];

  data[0] = e1.org.data;
  data[1] = e2.org.data;
  libtess.sweep.callCombine_(tess, e1.org, data, weights, false);
  libtess.mesh.meshSplice(e1, e2);
};

/**
 * Find some weights which describe how the intersection vertex is
 * a linear combination of org and dst. Each of the two edges
 * which generated "isect" is allocated 50% of the weight; each edge
 * splits the weight between its org and dst according to the
 * relative distance to "isect".
 *
 * @private
 * @param {libtess.GluVertex} isect [description]
 * @param {libtess.GluVertex} org [description]
 * @param {libtess.GluVertex} dst [description]
 * @param {Array.<number>} weights [description]
 * @param {number} weightIndex Index into weights for first weight to supply
 */
libtess.sweep.vertexWeights_ = function(isect, org, dst, weights, weightIndex) {
  // TODO(bckenny): think through how we can use L1dist here and be correct for coords
  var t1 = libtess.geom.vertL1dist(org, isect);
  var t2 = libtess.geom.vertL1dist(dst, isect);

  // TODO(bckenny): introduced weightIndex to mimic addressing in original
  // 1) document (though it is private and only used from getIntersectData)
  // 2) better way? manually inline into getIntersectData? supply two two-length tmp arrays?
  var i0 = weightIndex;
  var i1 = weightIndex + 1;
  weights[i0] = 0.5 * t2 / (t1 + t2);
  weights[i1] = 0.5 * t1 / (t1 + t2);
  isect.coords[0] += weights[i0]*org.coords[0] + weights[i1]*dst.coords[0];
  isect.coords[1] += weights[i0]*org.coords[1] + weights[i1]*dst.coords[1];
  isect.coords[2] += weights[i0]*org.coords[2] + weights[i1]*dst.coords[2];
};

/**
 * We've computed a new intersection point, now we need a "data" pointer
 * from the user so that we can refer to this new vertex in the
 * rendering callbacks.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluVertex} isect [description]
 * @param {libtess.GluVertex} orgUp [description]
 * @param {libtess.GluVertex} dstUp [description]
 * @param {libtess.GluVertex} orgLo [description]
 * @param {libtess.GluVertex} dstLo [description]
 */
libtess.sweep.getIntersectData_ = function(tess, isect, orgUp, dstUp, orgLo, dstLo) {
  // TODO(bckenny): called for every intersection event, should these be from a pool?
  // TODO(bckenny): better way to init these?
  var weights = [0, 0, 0, 0];
  var data = [
    orgUp.data,
    dstUp.data,
    orgLo.data,
    dstLo.data
  ];

  // TODO(bckenny): it appears isect is a reappropriated vertex, so does need to be zeroed.
  // double check this.
  isect.coords[0] = isect.coords[1] = isect.coords[2] = 0;

  // TODO(bckenny): see note in libtess.sweep.vertexWeights_ for explanation of weightIndex. fix?
  libtess.sweep.vertexWeights_(isect, orgUp, dstUp, weights, 0);
  libtess.sweep.vertexWeights_(isect, orgLo, dstLo, weights, 2);

  libtess.sweep.callCombine_(tess, isect, data, weights, true);
};

/**
 * Check the upper and lower edge of regUp, to make sure that the
 * eUp.org is above eLo, or eLo.org is below eUp (depending on which
 * origin is leftmost).
 *
 * The main purpose is to splice right-going edges with the same
 * dest vertex and nearly identical slopes (ie. we can't distinguish
 * the slopes numerically). However the splicing can also help us
 * to recover from numerical errors. For example, suppose at one
 * point we checked eUp and eLo, and decided that eUp.org is barely
 * above eLo. Then later, we split eLo into two edges (eg. from
 * a splice operation like this one). This can change the result of
 * our test so that now eUp.org is incident to eLo, or barely below it.
 * We must correct this condition to maintain the dictionary invariants.
 *
 * One possibility is to check these edges for intersection again
 * (i.e. checkForIntersect). This is what we do if possible. However
 * checkForIntersect requires that tess.event lies between eUp and eLo,
 * so that it has something to fall back on when the intersection
 * calculation gives us an unusable answer. So, for those cases where
 * we can't check for intersection, this routine fixes the problem
 * by just splicing the offending vertex into the other edge.
 * This is a guaranteed solution, no matter how degenerate things get.
 * Basically this is a combinatorial solution to a numerical problem.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @return {boolean} [description]
 */
libtess.sweep.checkForRightSplice_ = function(tess, regUp) {
  // TODO(bckenny): fully learn how these two checks work

  var regLo = regUp.regionBelow();
  var eUp = regUp.eUp;
  var eLo = regLo.eUp;

  if (libtess.geom.vertLeq(eUp.org, eLo.org)) {
    if (libtess.geom.edgeSign(eLo.dst(), eUp.org, eLo.org) > 0) {
      return false;
    }

    // eUp.org appears to be below eLo
    if (!libtess.geom.vertEq(eUp.org, eLo.org)) {
      // Splice eUp.org into eLo
      libtess.mesh.splitEdge(eLo.sym);
      libtess.mesh.meshSplice(eUp, eLo.oPrev());
      regUp.dirty = regLo.dirty = true;

    } else if (eUp.org !== eLo.org) {
      // merge the two vertices, discarding eUp.org
      // TODO(bckenny): fix pqHandle null situation
      tess.pq.remove(/** @type {libtess.PQHandle} */(eUp.org.pqHandle));
      libtess.sweep.spliceMergeVertices_(tess, eLo.oPrev(), eUp);
    }

  } else {
    if (libtess.geom.edgeSign(eUp.dst(), eLo.org, eUp.org) < 0) {
      return false;
    }

    // eLo.org appears to be above eUp, so splice eLo.org into eUp
    regUp.regionAbove().dirty = regUp.dirty = true;
    libtess.mesh.splitEdge(eUp.sym);
    libtess.mesh.meshSplice(eLo.oPrev(), eUp);
  }

  return true;
};

/**
 * Check the upper and lower edge of regUp to make sure that the
 * eUp.dst() is above eLo, or eLo.dst() is below eUp (depending on which
 * destination is rightmost).
 *
 * Theoretically, this should always be true. However, splitting an edge
 * into two pieces can change the results of previous tests. For example,
 * suppose at one point we checked eUp and eLo, and decided that eUp.dst()
 * is barely above eLo. Then later, we split eLo into two edges (eg. from
 * a splice operation like this one). This can change the result of
 * the test so that now eUp.dst() is incident to eLo, or barely below it.
 * We must correct this condition to maintain the dictionary invariants
 * (otherwise new edges might get inserted in the wrong place in the
 * dictionary, and bad stuff will happen).
 *
 * We fix the problem by just splicing the offending vertex into the
 * other edge.
 *
 * @private
 * @param {libtess.GluTesselator} tess description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @return {boolean} [description]
 */
libtess.sweep.checkForLeftSplice_ = function(tess, regUp) {
  var regLo = regUp.regionBelow();
  var eUp = regUp.eUp;
  var eLo = regLo.eUp;
  var e;

  libtess.assert(!libtess.geom.vertEq(eUp.dst(), eLo.dst()));

  if (libtess.geom.vertLeq(eUp.dst(), eLo.dst())) {
    if (libtess.geom.edgeSign(eUp.dst(), eLo.dst(), eUp.org) < 0) {
      return false;
    }

    // eLo.dst() is above eUp, so splice eLo.dst() into eUp
    regUp.regionAbove().dirty = regUp.dirty = true;
    e = libtess.mesh.splitEdge(eUp);
    libtess.mesh.meshSplice(eLo.sym, e);
    e.lFace.inside = regUp.inside;

  } else {
    if (libtess.geom.edgeSign(eLo.dst(), eUp.dst(), eLo.org) > 0) {
      return false;
    }

    // eUp.dst() is below eLo, so splice eUp.dst() into eLo
    regUp.dirty = regLo.dirty = true;
    e = libtess.mesh.splitEdge(eLo);
    libtess.mesh.meshSplice(eUp.lNext, eLo.sym);
    e.rFace().inside = regUp.inside;
  }

  return true;
};

/**
 * Check the upper and lower edges of the given region to see if
 * they intersect. If so, create the intersection and add it
 * to the data structures.
 *
 * Returns true if adding the new intersection resulted in a recursive
 * call to addRightEdges_(); in this case all "dirty" regions have been
 * checked for intersections, and possibly regUp has been deleted.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @return {boolean} [description]
 */
libtess.sweep.checkForIntersect_ = function(tess, regUp) {
  var regLo = regUp.regionBelow();
  var eUp = regUp.eUp;
  var eLo = regLo.eUp;
  var orgUp = eUp.org;
  var orgLo = eLo.org;
  var dstUp = eUp.dst();
  var dstLo = eLo.dst();

  var isect = new libtess.GluVertex();

  libtess.assert(!libtess.geom.vertEq(dstLo, dstUp));
  libtess.assert(libtess.geom.edgeSign(dstUp, tess.event, orgUp) <= 0);
  libtess.assert(libtess.geom.edgeSign(dstLo, tess.event, orgLo) >= 0 );
  libtess.assert(orgUp !== tess.event && orgLo !== tess.event);
  libtess.assert(!regUp.fixUpperEdge && !regLo.fixUpperEdge);

  if (orgUp === orgLo) {
    // right endpoints are the same
    return false;
  }

  var tMinUp = Math.min(orgUp.t, dstUp.t);
  var tMaxLo = Math.max(orgLo.t, dstLo.t);
  if (tMinUp > tMaxLo) {
    // t ranges do not overlap
    return false;
  }

  if (libtess.geom.vertLeq(orgUp, orgLo)) {
    if (libtess.geom.edgeSign(dstLo, orgUp, orgLo) > 0) {
      return false;
    }
  } else {
    if (libtess.geom.edgeSign(dstUp, orgLo, orgUp) < 0) {
      return false;
    }
  }

  // At this point the edges intersect, at least marginally
  libtess.sweepDebugEvent( tess );

  libtess.geom.edgeIntersect(dstUp, orgUp, dstLo, orgLo, isect);
  
  // The following properties are guaranteed:
  libtess.assert(Math.min(orgUp.t, dstUp.t) <= isect.t);
  libtess.assert(isect.t <= Math.max(orgLo.t, dstLo.t));
  libtess.assert(Math.min(dstLo.s, dstUp.s) <= isect.s);
  libtess.assert(isect.s <= Math.max(orgLo.s, orgUp.s));

  if (libtess.geom.vertLeq(isect, tess.event)) {
    /* The intersection point lies slightly to the left of the sweep line,
     * so move it until it's slightly to the right of the sweep line.
     * (If we had perfect numerical precision, this would never happen
     * in the first place). The easiest and safest thing to do is
     * replace the intersection by tess.event.
     */
    isect.s = tess.event.s;
    isect.t = tess.event.t;
  }

  // TODO(bckenny): try to find test54.d
  /* Similarly, if the computed intersection lies to the right of the
   * rightmost origin (which should rarely happen), it can cause
   * unbelievable inefficiency on sufficiently degenerate inputs.
   * (If you have the test program, try running test54.d with the
   * "X zoom" option turned on).
   */
  var orgMin = libtess.geom.vertLeq(orgUp, orgLo) ? orgUp : orgLo;
  if (libtess.geom.vertLeq(orgMin, isect)) {
    isect.s = orgMin.s;
    isect.t = orgMin.t;
  }

  if (libtess.geom.vertEq(isect, orgUp) || libtess.geom.vertEq(isect, orgLo)) {
    // Easy case -- intersection at one of the right endpoints
    libtess.sweep.checkForRightSplice_(tess, regUp);
    return false;
  }

  if ((!libtess.geom.vertEq(dstUp, tess.event) && libtess.geom.edgeSign(dstUp, tess.event, isect) >= 0) ||
      (!libtess.geom.vertEq(dstLo, tess.event) && libtess.geom.edgeSign(dstLo, tess.event, isect) <= 0)) {
    /* Very unusual -- the new upper or lower edge would pass on the
     * wrong side of the sweep event, or through it. This can happen
     * due to very small numerical errors in the intersection calculation.
     */
    if (dstLo === tess.event) {
      // Splice dstLo into eUp, and process the new region(s)
      libtess.mesh.splitEdge(eUp.sym);
      libtess.mesh.meshSplice(eLo.sym, eUp);
      regUp = libtess.sweep.topLeftRegion_(regUp);
      eUp = regUp.regionBelow().eUp;
      libtess.sweep.finishLeftRegions_(tess, regUp.regionBelow(), regLo);
      libtess.sweep.addRightEdges_(tess, regUp, eUp.oPrev(), eUp, eUp, true);
      return true;
    }

    if (dstUp === tess.event) {
      // Splice dstUp into eLo, and process the new region(s)
      libtess.mesh.splitEdge(eLo.sym);
      libtess.mesh.meshSplice(eUp.lNext, eLo.oPrev());
      regLo = regUp;
      regUp = libtess.sweep.topRightRegion_(regUp);
      var e = regUp.regionBelow().eUp.rPrev();
      regLo.eUp = eLo.oPrev();
      eLo = libtess.sweep.finishLeftRegions_(tess, regLo, null);
      libtess.sweep.addRightEdges_(tess, regUp, eLo.oNext, eUp.rPrev(), e, true);
      return true;
    }

    /* Special case: called from connectRightVertex. If either
     * edge passes on the wrong side of tess.event, split it
     * (and wait for connectRightVertex to splice it appropriately).
     */
    if (libtess.geom.edgeSign(dstUp, tess.event, isect) >= 0) {
      regUp.regionAbove().dirty = regUp.dirty = true;
      libtess.mesh.splitEdge(eUp.sym);
      eUp.org.s = tess.event.s;
      eUp.org.t = tess.event.t;
    }

    if (libtess.geom.edgeSign(dstLo, tess.event, isect) <= 0) {
      regUp.dirty = regLo.dirty = true;
      libtess.mesh.splitEdge(eLo.sym);
      eLo.org.s = tess.event.s;
      eLo.org.t = tess.event.t;
    }

    // leave the rest for connectRightVertex
    return false;
  }

  /* General case -- split both edges, splice into new vertex.
   * When we do the splice operation, the order of the arguments is
   * arbitrary as far as correctness goes. However, when the operation
   * creates a new face, the work done is proportional to the size of
   * the new face. We expect the faces in the processed part of
   * the mesh (ie. eUp.lFace) to be smaller than the faces in the
   * unprocessed original contours (which will be eLo.oPrev.lFace).
   */
  libtess.mesh.splitEdge(eUp.sym);
  libtess.mesh.splitEdge(eLo.sym);
  libtess.mesh.meshSplice(eLo.oPrev(), eUp);
  eUp.org.s = isect.s;
  eUp.org.t = isect.t;
  eUp.org.pqHandle = tess.pq.insert(eUp.org);
  libtess.sweep.getIntersectData_(tess, eUp.org, orgUp, dstUp, orgLo, dstLo);
  regUp.regionAbove().dirty = regUp.dirty = regLo.dirty = true;

  return false;
};

/**
 * When the upper or lower edge of any region changes, the region is
 * marked "dirty". This routine walks through all the dirty regions
 * and makes sure that the dictionary invariants are satisfied
 * (see the comments at the beginning of this file). Of course,
 * new dirty regions can be created as we make changes to restore
 * the invariants.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 */
libtess.sweep.walkDirtyRegions_ = function(tess, regUp) {
  var regLo = regUp.regionBelow();

  for ( ;; ) {
    // Find the lowest dirty region (we walk from the bottom up).
    while (regLo.dirty) {
      regUp = regLo;
      regLo = regLo.regionBelow();
    }
    if (!regUp.dirty) {
      regLo = regUp;
      regUp = regUp.regionAbove();
      if (regUp === null || !regUp.dirty) {
        // We've walked all the dirty regions
        return;
      }
    }

    regUp.dirty = false;
    var eUp = regUp.eUp;
    var eLo = regLo.eUp;

    if (eUp.dst() !== eLo.dst()) {
      // Check that the edge ordering is obeyed at the dst vertices.
      if (libtess.sweep.checkForLeftSplice_(tess, regUp)) {
        // If the upper or lower edge was marked fixUpperEdge, then
        // we no longer need it (since these edges are needed only for
        // vertices which otherwise have no right-going edges).
        if (regLo.fixUpperEdge) {
          libtess.sweep.deleteRegion_(tess, regLo);
          libtess.mesh.deleteEdge(eLo);
          regLo = regUp.regionBelow();
          eLo = regLo.eUp;

        } else if (regUp.fixUpperEdge) {
          libtess.sweep.deleteRegion_(tess, regUp);
          libtess.mesh.deleteEdge(eUp);
          regUp = regLo.regionAbove();
          eUp = regUp.eUp;
        }
      }
    }

    if (eUp.org !== eLo.org) {
      if (eUp.dst() !== eLo.dst() && !regUp.fixUpperEdge && !regLo.fixUpperEdge &&
          (eUp.dst() === tess.event || eLo.dst() === tess.event)) {
        /* When all else fails in checkForIntersect(), it uses tess.event
         * as the intersection location. To make this possible, it requires
         * that tess.event lie between the upper and lower edges, and also
         * that neither of these is marked fixUpperEdge (since in the worst
         * case it might splice one of these edges into tess.event, and
         * violate the invariant that fixable edges are the only right-going
         * edge from their associated vertex).
         */
        if (libtess.sweep.checkForIntersect_(tess, regUp)) {
          // walkDirtyRegions() was called recursively; we're done
          return;
        }

      } else {
        // Even though we can't use checkForIntersect(), the org vertices
        // may violate the dictionary edge ordering. Check and correct this.
        libtess.sweep.checkForRightSplice_(tess, regUp);
      }
    }

    if (eUp.org === eLo.org && eUp.dst() === eLo.dst()) {
      // A degenerate loop consisting of only two edges -- delete it.
      libtess.sweep.addWinding_(eLo, eUp);
      libtess.sweep.deleteRegion_(tess, regUp);
      libtess.mesh.deleteEdge(eUp);
      regUp = regLo.regionAbove();
    }
  }
};

/**
 * Purpose: connect a "right" vertex vEvent (one where all edges go left)
 * to the unprocessed portion of the mesh. Since there are no right-going
 * edges, two regions (one above vEvent and one below) are being merged
 * into one. regUp is the upper of these two regions.
 *
 * There are two reasons for doing this (adding a right-going edge):
 *  - if the two regions being merged are "inside", we must add an edge
 *    to keep them separated (the combined region would not be monotone).
 *  - in any case, we must leave some record of vEvent in the dictionary,
 *    so that we can merge vEvent with features that we have not seen yet.
 *    For example, maybe there is a vertical edge which passes just to
 *    the right of vEvent; we would like to splice vEvent into this edge.
 *
 * However, we don't want to connect vEvent to just any vertex. We don't
 * want the new edge to cross any other edges; otherwise we will create
 * intersection vertices even when the input data had no self-intersections.
 * (This is a bad thing; if the user's input data has no intersections,
 * we don't want to generate any false intersections ourselves.)
 *
 * Our eventual goal is to connect vEvent to the leftmost unprocessed
 * vertex of the combined region (the union of regUp and regLo).
 * But because of unseen vertices with all right-going edges, and also
 * new vertices which may be created by edge intersections, we don't
 * know where that leftmost unprocessed vertex is. In the meantime, we
 * connect vEvent to the closest vertex of either chain, and mark the region
 * as "fixUpperEdge". This flag says to delete and reconnect this edge
 * to the next processed vertex on the boundary of the combined region.
 * Quite possibly the vertex we connected to will turn out to be the
 * closest one, in which case we won't need to make any changes.
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @param {libtess.GluHalfEdge} eBottomLeft [description]
 */
libtess.sweep.connectRightVertex_ = function(tess, regUp, eBottomLeft) {
  var eTopLeft = eBottomLeft.oNext;
  var regLo = regUp.regionBelow();
  var eUp = regUp.eUp;
  var eLo = regLo.eUp;
  var degenerate = false;

  if (eUp.dst() !== eLo.dst()) {
    libtess.sweep.checkForIntersect_(tess, regUp);
  }

  // Possible new degeneracies: upper or lower edge of regUp may pass
  // through vEvent, or may coincide with new intersection vertex
  if (libtess.geom.vertEq(eUp.org, tess.event)) {
    libtess.mesh.meshSplice(eTopLeft.oPrev(), eUp);
    regUp = libtess.sweep.topLeftRegion_(regUp);
    eTopLeft = regUp.regionBelow().eUp;
    libtess.sweep.finishLeftRegions_(tess, regUp.regionBelow(), regLo);
    degenerate = true;
  }
  if (libtess.geom.vertEq(eLo.org, tess.event)) {
    libtess.mesh.meshSplice(eBottomLeft, eLo.oPrev());
    eBottomLeft = libtess.sweep.finishLeftRegions_(tess, regLo, null);
    degenerate = true;
  }
  if (degenerate) {
    libtess.sweep.addRightEdges_(tess, regUp, eBottomLeft.oNext, eTopLeft, eTopLeft, true);
    return;
  }

  // Non-degenerate situation -- need to add a temporary, fixable edge.
  // Connect to the closer of eLo.org, eUp.org.
  var eNew;
  if (libtess.geom.vertLeq(eLo.org, eUp.org)) {
    eNew = eLo.oPrev();
  } else {
    eNew = eUp;
  }
  eNew = libtess.mesh.connect(eBottomLeft.lPrev(), eNew);

  // Prevent cleanup, otherwise eNew might disappear before we've even
  // had a chance to mark it as a temporary edge.
  libtess.sweep.addRightEdges_(tess, regUp, eNew, eNew.oNext, eNew.oNext, false);
  eNew.sym.activeRegion.fixUpperEdge = true;
  libtess.sweep.walkDirtyRegions_(tess, regUp);
};

/**
 * The event vertex lies exacty on an already-processed edge or vertex.
 * Adding the new vertex involves splicing it into the already-processed
 * part of the mesh.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.ActiveRegion} regUp [description]
 * @param {libtess.GluVertex} vEvent [description]
 */
libtess.sweep.connectLeftDegenerate_ = function(tess, regUp, vEvent) {
  var e = regUp.eUp;
  if (libtess.geom.vertEq(e.org, vEvent)) {
    // e.org is an unprocessed vertex - just combine them, and wait
    // for e.org to be pulled from the queue
    libtess.assert(libtess.sweep.TOLERANCE_NONZERO_);
    libtess.sweep.spliceMergeVertices_(tess, e, vEvent.anEdge);
    return;
  }
  
  if (!libtess.geom.vertEq(e.dst(), vEvent)) {
    // General case -- splice vEvent into edge e which passes through it
    libtess.mesh.splitEdge(e.sym);

    if (regUp.fixUpperEdge) {
      // This edge was fixable -- delete unused portion of original edge
      libtess.mesh.deleteEdge(e.oNext);
      regUp.fixUpperEdge = false;
    }

    libtess.mesh.meshSplice(vEvent.anEdge, e);
    
    // recurse
    libtess.sweep.sweepEvent_(tess, vEvent);
    return;
  }

  // vEvent coincides with e.dst(), which has already been processed.
  // Splice in the additional right-going edges.
  libtess.assert(libtess.sweep.TOLERANCE_NONZERO_); // TODO(bckenny): are we supposed to not reach here?
  regUp = libtess.sweep.topRightRegion_(regUp);
  var reg = regUp.regionBelow();
  var eTopRight = reg.eUp.sym;
  var eTopLeft = eTopRight.oNext;
  var eLast = eTopLeft;

  if (reg.fixUpperEdge) {
    // Here e.dst() has only a single fixable edge going right.
    // We can delete it since now we have some real right-going edges.
    
    // there are some left edges too
    libtess.assert(eTopLeft !== eTopRight);
    libtess.sweep.deleteRegion_(tess, reg); // TODO(bckenny): something to null?
    libtess.mesh.deleteEdge(eTopRight);
    eTopRight = eTopLeft.oPrev();
  }

  libtess.mesh.meshSplice(vEvent.anEdge, eTopRight);
  if (!libtess.geom.edgeGoesLeft(eTopLeft)) {
    // e.dst() had no left-going edges -- indicate this to addRightEdges()
    eTopLeft = null;
  }

  libtess.sweep.addRightEdges_(tess, regUp, eTopRight.oNext, eLast, eTopLeft, true);
};

/**
 * Connect a "left" vertex (one where both edges go right)
 * to the processed portion of the mesh. Let R be the active region
 * containing vEvent, and let U and L be the upper and lower edge
 * chains of R. There are two possibilities:
 *
 * - the normal case: split R into two regions, by connecting vEvent to
 *   the rightmost vertex of U or L lying to the left of the sweep line
 *
 * - the degenerate case: if vEvent is close enough to U or L, we
 *   merge vEvent into that edge chain. The subcases are:
 *  - merging with the rightmost vertex of U or L
 *  - merging with the active edge of U or L
 *  - merging with an already-processed portion of U or L
 *
 * @private
 * @param {libtess.GluTesselator} tess   [description]
 * @param {libtess.GluVertex} vEvent [description]
 */
libtess.sweep.connectLeftVertex_ = function(tess, vEvent) {
  // TODO(bckenny): tmp only used for sweep. better to keep tmp across calls?
  var tmp = new libtess.ActiveRegion();

  // NOTE(bckenny): this was commented out in the original
  // libtess.assert(vEvent.anEdge.oNext.oNext === vEvent.anEdge);

  // Get a pointer to the active region containing vEvent
  tmp.eUp = vEvent.anEdge.sym;
  var regUp = /** @type {libtess.ActiveRegion} */(tess.dict.search(tmp).getKey());
  var regLo = regUp.regionBelow();
  var eUp = regUp.eUp;
  var eLo = regLo.eUp;

  // try merging with U or L first
  if (libtess.geom.edgeSign(eUp.dst(), vEvent, eUp.org) === 0) {
    libtess.sweep.connectLeftDegenerate_(tess, regUp, vEvent);
    return;
  }

  // Connect vEvent to rightmost processed vertex of either chain.
  // e.dst() is the vertex that we will connect to vEvent.
  var reg = libtess.geom.vertLeq(eLo.dst(), eUp.dst()) ? regUp : regLo;
  var eNew;
  if (regUp.inside || reg.fixUpperEdge) {
    if (reg === regUp) {
      eNew = libtess.mesh.connect(vEvent.anEdge.sym, eUp.lNext);

    } else {
      var tempHalfEdge = libtess.mesh.connect(eLo.dNext(), vEvent.anEdge);
      eNew = tempHalfEdge.sym;
    }

    if (reg.fixUpperEdge) {
      libtess.sweep.fixUpperEdge_(reg, eNew);

    } else {
      libtess.sweep.computeWinding_(tess, libtess.sweep.addRegionBelow_(tess, regUp, eNew));
    }
    libtess.sweep.sweepEvent_(tess, vEvent);

  } else {
    // The new vertex is in a region which does not belong to the polygon.
    // We don''t need to connect this vertex to the rest of the mesh.
    libtess.sweep.addRightEdges_(tess, regUp, vEvent.anEdge, vEvent.anEdge, null, true);
  }
};

/**
 * Does everything necessary when the sweep line crosses a vertex.
 * Updates the mesh and the edge dictionary.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluVertex} vEvent [description]
 */
libtess.sweep.sweepEvent_ = function(tess, vEvent) {
  tess.event = vEvent; // for access in edgeLeq_ // TODO(bckenny): wuh?
  libtess.sweepDebugEvent( tess );
  
  /* Check if this vertex is the right endpoint of an edge that is
   * already in the dictionary.  In this case we don't need to waste
   * time searching for the location to insert new edges.
   */
  var e = vEvent.anEdge;
  while (e.activeRegion === null) {
    e = e.oNext;
    if (e === vEvent.anEdge) {
      // All edges go right -- not incident to any processed edges
      libtess.sweep.connectLeftVertex_(tess, vEvent);
      return;
    }
  }

  /* Processing consists of two phases: first we "finish" all the
   * active regions where both the upper and lower edges terminate
   * at vEvent (ie. vEvent is closing off these regions).
   * We mark these faces "inside" or "outside" the polygon according
   * to their winding number, and delete the edges from the dictionary.
   * This takes care of all the left-going edges from vEvent.
   */
  var regUp = libtess.sweep.topLeftRegion_(e.activeRegion);
  var reg = regUp.regionBelow();
  var eTopLeft = reg.eUp;
  var eBottomLeft = libtess.sweep.finishLeftRegions_(tess, reg, null);

  /* Next we process all the right-going edges from vEvent. This
   * involves adding the edges to the dictionary, and creating the
   * associated "active regions" which record information about the
   * regions between adjacent dictionary edges.
   */
  if (eBottomLeft.oNext === eTopLeft) {
    // No right-going edges -- add a temporary "fixable" edge
    libtess.sweep.connectRightVertex_(tess, regUp, eBottomLeft);

  } else {
    libtess.sweep.addRightEdges_(tess, regUp, eBottomLeft.oNext, eTopLeft, eTopLeft, true);
  }
};

/**
 * We add two sentinel edges above and below all other edges,
 * to avoid special cases at the top and bottom.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {number} t [description]
 */
libtess.sweep.addSentinel_ = function(tess, t) {
  var reg = new libtess.ActiveRegion();

  var e = libtess.mesh.makeEdge(tess.mesh);

  e.org.s = libtess.sweep.SENTINEL_COORD_;
  e.org.t = t;
  e.dst().s = -libtess.sweep.SENTINEL_COORD_;
  e.dst().t = t;
  tess.event = e.dst(); //initialize it

  reg.eUp = e;
  reg.windingNumber = 0;
  reg.inside = false;
  reg.fixUpperEdge = false;
  reg.sentinel = true;
  reg.dirty = false;
  reg.nodeUp = tess.dict.insert(reg);
};

/**
 * We maintain an ordering of edge intersections with the sweep line.
 * This order is maintained in a dynamic dictionary.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.initEdgeDict_ = function(tess) {
  // TODO(bckenny): need to cast edgeLeq_?
  tess.dict = new libtess.Dict(tess,
      /** @type {function(Object, Object, Object): boolean} */(libtess.sweep.edgeLeq_));

  libtess.sweep.addSentinel_(tess, -libtess.sweep.SENTINEL_COORD_);
  libtess.sweep.addSentinel_(tess, libtess.sweep.SENTINEL_COORD_);
};

/**
 * [doneEdgeDict_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.doneEdgeDict_ = function(tess) {
  var fixedEdges = 0;

  var reg;
  while ((reg = /** @type {libtess.ActiveRegion} */(tess.dict.getMin().getKey())) !== null) {
    // At the end of all processing, the dictionary should contain
    // only the two sentinel edges, plus at most one "fixable" edge
    // created by connectRightVertex().
    if (!reg.sentinel) {
      libtess.assert(reg.fixUpperEdge);
      libtess.assert(++fixedEdges === 1);
    }
    libtess.assert(reg.windingNumber === 0);
    libtess.sweep.deleteRegion_(tess, reg);
  }

  tess.dict.deleteDict(); // TODO(bckenny): not necessary
  tess.dict = null;
};

/**
 * Remove zero-length edges, and contours with fewer than 3 vertices.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.removeDegenerateEdges_ = function(tess) {
  var eHead = tess.mesh.eHead;

  var eNext;
  for (var e = eHead.next; e !== eHead; e = eNext) {
    eNext = e.next;
    var eLNext = e.lNext;
    
    if (libtess.geom.vertEq(e.org, e.dst()) && e.lNext.lNext !== e) {
      // Zero-length edge, contour has at least 3 edges
      libtess.sweep.spliceMergeVertices_(tess, eLNext, e); // deletes e.org
      libtess.mesh.deleteEdge(e); // e is a self-loop TODO(bckenny): does this comment really apply here?
      e = eLNext;
      eLNext = e.lNext;
    }

    if (eLNext.lNext === e) {
      // Degenerate contour (one or two edges)
      if (eLNext !== e) {
        if (eLNext === eNext || eLNext === eNext.sym) {
          eNext = eNext.next;
        }
        libtess.mesh.deleteEdge(eLNext);
      }

      if (e === eNext || e === eNext.sym ) {
        eNext = eNext.next;
      }
      libtess.mesh.deleteEdge(e);
    }
  }
};

/**
 * Construct priority queue and insert all vertices into it, which determines
 * the order in which vertices cross the sweep line.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.initPriorityQ_ = function(tess) {
  // TODO(bckenny): libtess.geom.vertLeq needs cast?
  var pq = new libtess.PriorityQ(
      /** @type {function(Object, Object): boolean} */(libtess.geom.vertLeq));
  tess.pq = pq;

  var vHead = tess.mesh.vHead;
  var v;
  for (v = vHead.next; v !== vHead; v = v.next) {
    v.pqHandle = pq.insert(v);
  }

  pq.init();
};

/**
 * [donePriorityQ_ description]
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.sweep.donePriorityQ_ = function(tess) {
  // TODO(bckenny): probably don't need deleteQ. check that function for comment
  tess.pq.deleteQ();
  tess.pq = null;
};

/**
 * Delete any degenerate faces with only two edges. walkDirtyRegions()
 * will catch almost all of these, but it won't catch degenerate faces
 * produced by splice operations on already-processed edges.
 * The two places this can happen are in finishLeftRegions(), when
 * we splice in a "temporary" edge produced by connectRightVertex(),
 * and in checkForLeftSplice(), where we splice already-processed
 * edges to ensure that our dictionary invariants are not violated
 * by numerical errors.
 *
 * In both these cases it is *very* dangerous to delete the offending
 * edge at the time, since one of the routines further up the stack
 * will sometimes be keeping a pointer to that edge.
 *
 * @private
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.sweep.removeDegenerateFaces_ = function(mesh) {
  var fNext;
  for (var f = mesh.fHead.next; f !== mesh.fHead; f = fNext) {
    fNext = f.next;
    var e = f.anEdge;
    libtess.assert(e.lNext !== e);

    if (e.lNext.lNext === e) {
      // A face with only two edges
      libtess.sweep.addWinding_(e.oNext, e);
      libtess.mesh.deleteEdge(e);
    }
  }
};



// require libtess
// require libtess.DictNode
// require libtess.GluHalfEdge
/*global libtess */

// TODO(bckenny): apparently only visible outside of sweep for debugging routines.
// find out if we can hide

/**
 * For each pair of adjacent edges crossing the sweep line, there is
 * an ActiveRegion to represent the region between them. The active
 * regions are kept in sorted order in a dynamic dictionary.  As the
 * sweep line crosses each vertex, we update the affected regions.
 *
 * @constructor
 */
libtess.ActiveRegion = function() {
  // TODO(bckenny): I *think* eUp and nodeUp could be passed in as constructor params

  /**
   * upper edge, directed right to left
   * @type {libtess.GluHalfEdge}
   */
  this.eUp = null;

  /**
   * dictionary node corresponding to eUp
   * @type {libtess.DictNode}
   */
  this.nodeUp = null;

  /**
   * used to determine which regions are inside the polygon
   * @type {number}
   */
  this.windingNumber = 0;

  /**
   * is this region inside the polygon?
   * @type {boolean}
   */
  this.inside = false;
  
  /**
   * marks fake edges at t = +/-infinity
   * @type {boolean}
   */
  this.sentinel = false;
  
  /**
   * Marks regions where the upper or lower edge has changed, but we haven't
   * checked whether they intersect yet.
   * @type {boolean}
   */
  this.dirty = false;

  /**
   * marks temporary edges introduced when we process a "right vertex" (one
   * without any edges leaving to the right)
   * @type {boolean}
   */
  this.fixUpperEdge = false;
};

/**
 * [regionBelow description]
 * @return {libtess.ActiveRegion} [description]
 */
libtess.ActiveRegion.prototype.regionBelow = function() {
  // TODO(bckenny): better typing? or is cast unavoidable
  return /** @type {libtess.ActiveRegion} */ (this.nodeUp.getPred().getKey());
};

/**
 * [regionAbove description]
 * @return {libtess.ActiveRegion} [description]
 */
libtess.ActiveRegion.prototype.regionAbove = function() {
  // TODO(bckenny): better typing? or is cast unavoidable
  return /** @type {libtess.ActiveRegion} */ (this.nodeUp.getSucc().getKey());
};


// require libtess
// require libtess.CachedVertex
// require libtess.GluTesselator
// require libtess.GluFace
// require libtess.GluHalfEdge
// require libtess.GluMesh
/*global libtess */

// TODO(bckenny): most of these doc strings are probably more internal comments

libtess.render = function() {

};

/**
 * [SIGN_INCONSISTENT_ description]
 * @type {number}
 * @private
 * @const
 */
libtess.render.SIGN_INCONSISTENT_ = 2;

/**
 * render.renderMesh(tess, mesh) takes a mesh and breaks it into triangle
 * fans, strips, and separate triangles. A substantial effort is made
 * to use as few rendering primitives as possible (i.e. to make the fans
 * and strips as large as possible).
 *
 * The rendering output is provided as callbacks (see the api).
 *
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.render.renderMesh = function(tess, mesh) {
  // Make a list of separate triangles so we can render them all at once
  tess.lonelyTriList = null;

  var f;
  for(f = mesh.fHead.next; f !== mesh.fHead; f = f.next) {
    f.marked = false;
  }
  for(f = mesh.fHead.next; f !== mesh.fHead; f = f.next) {
    // We examine all faces in an arbitrary order.  Whenever we find
    // an unprocessed face F, we output a group of faces including F
    // whose size is maximum.
    if (f.inside && ! f.marked) {
      libtess.render.renderMaximumFaceGroup_(tess, f);
      libtess.assert(f.marked);
    }
  }
  if (tess.lonelyTriList !== null) {
    libtess.render.renderLonelyTriangles_(tess, tess.lonelyTriList);
    tess.lonelyTriList = null;
  }
};


/**
 * render.renderBoundary(tess, mesh) takes a mesh, and outputs one
 * contour for each face marked "inside". The rendering output is
 * provided as callbacks (see the api).
 *
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.render.renderBoundary = function(tess, mesh) {
  for (var f = mesh.fHead.next; f !== mesh.fHead; f = f.next) {
    if (f.inside) {
      tess.callBeginOrBeginData(libtess.primitiveType.GL_LINE_LOOP);

      var e = f.anEdge;
      do {
        tess.callVertexOrVertexData(e.org.data);
        e = e.lNext;
      } while (e !== f.anEdge);

      tess.callEndOrEndData();
    }
  }
};

/**
 * render.renderCache(tess) takes a single contour and tries to render it
 * as a triangle fan. This handles convex polygons, as well as some
 * non-convex polygons if we get lucky.
 *
 * Returns true if the polygon was successfully rendered. The rendering
 * output is provided as callbacks (see the api).
 *
 * @param {libtess.GluTesselator} tess [description]
 * @return {boolean} [description]
 */
libtess.render.renderCache = function(tess) {
  if (tess.cacheCount < 3) {
    // degenerate contour -- no output
    return true;
  }

  // TODO(bckenny): better init?
  var norm = [0, 0, 0];
  norm[0] = tess.normal[0];
  norm[1] = tess.normal[1];
  norm[2] = tess.normal[2];
  if (norm[0] === 0 && norm[1] === 0 && norm[2] === 0) {
    libtess.render.computeNormal_(tess, norm, false);
  }

  var sign = libtess.render.computeNormal_(tess, norm, true);
  if (sign === libtess.render.SIGN_INCONSISTENT_) {
    // fan triangles did not have a consistent orientation
    return false;
  }
  if (sign === 0) {
    // all triangles were degenerate
    return true;
  }

  // make sure we do the right thing for each winding rule
  switch(tess.windingRule) {
    case libtess.windingRule.GLU_TESS_WINDING_ODD:
    case libtess.windingRule.GLU_TESS_WINDING_NONZERO:
      break;
    case libtess.windingRule.GLU_TESS_WINDING_POSITIVE:
      if (sign < 0) {
        return true;
      }
      break;
    case libtess.windingRule.GLU_TESS_WINDING_NEGATIVE:
      if (sign > 0) {
        return true;
      }
      break;
    case libtess.windingRule.GLU_TESS_WINDING_ABS_GEQ_TWO:
      return true;
  }

  tess.callBeginOrBeginData(tess.boundaryOnly ?
      libtess.primitiveType.GL_LINE_LOOP : (tess.cacheCount > 3) ?
      libtess.primitiveType.GL_TRIANGLE_FAN : libtess.primitiveType.GL_TRIANGLES);

  // indexes into tess.cache to replace pointers
  // TODO(bckenny): refactor to be more straightforward
  var v0 = 0;
  var vn = v0 + tess.cacheCount;
  var vc;

  tess.callVertexOrVertexData(tess.cache[v0].data);
  if (sign > 0) {
    for (vc = v0+1; vc < vn; ++vc) {
      tess.callVertexOrVertexData(tess.cache[vc].data);
    }
  } else {
    for(vc = vn-1; vc > v0; --vc) {
      tess.callVertexOrVertexData(tess.cache[vc].data);
    }
  }
  tess.callEndOrEndData();
  return true;
};


/**
 * Returns true if face has been marked temporarily.
 * @private
 * @param {libtess.GluFace} f [description]
 * @return {boolean} [description]
 */
libtess.render.marked_ = function(f) {
  // NOTE(bckenny): originally macro
  return (!f.inside || f.marked);
};

/**
 * [freeTrail description]
 * @private
 * @param {libtess.GluFace} t [description]
 */
libtess.render.freeTrail_ = function(t) {
  // NOTE(bckenny): originally macro
  while (t !== null) {
    t.marked = false;
    t = t.trail;
  }
};

/**
 * eOrig.lFace is the face we want to render. We want to find the size
 * of a maximal fan around eOrig.org. To do this we just walk around
 * the origin vertex as far as possible in both directions.
 * @private
 * @param {libtess.GluHalfEdge} eOrig [description]
 * @return {libtess.FaceCount} [description]
 */
libtess.render.maximumFan_ = function(eOrig) {
  // TODO(bckenny): probably have dest FaceCount passed in (see renderMaximumFaceGroup)
  var newFace = new libtess.FaceCount(0, null, libtess.render.renderFan_);
  
  var trail = null;
  var e;

  for(e = eOrig; !libtess.render.marked_(e.lFace); e = e.oNext) {
    // NOTE(bckenny): AddToTrail(e.lFace, trail) macro
    e.lFace.trail = trail;
    trail = e.lFace;
    e.lFace.marked = true;

    ++newFace.size;
  }
  for(e = eOrig; !libtess.render.marked_(e.rFace()); e = e.oPrev()) {
    // NOTE(bckenny): AddToTrail(e.rFace(), trail) macro
    e.rFace().trail = trail;
    trail = e.rFace();
    e.rFace().marked = true;

    ++newFace.size;
  }
  newFace.eStart = e;

  libtess.render.freeTrail_(trail);
  return newFace;
};

/**
 * Here we are looking for a maximal strip that contains the vertices
 * eOrig.org, eOrig.dst(), eOrig.lNext.dst() (in that order or the
 * reverse, such that all triangles are oriented CCW).
 *
 * Again we walk forward and backward as far as possible. However for
 * strips there is a twist: to get CCW orientations, there must be
 * an *even* number of triangles in the strip on one side of eOrig.
 * We walk the strip starting on a side with an even number of triangles;
 * if both side have an odd number, we are forced to shorten one side.
 * @private
 * @param {libtess.GluHalfEdge} eOrig [description]
 * @return {libtess.FaceCount} [description]
 */
libtess.render.maximumStrip_ = function(eOrig) {
  // TODO(bckenny): probably have dest FaceCount passed in (see renderMaximumFaceGroup)
  var newFace = new libtess.FaceCount(0, null, libtess.render.renderStrip_);

  var headSize = 0;
  var tailSize = 0;

  var trail = null;

  var e;
  var eTail;
  var eHead;

  for (e = eOrig; !libtess.render.marked_(e.lFace); ++tailSize, e = e.oNext) {
    // NOTE(bckenny): AddToTrail(e.lFace, trail) macro
    e.lFace.trail = trail;
    trail = e.lFace;
    e.lFace.marked = true;

    ++tailSize;
    e = e.dPrev();
    if (libtess.render.marked_(e.lFace)) {
      break;
    }
    // NOTE(bckenny): AddToTrail(e.lFace, trail) macro
    e.lFace.trail = trail;
    trail = e.lFace;
    e.lFace.marked = true;
  }
  eTail = e;

  for (e = eOrig; !libtess.render.marked_(e.rFace()); ++headSize, e = e.dNext()) {
    // NOTE(bckenny): AddToTrail(e.rFace(), trail) macro
    e.rFace().trail = trail;
    trail = e.rFace();
    e.rFace().marked = true;

    ++headSize;
    e = e.oPrev();
    if (libtess.render.marked_(e.rFace())) {
      break;
    }
    // NOTE(bckenny): AddToTrail(e.rFace(), trail) macro
    e.rFace().trail = trail;
    trail = e.rFace();
    e.rFace().marked = true;
  }
  eHead = e;

  newFace.size = tailSize + headSize;
  if ((tailSize & 1) === 0) { // isEven
    newFace.eStart = eTail.sym;

  } else if ((headSize & 1) === 0) { // isEven
    newFace.eStart = eHead;

  } else {
    // Both sides have odd length, we must shorten one of them.  In fact,
    // we must start from eHead to guarantee inclusion of eOrig.lFace.
    --newFace.size;
    newFace.eStart = eHead.oNext;
  }

  libtess.render.freeTrail_(trail);
  return newFace;
};

/**
 * Render as many CCW triangles as possible in a fan starting from
 * edge "e". The fan *should* contain exactly "size" triangles
 * (otherwise we've goofed up somewhere).
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluHalfEdge} e [description]
 * @param {number} size [description]
 */
libtess.render.renderFan_ = function(tess, e, size) {
  tess.callBeginOrBeginData(libtess.primitiveType.GL_TRIANGLE_FAN);
  tess.callVertexOrVertexData(e.org.data);
  tess.callVertexOrVertexData(e.dst().data);

  while (!libtess.render.marked_(e.lFace)) {
    e.lFace.marked = true;
    --size;
    e = e.oNext;
    tess.callVertexOrVertexData(e.dst().data);
  }

  libtess.assert(size === 0);
  tess.callEndOrEndData();
};

/**
 * Render as many CCW triangles as possible in a strip starting from
 * edge e. The strip *should* contain exactly "size" triangles
 * (otherwise we've goofed up somewhere).
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluHalfEdge} e [description]
 * @param {number} size [description]
 */
libtess.render.renderStrip_ = function(tess, e, size) {
  tess.callBeginOrBeginData(libtess.primitiveType.GL_TRIANGLE_STRIP);
  tess.callVertexOrVertexData(e.org.data);
  tess.callVertexOrVertexData(e.dst().data);

  while (!libtess.render.marked_(e.lFace)) {
    e.lFace.marked = true;
    --size;
    e = e.dPrev();
    tess.callVertexOrVertexData(e.org.data);
    if (libtess.render.marked_(e.lFace)) {
      break;
    }

    e.lFace.marked = true;
    --size;
    e = e.oNext;
    tess.callVertexOrVertexData(e.dst().data);
  }

  libtess.assert(size === 0);
  tess.callEndOrEndData();
};

/**
 * Just add the triangle to a triangle list, so we can render all
 * the separate triangles at once.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluHalfEdge} e [description]
 * @param {number} size [description]
 */
libtess.render.renderTriangle_ = function(tess, e, size) {
  libtess.assert(size === 1);
  // NOTE(bckenny): AddToTrail(e.lFace, tess.lonelyTriList) macro
  e.lFace.trail = tess.lonelyTriList;
  tess.lonelyTriList = e.lFace;
  e.lFace.marked = true;
};

/**
 * We want to find the largest triangle fan or strip of unmarked faces
 * which includes the given face fOrig. There are 3 possible fans
 * passing through fOrig (one centered at each vertex), and 3 possible
 * strips (one for each CCW permutation of the vertices). Our strategy
 * is to try all of these, and take the primitive which uses the most
 * triangles (a greedy approach).
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluFace} fOrig [description]
 */
libtess.render.renderMaximumFaceGroup_ = function(tess, fOrig) {
  var e = fOrig.anEdge;

  // TODO(bckenny): see faceCount comments from below. should probably create
  // two here and pass one in and compare against the other to find max
  // maybe doesnt matter since so short lived
  var max = new libtess.FaceCount(1, e, libtess.render.renderTriangle_);

  var newFace;
  if (!tess.flagBoundary) {
    newFace = libtess.render.maximumFan_(e);
    if (newFace.size > max.size) {
      max = newFace;
    }
    newFace = libtess.render.maximumFan_(e.lNext);
    if (newFace.size > max.size) {
      max = newFace;
    }
    newFace = libtess.render.maximumFan_(e.lPrev());
    if (newFace.size > max.size) {
      max = newFace;
    }

    newFace = libtess.render.maximumStrip_(e);
    if (newFace.size > max.size) {
      max = newFace;
    }
    newFace = libtess.render.maximumStrip_(e.lNext);
    if (newFace.size > max.size) {
      max = newFace;
    }
    newFace = libtess.render.maximumStrip_(e.lPrev());
    if (newFace.size > max.size) {
      max = newFace;
    }
  }

  max.render(tess, max.eStart, max.size);
};

/**
 * Now we render all the separate triangles which could not be
 * grouped into a triangle fan or strip.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {libtess.GluFace} head [description]
 */
libtess.render.renderLonelyTriangles_ = function(tess, head) {
  // TODO(bckenny): edgeState needs to be boolean, but != on first call
  // force edge state output for first vertex
  var edgeState = -1;

  var f = head;

  tess.callBeginOrBeginData(libtess.primitiveType.GL_TRIANGLES);

  for(; f !== null; f = f.trail) {
    // Loop once for each edge (there will always be 3 edges)
    var e = f.anEdge;
    do {
      if (tess.flagBoundary) {
        // Set the "edge state" to true just before we output the
        // first vertex of each edge on the polygon boundary.
        var newState = !e.rFace().inside ? 1 : 0; // TODO(bckenny): total hack to get edgeState working. fix me.
        if (edgeState !== newState) {
          edgeState = newState;
          // TODO(bckenny): edgeState should be boolean now
          tess.callEdgeFlagOrEdgeFlagData(!!edgeState);
        }
      }
      tess.callVertexOrVertexData(e.org.data);

      e = e.lNext;
    } while (e !== f.anEdge);
  }

  tess.callEndOrEndData();
};

/**
 * If check==false, we compute the polygon normal and place it in norm[].
 * If check==true, we check that each triangle in the fan from v0 has a
 * consistent orientation with respect to norm[]. If triangles are
 * consistently oriented CCW, return 1; if CW, return -1; if all triangles
 * are degenerate return 0; otherwise (no consistent orientation) return
 * render.SIGN_INCONSISTENT_.
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {Array.<number>} norm [description]
 * @param {boolean} check [description]
 * @return {number} int
 */
libtess.render.computeNormal_ = function(tess, norm, check) {
  /* Find the polygon normal. It is important to get a reasonable
   * normal even when the polygon is self-intersecting (eg. a bowtie).
   * Otherwise, the computed normal could be very tiny, but perpendicular
   * to the true plane of the polygon due to numerical noise. Then all
   * the triangles would appear to be degenerate and we would incorrectly
   * decompose the polygon as a fan (or simply not render it at all).
   *
   * We use a sum-of-triangles normal algorithm rather than the more
   * efficient sum-of-trapezoids method (used in checkOrientation()
   * in normal.js). This lets us explicitly reverse the signed area
   * of some triangles to get a reasonable normal in the self-intersecting
   * case.
   */
  if (!check) {
    norm[0] = norm[1] = norm[2] = 0;
  }

  // indexes into tess.cache to replace pointers
  // TODO(bckenny): refactor to be more straightforward
  var v0 = 0;
  var vn = v0 + tess.cacheCount;
  var vc = v0 + 1;
  var vert0 = tess.cache[v0];
  var vertc = tess.cache[vc];
  
  var xc = vertc.coords[0] - vert0.coords[0];
  var yc = vertc.coords[1] - vert0.coords[1];
  var zc = vertc.coords[2] - vert0.coords[2];

  var sign = 0;
  while (++vc < vn) {
    vertc = tess.cache[vc];
    var xp = xc;
    var yp = yc;
    var zp = zc;
    xc = vertc.coords[0] - vert0.coords[0];
    yc = vertc.coords[1] - vert0.coords[1];
    zc = vertc.coords[2] - vert0.coords[2];

    // Compute (vp - v0) cross (vc - v0)
    var n = [0, 0, 0]; // TODO(bckenny): better init?
    n[0] = yp*zc - zp*yc;
    n[1] = zp*xc - xp*zc;
    n[2] = xp*yc - yp*xc;

    var dot = n[0]*norm[0] + n[1]*norm[1] + n[2]*norm[2];
    if (!check) {
      // Reverse the contribution of back-facing triangles to get
      // a reasonable normal for self-intersecting polygons (see above)
      if (dot >= 0) {
        norm[0] += n[0];
        norm[1] += n[1];
        norm[2] += n[2];
      } else {
        norm[0] -= n[0];
        norm[1] -= n[1];
        norm[2] -= n[2];
      }
    } else if (dot !== 0) {
      // Check the new orientation for consistency with previous triangles
      if (dot > 0) {
        if (sign < 0) {
          return libtess.render.SIGN_INCONSISTENT_;
        }
        sign = 1;
      } else {
        if (sign > 0) {
          return libtess.render.SIGN_INCONSISTENT_;
        }
        sign = -1;
      }
    }
  }

  return sign;
};


// require libtess
// require libtess.GluHalfEdge
// require libtess.GluTesselator
/*global libtess */

// TODO(bckenny): Used only in private functions of render.js

/**
 * This structure remembers the information we need about a primitive
 * to be able to render it later, once we have determined which
 * primitive is able to use the most triangles.
  *
 * @constructor
 * @param {number} size [description]
 * @param {libtess.GluHalfEdge} eStart [description]
 * @param {!function(libtess.GluTesselator, libtess.GluHalfEdge, number)} renderFunction [description]
 */
libtess.FaceCount = function(size, eStart, renderFunction) {
  /**
   * The number of triangles used.
   * @type {number}
   */
  this.size = size;

  /**
   * The edge where this primitive starts.
   * @type {libtess.GluHalfEdge}
   */
  this.eStart = eStart;

  /**
   * The routine to render this primitive.
   * @type {!function(libtess.GluTesselator, libtess.GluHalfEdge, number)}
   */
  this.render = renderFunction;
};


// TODO(bckenny): get rid of this:
// NOTE(bckenny): using NO_BRANCH_CONDITIONS = false

// require libtess
// require libtess.GluHalfEdge
// require libtess.GluVertex
/*global libtess */


libtess.geom = function() {

};

/**
 * [vertEq description]
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @return {boolean} [description]
 */
libtess.geom.vertEq = function(u, v) {
  return u.s === v.s && u.t === v.t;
};

/**
 * Returns true if u is lexicographically <= v.
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @return {boolean}
 */
libtess.geom.vertLeq = function(u, v) {
  return (u.s < v.s) || (u.s === v.s && u.t <= v.t);
};

/**
 * Given three vertices u,v,w such that geom.vertLeq(u,v) && geom.vertLeq(v,w),
 * evaluates the t-coord of the edge uw at the s-coord of the vertex v.
 * Returns v.t - (uw)(v.s), ie. the signed distance from uw to v.
 * If uw is vertical (and thus passes thru v), the result is zero.
 *
 * The calculation is extremely accurate and stable, even when v
 * is very close to u or w.  In particular if we set v.t = 0 and
 * let r be the negated result (this evaluates (uw)(v.s)), then
 * r is guaranteed to satisfy MIN(u.t,w.t) <= r <= MAX(u.t,w.t).
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @param {libtess.GluVertex} w [description]
 * @return {number} double
 */
libtess.geom.edgeEval = function(u, v, w) {
  var gapL, gapR;

  libtess.assert(libtess.geom.vertLeq(u, v) && libtess.geom.vertLeq(v, w));
  
  gapL = v.s - u.s;
  gapR = w.s - v.s;

  if (gapL + gapR > 0) {
    if (gapL < gapR) {
      return (v.t - u.t) + (u.t - w.t) * (gapL / (gapL + gapR));
    } else {
      return (v.t - w.t) + (w.t - u.t) * (gapR / (gapL + gapR));
    }
  }

  // vertical line
  return 0;
};

/**
 * Returns a number whose sign matches geom.edgeEval(u,v,w) but which
 * is cheaper to evaluate.  Returns > 0, == 0 , or < 0
 * as v is above, on, or below the edge uw.
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @param {libtess.GluVertex} w [description]
 * @return {number} double
 */
libtess.geom.edgeSign = function(u, v, w) {
  var gapL, gapR;

  libtess.assert(libtess.geom.vertLeq(u, v) && libtess.geom.vertLeq(v, w));
  
  gapL = v.s - u.s;
  gapR = w.s - v.s;

  if (gapL + gapR > 0) {
    return (v.t - w.t) * gapL + (v.t - u.t) * gapR;
  }

  // vertical line
  return 0;
};

/**
 * Version of VertLeq with s and t transposed.
 * Returns true if u is lexicographically <= v.
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @return {boolean}
 */
libtess.geom.transLeq = function(u, v) {
  return (u.t < v.t) || (u.t === v.t && u.s <= v.s);
};

/**
 * Version of geom.edgeEval with s and t transposed.
 * Given three vertices u,v,w such that geom.transLeq(u,v) && geom.transLeq(v,w),
 * evaluates the t-coord of the edge uw at the s-coord of the vertex v.
 * Returns v.s - (uw)(v.t), ie. the signed distance from uw to v.
 * If uw is vertical (and thus passes thru v), the result is zero.
 *
 * The calculation is extremely accurate and stable, even when v
 * is very close to u or w.  In particular if we set v.s = 0 and
 * let r be the negated result (this evaluates (uw)(v.t)), then
 * r is guaranteed to satisfy MIN(u.s,w.s) <= r <= MAX(u.s,w.s).
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @param {libtess.GluVertex} w [description]
 * @return {number} double
 */
libtess.geom.transEval = function(u, v, w) {
  var gapL, gapR;

  libtess.assert(libtess.geom.transLeq(u, v) && libtess.geom.transLeq(v, w));
  
  gapL = v.t - u.t;
  gapR = w.t - v.t;

  if (gapL + gapR > 0) {
    if (gapL < gapR) {
      return (v.s - u.s) + (u.s - w.s) * (gapL / (gapL + gapR));
    } else {
      return (v.s - w.s) + (w.s - u.s) * (gapR / (gapL + gapR));
    }
  }

  // vertical line
  return 0;
};

/**
 * Version of geom.edgeSign with s and t transposed.
 * Returns a number whose sign matches geom.transEval(u,v,w) but which
 * is cheaper to evaluate.  Returns > 0, == 0 , or < 0
 * as v is above, on, or below the edge uw.
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @param {libtess.GluVertex} w [description]
 * @return {number} double
 */
libtess.geom.transSign = function(u, v, w) {
  var gapL, gapR;

  libtess.assert(libtess.geom.transLeq(u, v) && libtess.geom.transLeq(v, w));
  
  gapL = v.t - u.t;
  gapR = w.t - v.t;

  if (gapL + gapR > 0) {
    return (v.s - w.s) * gapL + (v.s - u.s) * gapR;
  }

  // vertical line
  return 0;
};

/**
 * [edgeGoesLeft description]
 *
 * @param {libtess.GluHalfEdge} e [description]
 * @return {boolean} [description]
 */
libtess.geom.edgeGoesLeft = function(e) {
  return libtess.geom.vertLeq(e.dst(), e.org);
};

/**
 * [edgeGoesRight description]
 *
 * @param {libtess.GluHalfEdge} e [description]
 * @return {boolean} [description]
 */
libtess.geom.edgeGoesRight = function(e) {
  return libtess.geom.vertLeq(e.org, e.dst());
};

/**
 * [vertL1dist description]
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @return {number} [description]
 */
libtess.geom.vertL1dist = function(u, v) {
  return Math.abs(u.s - v.s) + Math.abs(u.t - v.t);
};

/**
 * For almost-degenerate situations, the results are not reliable.
 * Unless the floating-point arithmetic can be performed without
 * rounding errors, *any* implementation will give incorrect results
 * on some degenerate inputs, so the client must have some way to
 * handle this situation.
 *
 * @param {libtess.GluVertex} u [description]
 * @param {libtess.GluVertex} v [description]
 * @param {libtess.GluVertex} w [description]
 * @return {boolean}
 */
libtess.geom.vertCCW = function(u, v, w) {
  return (u.s*(v.t - w.t) + v.s*(w.t - u.t) + w.s*(u.t - v.t)) >= 0;
};

/**
 * Given parameters a,x,b,y returns the value (b*x+a*y)/(a+b),
 * or (x+y)/2 if a==b==0. It requires that a,b >= 0, and enforces
 * this in the rare case that one argument is slightly negative.
 * The implementation is extremely stable numerically.
 * In particular it guarantees that the result r satisfies
 * MIN(x,y) <= r <= MAX(x,y), and the results are very accurate
 * even when a and b differ greatly in magnitude.
 *
 * @private
 * @param {number} a [description]
 * @param {number} x [description]
 * @param {number} b [description]
 * @param {number} y [description]
 * @return {number} [description]
 */
libtess.geom.interpolate_ = function(a, x, b, y) {
  //(a = (a < 0) ? 0 : a, b = (b < 0) ? 0 : b, ((a <= b) ? ((b == 0) ? ((x+y) / 2) : (x + (y-x) * (a/(a+b)))) : (y + (x-y) * (b/(a+b)))))
  a = (a < 0) ? 0 : a;
  b = (b < 0) ? 0 : b;

  if (a <= b) {
    if (b === 0) {
      return (x+y) / 2;
    } else {
      return x + (y-x) * (a/(a+b));
    }
  } else {
    return y + (x-y) * (b/(a+b));
  }
};

/**
 * Given edges (o1,d1) and (o2,d2), compute their point of intersection.
 * The computed point is guaranteed to lie in the intersection of the
 * bounding rectangles defined by each edge.
 *
 * @param {libtess.GluVertex} o1 [description]
 * @param {libtess.GluVertex} d1 [description]
 * @param {libtess.GluVertex} o2 [description]
 * @param {libtess.GluVertex} d2 [description]
 * @param {libtess.GluVertex} v  output
 */
libtess.geom.edgeIntersect = function(o1, d1, o2, d2, v) {
  /* This is certainly not the most efficient way to find the intersection
   * of two line segments, but it is very numerically stable.
   *
   * Strategy: find the two middle vertices in the VertLeq ordering,
   * and interpolate the intersection s-value from these.  Then repeat
   * using the TransLeq ordering to find the intersection t-value.
   */
  var z1, z2;
  var tmp;
  
  if (!libtess.geom.vertLeq(o1, d1)) {
    // Swap(o1, d1);
    tmp = o1;
    o1 = d1;
    d1 = tmp;
  }
  if (!libtess.geom.vertLeq(o2, d2)) {
    // Swap(o2, d2);
    tmp = o2;
    o2 = d2;
    d2 = tmp;
  }
  if (!libtess.geom.vertLeq(o1, o2)) {
    // Swap(o1, o2);
    tmp = o1;
    o1 = o2;
    o2 = tmp;
    // Swap(d1, d2);
    tmp = d1;
    d1 = d2;
    d2 = tmp;
  }

  if (!libtess.geom.vertLeq(o2, d1)) {
    // Technically, no intersection -- do our best
    v.s = (o2.s + d1.s) / 2;

  } else if (libtess.geom.vertLeq(d1, d2)) {
    // Interpolate between o2 and d1
    z1 = libtess.geom.edgeEval(o1, o2, d1);
    z2 = libtess.geom.edgeEval(o2, d1, d2);
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2; }
    v.s = libtess.geom.interpolate_(z1, o2.s, z2, d1.s);

  } else {
    // Interpolate between o2 and d2
    z1 = libtess.geom.edgeSign(o1, o2, d1);
    z2 = -libtess.geom.edgeSign(o1, d2, d1);
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2; }
    v.s = libtess.geom.interpolate_(z1, o2.s, z2, d2.s);
  }

  // Now repeat the process for t
  if (!libtess.geom.transLeq(o1, d1)) {
    // Swap(o1, d1);
    tmp = o1;
    o1 = d1;
    d1 = tmp;
  }
  if (!libtess.geom.transLeq(o2, d2)) {
    // Swap(o2, d2);
    tmp = o2;
    o2 = d2;
    d2 = tmp;
  }
  if (!libtess.geom.transLeq(o1, o2)) {
    // Swap(o1, o2);
    tmp = o1;
    o1 = o2;
    o2 = tmp;
    // Swap(d1, d2);
    tmp = d1;
    d1 = d2;
    d2 = tmp;
  }

  if (!libtess.geom.transLeq(o2, d1)) {
    // Technically, no intersection -- do our best
    v.t = (o2.t + d1.t) / 2;

  } else if (libtess.geom.transLeq(d1, d2)) {
    // Interpolate between o2 and d1
    z1 = libtess.geom.transEval(o1, o2, d1);
    z2 = libtess.geom.transEval(o2, d1, d2);
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2; }
    v.t = libtess.geom.interpolate_(z1, o2.t, z2, d1.t);

  } else {
    // Interpolate between o2 and d2
    z1 = libtess.geom.transSign(o1, o2, d1);
    z2 = -libtess.geom.transSign(o1, d2, d1);
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2; }
    v.t = libtess.geom.interpolate_(z1, o2.t, z2, d2.t);
  }
};


// require libtess
// require libtess.GluTesselator
/*global libtess */

libtess.normal = function() {

};

// TODO(bckenny): NOTE:
/* The "feature merging" is not intended to be complete.  There are
 * special cases where edges are nearly parallel to the sweep line
 * which are not implemented.  The algorithm should still behave
 * robustly (ie. produce a reasonable tesselation) in the presence
 * of such edges, however it may miss features which could have been
 * merged.  We could minimize this effect by choosing the sweep line
 * direction to be something unusual (ie. not parallel to one of the
 * coordinate axes).
 */
/*#if defined(SLANTED_SWEEP)
#define S_UNIT_X  0.50941539564955385 // Pre-normalized
#define S_UNIT_Y  0.86052074622010633
#endif
 */
/**
 * @type {number}
 * @private
 * @const
 */
libtess.normal.S_UNIT_X_ = 1.0;

/**
 * @type {number}
 * @private
 * @const
 */
libtess.normal.S_UNIT_Y_ = 0.0;

/**
 * projectPolygon determines the polygon normal
 * and projects vertices onto the plane of the polygon.
 *
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.normal.projectPolygon = function(tess) {
  var computedNormal = false;
  
  var norm = [0, 0, 0];
  norm[0] = tess.normal[0]; // TODO(bckenny): better way to init these?
  norm[1] = tess.normal[1];
  norm[2] = tess.normal[2];
  if (norm[0] === 0 && norm[1] === 0 && norm[2] === 0) {
    libtess.normal.computeNormal_(tess, norm);
    computedNormal = true;
  }

  var sUnit = tess.sUnit;
  var tUnit = tess.tUnit;
  var i = libtess.normal.longAxis_(norm);

  if (libtess.TRUE_PROJECT) {
    // Choose the initial sUnit vector to be approximately perpendicular
    // to the normal.
    libtess.normal.normalize_(norm);

    sUnit[i] = 0;
    sUnit[(i+1)%3] = libtess.normal.S_UNIT_X_;
    sUnit[(i+2)%3] = libtess.normal.S_UNIT_Y_;

    // Now make it exactly perpendicular
    var w = libtess.normal.dot_(sUnit, norm);
    sUnit[0] -= w * norm[0];
    sUnit[1] -= w * norm[1];
    sUnit[2] -= w * norm[2];
    libtess.normal.normalize_(sUnit);

    // Choose tUnit so that (sUnit,tUnit,norm) form a right-handed frame
    tUnit[0] = norm[1]*sUnit[2] - norm[2]*sUnit[1];
    tUnit[1] = norm[2]*sUnit[0] - norm[0]*sUnit[2];
    tUnit[2] = norm[0]*sUnit[1] - norm[1]*sUnit[0];
    libtess.normal.normalize_(tUnit);

  } else {
    // Project perpendicular to a coordinate axis -- better numerically
    sUnit[i] = 0;
    sUnit[(i+1)%3] = libtess.normal.S_UNIT_X_;
    sUnit[(i+2)%3] = libtess.normal.S_UNIT_Y_;
    
    tUnit[i] = 0;
    tUnit[(i+1)%3] = (norm[i] > 0) ? -libtess.normal.S_UNIT_Y_ : libtess.normal.S_UNIT_Y_;
    tUnit[(i+2)%3] = (norm[i] > 0) ? libtess.normal.S_UNIT_X_ : -libtess.normal.S_UNIT_X_;
  }

  // Project the vertices onto the sweep plane
  var vHead = tess.mesh.vHead;
  for (var v = vHead.next; v !== vHead; v = v.next) {
    v.s = libtess.normal.dot_(v.coords, sUnit);
    v.t = libtess.normal.dot_(v.coords, tUnit);
  }

  if (computedNormal) {
    libtess.normal.checkOrientation_(tess);
  }
};

/**
 * Dot product.
 * @private
 * @param {Array.<number>} u [description]
 * @param {Array.<number>} v [description]
 * @return {number} [description]
 */
libtess.normal.dot_ = function(u, v) {
  return u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
};

/**
 * Normalize vector v
 * @private
 * @param {Array.<number>} v [description]
 */
libtess.normal.normalize_ = function(v) {
  var len = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];

  libtess.assert(len > 0);
  len = Math.sqrt(len);
  v[0] /= len;
  v[1] /= len;
  v[2] /= len;
};

/**
 * Returns the index of the longest component of vector v.
 * @private
 * @param {Array.<number>} v [description]
 * @return {number} The index of the longest component.
 */
libtess.normal.longAxis_ = function(v) {
  var i = 0;

  if (Math.abs(v[1]) > Math.abs(v[0])) {
    i = 1;
  }
  if (Math.abs(v[2]) > Math.abs(v[i])) {
    i = 2;
  }

  return i;
};

/**
 * [computeNormal description]
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 * @param {Array.<number>} norm [description]
 */
libtess.normal.computeNormal_ = function(tess, norm) {
  // TODO(bckenny): better way to init these
  // TODO(bckenny): can pool these, but only called once per poly
  var maxVal = [0, 0, 0];
  var minVal = [0, 0, 0];
  var d1 = [0, 0, 0];
  var d2 = [0, 0, 0];
  var tNorm = [0, 0, 0];

  maxVal[0] = maxVal[1] = maxVal[2] = -2 * libtess.GLU_TESS_MAX_COORD;
  minVal[0] = minVal[1] = minVal[2] = 2 * libtess.GLU_TESS_MAX_COORD;

  // TODO(bckenny): better way to init these
  var maxVert = new Array(3);
  var minVert = new Array(3);

  var i;
  var v;
  var vHead = tess.mesh.vHead;
  for (v = vHead.next; v !== vHead; v = v.next) {
    for (i = 0; i < 3; ++i) {
      var c = v.coords[i];
      if (c < minVal[i]) { minVal[i] = c; minVert[i] = v; }
      if (c > maxVal[i]) { maxVal[i] = c; maxVert[i] = v; }
    }
  }

  // Find two vertices separated by at least 1/sqrt(3) of the maximum
  // distance between any two vertices
  i = 0;
  if (maxVal[1] - minVal[1] > maxVal[0] - minVal[0]) { i = 1; }
  if (maxVal[2] - minVal[2] > maxVal[i] - minVal[i]) { i = 2; }
  if (minVal[i] >= maxVal[i]) {
    // All vertices are the same -- normal doesn't matter
    norm[0] = 0; norm[1] = 0; norm[2] = 1;
    return;
  }

  // Look for a third vertex which forms the triangle with maximum area
  // (Length of normal == twice the triangle area)
  var maxLen2 = 0;
  var v1 = minVert[i];
  var v2 = maxVert[i];
  d1[0] = v1.coords[0] - v2.coords[0];
  d1[1] = v1.coords[1] - v2.coords[1];
  d1[2] = v1.coords[2] - v2.coords[2];
  for (v = vHead.next; v !== vHead; v = v.next) {
    d2[0] = v.coords[0] - v2.coords[0];
    d2[1] = v.coords[1] - v2.coords[1];
    d2[2] = v.coords[2] - v2.coords[2];
    tNorm[0] = d1[1]*d2[2] - d1[2]*d2[1];
    tNorm[1] = d1[2]*d2[0] - d1[0]*d2[2];
    tNorm[2] = d1[0]*d2[1] - d1[1]*d2[0];
    var tLen2 = tNorm[0]*tNorm[0] + tNorm[1]*tNorm[1] + tNorm[2]*tNorm[2];
    if (tLen2 > maxLen2) {
      maxLen2 = tLen2;
      norm[0] = tNorm[0];
      norm[1] = tNorm[1];
      norm[2] = tNorm[2];
    }
  }

  if (maxLen2 <= 0) {
    // All points lie on a single line -- any decent normal will do
    norm[0] = norm[1] = norm[2] = 0;
    norm[libtess.normal.longAxis_(d1)] = 1;
  }
};

/**
 * [checkOrientation description]
 *
 * @private
 * @param {libtess.GluTesselator} tess [description]
 */
libtess.normal.checkOrientation_ = function(tess) {
  // When we compute the normal automatically, we choose the orientation
  // so that the the sum of the signed areas of all contours is non-negative.
  var area = 0;
  var fHead = tess.mesh.fHead;
  for (var f = fHead.next; f !== fHead; f = f.next) {
    var e = f.anEdge;
    if (e.winding <= 0) { continue; }
    do {
      area += (e.org.s - e.dst().s) * (e.org.t + e.dst().t);
      e = e.lNext;
    } while(e !== f.anEdge);
  }

  if (area < 0) {
    // Reverse the orientation by flipping all the t-coordinates
    var vHead = tess.mesh.vHead;
    for (var v = vHead.next; v !== vHead; v = v.next) {
      v.t = - v.t;
    }
    tess.tUnit[0] = -tess.tUnit[0];
    tess.tUnit[1] = -tess.tUnit[1];
    tess.tUnit[2] = -tess.tUnit[2];
  }
};

// require libtess
// require libtess.geom
// require libtess.GluFace
// require libtess.GluMesh
/*global libtess */

libtess.tessmono = function() {

};

/**
 * tessellateMonoRegion(face) tessellates a monotone region
 * (what else would it do??). The region must consist of a single
 * loop of half-edges (see mesh.js) oriented CCW. "Monotone" in this
 * case means that any vertical line intersects the interior of the
 * region in a single interval.
 *
 * Tessellation consists of adding interior edges (actually pairs of
 * half-edges), to split the region into non-overlapping triangles.
 * @private
 * @param {libtess.GluFace} face [description]
 */
libtess.tessmono.tessellateMonoRegion_ = function(face) {
  /* The basic idea is explained in Preparata and Shamos (which I don''t
   * have handy right now), although their implementation is more
   * complicated than this one. The are two edge chains, an upper chain
   * and a lower chain.  We process all vertices from both chains in order,
   * from right to left.
   *
   * The algorithm ensures that the following invariant holds after each
   * vertex is processed: the untessellated region consists of two
   * chains, where one chain (say the upper) is a single edge, and
   * the other chain is concave. The left vertex of the single edge
   * is always to the left of all vertices in the concave chain.
   *
   * Each step consists of adding the rightmost unprocessed vertex to one
   * of the two chains, and forming a fan of triangles from the rightmost
   * of two chain endpoints. Determining whether we can add each triangle
   * to the fan is a simple orientation test.  By making the fan as large
   * as possible, we restore the invariant (check it yourself).
   *
   * All edges are oriented CCW around the boundary of the region.
   * First, find the half-edge whose origin vertex is rightmost.
   * Since the sweep goes from left to right, face.anEdge should
   * be close to the edge we want.
   */

  var up = face.anEdge;
  libtess.assert(up.lNext !== up && up.lNext.lNext !== up);

  for (; libtess.geom.vertLeq(up.dst(), up.org); up = up.lPrev()) { }
  for (; libtess.geom.vertLeq(up.org, up.dst()); up = up.lNext) { }
  
  var lo = up.lPrev();

  var tempHalfEdge;
  while (up.lNext !== lo) {
    if (libtess.geom.vertLeq(up.dst(), lo.org)) {
      // up.dst() is on the left. It is safe to form triangles from lo.org.
      // The edgeGoesLeft test guarantees progress even when some triangles
      // are CW, given that the upper and lower chains are truly monotone.
      while (lo.lNext !== up && (libtess.geom.edgeGoesLeft(lo.lNext) ||
          libtess.geom.edgeSign(lo.org, lo.dst(), lo.lNext.dst()) <= 0)) {
        
        tempHalfEdge = libtess.mesh.connect(lo.lNext, lo);
        lo = tempHalfEdge.sym;
      }
      lo = lo.lPrev();

    } else {
      // lo.org is on the left. We can make CCW triangles from up.dst().
      while (lo.lNext !== up && (libtess.geom.edgeGoesRight(up.lPrev()) ||
          libtess.geom.edgeSign(up.dst(), up.org, up.lPrev().org) >= 0)) {
  
        tempHalfEdge = libtess.mesh.connect(up, up.lPrev());
        up = tempHalfEdge.sym;
      }
      up = up.lNext;
    }
  }

  // Now lo.org == up.dst() == the leftmost vertex. The remaining region
  // can be tessellated in a fan from this leftmost vertex.
  libtess.assert(lo.lNext !== up);
  while (lo.lNext.lNext !== up) {
    tempHalfEdge = libtess.mesh.connect(lo.lNext, lo);
    lo = tempHalfEdge.sym;
  }
};

/**
 * tessellateInterior(mesh) tessellates each region of
 * the mesh which is marked "inside" the polygon. Each such region
 * must be monotone.
 *
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.tessmono.tessellateInterior = function(mesh) {
  var next;
  for (var f = mesh.fHead.next; f !== mesh.fHead; f = next) {
    // Make sure we don''t try to tessellate the new triangles.
    next = f.next;
    if (f.inside) {
      libtess.tessmono.tessellateMonoRegion_(f);
    }
  }
};

/**
 * discardExterior(mesh) zaps (ie. sets to null) all faces
 * which are not marked "inside" the polygon. Since further mesh operations
 * on null faces are not allowed, the main purpose is to clean up the
 * mesh so that exterior loops are not represented in the data structure.
 *
 * @param {libtess.GluMesh} mesh [description]
 */
libtess.tessmono.discardExterior = function(mesh) {
  var next;
  for (var f = mesh.fHead.next; f !== mesh.fHead; f = next) {
    // Since f will be destroyed, save its next pointer.
    next = f.next;
    if (!f.inside) {
      libtess.mesh.zapFace(f);
    }
  }
};

/**
 * setWindingNumber(mesh, value, keepOnlyBoundary) resets the
 * winding numbers on all edges so that regions marked "inside" the
 * polygon have a winding number of "value", and regions outside
 * have a winding number of 0.
 *
 * If keepOnlyBoundary is true, it also deletes all edges which do not
 * separate an interior region from an exterior one.
 *
 * @param {libtess.GluMesh} mesh [description]
 * @param {number} value Winding number to set (int).
 */
libtess.tessmono.setWindingNumber = function(mesh, value, keepOnlyBoundary) {
  var eNext;
  for (var e = mesh.eHead.next; e !== mesh.eHead; e = eNext) {
    eNext = e.next;

    if (e.rFace().inside !== e.lFace.inside) {
      // This is a boundary edge (one side is interior, one is exterior).
      e.winding = (e.lFace.inside) ? value : -value;
    
    } else {
      // Both regions are interior, or both are exterior.
      if (!keepOnlyBoundary) {
        e.winding = 0;

      } else {
        libtess.mesh.deleteEdge(e);
      }
    }
  }
};
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  Symbol.iterator = Symbol();
  freeze(SymbolValue.prototype);
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name] && !privateNames[name])
        rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (privateNames[name])
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    createPrivateName: createPrivateName,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    privateNames: privateNames,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toObject: toObject,
    isObject: isObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf,
    checkObjectCoercible: checkObjectCoercible,
    hasOwnProperty: function(o, p) {
      return hasOwnProperty.call(o, p);
    },
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    keys: $keys
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        return this.value_ = this.func.call(global);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/utils";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Map";
  var $__3 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isObject = $__3.isObject,
      maybeAddIterator = $__3.maybeAddIterator,
      registerPolyfill = $__3.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__5 = iterable[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__7 = $__6.value,
            key = $__7[0],
            value = $__7[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__8() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__8, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__9() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__9, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__10() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__7 = global,
        Object = $__7.Object,
        Symbol = $__7.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Map" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Set";
  var $__11 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isObject = $__11.isObject,
      maybeAddIterator = $__11.maybeAddIterator,
      registerPolyfill = $__11.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Map").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__15 = iterable[Symbol.iterator](),
          $__16; !($__16 = $__15.next()).done; ) {
        var item = $__16.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__13 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__13);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__18() {
      var $__19,
          $__20;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__19 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__20 = $__19[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__20.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__20.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__20.value;
            default:
              return $ctx.end();
          }
      }, $__18, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__21() {
      var $__22,
          $__23;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__22 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__23 = $__22[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__23.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__23.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__23.value;
            default:
              return $ctx.end();
          }
      }, $__21, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__17 = global,
        Object = $__17.Object,
        Symbol = $__17.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Set" + '');
System.register("traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Promise" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator", [], function() {
  "use strict";
  var $__29;
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator";
  var $__27 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      createIteratorResultObject = $__27.createIteratorResultObject,
      isObject = $__27.isObject;
  var $__30 = $traceurRuntime,
      hasOwnProperty = $__30.hasOwnProperty,
      toProperty = $__30.toProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__29 = {}, Object.defineProperty($__29, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__29, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__29), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/String";
  var createStringIterator = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator").createStringIterator;
  var $__32 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__32.maybeAddFunctions,
      maybeAddIterator = $__32.maybeAddIterator,
      registerPolyfill = $__32.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/String" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__36;
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator";
  var $__34 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      toObject = $__34.toObject,
      toUint32 = $__34.toUint32,
      createIteratorResultObject = $__34.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__36 = {}, Object.defineProperty($__36, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__36, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__36), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Array";
  var $__37 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator"),
      entries = $__37.entries,
      keys = $__37.keys,
      values = $__37.values;
  var $__38 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      checkIterable = $__38.checkIterable,
      isCallable = $__38.isCallable,
      isConstructor = $__38.isConstructor,
      maybeAddFunctions = $__38.maybeAddFunctions,
      maybeAddIterator = $__38.maybeAddIterator,
      registerPolyfill = $__38.registerPolyfill,
      toInteger = $__38.toInteger,
      toLength = $__38.toLength,
      toObject = $__38.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__39 = items[Symbol.iterator](),
          $__40; !($__40 = $__39.next()).done; ) {
        var item = $__40.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__41 = 0; $__41 < arguments.length; $__41++)
      items[$__41] = arguments[$__41];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      if (i in object) {
        var value = object[i];
        if (predicate.call(thisArg, value, i, object)) {
          return returnIndex ? i : value;
        }
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__42 = global,
        Array = $__42.Array,
        Object = $__42.Object,
        Symbol = $__42.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Array" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Object";
  var $__43 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__43.maybeAddFunctions,
      registerPolyfill = $__43.registerPolyfill;
  var $__44 = $traceurRuntime,
      defineProperty = $__44.defineProperty,
      getOwnPropertyDescriptor = $__44.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__44.getOwnPropertyNames,
      keys = $__44.keys,
      privateNames = $__44.privateNames;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (privateNames[name])
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (privateNames[name])
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Object" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Number";
  var $__46 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isNumber = $__46.isNumber,
      maybeAddConsts = $__46.maybeAddConsts,
      maybeAddFunctions = $__46.maybeAddFunctions,
      registerPolyfill = $__46.registerPolyfill,
      toInteger = $__46.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Number" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/polyfills";
  var polyfillAll = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils").polyfillAll;
  polyfillAll(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/polyfills" + '');
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
var TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":2,"ieee754":3}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],4:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.1.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function() {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = window;
    }    
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

var mat2Identity = new Float32Array([
    1, 0,
    0, 1
]);

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

var mat2dIdentity = new Float32Array([
    1, 0,
    0, 1,
    0, 0
]);

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

var mat3Identity = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]);

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[2];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;

    out[3] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz + wx;

    out[6] = xz + wy;
    out[7] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

var mat4Identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

var quatIdentity = new Float32Array([0, 0, 0, 1]);

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (out !== a) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            out[3] = aw;
        }
        return out;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        out[0] = (ax * 0.5 + bx * 0.5);
        out[1] = (ay * 0.5 + by * 0.5);
        out[2] = (az * 0.5 + bz * 0.5);
        out[3] = (aw * 0.5 + bw * 0.5);
        return out;
    }

    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[0] = (ax * ratioA + bx * ratioB);
    out[1] = (ay * ratioA + by * ratioB);
    out[2] = (az * ratioA + bz * ratioB);
    out[3] = (aw * ratioA + bw * ratioB);

    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    var s_iNext = [1,2,0];
    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})();

},{}],5:[function(require,module,exports){
(function() {
  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}

  queue.version = "1.0.7";
  if (typeof define === "function" && define.amd) define(function() { return queue; });
  else if (typeof module === "object" && module.exports) module.exports = queue;
  else this.queue = queue;
})();

},{}],6:[function(require,module,exports){
'use strict';

var VectorTileLayer = require('./vectortilelayer');
var Protobuf = require('pbf');

module.exports = VectorTile;
function VectorTile(buffer, end) {
    if (!(buffer instanceof Protobuf)) {
        buffer = new Protobuf(buffer);
    }

    // Public
    this.layers = {};

    // Private
    this._buffer = buffer;

    var val, tag;
    if (typeof end === 'undefined') end = buffer.length;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;
        if (tag == 3) {
            var layer = this.readLayer();
            if (layer.length) {
                this.layers[layer.name] = layer;
            }
        } else {
            // console.warn('skipping tile tag ' + tag);
            buffer.skip(val);
        }
    }
}

VectorTile.prototype.readLayer = function() {
    var buffer = this._buffer;

    var bytes = buffer.readVarint();
    var end = buffer.pos + bytes;
    var layer = new VectorTileLayer(buffer, end);
    buffer.pos = end;
    return layer;
};

// Returns a dictionary of layers as individual GeoJSON feature collections, keyed by layer name
VectorTile.prototype.toGeoJSON = function () {
    var json = {};
    var layerNames = Object.keys(this.layers);

    for (var n=0; n < layerNames.length; n++) {
        json[layerNames[n]] = this.layers[layerNames[n]].toGeoJSON();
    }

    return json;
};

},{"./vectortilelayer":8,"pbf":9}],7:[function(require,module,exports){
'use strict';

/*
 * Construct a new vector tile feature given a buffer.
 *
 * @param {object} buffer
 * @param {number} [end]
 * @param {extent}
 * @param {object} keys
 * @param {object} values
 */
module.exports = VectorTileFeature;
function VectorTileFeature(buffer, end, extent, keys, values) {
    // Public
    this._extent = extent;
    this._type = 0;
    this._keys = keys;

    // Private
    this._buffer = buffer;
    this._geometry = -1;

    if (typeof end === 'undefined') {
        end = buffer.length;
    }

    var val, tag;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            this._id = buffer.readVarint();
        } else if (tag == 2) {
            var tag_end = buffer.pos + buffer.readVarint();
            while (buffer.pos < tag_end) {
                var key = keys[buffer.readVarint()];
                var value = values[buffer.readVarint()];
                this[key] = value;
            }
        } else if (tag == 3) {
            this._type = buffer.readVarint();
        } else if (tag == 4) {
            this._geometry = buffer.pos;
            buffer.skip(val);
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileFeature.Unknown = 0;
VectorTileFeature.Point = 1;
VectorTileFeature.LineString = 2;
VectorTileFeature.Polygon = 3;


VectorTileFeature.mapping = [];
VectorTileFeature.mapping[VectorTileFeature.Point] = 'point';
VectorTileFeature.mapping[VectorTileFeature.LineString] = 'line';
VectorTileFeature.mapping[VectorTileFeature.Polygon] = 'fill';


VectorTileFeature.prototype.loadGeometry = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint();
    var end = buffer.pos + bytes;
    var cmd = 1, length = 0, x = 0, y = 0;

    var lines = [];
    var line = null;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd == 1 || cmd == 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();

            if (cmd == 1) {
                // moveTo
                if (line) {
                    lines.push(line);
                }
                line = [];
            }

            line.push({ x: x, y: y });
        } else if (cmd == 7) {
            // closePolygon
            line.push(line[0]);
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) {
        lines.push(line);
    }

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint();
    var end = buffer.pos + bytes;
    var cmd = 1, length = 0, x = 0, y = 0;

    var x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd == 1 || cmd == 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;
        } else if (cmd != 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function () {
    var geojson = {
        type: 'Feature',
        geometry: {},
        properties: {}
    };

    for (var k=0; k < this._keys.length; k++) {
        var key = this._keys[k];
        geojson.properties[key] = this[key];
    }

    geojson.geometry.coordinates = this.loadGeometry();
    for (var r=0; r < geojson.geometry.coordinates.length; r++) {
        var ring = geojson.geometry.coordinates[r];
        for (var c=0; c < ring.length; c++) {
            ring[c] = [
                ring[c].x,
                ring[c].y
            ];
        }
    }

    if (this._type == VectorTileFeature.Point) {
        geojson.geometry.type = 'Point';
    }
    else if (this._type == VectorTileFeature.LineString) {
        if (geojson.geometry.coordinates.length == 1) {
            geojson.geometry.coordinates = geojson.geometry.coordinates[0];
            geojson.geometry.type = 'LineString';
        }
        else {
            geojson.geometry.type = 'MultiLineString';
        }
    }
    else if (this._type == VectorTileFeature.Polygon) {
        geojson.geometry.type = 'Polygon';
    }

    return geojson;
};

},{}],8:[function(require,module,exports){
'use strict';

var VectorTileFeature = require('./vectortilefeature.js');

module.exports = VectorTileLayer;
function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    var val, tag;
    if (typeof end === 'undefined') end = buffer.length;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;
        if (tag == 15) {
            this.version = buffer.readVarint();
        } else if (tag == 1) {
            this.name = buffer.readString();
        } else if (tag == 5) {
            this.extent = buffer.readVarint();
        } else if (tag == 2) {
            this.length++;
            this._features.push(buffer.pos);
            buffer.skip(val);
        } else if (tag == 3) {
            this._keys.push(buffer.readString());
        } else if (tag == 4) {
            this._values.push(this.readFeatureValue());
        } else {
            console.warn('skipping layer tag ' + tag);
            buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function() {
    var buffer = this._buffer;
    var value = null;

    var bytes = buffer.readVarint();
    var val, tag;
    var end = buffer.pos + bytes;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            value = buffer.readString();
        } else if (tag == 2) {
            throw new Error('read float');
        } else if (tag == 3) {
            value = buffer.readDouble();
        } else if (tag == 4) {
            value = buffer.readVarint();
        } else if (tag == 5) {
            throw new Error('read uint');
        } else if (tag == 6) {
            value = buffer.readSVarint();
        } else if (tag == 7) {
            value = Boolean(buffer.readVarint());
        } else {
            buffer.skip(val);
        }
    }

    return value;
};

/*
 * Return feature `i` from this layer as a `VectorTileFeature`
 *
 * @param {number} i
 * @returns {VectorTileFeature}
 */
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) {
        throw new Error('feature index out of bounds');
    }

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;
    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};

VectorTileLayer.prototype.toGeoJSON = function () {
    var geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (var f=0; f < this.length; f++) {
        geojson.features.push(this.feature(f).toGeoJSON());
    }

    return geojson;
};

},{"./vectortilefeature.js":7}],9:[function(require,module,exports){
(function (Buffer){
'use strict';

var ieee754 = require('ieee754');

module.exports = Protobuf;
function Protobuf(buf) {
    this.buf = buf;
    this.pos = 0;
}

Protobuf.prototype = {
    get length() { return this.buf.length; }
};

Protobuf.Varint = 0;
Protobuf.Int64 = 1;
Protobuf.Message = 2;
Protobuf.String = 2;
Protobuf.Packed = 2;
Protobuf.Int32 = 5;

Protobuf.prototype.destroy = function() {
    this.buf = null;
};

// === READING =================================================================

Protobuf.prototype.readUInt32 = function() {
    var val = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return val;
};

Protobuf.prototype.readUInt64 = function() {
    var val = this.buf.readUInt64LE(this.pos);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readDouble = function() {
    var val = ieee754.read(this.buf, this.pos, true, 52, 8);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readVarint = function() {
    // TODO: bounds checking
    var pos = this.pos;
    if (this.buf[pos] <= 0x7f) {
        this.pos++;
        return this.buf[pos];
    } else if (this.buf[pos + 1] <= 0x7f) {
        this.pos += 2;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] << 7);
    } else if (this.buf[pos + 2] <= 0x7f) {
        this.pos += 3;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2]) << 14;
    } else if (this.buf[pos + 3] <= 0x7f) {
        this.pos += 4;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21;
    } else if (this.buf[pos + 4] <= 0x7f) {
        this.pos += 5;
        return ((this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21) + (this.buf[pos + 4] * 268435456);
    } else {
        this.skip(Protobuf.Varint);
        return 0;
        // throw new Error("TODO: Handle 6+ byte varints");
    }
};

Protobuf.prototype.readSVarint = function() {
    var num = this.readVarint();
    if (num > 2147483647) throw new Error('TODO: Handle numbers >= 2^30');
    // zigzag encoding
    return ((num >> 1) ^ -(num & 1));
};

Protobuf.prototype.readString = function() {
    var bytes = this.readVarint();
    // TODO: bounds checking
    var chr = String.fromCharCode;
    var b = this.buf;
    var p = this.pos;
    var end = this.pos + bytes;
    var str = '';
    while (p < end) {
        if (b[p] <= 0x7F) str += chr(b[p++]);
        else if (b[p] <= 0xBF) throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
        else if (b[p] <= 0xDF) str += chr((b[p++] & 0x1F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xEF) str += chr((b[p++] & 0x1F) << 12 | (b[p++] & 0x3F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xF7) p += 4; // We can't handle these codepoints in JS, so skip.
        else if (b[p] <= 0xFB) p += 5;
        else if (b[p] <= 0xFD) p += 6;
        else throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
    }
    this.pos += bytes;
    return str;
};

Protobuf.prototype.readBuffer = function() {
    var bytes = this.readVarint();
    var buffer = this.buf.subarray(this.pos, this.pos + bytes);
    this.pos += bytes;
    return buffer;
};

Protobuf.prototype.readPacked = function(type) {
    // TODO: bounds checking
    var bytes = this.readVarint();
    var end = this.pos + bytes;
    var array = [];
    while (this.pos < end) {
        array.push(this['read' + type]());
    }
    return array;
};

Protobuf.prototype.skip = function(val) {
    // TODO: bounds checking
    var type = val & 0x7;
    switch (type) {
        /* varint */ case Protobuf.Varint: while (this.buf[this.pos++] > 0x7f); break;
        /* 64 bit */ case Protobuf.Int64: this.pos += 8; break;
        /* length */ case Protobuf.Message: var bytes = this.readVarint(); this.pos += bytes; break;
        /* 32 bit */ case Protobuf.Int32: this.pos += 4; break;
        default: throw new Error('Unimplemented type: ' + type);
    }
};

// === WRITING =================================================================

Protobuf.prototype.writeTag = function(tag, type) {
    this.writeVarint((tag << 3) | type);
};

Protobuf.prototype.realloc = function(min) {
    var length = this.buf.length;
    while (length < this.pos + min) length *= 2;
    if (length != this.buf.length) {
        var buf = new Buffer(length);
        this.buf.copy(buf);
        this.buf = buf;
    }
};

Protobuf.prototype.finish = function() {
    return this.buf.slice(0, this.pos);
};

Protobuf.prototype.writePacked = function(type, tag, items) {
    if (!items.length) return;

    var message = new Protobuf();
    for (var i = 0; i < items.length; i++) {
        message['write' + type](items[i]);
    }
    var data = message.finish();

    this.writeTag(tag, Protobuf.Packed);
    this.writeBuffer(data);
};

Protobuf.prototype.writeUInt32 = function(val) {
    this.realloc(4);
    this.buf.writeUInt32LE(val, this.pos);
    this.pos += 4;
};

Protobuf.prototype.writeTaggedUInt32 = function(tag, val) {
    this.writeTag(tag, Protobuf.Int32);
    this.writeUInt32(val);
};

Protobuf.prototype.writeVarint = function(val) {
    val = Number(val);
    if (isNaN(val)) {
        val = 0;
    }

    if (val <= 0x7f) {
        this.realloc(1);
        this.buf[this.pos++] = val;
    } else if (val <= 0x3fff) {
        this.realloc(2);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 7) & 0x7f);
    } else if (val <= 0x1ffffff) {
        this.realloc(3);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 7) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 14) & 0x7f);
    } else if (val <= 0xfffffff) {
        this.realloc(4);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 7) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 14) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 21) & 0x7f);
    } else {
        while (val > 0) {
            var b = val & 0x7f;
            val = Math.floor(val / 128);
            if (val > 0) b |= 0x80
            this.realloc(1);
            this.buf[this.pos++] = b;
        }
    }
};

Protobuf.prototype.writeTaggedVarint = function(tag, val) {
    this.writeTag(tag, Protobuf.Varint);
    this.writeVarint(val);
};

Protobuf.prototype.writeSVarint = function(val) {
    if (val >= 0) {
        this.writeVarint(val * 2);
    } else {
        this.writeVarint(val * -2 - 1);
    }
};

Protobuf.prototype.writeTaggedSVarint = function(tag, val) {
    this.writeTag(tag, Protobuf.Varint);
    this.writeSVarint(val);
};

Protobuf.prototype.writeBoolean = function(val) {
    this.writeVarint(Boolean(val));
};

Protobuf.prototype.writeTaggedBoolean = function(tag, val) {
    this.writeTaggedVarint(tag, Boolean(val));
};

Protobuf.prototype.writeString = function(str) {
    str = String(str);
    var bytes = Buffer.byteLength(str);
    this.writeVarint(bytes);
    this.realloc(bytes);
    this.buf.write(str, this.pos);
    this.pos += bytes;
};

Protobuf.prototype.writeTaggedString = function(tag, str) {
    this.writeTag(tag, Protobuf.String);
    this.writeString(str);
};

Protobuf.prototype.writeFloat = function(val) {
    this.realloc(4);
    this.buf.writeFloatLE(val, this.pos);
    this.pos += 4;
};

Protobuf.prototype.writeTaggedFloat = function(tag, val) {
    this.writeTag(tag, Protobuf.Int32);
    this.writeFloat(val);
};

Protobuf.prototype.writeDouble = function(val) {
    this.realloc(8);
    this.buf.writeDoubleLE(val, this.pos);
    this.pos += 8;
};

Protobuf.prototype.writeTaggedDouble = function(tag, val) {
    this.writeTag(tag, Protobuf.Int64);
    this.writeDouble(val);
};

Protobuf.prototype.writeBuffer = function(buffer) {
    var bytes = buffer.length;
    this.writeVarint(bytes);
    this.realloc(bytes);
    buffer.copy(this.buf, this.pos);
    this.pos += bytes;
};

Protobuf.prototype.writeTaggedBuffer = function(tag, buffer) {
    this.writeTag(tag, Protobuf.String);
    this.writeBuffer(buffer);
};

Protobuf.prototype.writeMessage = function(tag, protobuf) {
    var buffer = protobuf.finish();
    this.writeTag(tag, Protobuf.Message);
    this.writeBuffer(buffer);
};

}).call(this,require("buffer").Buffer)
},{"buffer":1,"ieee754":10}],10:[function(require,module,exports){
module.exports=require(3)
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  PerspectiveCamera: {get: function() {
      return PerspectiveCamera;
    }},
  IsometricCamera: {get: function() {
      return IsometricCamera;
    }},
  FlatCamera: {get: function() {
      return FlatCamera;
    }},
  __esModule: {value: true}
});
var Geo = require('./geo').Geo;
var GLProgram = require('./gl/gl_program').default;
var $__2 = require('gl-matrix'),
    mat4 = $__2.mat4,
    vec3 = $__2.vec3;
var Camera = function Camera(scene) {
  this.scene = scene;
};
($traceurRuntime.createClass)(Camera, {
  update: function() {},
  setupProgram: function(gl_program) {}
}, {create: function(scene, config) {
    switch (config.type) {
      case 'isometric':
        return new IsometricCamera(scene, config);
      case 'perspective':
        return new PerspectiveCamera(scene, config);
      case 'flat':
      default:
        return new FlatCamera(scene, config);
    }
  }});
var $__default = Camera;
var PerspectiveCamera = function PerspectiveCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $PerspectiveCamera.prototype, "constructor", [scene]);
  this.focal_length = 2.5;
  this.perspective_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_perspective;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_perspective * position; \n\
            }');
};
var $PerspectiveCamera = PerspectiveCamera;
($traceurRuntime.createClass)(PerspectiveCamera, {
  update: function() {
    var meter_zoom_y = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);
    var camera_height = meter_zoom_y / 2 * this.focal_length;
    var fov = Math.atan(1 / this.focal_length) * 2;
    var aspect = this.scene.view_aspect;
    var znear = 1;
    var zfar = (camera_height + znear) * 5;
    mat4.perspective(this.perspective_mat, fov, aspect, znear, zfar);
    mat4.translate(this.perspective_mat, this.perspective_mat, vec3.fromValues(0, 0, -camera_height));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_perspective', false, this.perspective_mat);
  }
}, {}, Camera);
var IsometricCamera = function IsometricCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $IsometricCamera.prototype, "constructor", [scene]);
  this.meter_view_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_meter_view;', 'vec2 isometric_axis = vec2(0., 1.);', 'float isometric_scale = 1.;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                position.xy += position.z * isometric_axis * isometric_scale / 1.; \n\
                                                                                    \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }');
};
var $IsometricCamera = IsometricCamera;
($traceurRuntime.createClass)(IsometricCamera, {
  update: function() {
    mat4.identity(this.meter_view_mat);
    mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
  }
}, {}, Camera);
var FlatCamera = function FlatCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $FlatCamera.prototype, "constructor", [scene]);
  this.meter_view_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_meter_view;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                                                                \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }');
};
var $FlatCamera = FlatCamera;
($traceurRuntime.createClass)(FlatCamera, {
  update: function() {
    mat4.identity(this.meter_view_mat);
    mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
  }
}, {}, Camera);


},{"./geo":12,"./gl/gl_program":17,"gl-matrix":4}],12:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Geo: {get: function() {
      return Geo;
    }},
  __esModule: {value: true}
});
var Point = require('./point').default;
var Geo = {};
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size;
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z = 0; z <= Geo.max_zoom; z++) {
  Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}
Geo.metersPerPixel = function(zoom) {
  return Geo.min_zoom_meters_per_pixel / Math.pow(2, zoom);
};
Geo.units_per_meter = [];
Geo.setTileScale = function(scale) {
  Geo.tile_scale = scale;
  Geo.units_per_pixel = Geo.tile_scale / Geo.tile_size;
  for (var z = 0; z <= Geo.max_zoom; z++) {
    Geo.units_per_meter[z] = Geo.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
  }
};
Geo.metersForTile = function(tile) {
  return Point((tile.x * Geo.tile_size * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x, ((tile.y * Geo.tile_size * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y);
};
Geo.metersToLatLng = function(meters) {
  var c = Point.copy(meters);
  c.x /= Geo.half_circumference_meters;
  c.y /= Geo.half_circumference_meters;
  c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;
  c.x *= 180;
  c.y *= 180;
  return c;
};
Geo.latLngToMeters = function(latlng) {
  var c = Point.copy(latlng);
  c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
  c.y = c.y * Geo.half_circumference_meters / 180;
  c.x = c.x * Geo.half_circumference_meters / 180;
  return c;
};
Geo.transformGeometry = function(geometry, transform) {
  if (geometry.type == 'Point') {
    return transform(geometry.coordinates);
  } else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
    return geometry.coordinates.map(transform);
  } else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
    return geometry.coordinates.map(function(coordinates) {
      return coordinates.map(transform);
    });
  } else if (geometry.type == 'MultiPolygon') {
    return geometry.coordinates.map(function(polygon) {
      return polygon.map(function(coordinates) {
        return coordinates.map(transform);
      });
    });
  }
  return {};
};
Geo.boxIntersect = function(b1, b2) {
  return !(b2.sw.x > b1.ne.x || b2.ne.x < b1.sw.x || b2.sw.y > b1.ne.y || b2.ne.y < b1.sw.y);
};
Geo.splitFeatureLines = function(feature, tolerance) {
  var tolerance = tolerance || 0.001;
  var tolerance_sq = tolerance * tolerance;
  var geom = feature.geometry;
  var lines;
  if (geom.type == 'MultiLineString') {
    lines = geom.coordinates;
  } else if (geom.type == 'LineString') {
    lines = [geom.coordinates];
  } else {
    return feature;
  }
  var split_lines = [];
  for (var s = 0; s < lines.length; s++) {
    var seg = lines[s];
    var split_seg = [];
    var last_coord = null;
    var keep;
    for (var c = 0; c < seg.length; c++) {
      var coord = seg[c];
      keep = true;
      if (last_coord != null) {
        var dist = (coord[0] - last_coord[0]) * (coord[0] - last_coord[0]) + (coord[1] - last_coord[1]) * (coord[1] - last_coord[1]);
        if (dist > tolerance_sq) {
          keep = false;
        }
      }
      if (keep == false) {
        split_lines.push(split_seg);
        split_seg = [];
      }
      split_seg.push(coord);
      last_coord = coord;
    }
    split_lines.push(split_seg);
    split_seg = [];
  }
  if (split_lines.length == 1) {
    geom.type = 'LineString';
    geom.coordinates = split_lines[0];
  } else {
    geom.type = 'MultiLineString';
    geom.coordinates = split_lines;
  }
  return feature;
};


},{"./point":21}],13:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GL: {get: function() {
      return GL;
    }},
  __esModule: {value: true}
});
var GL = {};
GL.getContext = function getContext(canvas) {
  var fullscreen = false;
  if (canvas == null) {
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = -1;
    document.body.appendChild(canvas);
    fullscreen = true;
  }
  var gl = canvas.getContext('experimental-webgl');
  if (!gl) {
    alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
    throw "Couldn't create WebGL context";
  }
  GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
  if (fullscreen == true) {
    window.addEventListener('resize', function() {
      GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    });
  }
  return gl;
};
GL.resizeCanvas = function(gl, width, height) {
  var device_pixel_ratio = window.devicePixelRatio || 1;
  gl.canvas.style.width = width + 'px';
  gl.canvas.style.height = height + 'px';
  gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};
GL.updateProgram = function GLupdateProgram(gl, program, vertex_shader_source, fragment_shader_source) {
  try {
    var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
    var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
  } catch (err) {
    console.log(err);
    return program;
  }
  gl.useProgram(null);
  if (program != null) {
    var old_shaders = gl.getAttachedShaders(program);
    for (var i = 0; i < old_shaders.length; i++) {
      gl.detachShader(program, old_shaders[i]);
    }
  } else {
    program = gl.createProgram();
  }
  if (vertex_shader == null || fragment_shader == null) {
    return program;
  }
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, fragment_shader);
  gl.deleteShader(vertex_shader);
  gl.deleteShader(fragment_shader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var program_error = "WebGL program error:\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" + "ERROR: " + gl.getError() + "\n\n" + "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" + "--- Fragment Shader ---\n" + fragment_shader_source;
    console.log(program_error);
    throw program_error;
  }
  return program;
};
GL.createShader = function GLcreateShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var shader_error = "WebGL shader error:\n" + (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader);
    throw shader_error;
  }
  return shader;
};
try {
  GL.tesselator = (function initTesselator() {
    var tesselator = new libtess.GluTesselator();
    function vertexCallback(data, polyVertArray) {
      if (tesselator.z != null) {
        polyVertArray.push([data[0], data[1], tesselator.z]);
      } else {
        polyVertArray.push([data[0], data[1]]);
      }
    }
    function combineCallback(coords, data, weight) {
      return coords;
    }
    function edgeCallback(flag) {}
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);
    tesselator.gluTessNormal(0, 0, 1);
    return tesselator;
  })();
  GL.triangulatePolygon = function GLTriangulate(contours, z) {
    var triangleVerts = [];
    GL.tesselator.z = z;
    GL.tesselator.gluTessBeginPolygon(triangleVerts);
    for (var i = 0; i < contours.length; i++) {
      GL.tesselator.gluTessBeginContour();
      var contour = contours[i];
      for (var j = 0; j < contour.length; j++) {
        var coords = [contour[j][0], contour[j][1], 0];
        GL.tesselator.gluTessVertex(coords, coords);
      }
      GL.tesselator.gluTessEndContour();
    }
    GL.tesselator.gluTessEndPolygon();
    return triangleVerts;
  };
} catch (e) {}
GL.addVertices = function(vertices, vertex_constants, vertex_data) {
  if (vertices == null) {
    return vertex_data;
  }
  vertex_constants = vertex_constants || [];
  for (var v = 0,
      vlen = vertices.length; v < vlen; v++) {
    vertex_data.push.apply(vertex_data, vertices[v]);
    vertex_data.push.apply(vertex_data, vertex_constants);
  }
  return vertex_data;
};
GL.addVerticesMultipleAttributes = function(dynamics, constants, vertex_data) {
  var dlen = dynamics.length;
  var vlen = dynamics[0].length;
  constants = constants || [];
  for (var v = 0; v < vlen; v++) {
    for (var d = 0; d < dlen; d++) {
      vertex_data.push.apply(vertex_data, dynamics[d][v]);
    }
    vertex_data.push.apply(vertex_data, constants);
  }
  return vertex_data;
};


},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GLBuilders: {get: function() {
      return GLBuilders;
    }},
  __esModule: {value: true}
});
var Point = require('../point').default;
var Vector = require('../vector').Vector;
var GL = require('./gl').GL;
var GLBuilders = {};
GLBuilders.debug = false;
GLBuilders.buildPolygons = function GLBuildersBuildPolygons(polygons, z, vertex_data, options) {
  options = options || {};
  var vertex_constants = [];
  if (z != null) {
    vertex_constants.push(z);
  }
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var vertices = GL.triangulatePolygon(polygons[p]);
    GL.addVertices(vertices, vertex_constants, vertex_data);
  }
  return vertex_data;
};
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon(polygons, z, height, min_height, vertex_data, options) {
  options = options || {};
  var min_z = z + (min_height || 0);
  var max_z = z + height;
  GLBuilders.buildPolygons(polygons, max_z, vertex_data, {
    normals: true,
    vertex_constants: options.vertex_constants
  });
  var wall_vertex_constants = [null, null, null];
  if (options.vertex_constants) {
    wall_vertex_constants.push.apply(wall_vertex_constants, options.vertex_constants);
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var polygon = polygons[p];
    for (var q = 0; q < polygon.length; q++) {
      var contour = polygon[q];
      for (var w = 0; w < contour.length - 1; w++) {
        var wall_vertices = [];
        wall_vertices.push([contour[w + 1][0], contour[w + 1][1], max_z], [contour[w + 1][0], contour[w + 1][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], max_z], [contour[w + 1][0], contour[w + 1][1], max_z]);
        var normal = Vector.cross([0, 0, 1], Vector.normalize([contour[w + 1][0] - contour[w][0], contour[w + 1][1] - contour[w][1], 0]));
        wall_vertex_constants[0] = normal[0];
        wall_vertex_constants[1] = normal[1];
        wall_vertex_constants[2] = normal[2];
        GL.addVertices(wall_vertices, wall_vertex_constants, vertex_data);
      }
    }
  }
  return vertex_data;
};
GLBuilders.buildPolylines = function GLBuildersBuildPolylines(lines, z, width, vertex_data, options) {
  options = options || {};
  options.closed_polygon = options.closed_polygon || false;
  options.remove_tile_edges = options.remove_tile_edges || false;
  var vertex_constants = [z, 0, 0, 1];
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (GLBuilders.debug && options.vertex_lines) {
    var num_lines = lines.length;
    for (var ln = 0; ln < num_lines; ln++) {
      var line = lines[ln];
      for (var p = 0; p < line.length - 1; p++) {
        var pa = line[p];
        var pb = line[p + 1];
        options.vertex_lines.push(pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0, pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0);
      }
    }
    ;
  }
  var vertices = [];
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    if (line.length > 2) {
      var anchors = [];
      if (line.length > 3) {
        var mid = [];
        var p,
            pmax;
        if (options.closed_polygon == true) {
          p = 0;
          pmax = line.length - 1;
        } else {
          p = 1;
          pmax = line.length - 2;
          mid.push(line[0]);
        }
        for (; p < pmax; p++) {
          var pa = line[p];
          var pb = line[p + 1];
          mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
        }
        var mmax;
        if (options.closed_polygon == true) {
          mmax = mid.length;
        } else {
          mid.push(line[line.length - 1]);
          mmax = mid.length - 1;
        }
        for (p = 0; p < mmax; p++) {
          anchors.push([mid[p], line[(p + 1) % line.length], mid[(p + 1) % mid.length]]);
        }
      } else {
        anchors = [[line[0], line[1], line[2]]];
      }
      for (var p = 0; p < anchors.length; p++) {
        if (!options.remove_tile_edges) {
          buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
        } else {
          var edge1 = GLBuilders.isOnTileEdge(anchors[p][0], anchors[p][1]);
          var edge2 = GLBuilders.isOnTileEdge(anchors[p][1], anchors[p][2]);
          if (!edge1 && !edge2) {
            buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
          } else if (!edge1) {
            buildSegment(anchors[p][0], anchors[p][1]);
          } else if (!edge2) {
            buildSegment(anchors[p][1], anchors[p][2]);
          }
        }
      }
    } else if (line.length == 2) {
      buildSegment(line[0], line[1]);
    }
  }
  ;
  GL.addVertices(vertices, vertex_constants, vertex_data);
  function buildSegment(pa, pb) {
    var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);
    var pa_outer = [pa[0] + slope[0] * width / 2, pa[1] + slope[1] * width / 2];
    var pa_inner = [pa[0] - slope[0] * width / 2, pa[1] - slope[1] * width / 2];
    var pb_outer = [pb[0] + slope[0] * width / 2, pb[1] + slope[1] * width / 2];
    var pb_inner = [pb[0] - slope[0] * width / 2, pb[1] - slope[1] * width / 2];
    vertices.push(pb_inner, pb_outer, pa_inner, pa_inner, pb_outer, pa_outer);
  }
  function buildAnchor(pa, joint, pb) {
    var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0]]);
    var pa_outer = [[pa[0] + pa_slope[0] * width / 2, pa[1] + pa_slope[1] * width / 2], [joint[0] + pa_slope[0] * width / 2, joint[1] + pa_slope[1] * width / 2]];
    var pa_inner = [[pa[0] - pa_slope[0] * width / 2, pa[1] - pa_slope[1] * width / 2], [joint[0] - pa_slope[0] * width / 2, joint[1] - pa_slope[1] * width / 2]];
    var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0]]);
    var pb_outer = [[joint[0] + pb_slope[0] * width / 2, joint[1] + pb_slope[1] * width / 2], [pb[0] + pb_slope[0] * width / 2, pb[1] + pb_slope[1] * width / 2]];
    var pb_inner = [[joint[0] - pb_slope[0] * width / 2, joint[1] - pb_slope[1] * width / 2], [pb[0] - pb_slope[0] * width / 2, pb[1] - pb_slope[1] * width / 2]];
    var intersection = Vector.lineIntersection(pa_outer[0], pa_outer[1], pb_outer[0], pb_outer[1]);
    var line_debug = null;
    if (intersection != null) {
      var intersect_outer = intersection;
      var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
      var miter_len_max = 3;
      if (len_sq > (width * width * miter_len_max * miter_len_max)) {
        line_debug = 'distance';
        intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
        intersect_outer = [joint[0] + intersect_outer[0] * miter_len_max, joint[1] + intersect_outer[1] * miter_len_max];
      }
      var intersect_inner = [(joint[0] - intersect_outer[0]) + joint[0], (joint[1] - intersect_outer[1]) + joint[1]];
      vertices.push(intersect_inner, intersect_outer, pa_inner[0], pa_inner[0], intersect_outer, pa_outer[0], pb_inner[1], pb_outer[1], intersect_inner, intersect_inner, pb_outer[1], intersect_outer);
    } else {
      line_debug = 'parallel';
      pa_inner[1] = pb_inner[0];
      pa_outer[1] = pb_outer[0];
      vertices.push(pa_inner[1], pa_outer[1], pa_inner[0], pa_inner[0], pa_outer[1], pa_outer[0], pb_inner[1], pb_outer[1], pb_inner[0], pb_inner[0], pb_outer[1], pb_outer[0]);
    }
    if (GLBuilders.debug && options.vertex_lines) {
      options.vertex_lines.push(pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0);
    }
    if (GLBuilders.debug && line_debug && options.vertex_lines) {
      var dcolor;
      if (line_debug == 'parallel') {
        dcolor = [0, 1, 0];
      } else if (line_debug == 'distance') {
        dcolor = [1, 0, 0];
      }
      options.vertex_lines.push(pa[0], pa[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], pb[0], pb[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2]);
      var num_lines = lines.length;
      for (var ln = 0; ln < num_lines; ln++) {
        var line2 = lines[ln];
        for (var p = 0; p < line2.length - 1; p++) {
          var pa = line2[p];
          var pb = line2[p + 1];
          options.vertex_lines.push(pa[0], pa[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0, pb[0], pb[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0);
        }
      }
      ;
    }
  }
  return vertex_data;
};
GLBuilders.buildQuadsForPoints = function(points, width, height, z, vertex_data, options) {
  var options = options || {};
  var vertex_constants = [];
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_points = points.length;
  for (var p = 0; p < num_points; p++) {
    var point = points[p];
    var positions = [[point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] + height / 2]];
    if (z != null) {
      positions[0][2] = z;
      positions[1][2] = z;
      positions[2][2] = z;
      positions[3][2] = z;
      positions[4][2] = z;
      positions[5][2] = z;
    }
    if (options.texcoords == true) {
      var texcoords = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      GL.addVerticesMultipleAttributes([positions, texcoords], vertex_constants, vertex_data);
    } else {
      GL.addVertices(positions, vertex_constants, vertex_data);
    }
  }
  return vertex_data;
};
GLBuilders.buildLines = function GLBuildersBuildLines(lines, feature, layer, style, tile, z, vertex_data, options) {
  options = options || {};
  var color = style.color;
  var width = style.width;
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    for (var p = 0; p < line.length - 1; p++) {
      var pa = line[p];
      var pb = line[p + 1];
      vertex_data.push(pa[0], pa[1], z, 0, 0, 1, color[0], color[1], color[2], pb[0], pb[1], z, 0, 0, 1, color[0], color[1], color[2]);
    }
  }
  ;
  return vertex_data;
};
GLBuilders.isOnTileEdge = function(pa, pb, options) {
  options = options || {};
  var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
  var tolerance = options.tolerance || 1;
  var tile_min = GLBuilders.tile_bounds[0];
  var tile_max = GLBuilders.tile_bounds[1];
  var edge = null;
  if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
    edge = 'left';
  } else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
    edge = 'right';
  } else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
    edge = 'top';
  } else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
    edge = 'bottom';
  }
  return edge;
};
GLBuilders.setTileScale = function(scale) {
  GLBuilders.tile_bounds = [Point(0, 0), Point(scale, -scale)];
};
GLBuilders.valuesWithinTolerance = function(a, b, tolerance) {
  tolerance = tolerance || 1;
  return (Math.abs(a - b) < tolerance);
};
GLBuilders.buildZigzagLineTestPattern = function() {
  var min = Point(0, 0);
  var max = Point(4096, 4096);
  var g = {
    id: 123,
    geometry: {
      type: 'LineString',
      coordinates: [[min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25], [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5], [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25], [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75], [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5], [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]]
    },
    properties: {kind: 'debug'}
  };
  return g;
};


},{"../point":21,"../vector":27,"./gl":13}],15:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var GL = require('./gl').GL;
var GLVertexLayout = require('./gl_vertex_layout').default;
var GLProgram = require('./gl_program').default;
function GLGeometry(gl, vertex_data, vertex_layout, options) {
  options = options || {};
  this.gl = gl;
  this.vertex_data = vertex_data;
  this.vertex_layout = vertex_layout;
  this.buffer = this.gl.createBuffer();
  this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
  this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
  this.vertices_per_geometry = 3;
  this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
  this.geometry_count = this.vertex_count / this.vertices_per_geometry;
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}
var $__default = GLGeometry;
GLGeometry.prototype.render = function(options) {
  options = options || {};
  if (typeof this._render_setup == 'function') {
    this._render_setup();
  }
  var gl_program = options.gl_program || GLProgram.current;
  gl_program.use();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.vertex_layout.enable(this.gl, gl_program);
  this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
};
GLGeometry.prototype.destroy = function() {
  console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
  this.gl.deleteBuffer(this.buffer);
  delete this.vertex_data;
};


},{"./gl":13,"./gl_program":17,"./gl_vertex_layout":20}],16:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Modes: {get: function() {
      return Modes;
    }},
  ModeManager: {get: function() {
      return ModeManager;
    }},
  __esModule: {value: true}
});
var GL = require('./gl').GL;
var GLVertexLayout = require('./gl_vertex_layout').default;
var GLBuilders = require('./gl_builders').GLBuilders;
var GLProgram = require('./gl_program').default;
var GLGeometry = require('./gl_geom').default;
var shader_sources = require('./gl_shaders');
var Queue = require('queue-async');
var Modes = {};
var ModeManager = {};
var RenderMode = {
  init: function(gl) {
    this.gl = gl;
    this.makeGLProgram();
    if (typeof this._init == 'function') {
      this._init();
    }
  },
  refresh: function() {
    this.makeGLProgram();
  },
  defines: {},
  selection: false,
  buildPolygons: function() {},
  buildLines: function() {},
  buildPoints: function() {},
  makeGLGeometry: function(vertex_data) {
    return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
  }
};
RenderMode.makeGLProgram = function() {
  var $__5 = this;
  var queue = Queue();
  var defines = this.buildDefineList();
  if (this.selection) {
    var selection_defines = Object.create(defines);
    selection_defines['FEATURE_SELECTION'] = true;
  }
  var transforms = (this.shaders && this.shaders.transforms);
  var program = (this.hasOwnProperty('gl_program') && this.gl_program);
  var selection_program = (this.hasOwnProperty('selection_gl_program') && this.selection_gl_program);
  queue.defer((function(complete) {
    if (!program) {
      program = new GLProgram($__5.gl, shader_sources[$__5.vertex_shader_key], shader_sources[$__5.fragment_shader_key], {
        defines: defines,
        transforms: transforms,
        name: $__5.name,
        callback: complete
      });
    } else {
      program.defines = defines;
      program.transforms = transforms;
      program.compile(complete);
    }
  }));
  if (this.selection) {
    queue.defer((function(complete) {
      if (!selection_program) {
        selection_program = new GLProgram($__5.gl, shader_sources[$__5.vertex_shader_key], shader_sources['selection_fragment'], {
          defines: selection_defines,
          transforms: transforms,
          name: ($__5.name + ' (selection)'),
          callback: complete
        });
      } else {
        selection_program.defines = selection_defines;
        selection_program.transforms = transforms;
        selection_program.compile(complete);
      }
    }));
  }
  queue.await((function() {
    if (program) {
      $__5.gl_program = program;
    }
    if (selection_program) {
      $__5.selection_gl_program = selection_program;
    }
  }));
};
RenderMode.buildDefineList = function() {
  var defines = {};
  if (this.defines != null) {
    for (var d in this.defines) {
      defines[d] = this.defines[d];
    }
  }
  if (this.shaders != null && this.shaders.defines != null) {
    for (var d in this.shaders.defines) {
      defines[d] = this.shaders.defines[d];
    }
  }
  return defines;
};
RenderMode.setUniforms = function() {
  var gl_program = GLProgram.current;
  if (gl_program != null && this.shaders != null && this.shaders.uniforms != null) {
    gl_program.setUniforms(this.shaders.uniforms);
  }
};
RenderMode.update = function() {
  if (typeof this.animation == 'function') {
    this.animation();
  }
};
ModeManager.configureMode = function(name, settings) {
  Modes[name] = Modes[name] || Object.create(Modes[settings.extends] || RenderMode);
  if (Modes[settings.extends]) {
    Modes[name].parent = Modes[settings.extends];
  }
  for (var s in settings) {
    Modes[name][s] = settings[s];
  }
  Modes[name].name = name;
  return Modes[name];
};
Modes.polygons = Object.create(RenderMode);
Modes.polygons.name = 'polygons';
Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';
Modes.polygons.defines = {'WORLD_POSITION_WRAP': 100000};
Modes.polygons.selection = true;
Modes.polygons._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_normal',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.polygons.buildPolygons = function(polygons, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  if (style.extrude && style.height) {
    GLBuilders.buildExtrudedPolygons(polygons, style.z, style.height, style.min_height, vertex_data, {vertex_constants: vertex_constants});
  } else {
    GLBuilders.buildPolygons(polygons, style.z, vertex_data, {
      normals: true,
      vertex_constants: vertex_constants
    });
  }
  if (style.outline.color && style.outline.width) {
    for (var mpc = 0; mpc < polygons.length; mpc++) {
      GLBuilders.buildPolylines(polygons[mpc], style.z, style.outline.width, vertex_data, {
        closed_polygon: true,
        remove_tile_edges: true,
        vertex_constants: outline_vertex_constants
      });
    }
  }
};
Modes.polygons.buildLines = function(lines, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  GLBuilders.buildPolylines(lines, style.z, style.width, vertex_data, {vertex_constants: vertex_constants});
  if (style.outline.color && style.outline.width) {
    GLBuilders.buildPolylines(lines, style.z, style.width + 2 * style.outline.width, vertex_data, {vertex_constants: outline_vertex_constants});
  }
};
Modes.polygons.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: true,
    texcoords: false,
    vertex_constants: vertex_constants
  });
};
Modes.points = Object.create(RenderMode);
Modes.points.name = 'points';
Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';
Modes.points.defines = {'EFFECT_SCREEN_COLOR': true};
Modes.points.selection = true;
Modes.points._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_texcoord',
    size: 2,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.points.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: false,
    texcoords: true,
    vertex_constants: vertex_constants
  });
};


},{"./gl":13,"./gl_builders":14,"./gl_geom":15,"./gl_program":17,"./gl_shaders":18,"./gl_vertex_layout":20,"queue-async":5}],17:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Utils = require('../utils');
var GL = require('./gl').GL;
var GLTexture = require('./gl_texture').default;
var Queue = require('queue-async');
GLProgram.id = 0;
GLProgram.programs = {};
function GLProgram(gl, vertex_shader, fragment_shader, options) {
  options = options || {};
  this.gl = gl;
  this.program = null;
  this.compiled = false;
  this.defines = options.defines || {};
  this.transforms = options.transforms || {};
  this.uniforms = {};
  this.attribs = {};
  this.vertex_shader = vertex_shader;
  this.fragment_shader = fragment_shader;
  this.id = GLProgram.id++;
  GLProgram.programs[this.id] = this;
  this.name = options.name;
  this.compile(options.callback);
}
var $__default = GLProgram;
;
GLProgram.prototype.use = function() {
  if (!this.compiled) {
    return;
  }
  if (GLProgram.current != this) {
    this.gl.useProgram(this.program);
  }
  GLProgram.current = this;
};
GLProgram.current = null;
GLProgram.defines = {};
GLProgram.transforms = {};
GLProgram.addTransform = function(key) {
  var $__4;
  for (var transforms = [],
      $__3 = 1; $__3 < arguments.length; $__3++)
    transforms[$__3 - 1] = arguments[$__3];
  GLProgram.transforms[key] = GLProgram.transforms[key] || [];
  ($__4 = GLProgram.transforms[key]).push.apply($__4, $traceurRuntime.spread(transforms));
};
GLProgram.removeTransform = function(key) {
  GLProgram.transforms[key] = [];
};
GLProgram.prototype.compile = function(callback) {
  var $__2 = this;
  var queue = Queue();
  this.computed_vertex_shader = this.vertex_shader;
  this.computed_fragment_shader = this.fragment_shader;
  var defines = this.buildDefineList();
  var transforms = this.buildShaderTransformList();
  var loaded_transforms = {};
  var regexp;
  for (var key in transforms) {
    var transform = transforms[key];
    if (transform == null) {
      continue;
    }
    if (!(typeof transform === 'object' && transform.length >= 0)) {
      transform = [transform];
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
    var inject_vertex = this.computed_vertex_shader.match(regexp);
    var inject_fragment = this.computed_fragment_shader.match(regexp);
    if (inject_vertex == null && inject_fragment == null) {
      continue;
    }
    loaded_transforms[key] = {};
    loaded_transforms[key].regexp = new RegExp(regexp);
    loaded_transforms[key].inject_vertex = (inject_vertex != null);
    loaded_transforms[key].inject_fragment = (inject_fragment != null);
    loaded_transforms[key].list = [];
    for (var u = 0; u < transform.length; u++) {
      queue.defer(GLProgram.loadTransform, loaded_transforms, transform[u], key, u);
    }
    defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
  }
  queue.await((function(error) {
    if (error) {
      console.log("error loading transforms: " + error);
      return;
    }
    for (var t in loaded_transforms) {
      var combined_source = "";
      for (var s = 0; s < loaded_transforms[t].list.length; s++) {
        combined_source += loaded_transforms[t].list[s] + '\n';
      }
      if (loaded_transforms[t].inject_vertex != null) {
        $__2.computed_vertex_shader = $__2.computed_vertex_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
      if (loaded_transforms[t].inject_fragment != null) {
        $__2.computed_fragment_shader = $__2.computed_fragment_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    $__2.computed_vertex_shader = $__2.computed_vertex_shader.replace(regexp, '');
    $__2.computed_fragment_shader = $__2.computed_fragment_shader.replace(regexp, '');
    var define_str = GLProgram.buildDefineString(defines);
    $__2.computed_vertex_shader = define_str + $__2.computed_vertex_shader;
    $__2.computed_fragment_shader = define_str + $__2.computed_fragment_shader;
    var info = ($__2.name ? ($__2.name + ' / id ' + $__2.id) : ('id ' + $__2.id));
    $__2.computed_vertex_shader = '// Program: ' + info + '\n' + $__2.computed_vertex_shader;
    $__2.computed_fragment_shader = '// Program: ' + info + '\n' + $__2.computed_fragment_shader;
    try {
      $__2.program = GL.updateProgram($__2.gl, $__2.program, $__2.computed_vertex_shader, $__2.computed_fragment_shader);
      $__2.compiled = true;
    } catch (e) {
      $__2.program = null;
      $__2.compiled = false;
    }
    $__2.use();
    $__2.refreshUniforms();
    $__2.refreshAttributes();
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
GLProgram.loadTransform = function(transforms, block, key, index, complete) {
  var type,
      value,
      source;
  if (typeof block == 'string') {
    transforms[key].list[index] = block;
    complete();
  } else if (typeof block == 'object' && block.url) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      source = req.response;
      transforms[key].list[index] = source;
      complete();
    };
    req.open('GET', Utils.urlForPath(block.url) + '?' + (+new Date()), true);
    req.responseType = 'text';
    req.send();
  }
};
GLProgram.prototype.buildDefineList = function() {
  var d,
      defines = {};
  for (d in GLProgram.defines) {
    defines[d] = GLProgram.defines[d];
  }
  for (d in this.defines) {
    defines[d] = this.defines[d];
  }
  return defines;
};
GLProgram.prototype.buildShaderTransformList = function() {
  var $__4,
      $__5;
  var d,
      transforms = {};
  for (d in GLProgram.transforms) {
    transforms[d] = [];
    if (typeof GLProgram.transforms[d] === 'object' && GLProgram.transforms[d].length >= 0) {
      ($__4 = transforms[d]).push.apply($__4, $traceurRuntime.spread(GLProgram.transforms[d]));
    } else {
      transforms[d] = [GLProgram.transforms[d]];
    }
  }
  for (d in this.transforms) {
    transforms[d] = transforms[d] || [];
    if (typeof this.transforms[d] === 'object' && this.transforms[d].length >= 0) {
      ($__5 = transforms[d]).push.apply($__5, $traceurRuntime.spread(this.transforms[d]));
    } else {
      transforms[d].push(this.transforms[d]);
    }
  }
  return transforms;
};
GLProgram.buildDefineString = function(defines) {
  var define_str = "";
  for (var d in defines) {
    if (defines[d] == false) {
      continue;
    } else if (typeof defines[d] == 'boolean' && defines[d] == true) {
      define_str += "#define " + d + "\n";
    } else if (typeof defines[d] == 'number' && Math.floor(defines[d]) == defines[d]) {
      define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
    } else {
      define_str += "#define " + d + " " + defines[d] + "\n";
    }
  }
  return define_str;
};
GLProgram.prototype.setUniforms = function(uniforms) {
  var texture_unit = 0;
  for (var u in uniforms) {
    var uniform = uniforms[u];
    if (typeof uniform == 'number') {
      this.uniform('1f', u, uniform);
    } else if (typeof uniform == 'object') {
      if (uniform.length >= 2 && uniform.length <= 4) {
        this.uniform(uniform.length + 'fv', u, uniform);
      } else if (uniform.length > 4) {
        this.uniform('1fv', u + '[0]', uniform);
      }
    } else if (typeof uniform == 'boolean') {
      this.uniform('1i', u, uniform);
    } else if (typeof uniform == 'string') {
      var texture = GLTexture.textures[uniform];
      if (texture == null) {
        texture = new GLTexture(this.gl, uniform);
        texture.load(uniform);
      }
      texture.bind(texture_unit);
      this.uniform('1i', u, texture_unit);
      texture_unit++;
    }
  }
};
GLProgram.prototype.uniform = function(method, name) {
  if (!this.compiled) {
    return;
  }
  var uniform = (this.uniforms[name] = this.uniforms[name] || {});
  uniform.name = name;
  uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
  uniform.method = 'uniform' + method;
  uniform.values = Array.prototype.slice.call(arguments, 2);
  this.updateUniform(name);
};
GLProgram.prototype.updateUniform = function(name) {
  if (!this.compiled) {
    return;
  }
  var uniform = this.uniforms[name];
  if (uniform == null || uniform.location == null) {
    return;
  }
  this.use();
  this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values));
};
GLProgram.prototype.refreshUniforms = function() {
  if (!this.compiled) {
    return;
  }
  for (var u in this.uniforms) {
    this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
    this.updateUniform(u);
  }
};
GLProgram.prototype.refreshAttributes = function() {
  this.attribs = {};
};
GLProgram.prototype.attribute = function(name) {
  if (!this.compiled) {
    return;
  }
  var attrib = (this.attribs[name] = this.attribs[name] || {});
  if (attrib.location != null) {
    return attrib;
  }
  attrib.name = name;
  attrib.location = this.gl.getAttribLocation(this.program, name);
  return attrib;
};


},{"../utils":26,"./gl":13,"./gl_texture":19,"queue-async":5}],18:[function(require,module,exports){
"use strict";
var shader_sources = {};
shader_sources['point_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  vec3 lighting = vec3(1.);\n" + "  float len = length(v_texcoord);\n" + "  if(len > 1.) {\n" + "    discard;\n" + "  }\n" + "  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.);\n" + "}\n" + "";
shader_sources['point_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec2 a_texcoord;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  v_color = a_color;\n" + "  v_texcoord = a_texcoord;\n" + "  cameraProjection(position);\n" + "  position.z -= (a_layer + 1.) * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform float u_test;\n" + "uniform float u_test2;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(LIGHTING_ENVIRONMENT)\n" + "\n" + "uniform sampler2D u_env_map;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" + "  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" + "  if(eye.z > 0.01) {\n" + "    eye.z = 0.01;\n" + "  }\n" + "  vec3 r = reflect(eye, normal);\n" + "  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" + "  vec2 uv = r.xy / m + .5;\n" + "  return texture2D(envmap, uv);\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  #if defined(LIGHTING_ENVIRONMENT)\n" + "  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" + "  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" + "  #endif\n" + "  \n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  vec3 lighting = v_lighting;\n" + "  #endif\n" + "  vec3 color_prelight = color;\n" + "  color *= lighting;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform mat4 u_tile_world;\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec4 v_world_position;\n" + "varying vec3 v_color;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 c_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 e_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 b_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = c_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = d_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = c_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = e_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  v_world_position = u_tile_world * vec4(a_position, 1.);\n" + "  #if defined(WORLD_POSITION_WRAP)\n" + "  v_world_position.xy -= world_position_anchor;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  v_color = a_color;\n" + "  v_lighting = b_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  cameraProjection(position);\n" + "  position.z -= (a_layer + 1.) * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['selection_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void main(void) {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  gl_FragColor = v_selection_color;\n" + "  #else\n" + "  gl_FragColor = vec4(0., 0., 0., 1.);\n" + "  #endif\n" + "  \n" + "}\n" + "";
shader_sources['simple_polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform float u_meters_per_pixel;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color;\n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  color = v_color;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['simple_polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
module.exports = shader_sources;


},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Utils = require('../utils');
var GL = require('./gl').GL;
GLTexture.textures = {};
function GLTexture(gl, name, options) {
  options = options || {};
  this.gl = gl;
  this.texture = gl.createTexture();
  this.bind(0);
  this.image = null;
  this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), {filtering: 'nearest'});
  this.name = name;
  GLTexture.textures[this.name] = this;
}
var $__default = GLTexture;
;
GLTexture.prototype.bind = function(unit) {
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};
GLTexture.prototype.load = function(url, options) {
  var $__1 = this;
  options = options || {};
  this.image = new Image();
  this.image.onload = (function() {
    $__1.width = $__1.image.width;
    $__1.height = $__1.image.height;
    $__1.data = null;
    $__1.update(options);
    $__1.setTextureFiltering(options);
  });
  this.image.src = url;
};
GLTexture.prototype.setData = function(width, height, data, options) {
  this.width = width;
  this.height = height;
  this.data = data;
  this.image = null;
  this.update(options);
  this.setTextureFiltering(options);
};
GLTexture.prototype.update = function(options) {
  options = options || {};
  this.bind(0);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
  if (this.image && this.image.complete) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
  } else if (this.width && this.height) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
  }
};
GLTexture.prototype.setTextureFiltering = function(options) {
  options = options || {};
  options.filtering = options.filtering || 'mipmap';
  var gl = this.gl;
  if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
    this.power_of_2 = true;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);
    if (options.filtering == 'mipmap') {
      this.filtering = 'mipmap';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else if (options.filtering == 'linear') {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
  } else {
    this.power_of_2 = false;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }
};


},{"../utils":26,"./gl":13}],20:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
function GLVertexLayout(gl, attribs) {
  this.attribs = attribs;
  this.stride = 0;
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    attrib.byte_size = attrib.size;
    switch (attrib.type) {
      case gl.FLOAT:
      case gl.INT:
      case gl.UNSIGNED_INT:
        attrib.byte_size *= 4;
        break;
      case gl.SHORT:
      case gl.UNSIGNED_SHORT:
        attrib.byte_size *= 2;
        break;
    }
    attrib.offset = this.stride;
    this.stride += attrib.byte_size;
  }
}
var $__default = GLVertexLayout;
GLVertexLayout.enabled_attribs = {};
GLVertexLayout.prototype.enable = function(gl, gl_program) {
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    var location = gl_program.attribute(attrib.name).location;
    if (location != -1) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
      GLVertexLayout.enabled_attribs[location] = gl_program;
    }
  }
  var unusued_attribs = [];
  for (location in GLVertexLayout.enabled_attribs) {
    if (GLVertexLayout.enabled_attribs[location] != gl_program) {
      gl.disableVertexAttribArray(location);
      unusued_attribs.push(location);
    }
  }
  for (location in unusued_attribs) {
    delete GLVertexLayout.enabled_attribs[location];
  }
};


},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Point = function Point(x, y) {
  if (!(this instanceof $Point)) {
    return new $Point(x, y);
  }
  this.x = x;
  this.y = y;
};
var $Point = Point;
($traceurRuntime.createClass)(Point, {}, {copy: function(other) {
    if (other == null) {
      return null;
    }
    return new $Point(other.x, other.y);
  }});
var $__default = Point;


},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Point = require('./point').default;
var Geo = require('./geo').Geo;
var Utils = require('./utils');
var Style = require('./style').Style;
var Queue = require('queue-async');
var GL = require('./gl/gl').GL;
var GLBuilders = require('./gl/gl_builders').GLBuilders;
var GLProgram = require('./gl/gl_program').default;
var GLTexture = require('./gl/gl_texture').default;
var ModeManager = require('./gl/gl_modes').ModeManager;
var Camera = require('./camera').default;
var $__9 = require('gl-matrix'),
    mat4 = $__9.mat4,
    vec3 = $__9.vec3;
var yaml;
Utils.runIfInMainThread(function() {
  try {
    yaml = require('js-yaml');
  } catch (e) {
    console.log("no YAML support, js-yaml module not found");
  }
  findBaseLibraryURL();
});
Scene.tile_scale = 4096;
Geo.setTileScale(Scene.tile_scale);
GLBuilders.setTileScale(Scene.tile_scale);
GLProgram.defines.TILE_SCALE = Scene.tile_scale;
Scene.debug = false;
function Scene(tile_source, layers, styles, options) {
  var options = options || {};
  this.initialized = false;
  this.tile_source = tile_source;
  this.tiles = {};
  this.queued_tiles = [];
  this.num_workers = options.num_workers || 1;
  this.allow_cross_domain_workers = (options.allow_cross_domain_workers === false ? false : true);
  this.layers = layers;
  this.styles = styles;
  this.dirty = true;
  this.animated = false;
  this.frame = 0;
  this.zoom = null;
  this.center = null;
  this.device_pixel_ratio = window.devicePixelRatio || 1;
  this.zooming = false;
  this.panning = false;
  this.container = options.container;
  this.resetTime();
}
var $__default = Scene;
Scene.prototype.init = function(callback) {
  var $__10 = this;
  if (this.initialized) {
    return;
  }
  this.loadScene((function() {
    var queue = Queue();
    queue.defer((function(complete) {
      $__10.modes = Scene.createModes($__10.styles);
      $__10.updateActiveModes();
      complete();
    }));
    queue.defer((function(complete) {
      $__10.createWorkers(complete);
    }));
    queue.await((function() {
      $__10.container = $__10.container || document.body;
      $__10.canvas = document.createElement('canvas');
      $__10.canvas.style.position = 'absolute';
      $__10.canvas.style.top = 0;
      $__10.canvas.style.left = 0;
      $__10.canvas.style.zIndex = -1;
      $__10.container.appendChild($__10.canvas);
      $__10.gl = GL.getContext($__10.canvas);
      $__10.resizeMap($__10.container.clientWidth, $__10.container.clientHeight);
      $__10.createCamera();
      $__10.initModes();
      $__10.initSelectionBuffer();
      $__10.last_render_count = null;
      $__10.initInputHandlers();
      $__10.initialized = true;
      if (typeof callback == 'function') {
        callback();
      }
    }));
  }));
};
Scene.prototype.initModes = function() {
  for (var m in this.modes) {
    this.modes[m].init(this.gl);
  }
};
Scene.prototype.initSelectionBuffer = function() {
  this.pixel = new Uint8Array(4);
  this.pixel32 = new Float32Array(this.pixel.buffer);
  this.selection_point = Point(0, 0);
  this.selected_feature = null;
  this.selection_callback = null;
  this.selection_callback_timer = null;
  this.selection_frame_delay = 5;
  this.update_selection = false;
  this.fbo = this.gl.createFramebuffer();
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  this.fbo_size = {
    width: 256,
    height: 256
  };
  this.fbo_size.aspect = this.fbo_size.width / this.fbo_size.height;
  this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
  this.fbo_texture = new GLTexture(this.gl, 'selection_fbo');
  this.fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, {filtering: 'nearest'});
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fbo_texture.texture, 0);
  this.fbo_depth_rb = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.createWorkers = function(callback) {
  var $__10 = this;
  var queue = Queue();
  var worker_url = Scene.library_base_url + 'tangram-worker.debug.js' + '?' + (+new Date());
  queue.defer((function(complete) {
    var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
    if (createObjectURL && $__10.allow_cross_domain_workers) {
      var req = new XMLHttpRequest();
      req.onload = (function() {
        var worker_local_url = createObjectURL(new Blob([req.response], {type: 'application/javascript'}));
        $__10.makeWorkers(worker_local_url);
        complete();
      });
      req.open('GET', worker_url, true);
      req.responseType = 'text';
      req.send();
    } else {
      console.log($__10);
      $__10.makeWorkers(worker_url);
      complete();
    }
  }));
  queue.await((function() {
    $__10.workers.forEach((function(worker) {
      worker.addEventListener('message', $__10.workerBuildTileCompleted.bind($__10));
      worker.addEventListener('message', $__10.workerGetFeatureSelection.bind($__10));
      worker.addEventListener('message', $__10.workerLogMessage.bind($__10));
    }));
    $__10.next_worker = 0;
    $__10.selection_map_worker_size = {};
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
Scene.prototype.makeWorkers = function(url) {
  this.workers = [];
  for (var w = 0; w < this.num_workers; w++) {
    this.workers.push(new Worker(url));
    this.workers[w].postMessage({
      type: 'init',
      worker_id: w,
      num_workers: this.num_workers
    });
  }
};
Scene.prototype.workerPostMessageForTile = function(tile, message) {
  if (tile.worker == null) {
    tile.worker = this.next_worker;
    this.next_worker = (tile.worker + 1) % this.workers.length;
  }
  this.workers[tile.worker].postMessage(message);
};
Scene.prototype.setCenter = function(lng, lat) {
  this.center = {
    lng: lng,
    lat: lat
  };
  this.dirty = true;
};
Scene.prototype.startZoom = function() {
  this.last_zoom = this.zoom;
  this.zooming = true;
};
Scene.prototype.preserve_tiles_within_zoom = 2;
Scene.prototype.setZoom = function(zoom) {
  var below = zoom;
  var above = zoom;
  if (this.last_zoom != null) {
    console.log("scene.last_zoom: " + this.last_zoom);
    if (Math.abs(zoom - this.last_zoom) <= this.preserve_tiles_within_zoom) {
      if (zoom > this.last_zoom) {
        below = zoom - this.preserve_tiles_within_zoom;
      } else {
        above = zoom + this.preserve_tiles_within_zoom;
      }
    }
  }
  this.last_zoom = this.zoom;
  this.zoom = zoom;
  this.capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
  this.zooming = false;
  this.updateMeterView();
  this.removeTilesOutsideZoomRange(below, above);
  this.dirty = true;
};
Scene.prototype.updateMeterView = function() {
  this.meters_per_pixel = Geo.metersPerPixel(this.zoom);
  if (this.css_size !== undefined) {
    this.meter_zoom = {
      x: this.css_size.width / 2 * this.meters_per_pixel,
      y: this.css_size.height / 2 * this.meters_per_pixel
    };
  }
};
Scene.prototype.removeTilesOutsideZoomRange = function(below, above) {
  below = Math.min(below, this.tile_source.max_zoom || below);
  above = Math.min(above, this.tile_source.max_zoom || above);
  console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
  var remove_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.coords.z < below || tile.coords.z > above) {
      remove_tiles.push(t);
    }
  }
  for (var r = 0; r < remove_tiles.length; r++) {
    var key = remove_tiles[r];
    console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
    this.removeTile(key);
  }
};
Scene.prototype.setBounds = function(sw, ne) {
  this.bounds = {
    sw: {
      lng: sw.lng,
      lat: sw.lat
    },
    ne: {
      lng: ne.lng,
      lat: ne.lat
    }
  };
  var buffer = 200 * this.meters_per_pixel;
  this.buffered_meter_bounds = {
    sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
    ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
  };
  this.buffered_meter_bounds.sw.x -= buffer;
  this.buffered_meter_bounds.sw.y -= buffer;
  this.buffered_meter_bounds.ne.x += buffer;
  this.buffered_meter_bounds.ne.y += buffer;
  this.center_meters = Point((this.buffered_meter_bounds.sw.x + this.buffered_meter_bounds.ne.x) / 2, (this.buffered_meter_bounds.sw.y + this.buffered_meter_bounds.ne.y) / 2);
  for (var t in this.tiles) {
    this.updateVisibilityForTile(this.tiles[t]);
  }
  this.dirty = true;
};
Scene.prototype.isTileInZoom = function(tile) {
  return (Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == this.capped_zoom);
};
Scene.prototype.updateVisibilityForTile = function(tile) {
  var visible = tile.visible;
  tile.visible = this.isTileInZoom(tile) && Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
  tile.center_dist = Math.abs(this.center_meters.x - tile.min.x) + Math.abs(this.center_meters.y - tile.min.y);
  return (visible != tile.visible);
};
Scene.prototype.resizeMap = function(width, height) {
  this.dirty = true;
  this.css_size = {
    width: width,
    height: height
  };
  this.device_size = {
    width: Math.round(this.css_size.width * this.device_pixel_ratio),
    height: Math.round(this.css_size.height * this.device_pixel_ratio)
  };
  this.view_aspect = this.css_size.width / this.css_size.height;
  this.updateMeterView();
  this.canvas.style.width = this.css_size.width + 'px';
  this.canvas.style.height = this.css_size.height + 'px';
  this.canvas.width = this.device_size.width;
  this.canvas.height = this.device_size.height;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.requestRedraw = function() {
  this.dirty = true;
};
Scene.calculateZ = function(layer, tile, layer_offset, feature_offset) {
  var z = 0;
  return z;
};
Scene.prototype.render = function() {
  this.loadQueuedTiles();
  if (this.dirty == false || this.initialized == false) {
    return false;
  }
  this.dirty = false;
  this.renderGL();
  if (this.animated == true) {
    this.dirty = true;
  }
  this.frame++;
  return true;
};
Scene.prototype.resetFrame = function() {
  if (!this.initialized) {
    return;
  }
  var gl = this.gl;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
};
Scene.prototype.renderGL = function() {
  var gl = this.gl;
  this.input();
  this.resetFrame();
  var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
  var tile_view_mat = mat4.create();
  var tile_world_mat = mat4.create();
  this.camera.update();
  var renderable_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.loaded == true && tile.visible == true) {
      renderable_tiles.push(tile);
    }
  }
  this.renderable_tiles_count = renderable_tiles.length;
  var render_count = 0;
  for (var mode in this.modes) {
    this.modes[mode].update();
    var gl_program = this.modes[mode].gl_program;
    if (gl_program == null || gl_program.compiled == false) {
      continue;
    }
    var first_for_mode = true;
    for (var t in renderable_tiles) {
      var tile = renderable_tiles[t];
      if (tile.gl_geometry[mode] != null) {
        if (first_for_mode == true) {
          first_for_mode = false;
          gl_program.use();
          this.modes[mode].setUniforms();
          gl_program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
          gl_program.uniform('2f', 'u_aspect', this.view_aspect, 1.0);
          gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
          gl_program.uniform('1f', 'u_map_zoom', this.zoom);
          gl_program.uniform('2f', 'u_map_center', center.x, center.y);
          gl_program.uniform('1f', 'u_num_layers', this.layers.length);
          gl_program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
          this.camera.setupProgram(gl_program);
        }
        gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
        mat4.identity(tile_view_mat);
        mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
        mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
        mat4.identity(tile_world_mat);
        mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
        mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
        tile.gl_geometry[mode].render();
        render_count += tile.gl_geometry[mode].geometry_count;
      }
    }
  }
  if (this.update_selection) {
    this.update_selection = false;
    if (this.panning) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
    this.resetFrame();
    for (mode in this.modes) {
      gl_program = this.modes[mode].selection_gl_program;
      if (gl_program == null || gl_program.compiled == false) {
        continue;
      }
      first_for_mode = true;
      for (t in renderable_tiles) {
        tile = renderable_tiles[t];
        if (tile.gl_geometry[mode] != null) {
          if (first_for_mode == true) {
            first_for_mode = false;
            gl_program.use();
            this.modes[mode].setUniforms();
            gl_program.uniform('2f', 'u_resolution', this.fbo_size.width, this.fbo_size.height);
            gl_program.uniform('2f', 'u_aspect', this.fbo_size.aspect, 1.0);
            gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
            gl_program.uniform('1f', 'u_map_zoom', this.zoom);
            gl_program.uniform('2f', 'u_map_center', center.x, center.y);
            gl_program.uniform('1f', 'u_num_layers', this.layers.length);
            gl_program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
            this.camera.setupProgram(gl_program);
          }
          gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
          mat4.identity(tile_view_mat);
          mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
          mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
          mat4.identity(tile_world_mat);
          mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
          mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
          tile.gl_geometry[mode].render();
        }
      }
    }
    if (this.selection_callback_timer != null) {
      clearTimeout(this.selection_callback_timer);
    }
    this.selection_callback_timer = setTimeout(this.readSelectionBuffer.bind(this), this.selection_frame_delay);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  if (render_count != this.last_render_count) {
    console.log("rendered " + render_count + " primitives");
  }
  this.last_render_count = render_count;
  return true;
};
Scene.prototype.getFeatureAt = function(pixel, callback) {
  if (!this.initialized) {
    return;
  }
  if (this.update_selection == true) {
    return;
  }
  this.selection_point = Point(pixel.x * this.device_pixel_ratio, this.device_size.height - (pixel.y * this.device_pixel_ratio));
  this.selection_callback = callback;
  this.update_selection = true;
  this.dirty = true;
};
Scene.prototype.readSelectionBuffer = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  gl.readPixels(Math.floor(this.selection_point.x * this.fbo_size.width / this.device_size.width), Math.floor(this.selection_point.y * this.fbo_size.height / this.device_size.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;
  var worker_id = this.pixel[3];
  if (worker_id != 255) {
    if (this.workers[worker_id] != null) {
      this.workers[worker_id].postMessage({
        type: 'getFeatureSelection',
        key: feature_key
      });
    }
  } else {
    this.workerGetFeatureSelection({data: {
        type: 'getFeatureSelection',
        feature: null
      }});
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
Scene.prototype.workerGetFeatureSelection = function(event) {
  if (event.data.type != 'getFeatureSelection') {
    return;
  }
  var feature = event.data.feature;
  var changed = false;
  if ((feature != null && this.selected_feature == null) || (feature == null && this.selected_feature != null) || (feature != null && this.selected_feature != null && feature.id != this.selected_feature.id)) {
    changed = true;
  }
  this.selected_feature = feature;
  if (typeof this.selection_callback == 'function') {
    this.selection_callback({
      feature: this.selected_feature,
      changed: changed
    });
  }
};
Scene.prototype.loadTile = function(coords, div, callback) {
  this.queued_tiles[this.queued_tiles.length] = arguments;
};
Scene.prototype.loadQueuedTiles = function() {
  if (!this.initialized) {
    return;
  }
  if (this.queued_tiles.length == 0) {
    return;
  }
  for (var t = 0; t < this.queued_tiles.length; t++) {
    this._loadTile.apply(this, this.queued_tiles[t]);
  }
  this.queued_tiles = [];
};
Scene.prototype._loadTile = function(coords, div, callback) {
  if (coords.z > this.tile_source.max_zoom) {
    var zgap = coords.z - this.tile_source.max_zoom;
    coords.x = ~~(coords.x / Math.pow(2, zgap));
    coords.y = ~~(coords.y / Math.pow(2, zgap));
    coords.display_z = coords.z;
    coords.z -= zgap;
  }
  this.trackTileSetLoadStart();
  var key = [coords.x, coords.y, coords.z].join('/');
  if (this.tiles[key]) {
    if (callback) {
      callback(null, div);
    }
    return;
  }
  var tile = this.tiles[key] = {};
  tile.key = key;
  tile.coords = coords;
  tile.min = Geo.metersForTile(tile.coords);
  tile.max = Geo.metersForTile({
    x: tile.coords.x + 1,
    y: tile.coords.y + 1,
    z: tile.coords.z
  });
  tile.span = {
    x: (tile.max.x - tile.min.x),
    y: (tile.max.y - tile.min.y)
  };
  tile.bounds = {
    sw: {
      x: tile.min.x,
      y: tile.max.y
    },
    ne: {
      x: tile.max.x,
      y: tile.min.y
    }
  };
  tile.debug = {};
  tile.loading = true;
  tile.loaded = false;
  this.buildTile(tile.key);
  this.updateTileElement(tile, div);
  this.updateVisibilityForTile(tile);
  if (callback) {
    callback(null, div);
  }
};
Scene.prototype.rebuildTiles = function() {
  var $__10 = this;
  if (!this.initialized) {
    return;
  }
  this.layers_serialized = Utils.serializeWithFunctions(this.layers);
  this.styles_serialized = Utils.serializeWithFunctions(this.styles);
  this.selection_map = {};
  this.workers.forEach((function(worker) {
    worker.postMessage({
      type: 'prepareForRebuild',
      layers: $__10.layers_serialized,
      styles: $__10.styles_serialized
    });
  }));
  var visible = [],
      invisible = [];
  for (var t in this.tiles) {
    if (this.tiles[t].visible == true) {
      visible.push(t);
    } else {
      invisible.push(t);
    }
  }
  visible.sort((function(a, b) {
    var ad = $__10.tiles[a].center_dist;
    var bd = $__10.tiles[b].center_dist;
    return (bd > ad ? -1 : (bd == ad ? 0 : 1));
  }));
  for (var t in visible) {
    this.buildTile(visible[t]);
  }
  for (var t in invisible) {
    if (this.isTileInZoom(this.tiles[invisible[t]]) == true) {
      this.buildTile(invisible[t]);
    } else {
      this.removeTile(invisible[t]);
    }
  }
  this.updateActiveModes();
  this.resetTime();
};
Scene.prototype.buildTile = function(key) {
  var tile = this.tiles[key];
  this.workerPostMessageForTile(tile, {
    type: 'buildTile',
    tile: {
      key: tile.key,
      coords: tile.coords,
      min: tile.min,
      max: tile.max,
      debug: tile.debug
    },
    tile_source: this.tile_source,
    layers: this.layers_serialized,
    styles: this.styles_serialized
  });
};
Scene.addTile = function(tile, layers, styles, modes) {
  var layer,
      style,
      feature,
      z,
      mode;
  var vertex_data = {};
  tile.debug.features = 0;
  for (var layer_num = layers.length - 1; layer_num >= 0; layer_num--) {
    layer = layers[layer_num];
    if (styles.layers[layer.name] == null || styles.layers[layer.name].visible == false) {
      continue;
    }
    if (tile.layers[layer.name] != null) {
      var num_features = tile.layers[layer.name].features.length;
      for (var f = num_features - 1; f >= 0; f--) {
        feature = tile.layers[layer.name].features[f];
        style = Style.parseStyleForFeature(feature, layer.name, styles.layers[layer.name], tile);
        if (style == null) {
          continue;
        }
        style.layer_num = layer_num;
        style.z = Scene.calculateZ(layer, tile) + style.z;
        var points = null,
            lines = null,
            polygons = null;
        if (feature.geometry.type == 'Polygon') {
          polygons = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPolygon') {
          polygons = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'LineString') {
          lines = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiLineString') {
          lines = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'Point') {
          points = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPoint') {
          points = feature.geometry.coordinates;
        }
        mode = style.mode.name;
        if (vertex_data[mode] == null) {
          vertex_data[mode] = [];
        }
        if (polygons != null) {
          modes[mode].buildPolygons(polygons, style, vertex_data[mode]);
        }
        if (lines != null) {
          modes[mode].buildLines(lines, style, vertex_data[mode]);
        }
        if (points != null) {
          modes[mode].buildPoints(points, style, vertex_data[mode]);
        }
        tile.debug.features++;
      }
    }
  }
  tile.vertex_data = {};
  for (var s in vertex_data) {
    tile.vertex_data[s] = new Float32Array(vertex_data[s]);
  }
  return {vertex_data: true};
};
Scene.prototype.workerBuildTileCompleted = function(event) {
  var $__10 = this;
  if (event.data.type != 'buildTileCompleted') {
    return;
  }
  this.selection_map_worker_size[event.data.worker_id] = event.data.selection_map_size;
  this.selection_map_size = 0;
  Object.keys(this.selection_map_worker_size).forEach((function(worker) {
    $__10.selection_map_size += $__10.selection_map_worker_size[worker];
  }));
  console.log("selection map: " + this.selection_map_size + " features");
  var tile = event.data.tile;
  if (this.tiles[tile.key] == null) {
    console.log("discarded tile " + tile.key + " in Scene.tileWorkerCompleted because previously removed");
    return;
  }
  tile = this.mergeTile(tile.key, tile);
  this.buildGLGeometry(tile);
  this.dirty = true;
  this.trackTileSetLoadEnd();
  this.printDebugForTile(tile);
};
Scene.prototype.buildGLGeometry = function(tile) {
  var vertex_data = tile.vertex_data;
  this.freeTileResources(tile);
  tile.gl_geometry = {};
  for (var s in vertex_data) {
    tile.gl_geometry[s] = this.modes[s].makeGLGeometry(vertex_data[s]);
  }
  tile.debug.geometries = 0;
  tile.debug.buffer_size = 0;
  for (var p in tile.gl_geometry) {
    tile.debug.geometries += tile.gl_geometry[p].geometry_count;
    tile.debug.buffer_size += tile.gl_geometry[p].vertex_data.byteLength;
  }
  tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);
  delete tile.vertex_data;
};
Scene.prototype.removeTile = function(key) {
  if (!this.initialized) {
    return;
  }
  console.log("tile unload for " + key);
  if (this.zooming == true) {
    return;
  }
  var tile = this.tiles[key];
  if (tile != null) {
    this.freeTileResources(tile);
    this.workerPostMessageForTile(tile, {
      type: 'removeTile',
      key: tile.key
    });
  }
  delete this.tiles[key];
  this.dirty = true;
};
Scene.prototype.freeTileResources = function(tile) {
  if (tile != null && tile.gl_geometry != null) {
    for (var p in tile.gl_geometry) {
      tile.gl_geometry[p].destroy();
    }
    tile.gl_geometry = null;
  }
};
Scene.prototype.updateTileElement = function(tile, div) {
  div.setAttribute('data-tile-key', tile.key);
  div.style.width = '256px';
  div.style.height = '256px';
  if (this.debug) {
    var debug_overlay = document.createElement('div');
    debug_overlay.textContent = tile.key;
    debug_overlay.style.position = 'absolute';
    debug_overlay.style.left = 0;
    debug_overlay.style.top = 0;
    debug_overlay.style.color = 'white';
    debug_overlay.style.fontSize = '16px';
    div.appendChild(debug_overlay);
    div.style.borderStyle = 'solid';
    div.style.borderColor = 'white';
    div.style.borderWidth = '1px';
  }
};
Scene.prototype.mergeTile = function(key, source_tile) {
  var tile = this.tiles[key];
  if (tile == null) {
    this.tiles[key] = source_tile;
    return this.tiles[key];
  }
  for (var p in source_tile) {
    tile[p] = source_tile[p];
  }
  return tile;
};
Scene.prototype.loadScene = function(callback) {
  var $__10 = this;
  var queue = Queue();
  if (!this.layer_source && typeof(this.layers) == 'string') {
    this.layer_source = Utils.urlForPath(this.layers);
  }
  if (!this.style_source && typeof(this.styles) == 'string') {
    this.style_source = Utils.urlForPath(this.styles);
  }
  if (this.layer_source) {
    queue.defer((function(complete) {
      Scene.loadLayers($__10.layer_source, (function(layers) {
        $__10.layers = layers;
        $__10.layers_serialized = Utils.serializeWithFunctions($__10.layers);
        complete();
      }));
    }));
  }
  if (this.style_source) {
    queue.defer((function(complete) {
      Scene.loadStyles($__10.style_source, (function(styles) {
        $__10.styles = styles;
        $__10.styles_serialized = Utils.serializeWithFunctions($__10.styles);
        complete();
      }));
    }));
  } else {
    this.styles = Scene.postProcessStyles(this.styles);
  }
  queue.await(function() {
    if (typeof callback == 'function') {
      callback();
    }
  });
};
Scene.prototype.reloadScene = function() {
  var $__10 = this;
  if (!this.initialized) {
    return;
  }
  this.loadScene((function() {
    $__10.refreshCamera();
    $__10.rebuildTiles();
  }));
};
Scene.prototype.refreshModes = function() {
  if (!this.initialized) {
    return;
  }
  this.modes = Scene.refreshModes(this.modes, this.styles);
};
Scene.prototype.updateActiveModes = function() {
  this.active_modes = {};
  var animated = false;
  for (var l in this.styles.layers) {
    var mode = this.styles.layers[l].mode.name;
    if (this.styles.layers[l].visible !== false) {
      this.active_modes[mode] = true;
      if (animated == false && this.modes[mode].animated == true) {
        animated = true;
      }
    }
  }
  this.animated = animated;
};
Scene.prototype.createCamera = function() {
  this.camera = Camera.create(this, this.styles.camera);
};
Scene.prototype.refreshCamera = function() {
  this.createCamera();
  this.refreshModes();
};
Scene.prototype.resetTime = function() {
  this.start_time = +new Date();
};
Scene.prototype.initInputHandlers = function() {};
Scene.prototype.input = function() {};
Scene.prototype.trackTileSetLoadStart = function() {
  if (this.tile_set_loading == null) {
    this.tile_set_loading = +new Date();
    console.log("tile set load START");
  }
};
Scene.prototype.trackTileSetLoadEnd = function() {
  if (this.tile_set_loading != null) {
    var end_tile_set = true;
    for (var t in this.tiles) {
      if (this.tiles[t].loading == true) {
        end_tile_set = false;
        break;
      }
    }
    if (end_tile_set == true) {
      this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
      this.tile_set_loading = null;
      console.log("tile set load FINISHED in: " + this.last_tile_set_load);
    }
  }
};
Scene.prototype.printDebugForTile = function(tile) {
  console.log("debug for " + tile.key + ': [ ' + Object.keys(tile.debug).map(function(t) {
    return t + ': ' + tile.debug[t];
  }).join(', ') + ' ]');
};
Scene.prototype.compileShaders = function() {
  for (var m in this.modes) {
    this.modes[m].gl_program.compile();
  }
};
Scene.prototype.getDebugSum = function(prop, filter) {
  var sum = 0;
  for (var t in this.tiles) {
    if (this.tiles[t].debug[prop] != null && (typeof filter != 'function' || filter(this.tiles[t]) == true)) {
      sum += this.tiles[t].debug[prop];
    }
  }
  return sum;
};
Scene.prototype.getDebugAverage = function(prop, filter) {
  return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};
Scene.prototype.workerLogMessage = function(event) {
  if (event.data.type != 'log') {
    return;
  }
  console.log("worker " + event.data.worker_id + ": " + event.data.msg);
};
Scene.loadLayers = function(url, callback) {
  var layers;
  var req = new XMLHttpRequest();
  req.onload = function() {
    eval('layers = ' + req.response);
    if (typeof callback == 'function') {
      callback(layers);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.loadStyles = function(url, callback) {
  var styles;
  var req = new XMLHttpRequest();
  req.onload = function() {
    styles = req.response;
    try {
      eval('styles = ' + req.response);
    } catch (e) {
      try {
        styles = yaml.safeLoad(req.response);
      } catch (e) {
        console.log("failed to parse styles!");
        console.log(styles);
        styles = null;
      }
    }
    Utils.stringsToFunctions(styles);
    Style.expandMacros(styles);
    Scene.postProcessStyles(styles);
    if (typeof callback == 'function') {
      callback(styles);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.postProcessStyles = function(styles) {
  for (var m in styles.layers) {
    if (styles.layers[m].visible !== false) {
      styles.layers[m].visible = true;
    }
    if ((styles.layers[m].mode && styles.layers[m].mode.name) == null) {
      styles.layers[m].mode = {};
      for (var p in Style.defaults.mode) {
        styles.layers[m].mode[p] = Style.defaults.mode[p];
      }
    }
  }
  styles.camera = styles.camera || {};
  return styles;
};
Scene.processLayersForTile = function(layers, tile) {
  var tile_layers = {};
  for (var t = 0; t < layers.length; t++) {
    layers[t].number = t;
    if (layers[t] != null) {
      if (layers[t].data == null) {
        tile_layers[layers[t].name] = tile.layers[layers[t].name];
      } else if (typeof layers[t].data == 'string') {
        tile_layers[layers[t].name] = tile.layers[layers[t].data];
      } else if (typeof layers[t].data == 'function') {
        tile_layers[layers[t].name] = layers[t].data(tile.layers);
      }
    }
    tile_layers[layers[t].name] = tile_layers[layers[t].name] || {
      type: 'FeatureCollection',
      features: []
    };
  }
  tile.layers = tile_layers;
  return tile_layers;
};
Scene.createModes = function(styles) {
  var modes = {};
  var built_ins = require('./gl/gl_modes').Modes;
  for (var m in built_ins) {
    modes[m] = built_ins[m];
  }
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  return modes;
};
Scene.refreshModes = function(modes, styles) {
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  for (m in modes) {
    modes[m].refresh();
  }
  return modes;
};
function findBaseLibraryURL() {
  Scene.library_base_url = '';
  var scripts = document.getElementsByTagName('script');
  for (var s = 0; s < scripts.length; s++) {
    var match = scripts[s].src.indexOf('tangram.debug.js');
    if (match == -1) {
      match = scripts[s].src.indexOf('tangram.min.js');
    }
    if (match >= 0) {
      Scene.library_base_url = scripts[s].src.substr(0, match);
      break;
    }
  }
}
;


},{"./camera":11,"./geo":12,"./gl/gl":13,"./gl/gl_builders":14,"./gl/gl_modes":16,"./gl/gl_program":17,"./gl/gl_texture":19,"./point":21,"./style":24,"./utils":26,"gl-matrix":4,"js-yaml":"jkXaKS","queue-async":5}],23:[function(require,module,exports){
"use strict";
var Utils = require('./utils');
var Style = require('./style').Style;
var Scene = require('./scene').default;
var GLBuilders = require('./gl/gl_builders').GLBuilders;
var TileSource = require('./tile_source.js');
var SceneWorker = {};
SceneWorker.worker = self;
SceneWorker.tiles = {};
GLBuilders.setTileScale(Scene.tile_scale);
SceneWorker.worker.addEventListener('message', function(event) {
  if (event.data.type != 'init') {
    return;
  }
  SceneWorker.worker_id = event.data.worker_id;
  SceneWorker.num_workers = event.data.num_workers;
  Style.selection_map_prefix = SceneWorker.worker_id;
});
SceneWorker.buildTile = function(tile) {
  tile.debug.rendering = +new Date();
  var keys = Scene.addTile(tile, SceneWorker.layers, SceneWorker.styles, SceneWorker.modes);
  tile.debug.rendering = +new Date() - tile.debug.rendering;
  keys.key = true;
  keys.loading = true;
  keys.loaded = true;
  keys.debug = true;
  var tile_subset = {};
  for (var k in keys) {
    tile_subset[k] = tile[k];
  }
  SceneWorker.worker.postMessage({
    type: 'buildTileCompleted',
    worker_id: SceneWorker.worker_id,
    tile: tile_subset,
    selection_map_size: Object.keys(Style.selection_map).length
  });
};
SceneWorker.worker.addEventListener('message', function(event) {
  if (event.data.type != 'buildTile') {
    return;
  }
  var tile = event.data.tile;
  if (SceneWorker.tiles[tile.key] != null) {
    if (SceneWorker.tiles[tile.key].loading == true) {
      return;
    }
    tile.layers = SceneWorker.tiles[tile.key].layers;
  }
  SceneWorker.tiles[tile.key] = tile;
  SceneWorker.tile_source = SceneWorker.tile_source || TileSource.create(event.data.tile_source.type, event.data.tile_source.url, event.data.tile_source);
  SceneWorker.styles = SceneWorker.styles || Utils.deserializeWithFunctions(event.data.styles);
  SceneWorker.layers = SceneWorker.layers || Utils.deserializeWithFunctions(event.data.layers);
  SceneWorker.modes = SceneWorker.modes || Scene.createModes(SceneWorker.styles);
  if (tile.layers == null) {
    tile.loaded = false;
    tile.loading = true;
    SceneWorker.tile_source.loadTile(tile, function() {
      Scene.processLayersForTile(SceneWorker.layers, tile);
      SceneWorker.buildTile(tile);
    });
  } else {
    SceneWorker.log("used worker cache for tile " + tile.key);
    tile.loaded = true;
    tile.loading = false;
    SceneWorker.buildTile(tile);
  }
});
SceneWorker.worker.addEventListener('message', function(event) {
  if (event.data.type != 'removeTile') {
    return;
  }
  var key = event.data.key;
  var tile = SceneWorker.tiles[key];
  if (tile != null) {
    if (tile.loading == true) {
      SceneWorker.log("cancel tile load for " + key);
      tile.loading = false;
      if (tile.xhr != null) {
        tile.xhr.abort();
      }
    }
    delete SceneWorker.tiles[key];
  }
});
SceneWorker.worker.addEventListener('message', function(event) {
  if (event.data.type != 'getFeatureSelection') {
    return;
  }
  var key = event.data.key;
  var selection = Style.selection_map[key];
  if (selection != null) {
    SceneWorker.worker.postMessage({
      type: 'getFeatureSelection',
      key: key,
      feature: selection.feature
    });
  }
});
SceneWorker.worker.addEventListener('message', function(event) {
  if (event.data.type != 'prepareForRebuild') {
    return;
  }
  SceneWorker.styles = Utils.deserializeWithFunctions(event.data.styles);
  SceneWorker.layers = Utils.deserializeWithFunctions(event.data.layers);
  SceneWorker.modes = SceneWorker.modes || Scene.createModes(SceneWorker.styles);
  Style.resetSelectionMap();
  SceneWorker.log("worker refreshed config for tile rebuild");
});
SceneWorker.log = function(msg) {
  SceneWorker.worker.postMessage({
    type: 'log',
    worker_id: SceneWorker.worker_id,
    msg: msg
  });
};


},{"./gl/gl_builders":14,"./scene":22,"./style":24,"./tile_source.js":25,"./utils":26}],24:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Style: {get: function() {
      return Style;
    }},
  __esModule: {value: true}
});
var Geo = require('./geo').Geo;
var Style = {};
Style.color = {
  pseudoRandomGrayscale: function(f) {
    var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4);
    return [0.7 * c, 0.7 * c, 0.7 * c];
  },
  pseudoRandomColor: function(f) {
    return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)];
  },
  randomColor: function(f) {
    return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()];
  }
};
Style.pixels = function(p, z) {
  var f;
  eval('f = function(f, t, h) { return ' + (typeof p == 'function' ? '(' + (p.toString() + '(f, t, h))') : p) + ' * h.Geo.meters_per_pixel[h.zoom]; }');
  return f;
};
Style.selection_map = {};
Style.selection_map_current = 1;
Style.selection_map_prefix = 0;
Style.generateSelection = function(color_map) {
  Style.selection_map_current++;
  var ir = Style.selection_map_current & 255;
  var ig = (Style.selection_map_current >> 8) & 255;
  var ib = (Style.selection_map_current >> 16) & 255;
  var ia = Style.selection_map_prefix;
  var r = ir / 255;
  var g = ig / 255;
  var b = ib / 255;
  var a = ia / 255;
  var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0;
  color_map[key] = {color: [r, g, b, a]};
  return color_map[key];
};
Style.resetSelectionMap = function() {
  Style.selection_map = {};
  Style.selection_map_current = 1;
};
Style.macros = ['Style.color.pseudoRandomColor', 'Style.pixels'];
Style.expandMacros = function expandMacros(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = expandMacros(val);
    } else if (typeof val == 'string') {
      for (var m in Style.macros) {
        if (val.match(Style.macros[m])) {
          var f;
          try {
            eval('f = ' + val);
            obj[p] = f;
            break;
          } catch (e) {
            obj[p] = val;
          }
        }
      }
    }
  }
  return obj;
};
Style.defaults = {
  color: [1.0, 0, 0],
  width: 1,
  size: 1,
  extrude: false,
  height: 20,
  min_height: 0,
  outline: {},
  selection: {
    active: false,
    color: [0, 0, 0, 1]
  },
  mode: {name: 'polygons'}
};
Style.helpers = {
  Style: Style,
  Geo: Geo
};
Style.parseStyleForFeature = function(feature, layer_name, layer_style, tile) {
  var layer_style = layer_style || {};
  var style = {};
  Style.helpers.zoom = tile.coords.z;
  if (typeof layer_style.filter == 'function') {
    if (layer_style.filter(feature, tile, Style.helpers) == false) {
      return null;
    }
  }
  style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || Style.defaults.color;
  if (typeof style.color == 'function') {
    style.color = style.color(feature, tile, Style.helpers);
  }
  style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || Style.defaults.width;
  if (typeof style.width == 'function') {
    style.width = style.width(feature, tile, Style.helpers);
  }
  style.width *= Geo.units_per_meter[tile.coords.z];
  style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || Style.defaults.size;
  if (typeof style.size == 'function') {
    style.size = style.size(feature, tile, Style.helpers);
  }
  style.size *= Geo.units_per_meter[tile.coords.z];
  style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || Style.defaults.extrude;
  if (typeof style.extrude == 'function') {
    style.extrude = style.extrude(feature, tile, Style.helpers);
  }
  style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
  style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;
  if (style.extrude) {
    if (typeof style.extrude == 'number') {
      style.height = style.extrude;
    } else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
      style.min_height = style.extrude[0];
      style.height = style.extrude[1];
    }
  }
  style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || Style.defaults.z || 0;
  if (typeof style.z == 'function') {
    style.z = style.z(feature, tile, Style.helpers);
  }
  style.outline = {};
  layer_style.outline = layer_style.outline || {};
  style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || Style.defaults.outline.color;
  if (typeof style.outline.color == 'function') {
    style.outline.color = style.outline.color(feature, tile, Style.helpers);
  }
  style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || Style.defaults.outline.width;
  if (typeof style.outline.width == 'function') {
    style.outline.width = style.outline.width(feature, tile, Style.helpers);
  }
  style.outline.width *= Geo.units_per_meter[tile.coords.z];
  style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || Style.defaults.outline.dash;
  if (typeof style.outline.dash == 'function') {
    style.outline.dash = style.outline.dash(feature, tile, Style.helpers);
  }
  var interactive = false;
  if (typeof layer_style.interactive == 'function') {
    interactive = layer_style.interactive(feature, tile, Style.helpers);
  } else {
    interactive = layer_style.interactive;
  }
  if (interactive == true) {
    var selector = Style.generateSelection(Style.selection_map);
    selector.feature = {
      id: feature.id,
      properties: feature.properties
    };
    selector.feature.properties.layer = layer_name;
    style.selection = {
      active: true,
      color: selector.color
    };
  } else {
    style.selection = Style.defaults.selection;
  }
  if (layer_style.mode != null && layer_style.mode.name != null) {
    style.mode = {};
    for (var m in layer_style.mode) {
      style.mode[m] = layer_style.mode[m];
    }
  } else {
    style.mode = Style.defaults.mode;
  }
  return style;
};


},{"./geo":12}],25:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Geo = require('./geo').Geo;
var Point = require('./point').default;
function TileSource(url_template, options) {
  var options = options || {};
  this.url_template = url_template;
  this.max_zoom = options.max_zoom || Geo.max_zoom;
}
var $__default = TileSource;
TileSource.create = function(type, url_template, options) {
  return new TileSource[type](url_template, options);
};
TileSource.projectTile = function(tile) {
  var timer = +new Date();
  for (var t in tile.layers) {
    var num_features = tile.layers[t].features.length;
    for (var f = 0; f < num_features; f++) {
      var feature = tile.layers[t].features[f];
      feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function(coordinates) {
        var m = Geo.latLngToMeters(Point(coordinates[0], coordinates[1]));
        return [m.x, m.y];
      });
    }
    ;
  }
  tile.debug.projection = +new Date() - timer;
  return tile;
};
TileSource.scaleTile = function(tile) {
  for (var t in tile.layers) {
    var num_features = tile.layers[t].features.length;
    for (var f = 0; f < num_features; f++) {
      var feature = tile.layers[t].features[f];
      feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function(coordinates) {
        coordinates[0] = (coordinates[0] - tile.min.x) * Geo.units_per_meter[tile.coords.z];
        coordinates[1] = (coordinates[1] - tile.min.y) * Geo.units_per_meter[tile.coords.z];
        return coordinates;
      });
    }
    ;
  }
  return tile;
};
NetworkTileSource.prototype = Object.create(TileSource.prototype);
function NetworkTileSource(url_template, options) {
  TileSource.apply(this, arguments);
  var options = options || {};
  this.response_type = "";
  this.url_hosts = null;
  var host_match = this.url_template.match(/{s:\[([^}+]+)\]}/);
  if (host_match != null && host_match.length > 1) {
    this.url_hosts = host_match[1].split(',');
    this.next_host = 0;
  }
}
NetworkTileSource.prototype.loadTile = function(tile, callback) {
  var tile_source = this;
  var req = new XMLHttpRequest();
  var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);
  if (this.url_hosts != null) {
    url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
    this.next_host = (this.next_host + 1) % this.url_hosts.length;
  }
  tile.url = url;
  tile.xhr = req;
  tile.debug.network = +new Date();
  req.onload = function() {
    if (tile.loading == false) {
      return;
    }
    tile.debug.response_size = tile.xhr.response.length || tile.xhr.response.byteLength;
    tile.debug.network = +new Date() - tile.debug.network;
    if (tile_source._loadTile) {
      tile.debug.parsing = +new Date();
      tile_source._loadTile(tile);
      tile.debug.parsing = +new Date() - tile.debug.parsing;
    }
    delete tile.xhr;
    tile.loading = false;
    tile.loaded = true;
    if (callback) {
      callback(tile);
    }
  };
  req.open('GET', url, true);
  req.responseType = this.response_type;
  req.send();
};
TileSource.GeoJSONTileSource = GeoJSONTileSource;
GeoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);
function GeoJSONTileSource(url_template, options) {
  NetworkTileSource.apply(this, arguments);
}
GeoJSONTileSource.prototype._loadTile = function(tile) {
  tile.layers = JSON.parse(tile.xhr.response);
  TileSource.projectTile(tile);
  TileSource.scaleTile(tile);
};
TileSource.TopoJSONTileSource = TopoJSONTileSource;
TopoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);
function TopoJSONTileSource(url_template, options) {
  NetworkTileSource.apply(this, arguments);
  if (typeof topojson == 'undefined') {
    try {
      importScripts('http://d3js.org/topojson.v1.min.js');
      console.log("loaded TopoJSON library");
    } catch (e) {
      console.log("failed to load TopoJSON library!");
    }
  }
}
TopoJSONTileSource.prototype._loadTile = function(tile) {
  if (typeof topojson == 'undefined') {
    tile.layers = {};
    return;
  }
  tile.layers = JSON.parse(tile.xhr.response);
  if (tile.layers.objects.vectiles != null) {
    tile.layers = topojson.feature(tile.layers, tile.layers.objects.vectiles);
  } else {
    var layers = {};
    for (var t in tile.layers.objects) {
      layers[t] = topojson.feature(tile.layers, tile.layers.objects[t]);
    }
    tile.layers = layers;
  }
  TileSource.projectTile(tile);
  TileSource.scaleTile(tile);
};
TileSource.MapboxTileSource = MapboxTileSource;
MapboxTileSource.prototype = Object.create(NetworkTileSource.prototype);
function MapboxTileSource(url_template, options) {
  NetworkTileSource.apply(this, arguments);
  this.response_type = "arraybuffer";
  this.VectorTile = require('vector-tile');
}
MapboxTileSource.prototype._loadTile = function(tile) {
  tile.data = new this.VectorTile(new Uint8Array(tile.xhr.response));
  tile.layers = tile.data.toGeoJSON();
  delete tile.data;
  for (var t in tile.layers) {
    var num_features = tile.layers[t].features.length;
    for (var f = 0; f < num_features; f++) {
      var feature = tile.layers[t].features[f];
      feature.properties.id = feature.properties.osm_id;
      feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function(coordinates) {
        coordinates[1] = -coordinates[1];
        return coordinates;
      });
    }
    ;
  }
};
if (module !== undefined) {
  module.exports = TileSource;
}


},{"./geo":12,"./point":21,"vector-tile":6}],26:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  urlForPath: {get: function() {
      return urlForPath;
    }},
  serializeWithFunctions: {get: function() {
      return serializeWithFunctions;
    }},
  deserializeWithFunctions: {get: function() {
      return deserializeWithFunctions;
    }},
  stringsToFunctions: {get: function() {
      return stringsToFunctions;
    }},
  runIfInMainThread: {get: function() {
      return runIfInMainThread;
    }},
  isPowerOf2: {get: function() {
      return isPowerOf2;
    }},
  __esModule: {value: true}
});
function urlForPath(path) {
  if (path == null || path == '') {
    return null;
  }
  if (typeof path == 'object' && path.length > 0) {
    for (var p in path) {
      var protocol = path[p].toLowerCase().substr(0, 4);
      if (!(protocol == 'http' || protocol == 'file')) {
        path[p] = window.location.origin + window.location.pathname + path[p];
      }
    }
  } else {
    var protocol = path.toLowerCase().substr(0, 4);
    if (!(protocol == 'http' || protocol == 'file')) {
      path = window.location.origin + window.location.pathname + path;
    }
  }
  return path;
}
;
function serializeWithFunctions(obj) {
  var serialized = JSON.stringify(obj, function(k, v) {
    if (typeof v == 'function') {
      return v.toString();
    }
    return v;
  });
  return serialized;
}
;
function deserializeWithFunctions(serialized) {
  var obj = JSON.parse(serialized);
  obj = stringsToFunctions(obj);
  return obj;
}
;
function stringsToFunctions(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = stringsToFunctions(val);
    } else if (typeof val == 'string' && val.match(/^function.*\(.*\)/) != null) {
      var f;
      try {
        eval('f = ' + val);
        obj[p] = f;
      } catch (e) {
        obj[p] = val;
      }
    }
  }
  return obj;
}
;
function runIfInMainThread(block, err) {
  try {
    if (window.document !== undefined) {
      block();
    }
  } catch (e) {
    if (typeof err == 'function') {
      err();
    }
  }
}
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Vector: {get: function() {
      return Vector;
    }},
  __esModule: {value: true}
});
var Vector = {};
Vector.lengthSq = function(v) {
  if (v.length == 2) {
    return (v[0] * v[0] + v[1] * v[1]);
  } else {
    return (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
};
Vector.length = function(v) {
  return Math.sqrt(Vector.lengthSq(v));
};
Vector.normalize = function(v) {
  var d;
  if (v.length == 2) {
    d = v[0] * v[0] + v[1] * v[1];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d];
    }
    return [0, 0];
  } else {
    var d = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d, v[2] / d];
    }
    return [0, 0, 0];
  }
};
Vector.cross = function(v1, v2) {
  return [(v1[1] * v2[2]) - (v1[2] * v2[1]), (v1[2] * v2[0]) - (v1[0] * v2[2]), (v1[0] * v2[1]) - (v1[1] * v2[0])];
};
Vector.lineIntersection = function(p1, p2, p3, p4, parallel_tolerance) {
  var parallel_tolerance = parallel_tolerance || 0.01;
  var a1 = p1[1] - p2[1];
  var b1 = p1[0] - p2[0];
  var a2 = p3[1] - p4[1];
  var b2 = p3[0] - p4[0];
  var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]);
  var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]);
  var denom = (b1 * a2) - (a1 * b2);
  if (Math.abs(denom) > parallel_tolerance) {
    return [((c1 * b2) - (b1 * c2)) / denom, ((c1 * a2) - (a1 * c2)) / denom];
  }
  return null;
};


},{}]},{},[23])