import React, { memo } from 'react';

import { Game } from './components/Game';
import styles from './App.module.scss';

export const App = memo(() => {

  return (
    <div className={styles.App}>
      <h1>Anna Valerious</h1>
      <Game />
    </div>
  );
});

export default App;
