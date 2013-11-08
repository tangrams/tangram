function VectorRenderer (map, layer)
{
    this.map = map;
    this.layer = layer;
    this.tiles = {};
}

VectorRenderer.prototype.addTile = function (tile, tileDiv)
{
    if (this.tiles[tile.key] == null) {
        this.tiles[tile.key] = {};
        this.tiles[tile.key].key = tile.key;
        this.tiles[tile.key].coords = tile.coords;
    }
};

VectorRenderer.prototype.removeTile = function (tile)
{
    delete this.tiles[tile.key];
};
