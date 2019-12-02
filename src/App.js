import React from 'react';
import { FlipperPlugin, Button, FlexRow, Text, styled } from 'flipper';

import {
  BarLegend,
  Title,
  COLOR_SEPARATOR,
  COLOR_DISABLED,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { StartupTable } from './StartupTable';
import { TableLegend } from './TableLegend';
import { formatBytes } from './lib/formatBytes';
import { METRICS } from './constants';

const Container = styled('div')({
  paddingTop: MARGIN_CONTAINER_VERTICAL,
  paddingBottom: MARGIN_CONTAINER_VERTICAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingRight: MARGIN_CONTAINER_HORIZONTAL,
});

const Section = styled(Container)({
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: COLOR_SEPARATOR,
});

const SectionHeader = styled(FlexRow)({
  justifyContent: 'space-between',
  alignItems: 'center',
});

const SectionHeaderStartup = styled(SectionHeader)({
  marginBottom: 20,
});

const PendingText = styled(Text)({
  fontSize: 13,
  color: COLOR_DISABLED,
});
const BundleSize = styled(Text)({
  fontSize: 20,
  fontWeight: 500,
});

export class App extends FlipperPlugin {
  static defaultPersistedState = {
    sessions: [],
    bundleSize: null,
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
        bundleSize: payload.bundleSize,
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

  handleSessionRemoveClick = session =>
    this.props.setPersistedState({
      sessions: this.props.persistedState.sessions.filter(
        ({ sessionStartedAt }) => sessionStartedAt !== session.sessionStartedAt
      ),
    });

  render() {
    const { sessions, bundleSize } = this.props.persistedState;
    const { includedMetrics } = this.state;
    const [currentSession] = sessions;

    return (
      <React.Fragment>
        <Section>
          <SectionHeaderStartup>
            <Title>Startup</Title>
            <Button onClick={this.handleClearClick}>Clear</Button>
          </SectionHeaderStartup>
          <TableLegend
            includedMetrics={includedMetrics}
            onLegendClick={this.toggleMetric}
          />
        </Section>
        <StartupTable
          sessions={sessions}
          includedMetrics={includedMetrics}
          onSessionRemoveClick={this.handleSessionRemoveClick}
        />
        <Section>
          <SectionHeader>
            <Title>Bundle</Title>
            {!bundleSize ? (
              <PendingText>Pending</PendingText>
            ) : (
              <BundleSize>{formatBytes(bundleSize)}</BundleSize>
            )}
          </SectionHeader>
        </Section>
      </React.Fragment>
    );
  }
}
