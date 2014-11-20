import chai from 'chai';
let assert = chai.assert;
//import {parseLayers, walkRuleTree} from '../src/rules';
//import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let sampleFeature = {
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    4095.848539021153,
                    -2063.2531953755924
                ],
                [
                    1679.1837809756014,
                    -2370.160638078569
                ],
                [
                    1648.239138129794,
                    -2344.0932907504034
                ],
                [
                    1605.3640305757322,
                    -1985.5422007100378
                ],
                [
                    1566.2171932410502,
                    -1954.5561197685702
                ],
                [
                    -0.02912711201490421,
                    -2251.627815992822
                ],
                [
                    -0.02912711201490421,
                    0.0854450579987468
                ],
                [
                    4095.848539021153,
                    0.0854450579987468
                ],
                [
                    4095.848539021153,
                    -2063.2531953755924
                ]
            ]
        ]
    },
    "type": "Feature",
    "id": "484306",
    "clipped": true,
    "properties": {
        "land": "base"
    }
};

let sampleLayerStyle = {
    "color": {
        "default": [
            0.175,
            0.175,
            0.175
        ]
    },
    "visible": true,
    "mode": {
        "name": "polygons"
    },
    "outline": {}
};



let outStyle = {
    "color": [
        0.175,
        0.175,
        0.175
    ],
    "width": 3.3491621239499065,
    "size": 3.3491621239499065,
    "extrude": false,
    "height": 20,
    "min_height": 0,
    "z": 0,
    "order": 0,
    "outline": {
        "width": null,
        "tile_edges": false
    },
    "selection": {
        "active": false,
        "color": [
            0,
            0,
            0,
            1
        ]
    },
    "mode": {
        "name": "polygons"
    }
};

let layerName = 'earth';


describe('Style', () => {

    describe('Style.parseStyleForFeatures', () => {

        it('do someting', () => {
            assert.isObject(sampleFeature);
            assert.isObject(outStyle);
            assert.isObject(sampleLayerStyle);
            assert.isString(layerName);
        });

    });

});
