import WorkerBroker from '../utils/worker_broker';

let MAX_VALUE = Math.pow(2, 16) - 1;
let Uint32_flag = false;

export default class VertexElements {
    constructor () {
        this.array = [];
        this.has_overflown = false;
    }
    push (value) {
        // If values have overflown and no Uint32 option is available, do not push values
        if (this.has_overflown && !Uint32_flag) {
            return;
        }

        // Trigger overflow if value is greater than Uint16 max
        if (value > MAX_VALUE) {
            this.has_overflown = true;
            if (!Uint32_flag) {
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

VertexElements.setUint32Flag = function(flag) {
    Uint32_flag = flag;
};

function createBuffer(array, overflown) {
    var typedArray = (overflown && Uint32_flag) ? Uint32Array : Uint16Array;
    return new typedArray(array);
}

WorkerBroker.addTarget('VertexElements', VertexElements);
