import NodeCache from 'node-cache';

// stdTTL: standard time to live in seconds. Default = 0 (unlimited)
// checkperiod: period in seconds, used for the automatic delete check interval.
export const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 60 });
