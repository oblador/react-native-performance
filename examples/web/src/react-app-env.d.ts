/// <reference types="react-scripts" />

// react-scripts only declares '*.module.css'. TypeScript 6 added TS2882, which
// requires a declaration for side-effect imports too, so plain `import './x.css'`
// needs one of its own.
declare module '*.css';
