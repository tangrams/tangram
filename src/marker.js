
// Tangram marker class - takes an html element as the base

export default class Marker {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.offset = options.offset || {x: 0, y: 0};
        this.wrap = typeof options.wrap === 'undefined' ? null : options.wrap; // override wrapWorld

        // TODO - default styles
        // this.element.classList.add('default-tangram-marker');

        this.map = null;
    }

    // add marker to the map
    addTo(map) {
        this.remove();
        this.map = map;
        map.getCanvasContainer().appendChild(this.element);

        map.view.subscribe({
            move: () => {
                this.update();
            }
        });
        map.view.subscribe({
            moveend: () => {
                this.update();
            }
        });
        this.update();

        return this;
    }

    // remove marker from the map
    remove() {
        if (this.map) {
            this.map.view.unsubscribe({move: this.update});
            this.map.view.unsubscribe({moveend: this.update});
            delete this.map;
        }
        this.element.remove();
        return this;
    }

    // set the marker's location
    setLocation(lnglat) {
        this.lngLat = lnglat;
        this.position = null;
        this.update();
        return this;
    }

    // get the marker's location
    getLocation() {
        return this.lngLat;
    }

    // update marker position
    update() {
        if (!this.map) {
            return;
        }
        if (this.wrap || (this.wrap === null && this.map.transform.wrapWorld)) {
            this.lngLat = this.unWrap(this.lngLat, this.position, this.map.transform);
        }
        // get new position
        this.position = this.map.project(this.lngLat).add(this.offset);

        // center marker to screen, then
        // position the element's top left corner, then center the element over the marker
        // TODO: the -50% y translation isn't working - height is 0 because of css reasons
        this.element.style['transform'] = `translate(${this.position.x}px, ${this.position.y}px) translate(-50%, -50%)`;
    }

    // set a css transform property
    setTransform(el, value) {
        el.style['transform'] = value;
    }

    // get the marker's html element
    getElement() {
        return this.element;
    }

    // find a good new marker position when the map is scrolled more than 360 degrees
    unWrap(lngLat, prevLoc, transform) {
        // Check to see if +/- 360 is closer to the previous location
        if (prevLoc) {
            var left  = Object.assign({}, lngLat);
            var right = Object.assign({}, lngLat);
            left      = Object.assign(left,  {lng: lngLat.lng - 360, lat: lngLat.lat});
            right     = Object.assign(right, {lng: lngLat.lng + 360, lat: lngLat.lat});
            const delta = this.map.project(lngLat).distSqr(prevLoc);
            if (this.map.project(left).distSqr(prevLoc) < delta) {
                lngLat = left;
            } else if (this.map.project(right).distSqr(prevLoc) < delta) {
                lngLat = right;
            }
        }

        // Wrap the lngLat until it's as close to the viewport as it can get
        var count = 0;
        while (Math.abs(lngLat.lng - this.map.center.lng) > 180 && count < 10) {
            count++;
            const pos = this.map.project(lngLat);
            if (pos.x >= 0 && pos.y >= 0 && pos.x <= this.map.view.size.css.width && pos.y <= transform.height) {
                break;
            }
            if (lngLat.lng > this.map.view.center.lng) {
                lngLat.lng -= 360;
            } else {
                lngLat.lng += 360;
            }
        }
        return lngLat;
    }

}
