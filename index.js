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
    nativeStartDuration: null,
    javascriptDownloadDuration: null,
    javascriptParseDuration: null,
    reactStartDuration: null,
  };
  static persistedStateReducer(persistedState, method, payload) {
    if (method === 'measurements') {
      return Object.assign({}, persistedState, {
        nativeStartDuration: payload.nativeStartDuration,
        javascriptDownloadDuration: payload.javascriptDownloadDuration,
        javascriptParseDuration: payload.javascriptParseDuration,
        reactStartDuration: payload.reactStartDuration,
      });
    }
    return persistedState;
  }

  render() {
    const {
      nativeStartDuration,
      javascriptDownloadDuration,
      javascriptParseDuration,
      reactStartDuration,
    } = this.props.persistedState;

    return (
      <CenteredView>
        <Measurement title="Native Startup" duration={nativeStartDuration} />
        <Measurement
          title="JavaScript Download"
          duration={javascriptDownloadDuration}
        />
        <Measurement
          title="JavaScript Parse"
          duration={javascriptParseDuration}
        />
        <Measurement title="React Startup" duration={reactStartDuration} />
      </CenteredView>
    );
  }
}
