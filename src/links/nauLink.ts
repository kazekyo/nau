import { from } from '@apollo/client';
import { createArgumentDefinitionsLink } from './argumentDefinitionsLink';
import { createCacheUpdaterLink } from './cacheUpdaterLink';
import { createConnectionLink } from './connectionLink';
import { createConnectionVariablesLink } from './connectionVariablesLink';
import { createRefetchableLink } from './refetchableLink';

export const nauLink = from([
  createRefetchableLink(),
  createConnectionLink(),
  createArgumentDefinitionsLink(),
  createConnectionVariablesLink(),
  createCacheUpdaterLink(),
]);
