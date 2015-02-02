import subscribeMixin from '../src/utils/subscribe';

describe('subscribeMixin', () => {
    let subject;

    class A {
        constructor() {
            subscribeMixin(this);
        }
    }

    beforeEach(() => {
        subject = new A();
    });

    afterEach(() => {
        subject = undefined;
    });

    it('fires all of the events that are subscribed', () => {
        let spyA = sinon.spy(),
            spyB = sinon.spy(),
            spyC = sinon.spy(),
            spyD = sinon.spy();

        subject.subscribe({ test: spyA });
        subject.subscribe({ test: spyB });
        subject.subscribe({ test: spyC });
        subject.subscribe({ test: spyD });

        sinon.assert.notCalled(spyA);
        sinon.assert.notCalled(spyB);
        sinon.assert.notCalled(spyC);
        sinon.assert.notCalled(spyD);

        subject.trigger('test');

        sinon.assert.called(spyA);
        sinon.assert.called(spyB);
        sinon.assert.called(spyC);
        sinon.assert.called(spyD);
    });

    it('does not fires events that are unsubscribed', () => {
        let spyA = sinon.spy(),
            spyB = sinon.spy(),
            spyC = sinon.spy(),
            spyD = sinon.spy();

        let subscriberA = { test: spyA },
            subscriberB = { test: spyB },
            subscriberC = { test: spyC },
            subscriberD = { test: spyD };

        subject.subscribe(subscriberA);
        subject.subscribe(subscriberB);
        subject.subscribe(subscriberC);
        subject.subscribe(subscriberD);

        subject.unsubscribe(subscriberA);
        subject.unsubscribe(subscriberB);
        subject.unsubscribe(subscriberC);

        subject.trigger('test');

        sinon.assert.notCalled(spyA);
        sinon.assert.notCalled(spyB);
        sinon.assert.notCalled(spyC);
        sinon.assert.called(spyD);
    });

    it('does not fire any events when they are all unsubscribed', () => {
        let spyA = sinon.spy(),
            spyB = sinon.spy(),
            spyC = sinon.spy(),
            spyD = sinon.spy();

        subject.subscribe({ test: spyA });
        subject.subscribe({ test: spyB });
        subject.subscribe({ test: spyC });
        subject.subscribe({ test: spyD });

        sinon.assert.notCalled(spyA);
        sinon.assert.notCalled(spyB);
        sinon.assert.notCalled(spyC);
        sinon.assert.notCalled(spyD);

        subject.unsubscribeAll();
        subject.trigger('test');

        sinon.assert.notCalled(spyA);
        sinon.assert.notCalled(spyB);
        sinon.assert.notCalled(spyC);
        sinon.assert.notCalled(spyD);
    });


});
