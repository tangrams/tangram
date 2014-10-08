

export class NotImplemented extends Error {
    constructor(methodName) {
        this.name    = 'NotImplemented';
        this.message = 'Method' + methodName + ' must be implemented in subclass';
    }
}
