import { AppRegistry, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import performance, { PerformanceObserver } from 'react-native-performance';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

new PerformanceObserver((list, observer) => {
  if (list.getEntries().find(e => e.name === 'appMount')) {
    const dir =
      Platform.OS === 'android'
        ? RNFS.ExternalDirectoryPath
        : RNFS.DocumentDirectoryPath;
    const path = `${dir}/performance.json`;

    RNFS.writeFile(
      path,
      JSON.stringify(performance.getEntries().map(e => e.toJSON())),
      'utf8'
    );
    console.log(`wrote to ${path}`);
  }
}).observe({ type: 'measure', buffered: true });
