import { COLOR_BAR_1, COLOR_BAR_2, COLOR_BAR_3, COLOR_BAR_4 } from './ui';

export const METRICS = [
  {
    title: 'Native startup',
    key: 'nativeStartup',
    color: COLOR_BAR_1,
    enabledByDefault: true,
  },
  {
    title: 'Script download',
    key: 'scriptDownload',
    color: COLOR_BAR_2,
    enabledByDefault: false,
  },
  {
    title: 'Script execution',
    key: 'scriptExecution',
    color: COLOR_BAR_3,
    enabledByDefault: true,
  },
  {
    title: 'Time to interactive',
    key: 'tti',
    color: COLOR_BAR_4,
    enabledByDefault: true,
  },
];
