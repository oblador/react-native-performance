import React from 'react';
import { FlexRow, styled, Text } from 'flipper';
import { METRICS } from './constants';
import {
  BarHorizontalRounded,
  BarHorizontalSegment,
  COLOR_TEXT,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { formatTime } from './lib/formatTime';
import { getTotalMetricSum } from './lib/getTotalMetricSum';

const findSlowestDuration = (sessions, metrics) =>
  sessions.reduce(
    (slowestDuration, session) =>
      Math.max(slowestDuration, getTotalMetricSum(session, metrics)),
    0
  );

const ROW_VERTICAL_PADDING = MARGIN_CONTAINER_HORIZONTAL / 2;
const ROW_LABEL_WIDTH = 90;

const BarLabel = styled('th')({
  color: COLOR_TEXT,
  fontSize: 13,
  width: ROW_LABEL_WIDTH + MARGIN_CONTAINER_HORIZONTAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingTop: ROW_VERTICAL_PADDING,
  paddingBottom: ROW_VERTICAL_PADDING,
  textAlign: 'left',
  verticalAlign: 'middle',
});

const BarValue = styled('td')({
  paddingTop: ROW_VERTICAL_PADDING,
  paddingBottom: ROW_VERTICAL_PADDING,
  paddingRight: MARGIN_CONTAINER_HORIZONTAL,
});

const SessionRow = ({ relativeDuration, includedMetrics, ...session }) => {
  const {
    sessionStartedAt,
    nativeStartup,
    bundleSize,
    scriptDownload,
    scriptExecution,
    tti,
  } = session;
  const totalDuration = getTotalMetricSum(session, includedMetrics);
  const startDate = new Date(sessionStartedAt);

  return (
    <tr>
      <BarLabel>{formatTime(startDate)}</BarLabel>
      <BarValue>
        <BarHorizontalRounded
          width={Math.round((totalDuration / relativeDuration) * 100) + '%'}
        >
          {METRICS.filter(
            metric => includedMetrics.has(metric.key) && session[metric.key]
          ).map(metric => (
            <BarHorizontalSegment
              relativeSize={session[metric.key] / totalDuration}
              color={metric.color}
            />
          ))}
        </BarHorizontalRounded>
      </BarValue>
    </tr>
  );
};

const TableFullWidth = styled('table')({
  width: '100%',
  marginTop: MARGIN_CONTAINER_VERTICAL,
  marginBottom: MARGIN_CONTAINER_VERTICAL,
});

export const StartupTable = ({ sessions, includedMetrics }) => {
  const slowestDuration = findSlowestDuration(sessions, includedMetrics);

  return (
    <TableFullWidth>
      <tbody>
        {sessions.map(session => (
          <SessionRow
            {...session}
            includedMetrics={includedMetrics}
            relativeDuration={slowestDuration}
          />
        ))}
      </tbody>
    </TableFullWidth>
  );
};
