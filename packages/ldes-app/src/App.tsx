import React, { useMemo, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { IConnectorService } from '../../ldes-types';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { connectors } from './hooks/api/data';
import { LDESContainer } from './pages/LDES/LDESContainer';
import { ServiceDetailContainer } from './pages/Services/ServiceDetailContainer';
import { ServicesContainer } from './pages/Services/ServicesContainer';

type AppContextType = {
  connectors: IConnectorService[];
  setConnectors: React.Dispatch<React.SetStateAction<IConnectorService[]>>;
};

// @ts-ignore
export const AppContext = React.createContext<AppContextType>({});

export function App() {
  const [state, setState] = useState(connectors);

  const memoizedValue = useMemo(
    () => ({
      connectors: state,
      setConnectors: setState,
    }),
    [state]
  );

  return (
    <AppContext.Provider value={memoizedValue}>
      <div className="w-full h-full flex flex-col items-center">
        <div className="w-full">
          <Header />
          <Navigation />
        </div>
        <div className="w-full max-w-6xl px-6 mt-16 pb-16">
          <Switch>
            <Route path="/services" exact>
              <ServicesContainer />
            </Route>
            <Route path="/services/:id">
              <ServiceDetailContainer />
            </Route>
            <Route path="/ldes">
              <LDESContainer />
            </Route>
            <Redirect to="/services" />
          </Switch>
        </div>
      </div>
    </AppContext.Provider>
  );
}
