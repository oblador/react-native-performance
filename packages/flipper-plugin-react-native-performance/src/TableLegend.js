import React from 'react';
import { FlipperPlugin, Button, FlexRow, styled } from 'flipper';
import { BarLegend } from './ui';
import { METRICS } from './constants';

export const TableLegend = ({
  includedMetrics,
  onLegendClick,
  selectedSession,
}) => (
  <FlexRow>
    {METRICS.map(metric => (
      <BarLegend
        enabled={includedMetrics.has(metric.key)}
        color={metric.color}
        key={metric.key}
        onClick={event => {
          onLegendClick(metric.key);
          event.stopPropagation();
        }}
        value={
          selectedSession &&
          selectedSession[metric.key] &&
          Math.round(selectedSession[metric.key])
        }
        unit="ms"
      >
        {metric.title}
      </BarLegend>
    ))}
  </FlexRow>
);
