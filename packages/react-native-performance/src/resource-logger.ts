import { PerformanceResourceTiming } from './performance-entry';
import type { PerformanceEntry } from './performance-entry';
import type { Performance } from './performance';

interface XMLHttpRequestType extends XMLHttpRequest {
  new (...args: any): XMLHttpRequestType;
  performanceOriginal: XMLHttpRequest;
  performanceStartTime?: number;
  responseURL: string;
  responseHeaders: string[];
}
interface Context {
  XMLHttpRequest: XMLHttpRequestType;
}

export const installResourceLogger = (
  context: Context,
  performance: Performance,
  addEntry: (entry: PerformanceEntry) => PerformanceEntry
) => {
  if (context.XMLHttpRequest && !context.XMLHttpRequest.performanceOriginal) {
    class XMLHttpRequest extends context.XMLHttpRequest {
      constructor(...args: any) {
        super(...args);
        this.performanceStartTime = null;

        super.addEventListener('readystatechange', () => {
          if (this.readyState === this.DONE) {
            if (this.responseURL && this.responseHeaders) {
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
          }
        });
      }

      open(...args: any) {
        this.performanceStartTime = performance.now();
        //@ts-ignore
        super.open(...args);
      }
    }
    XMLHttpRequest.performanceOriginal = context.XMLHttpRequest;
    context.XMLHttpRequest = XMLHttpRequest;
  }
};

export const uninstallResourceLogger = (context: any) => {
  if (context.XMLHttpRequest && context.XMLHttpRequest.performanceOriginal) {
    context.XMLHttpRequest = context.XMLHttpRequest.performanceOriginal;
  }
};
