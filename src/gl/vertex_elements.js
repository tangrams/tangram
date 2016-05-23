import WorkerBroker from '../utils/worker_broker';

let MAX_VALUE = Math.pow(2, 16) - 1;
let Uint32_flag = false;

export default class VertexElements {
    constructor () {
        this.array = [];
        this.hasOverflown = false;
    }
    push (value) {
        if (value > MAX_VALUE) this.hasOverflown = true;
        this.array.push(value);
    }
    end () {
        if (this.array.length){
            let buffer = createBuffer(this.array, this.hasOverflown);
            this.array = [];
            this.hasOverflown = false;
            return buffer;
        }
        else return false;
    }
}

VertexElements.setUint32Flag = function(flag){
    Uint32_flag = flag;
}

function createBuffer(array, overflown){
    var typedArray = (overflown && Uint32_flag)
        ? Uint32Array
        : Uint16Array;
    return new typedArray(array);
}

WorkerBroker.addTarget('VertexElements', VertexElements);
