import React from 'react';
import { FlipperPlugin, Button, FlexRow, Text, View, styled } from 'flipper';

import {
  BarLegend,
  Title,
  Metric,
  COLOR_SEPARATOR,
  COLOR_DISABLED,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { StartupTable } from './StartupTable';
import { TableLegend } from './TableLegend';
import { formatBytesToParts } from './lib/formatBytesToParts';
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
    selectedSession: null,
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

  clearSelectedSession = () => this.setState({ selectedSession: null });

  handleSessionClick = session => this.setState({ selectedSession: session });

  handleSessionRemoveClick = session =>
    this.props.setPersistedState({
      sessions: this.props.persistedState.sessions.filter(
        ({ sessionStartedAt }) => sessionStartedAt !== session.sessionStartedAt
      ),
    });

  render() {
    const { sessions, bundleSize } = this.props.persistedState;
    const { includedMetrics, selectedSession } = this.state;
    const [currentSession] = sessions;

    return (
      <View grow={true} scrollable={true} onClick={this.clearSelectedSession}>
        <Section>
          <SectionHeaderStartup>
            <Title>Startup</Title>
            <Button onClick={this.handleClearClick}>Clear</Button>
          </SectionHeaderStartup>
          <TableLegend
            includedMetrics={includedMetrics}
            onLegendClick={this.toggleMetric}
            selectedSession={selectedSession}
          />
        </Section>
        <StartupTable
          sessions={sessions}
          includedMetrics={includedMetrics}
          selectedSession={selectedSession}
          onSessionClick={this.handleSessionClick}
          onSessionRemoveClick={this.handleSessionRemoveClick}
        />
        <Section>
          <SectionHeader>
            <Title>Bundle</Title>
            {!bundleSize ? (
              <PendingText>Pending</PendingText>
            ) : (
              <Metric {...formatBytesToParts(bundleSize)} />
            )}
          </SectionHeader>
        </Section>
      </View>
    );
  }
}
