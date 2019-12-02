import React from 'react';
import { styled, FlexRow } from 'flipper';

const BAR_HORIZONTAL_HEIGHT = 18;

export const BarHorizontalRounded = styled(FlexRow)(({ width = '100%' }) => ({
  width: width,
  height: BAR_HORIZONTAL_HEIGHT,
  borderRadius: BAR_HORIZONTAL_HEIGHT / 2,
  overflow: 'hidden',
}));

export const BarHorizontalSegment = styled('div')(
  ({ width = '100%', color = 'red' }) => ({
    width: width,
    height: BAR_HORIZONTAL_HEIGHT,
    backgroundColor: color,
  })
);
