import perfLogger from './perfLogger';

describe('perfLogger', () => {
    describe('metrics', () => {
        const exampleValue = 'exampleValue';
        const exampleKey = 'exampleKey';
        beforeEach(() => {
            perfLogger.clear();
            perfLogger.clearOutputs();
        });
        it('add metric to array', () => {
            perfLogger.addMetric({ key: exampleKey, value: exampleValue});
            expect(perfLogger.getMetrics()[0].key).toBe(exampleKey);
            expect(perfLogger.getMetrics()[0].value).toBe(exampleValue);
        });
        it('add metric should call output', () => {
            const output = { addMetric: jest.fn() };
            perfLogger.addOutputs([output]);
            perfLogger.addMetric({ key: exampleKey, value: exampleValue });
            expect(output.addMetric).toBeCalledTimes(1);
        });
    });
    describe('points', () => {
        const exampleGroup = 'exampleGroup';
        const exampleKey = 'exampleKey';
        beforeEach(() => {
            perfLogger.clear();
            perfLogger.clearOutputs();
        });
        it('perfLogger mark point', () => {
            perfLogger.markPoint({ key: exampleKey, group: exampleGroup });
            expect(perfLogger.getPoints()[exampleGroup][exampleKey]).not.toBeNull();
        });
        it('mark point should call output', () => {
            const output = { addPoint: jest.fn() };
            perfLogger.addOutputs([output]);
            perfLogger.markPoint({ key: exampleKey, group: exampleGroup });
            expect(output.addPoint).toBeCalledTimes(1);
        });
    });
    describe('timeSpans', () => {
        const exampleGroup = 'exampleGroup';
        const exampleKey = 'exampleKey';
        beforeEach(() => {
            perfLogger.clear();
            perfLogger.clearOutputs();
        });
        it(`starttimespan should add timespan to array`, () => {
            perfLogger.startTimespan({ key: exampleKey, group: exampleGroup, timestamp: 500 });
            expect(perfLogger.getTimespans()[exampleGroup][exampleKey].timespan.startTime).toBe(500);
        });
        it(`stoptimespan should set correct duration of event`, () => {
            perfLogger.startTimespan({ key: exampleKey, group: exampleGroup, timestamp: 500 });
            perfLogger.stopTimespan({ key: exampleKey, group: exampleGroup, timestamp: 600 });
            expect(perfLogger.getTimespans()[exampleGroup][exampleKey].timespan.duration).toBe(100);
            expect(perfLogger.getTimespans()[exampleGroup][exampleKey].timespan.stopTime).toBe(600);
        });
        it(`starttimespan shouldn't call output`, () => {
            const output = { addTimespan: jest.fn() };
            perfLogger.addOutputs([output]);
            perfLogger.startTimespan({ key: exampleKey, group: exampleGroup, timestamp: 500 });
            expect(output.addTimespan).not.toHaveBeenCalled();
        });
        it(`stoptimespan should call output`, () => {
            const output = { addTimespan: jest.fn() };
            perfLogger.addOutputs([output]);
            perfLogger.startTimespan({ key: exampleKey, group: exampleGroup, timestamp: 500 });
            perfLogger.stopTimespan({ key: exampleKey, group: exampleGroup, timestamp: 600 });
            expect(output.addTimespan).toHaveBeenCalledTimes(1);
        });
        it(`clearCompleted should remove completed events`, () => {
            perfLogger.startTimespan({ key: exampleKey, group: exampleGroup, timestamp: 500 });
            perfLogger.stopTimespan({ key: exampleKey, group: exampleGroup, timestamp: 600 });
            perfLogger.clearCompleted();
            expect(perfLogger.getTimespans()[exampleGroup]).toStrictEqual({});
        });
    });
});
