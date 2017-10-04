let MAX_VALUE = Math.pow(2, 16) - 1;
let has_element_index_uint = false;

export default class VertexElements {
    constructor () {
        this.array = [];
        this.has_overflown = false;
    }
    push (value) {
        // If values have overflown and no Uint32 option is available, do not push values
        if (this.has_overflown && !has_element_index_uint) {
            return;
        }

        // Trigger overflow if value is greater than Uint16 max
        if (value > MAX_VALUE) {
            this.has_overflown = true;
            if (!has_element_index_uint) {
                return;
            }
        }

        this.array.push(value);
    }
    end () {
        if (this.array.length){
            let buffer = createBuffer(this.array, this.has_overflown);
            this.array = [];
            this.has_overflown = false;
            return buffer;
        }
        else {
            return false;
        }
    }
}

VertexElements.setElementIndexUint = function(flag) {
    has_element_index_uint = flag;
};

function createBuffer(array, overflown) {
    var typedArray = (overflown && has_element_index_uint) ? Uint32Array : Uint16Array;
    return new typedArray(array);
}
