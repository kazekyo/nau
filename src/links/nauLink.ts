import { from } from '@apollo/client';
import { createArgumentDefinitionsLink } from './argumentDefinitionsLink';
import { createCacheUpdaterLink } from './cacheUpdaterLink';
import { createConnectionLink } from './connectionLink';
import { createConnectionVariablesLink } from './connectionVariablesLink';
import { createRefetchableLink } from './refetchableLink';

// ArgumentDefinitionsLink checks values put into the Context by ConnectionLink
//   and changes the name of arguments in the Context or does not remove nullable arguments.
// So, the order must be ConnectionLink -> ArgumentDefinitionsLink -> ConnectionVariablesLink.

export const nauLink = from([
  createRefetchableLink(),
  createConnectionLink(),
  createArgumentDefinitionsLink(),
  createConnectionVariablesLink(),
  createCacheUpdaterLink(),
]);
