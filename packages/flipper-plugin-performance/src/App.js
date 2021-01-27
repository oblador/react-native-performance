import React from 'react';
import { FlipperPlugin, FlexRow, Text, View, styled } from 'flipper';

import {
  Title,
  COLOR_SEPARATOR,
  COLOR_DISABLED,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { Timeline } from './Timeline';
import { Metrics } from './Metrics';
import { persistedStateReducer } from './persistedStateReducer';

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

export class App extends FlipperPlugin {
  static defaultPersistedState = {
    sessions: [],
  };

  static persistedStateReducer = persistedStateReducer;

  state = {
    selectedSessionStartedAt: null,
  };

  render() {
    const { sessions } = this.props.persistedState;
    const { selectedSessionStartedAt } = this.state;
    const session =
      sessions.find(
        session => session.sessionStartedAt === selectedSessionStartedAt
      ) || sessions[0];
    const { measures, metrics, marks } = session || {
      measures: [],
      metrics: {},
      marks: [],
    };

    return (
      <View grow={true} scrollable={true}>
        <Section>
          <SectionHeader>
            <Title>Timeline</Title>
          </SectionHeader>
        </Section>
        <Timeline measures={measures} marks={marks} />
        <Section>
          <SectionHeader>
            <Title>Metrics</Title>
          </SectionHeader>
        </Section>
        <Metrics metrics={metrics} />
      </View>
    );
  }
}
