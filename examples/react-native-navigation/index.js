import { Navigation } from 'react-native-navigation';
import App from './App';

const ROOT_SCREEN = 'navigation.ROOT_SCREEN';

Navigation.registerComponent(ROOT_SCREEN, () => App);

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      component: {
        name: ROOT_SCREEN,
      },
    },
  });
});

if (__DEV__) {
  require('react-native-performance-flipper-reporter').setupDefaultFlipperReporter();
}
