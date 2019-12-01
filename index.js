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

const Duration = ({ title, duration }) => {
  const value = duration ? `${Math.round(duration)} ms` : 'Pending...';
  return (
    <RoundedSection title={title}>
      <Value>{value}</Value>
    </RoundedSection>
  );
};

const formatBytes = bytes => {
  const UNITS = ['B', 'KiB', 'MiB', 'GiB'];
  const UNIT_STEP = 1024;

  let unit;
  let value = bytes;
  for (let i = 0; i < UNITS.length; i++) {
    unit = UNITS[i];
    if (value / UNIT_STEP >= 1) {
      value /= UNIT_STEP;
    } else {
      break;
    }
  }

  return `${Math.round(value * 10) / 10} ${unit}`;
};

const FileSize = ({ title, bytes }) => {
  const value = bytes ? formatBytes(bytes) : 'Pending...';
  return (
    <RoundedSection title={title}>
      <Value>{value}</Value>
    </RoundedSection>
  );
};

export default class extends FlipperPlugin {
  static defaultPersistedState = {
    NativeStartup: null,
    BundleSize: null,
    ScriptDownload: null,
    ScriptExecution: null,
    TTI: null,
  };

  static persistedStateReducer(persistedState, method, payload) {
    if (method === 'measurements') {
      return Object.assign({}, persistedState, {
        NativeStartup: payload.NativeStartup,
        BundleSize: payload.BundleSize,
        ScriptDownload: payload.ScriptDownload,
        ScriptExecution: payload.ScriptExecution,
        TTI: payload.TTI,
      });
    }
    return persistedState;
  }

  render() {
    const {
      NativeStartup,
      BundleSize,
      ScriptDownload,
      ScriptExecution,
      TTI,
    } = this.props.persistedState;

    return (
      <CenteredView>
        <Duration title="Native startup" duration={NativeStartup} />
        <Duration title="Script download" duration={ScriptDownload} />
        <FileSize title="Bundle size" bytes={BundleSize} />
        <Duration title="Script execution" duration={ScriptExecution} />
        <Duration title="Time to interactive" duration={TTI} />
      </CenteredView>
    );
  }
}
