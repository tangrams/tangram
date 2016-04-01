// Uniforms defining raster textures and macros for accessing them

#ifdef TANGRAM_FRAGMENT_SHADER
uniform sampler2D u_rasters[TANGRAM_NUM_RASTER_SOURCES];    // raster tile texture samplers
uniform vec2 u_raster_sizes[TANGRAM_NUM_RASTER_SOURCES];    // raster tile texture sizes (width/height in pixels)
uniform vec3 u_raster_offsets[TANGRAM_NUM_RASTER_SOURCES];  // raster tile texture UV starting offset for tile

// Note: the raster accessors below are #defines rather than functions to
// avoid issues with constant integer expressions for array indices

// Adjusts UVs in model space to account for raster tile texture overzooming
// (applies scale and offset adjustments)
#define adjustRasterUV(raster_index, uv) \
    ((uv) * u_raster_offsets[raster_index].z + u_raster_offsets[raster_index].xy)

// Returns the UVs of the current model position for a raster sampler
#define currentRasterUV(raster_index) \
    (adjustRasterUV(raster_index, v_modelpos_base_zoom.xy))

// Returns pixel location in raster tile texture at current model position
#define currentRasterPixel(raster_index) \
    (currentRasterUV(raster_index) * rasterPixelSize(raster_index))

// Samples a raster tile texture for the current model position
#define sampleRaster(raster_index) \
    (texture2D(u_rasters[raster_index], currentRasterUV(raster_index)))

// Samples a raster tile texture for a given pixel
#define sampleRasterAtPixel(raster_index, pixel) \
    (texture2D(u_rasters[raster_index], adjustRasterUV(raster_index, (pixel) / rasterPixelSize(raster_index))))

// Returns size of raster sampler in pixels
#define rasterPixelSize(raster_index) \
    (u_raster_sizes[raster_index])

#endif
