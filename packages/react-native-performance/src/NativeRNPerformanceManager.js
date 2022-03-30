/**
 * @flow
 */

import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Events
  +addListener: (eventName: string) => void;
  +removeListeners: (count: number) => void;
}

export default (TurboModuleRegistry.get<Spec>('RNPerformanceManager'): ?Spec);
