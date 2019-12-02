import React from 'react';
import { FlexRow, styled, Text } from 'flipper';
import { COLOR_SEPARATOR, COLOR_DISABLED } from './constants';

const LABEL_HEIGHT = 12;
const LABEL_MARGIN = 10;

const SpacedRow = styled(FlexRow)({
  justifyContent: 'space-between',
});

const AxisLabel = styled('div')({
  position: 'relative',
  width: 1,
  marginBottom: LABEL_HEIGHT + LABEL_MARGIN,
  backgroundColor: COLOR_SEPARATOR,
});

const AxisText = styled(Text)({
  fontSize: 12,
  lineHeight: 1,
  color: '#999',
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: LABEL_MARGIN,
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

const identity = a => a;

export const Grid = ({
  numberOfIntervals,
  interval,
  formatLabel = identity,
  insetTop = 0,
  insetLeft = 0,
  insetRight = 0,
  insetBottom = 0,
}) => (
  <SpacedRow
    style={{
      position: 'absolute',
      top: insetTop,
      left: insetLeft,
      right: insetRight,
      bottom: insetBottom,
      pointerEvents: 'none',
    }}
  >
    {new Array(numberOfIntervals)
      .fill(null)
      .map((_, i) => i * interval)
      .map(value =>
        value === 0 ? (
          <div />
        ) : (
          <AxisLabel>
            <AxisText>{formatLabel(value)}</AxisText>
          </AxisLabel>
        )
      )}
  </SpacedRow>
);
