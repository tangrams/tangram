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
