import React from 'react';
import ReactDOM from 'react-dom';

import { Scatterplot } from './PixiScatterplot/Scatterplot';

const rootElement = document.getElementById('root');
const root = document.createElement('div');
rootElement?.appendChild(root);

ReactDOM.render(<Scatterplot />, root);
