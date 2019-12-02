import React from 'react';
import { styled, FlexRow, Text } from 'flipper';
import { COLOR_TEXT, COLOR_DISABLED } from './constants';

const BarLegendDot = styled('div')(({ color, size = 12 }) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: color,
}));

const BarLegendText = styled(Text)(({ disabled = false }) => ({
  color: disabled ? COLOR_DISABLED : COLOR_TEXT,
  fontSize: 12,
  marginLeft: 10,
  marginRight: 30,
}));

export const BarLegend = ({ children, enabled = true, color, onClick }) => (
  <FlexRow onClick={onClick}>
    <BarLegendDot color={enabled ? color : COLOR_DISABLED} />
    <BarLegendText disabled={!enabled}>{children}</BarLegendText>
  </FlexRow>
);
