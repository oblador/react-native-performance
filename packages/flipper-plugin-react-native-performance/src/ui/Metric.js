import React from 'react';
import { FlexRow, styled, Text } from 'flipper';
import { COLOR_TEXT } from './constants';

const Value = styled(Text)({
  color: COLOR_TEXT,
  fontSize: 20,
  fontWeight: 500,
});

const Unit = styled(Text)({
  color: COLOR_TEXT,
  fontSize: 10,
  marginLeft: 5,
});

export const Metric = ({ unit, value, ...props }) => (
  <div {...props}>
    <Value>{value}</Value>
    <Unit>{unit}</Unit>
  </div>
);
