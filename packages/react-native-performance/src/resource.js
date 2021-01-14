import { PerformanceResourceTiming } from './performance-entry';

export const installResourceLogger = (context, performance, addEntry) => {
  if (context.XMLHttpRequest && !context.XMLHttpRequest.performanceOriginal) {
    class XMLHttpRequest extends context.XMLHttpRequest {
      constructor(...args) {
        super(...args);
        this.performanceStartTime = null;

        super.onreadystatechange = () => {
          if (this.readyState === this.DONE) {
            const responseEnd = performance.now();
            const contentLength = Object.entries(this.responseHeaders).find(
              ([header]) => header.toLowerCase() === 'content-length'
            );
            addEntry(
              new PerformanceResourceTiming({
                name: this.responseURL,
                startTime: this.performanceStartTime,
                duration: responseEnd - this.performanceStartTime,
                initiatorType: 'xmlhttprequest',
                responseEnd,
                transferSize: contentLength ? parseInt(contentLength[1]) : 0,
              })
            );
          }
        };
      }

      open(...args) {
        this.performanceStartTime = performance.now();
        super.open(...args);
      }
    }
    XMLHttpRequest.performanceOriginal = context.XMLHttpRequest;
    context.XMLHttpRequest = XMLHttpRequest;
  }
};

export const uninstallResourceLogger = context => {
  if (context.XMLHttpRequest && context.XMLHttpRequest.performanceOriginal) {
    context.XMLHttpRequest = context.XMLHttpRequest.performanceOriginal;
  }
};
