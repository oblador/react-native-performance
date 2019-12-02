import React from 'react';
import { FlipperPlugin, Button, FlexRow, styled } from 'flipper';
import { BarLegend } from './ui';
import { METRICS } from './constants';

export const TableLegend = ({ includedMetrics, onLegendClick }) => (
  <FlexRow>
    {METRICS.map(metric => (
      <BarLegend
        enabled={includedMetrics.has(metric.key)}
        color={metric.color}
        key={metric.key}
        onClick={() => onLegendClick(metric.key)}
      >
        {metric.title}
      </BarLegend>
    ))}
  </FlexRow>
);
