import React, { memo } from 'react';

import { Game } from './components/Game';
import { RootState } from './reducers/index';
import styles from './App.module.scss';
import { useSelector } from 'react-redux';

export const App = memo(() => {
  const health = useSelector((state: RootState) => state?.defaultState?.userHealth);

  return (
    <div className={styles.App}>
      <h1>Anna Valerious: {health}</h1>
      <Game />
    </div>
  );
});

export default App;
