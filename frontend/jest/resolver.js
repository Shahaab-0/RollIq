'use strict';

// Combines two resolvers that each want to be jest.config's sole `resolver`:
// - @react-native/jest-preset's (drops the "exports" field on react-native's
//   own package.json so subpath imports still resolve under Jest)
// - react-native-worklets' (react-native-worklets/jest/resolver.js -- forces
//   ".native" files to resolve to their plain fallback for worklets modules,
//   since there's no native TurboModule bridge under Jest)
// Jest only takes one `resolver`, so this re-implements both instead of
// picking one and losing the other.
module.exports = (request, options) => {
  const originalPackageFilter = options.packageFilter;
  let resolvedOptions = options;

  if (
    options.basedir.includes('react-native-worklets') ||
    request.includes('react-native-worklets')
  ) {
    resolvedOptions = {
      ...resolvedOptions,
      extensions: resolvedOptions.extensions?.filter(ext => !ext.includes('native')),
    };
  }

  return resolvedOptions.defaultResolver(request, {
    ...resolvedOptions,
    packageFilter: pkg => {
      const filteredPkg = originalPackageFilter ? originalPackageFilter(pkg) : pkg;
      if (filteredPkg.name === 'react-native') {
        delete filteredPkg.exports;
      }
      return filteredPkg;
    },
  });
};
