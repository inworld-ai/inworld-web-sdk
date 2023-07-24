import { ConfigurationSession } from '../types';

const INWORLD_CONFIGURATION_KEY = 'inworldConfiguration';

export const save = (values: ConfigurationSession) => {
  localStorage.setItem(INWORLD_CONFIGURATION_KEY, JSON.stringify(values));
};

export const get = () => localStorage.getItem(INWORLD_CONFIGURATION_KEY);
