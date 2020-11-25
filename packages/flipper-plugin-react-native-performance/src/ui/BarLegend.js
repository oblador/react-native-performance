import React from 'react';
import { styled, FlexRow, Text, View } from 'flipper';
import { Metric } from './Metric';
import { COLOR_TEXT, COLOR_DISABLED } from './constants';

const BarLegendDot = styled('div')(({ color, size = 12 }) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: color,
}));

const BarLegendContent = styled('div')({
  marginLeft: 10,
  marginRight: 30,
});

const BarLegendText = styled(Text)(({ disabled = false }) => ({
  color: disabled ? COLOR_DISABLED : COLOR_TEXT,
  fontSize: 12,
}));

const MetricWithMargin = styled(Metric)({
  marginTop: 10,
});

export const BarLegend = ({
  children,
  value,
  unit,
  enabled = true,
  color,
  onClick,
}) => (
  <FlexRow onClick={onClick}>
    <BarLegendDot color={enabled ? color : COLOR_DISABLED} />
    <BarLegendContent>
      <BarLegendText disabled={!enabled}>{children}</BarLegendText>
      {value && <MetricWithMargin value={value} unit={unit} />}
    </BarLegendContent>
  </FlexRow>
);
