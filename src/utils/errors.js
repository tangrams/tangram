

export class MethodNotImplemented extends Error {
    constructor(methodName) {
        super();
        this.name    = 'MethodNotImplemented';
        this.message = 'Method ' + methodName + ' must be implemented in subclass';
    }
}
