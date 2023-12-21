import React, { Dispatch, SetStateAction, useState } from 'react';

interface SystemContextValues {
  loading: boolean;
  loadingPercent: number;
  loadingPercentTotal: number;
  state: string;
  setLoading: Dispatch<SetStateAction<boolean>> | null;
  setLoadingPercent: Dispatch<SetStateAction<number>> | null;
  setLoadingPercentTotal: Dispatch<SetStateAction<number>> | null;
  setState: Dispatch<SetStateAction<string>> | null;
}

const STATE_ERROR: string = 'state_error';
const STATE_INIT: string = 'state_init';
const STATE_PAUSED: string = 'state_paused';
const STATE_RUNNING: string = 'state_running';

const SystemContext = React.createContext<SystemContextValues>({
  loading: false,
  loadingPercent: 0,
  loadingPercentTotal: 0,
  state: STATE_INIT,
  setLoading: null,
  setLoadingPercent: null,
  setLoadingPercentTotal: null,
  setState: null,
});

const useSystem = () => React.useContext(SystemContext);

function SystemProvider({ children }: any) {
  // console.log("SystemProvider Init");

  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingPercentTotal, setLoadingPercentTotal] = useState(0);
  const [state, setState] = useState(STATE_INIT);

  return (
    <SystemContext.Provider
      value={{
        loading,
        loadingPercent,
        loadingPercentTotal,
        state,
        setLoading,
        setLoadingPercent,
        setLoadingPercentTotal,
        setState,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export {
  STATE_ERROR,
  STATE_INIT,
  STATE_PAUSED,
  STATE_RUNNING,
  SystemProvider,
  useSystem,
};
