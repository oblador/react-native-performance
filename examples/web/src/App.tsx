import React from 'react';
import logo from './logo.svg';
import './App.css';
import { performance, PerformanceObserver } from 'isomorphic-performance';

function App() {
  const [measures, setMeasures] = React.useState<PerformanceEntry[]>([]);
  React.useEffect(() => {
    performance.measure('App.render');
    new PerformanceObserver(() => {
      setMeasures(performance.getEntriesByName('App.render'));
    }).observe({ type: 'measure', buffered: true });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <ul>
          {measures.map((entry) => (
            <li key={entry.startTime}>
              {entry.name}: {entry.duration.toFixed(1)}ms
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
