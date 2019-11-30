import {
  FlipperPlugin,
  CenteredView,
  RoundedSection,
  styled,
  Text,
} from 'flipper';

const Value = styled(Text)({
  fontSize: 40,
  fontWeight: 'bold',
});

const Measurement = ({ title, duration }) => {
  const value = duration ? `${Math.round(duration)} ms` : 'Pending...';
  return (
    <RoundedSection title={title}>
      <Value>{value}</Value>
    </RoundedSection>
  );
};

export default class extends FlipperPlugin {
  static defaultPersistedState = {
    nativeStartTime: null,
    reactStartTime: null,
  };
  static persistedStateReducer(persistedState, method, payload) {
    if (method === 'measurements') {
      return Object.assign({}, persistedState, {
        nativeStartTime: payload.nativeStartTime,
        reactStartTime: payload.reactStartTime,
      });
    }
    return persistedState;
  }

  render() {
    const { nativeStartTime, reactStartTime } = this.props.persistedState;

    return (
      <CenteredView>
        <Measurement title="Native Startup" duration={nativeStartTime} />
        <Measurement title="React Startup" duration={reactStartTime} />
      </CenteredView>
    );
  }
}
