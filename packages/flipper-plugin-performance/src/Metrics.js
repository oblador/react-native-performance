import React from 'react';
import { FlexRow, styled, Text } from 'flipper';
import {
  COLOR_TEXT,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { formatBytesToParts } from './lib/formatBytesToParts';
import { formatMillisecondsToParts } from './lib/formatMillisecondsToParts';

const formatValue = (value, unit) => {
  switch (unit) {
    case 'ms':
    case 'millisecond':
    case 'milliseconds':
      return formatMillisecondsToParts(value);
    case 'b':
    case 'byte':
    case 'bytes':
      return formatBytesToParts(value);
    default:
      return { value, unit };
  }
};

export const Metrics = React.memo(({ metrics }) => {
  return (
    <ul
      style={{
        display: 'flex',
        marginLeft: MARGIN_CONTAINER_HORIZONTAL - 20,
        marginTop: 10,
      }}
    >
      {Object.values(metrics).map((metric) => {
        const { value, unit } = formatValue(metric.value, metric.unit);
        return (
          <li
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 200,
              padding: 20,
              borderRadius: 10,
              backgroundColor: '#F7F7F7',
              marginTop: 20,
              marginLeft: 20,
              height: 117,
            }}
          >
            <h2>{metric.name}</h2>
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'flex-end',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <strong style={{ fontSize: 40, fontWeight: '500' }}>
                {value}
              </strong>
              <span
                style={{
                  fontSize: 10,
                  marginBottom: 5,
                  marginLeft: 5,
                  fontWeight: '500',
                }}
              >
                {unit}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
});
