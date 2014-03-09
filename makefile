all: dist/vector-map.min.js dist/vector-map.cat.js

dist/vector-map.cat.js: lib/libtess.cat.js geo.js gl.js vector_renderer.js canvas_renderer.js gl_renderer.js gl_builders.js vertex.glsl.js fragment.glsl.js leaflet_vector_tile_layer.js
	cat lib/libtess.cat.js geo.js gl.js vector_renderer.js canvas_renderer.js gl_renderer.js gl_builders.js leaflet_vector_tile_layer.js vertex.glsl.js fragment.glsl.js > dist/vector-map.cat.js

dist/vector-map.min.js: dist/vector-map.cat.js
	./node_modules/.bin/uglifyjs dist/vector-map.cat.js -c > dist/vector-map.min.js

vertex.glsl.js: vertex.glsl
	(echo "// Generated from vertex.glsl, don't edit"; echo 'GLRenderer.vertex_shader_source = '; sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' vertex.glsl; echo '"";';) > vertex.glsl.js

fragment.glsl.js: fragment.glsl
	(echo "// Generated from fragment.glsl, don't edit";echo 'GLRenderer.fragment_shader_source = '; sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' fragment.glsl; echo '"";';) > fragment.glsl.js

clean:
	rm -f dist/*
	rm -f *.glsl.js
