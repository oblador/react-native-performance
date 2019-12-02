import React from 'react';
import { FlipperPlugin, Button, FlexRow, styled } from 'flipper';

import {
  BarLegend,
  Title,
  COLOR_SEPARATOR,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { StartupTable } from './StartupTable';
import { TableLegend } from './TableLegend';
import { METRICS } from './constants';

const Section = styled('div')({
  paddingTop: MARGIN_CONTAINER_VERTICAL,
  paddingBottom: MARGIN_CONTAINER_VERTICAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingRight: MARGIN_CONTAINER_HORIZONTAL,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: COLOR_SEPARATOR,
});

const TableLegendHeader = styled(FlexRow)({
  justifyContent: 'space-between',
  marginBottom: 20,
});

export class App extends FlipperPlugin {
  static defaultPersistedState = {
    sessions: [],
  };

  static persistedStateReducer(persistedState, method, payload) {
    if (method === 'measurements') {
      let sessions = persistedState.sessions.slice();
      let existingSession = persistedState.sessions.find(
        session => session.sessionStartedAt === payload.sessionStartedAt
      );
      const session = {
        sessionStartedAt: payload.sessionStartedAt,
        nativeStartup: payload.nativeStartup,
        bundleSize: payload.bundleSize,
        scriptDownload: payload.scriptDownload,
        scriptExecution: payload.scriptExecution,
        tti: payload.tti,
      };
      if (existingSession) {
        const index = sessions.indexOf(existingSession);
        sessions.splice(index, 1, session);
      } else {
        sessions.unshift(session);
      }
      return Object.assign({}, persistedState, {
        sessions,
      });
    }
    return persistedState;
  }

  state = {
    includedMetrics: new Set(
      METRICS.filter(metric => metric.enabledByDefault).map(({ key }) => key)
    ),
  };

  toggleMetric = key =>
    this.setState(state => {
      const includedMetrics = new Set(state.includedMetrics);
      if (includedMetrics.has(key)) {
        includedMetrics.delete(key);
      } else {
        includedMetrics.add(key);
      }
      return { includedMetrics };
    });

  handleClearClick = () => this.props.setPersistedState({ sessions: [] });

  render() {
    const { sessions } = this.props.persistedState;
    const { includedMetrics } = this.state;

    return (
      <React.Fragment>
        <Section>
          <TableLegendHeader>
            <Title>Startup</Title>
            <Button onClick={this.handleClearClick}>Clear</Button>
          </TableLegendHeader>
          <TableLegend
            includedMetrics={includedMetrics}
            onLegendClick={this.toggleMetric}
          />
        </Section>
        <StartupTable sessions={sessions} includedMetrics={includedMetrics} />
      </React.Fragment>
    );
  }
}
