import React from 'react';
import { COLOR_SEPARATOR, COLOR_DISABLED } from './constants';

export const LABEL_HEIGHT = 9;
export const LABEL_MARGIN = 10;

const AxisLabel = ({ value, zoom, children }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: value * zoom,
      bottom: 0,
      width: 1,
      marginBottom: LABEL_HEIGHT + LABEL_MARGIN,
      backgroundColor: COLOR_SEPARATOR,
    }}
  >
    {children}
  </div>
);

const AxisText = ({ children }) => (
  <span
    style={{
      fontSize: 9,
      lineHeight: 1,
      color: '#999',
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: LABEL_MARGIN,
      textAlign: 'right',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const identity = a => a;

export const Grid = React.memo(
  ({
    numberOfIntervals,
    interval,
    formatLabel = identity,
    zoom = 1,
    insetTop = 0,
    insetLeft = 0,
    insetRight = 0,
    insetBottom = 0,
  }) =>
    new Array(numberOfIntervals)
      .fill(null)
      .map((_, i) => i * interval)
      .map(
        value =>
          value !== 0 && (
            <AxisLabel value={value} zoom={zoom}>
              <AxisText>{formatLabel(value)}</AxisText>
            </AxisLabel>
          )
      )
);
