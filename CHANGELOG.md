# Changelog
All notable changes to this project will be documented in this file.

# [2.2.0](https://github.com/NedcloarBR/nestjs-toolkit/compare/v2.1.0...v2.2.0) - (2026-09-14)

## Features

- **config:** Let defineConfig factories run outside the app ([db41ae1](https://github.com/NedcloarBR/nestjs-toolkit/commit/db41ae1463c84f79daf4ce616db6660c62368df2))

# [2.1.0](https://github.com/NedcloarBR/nestjs-toolkit/compare/v2.0.0...v2.1.0) - (2026-09-11)

## Documentation

- **readme:** Document make:config and nestjs-toolkit.json ([5e3dfd9](https://github.com/NedcloarBR/nestjs-toolkit/commit/5e3dfd964ab5797aed020bb6752c8812d2f9daa8))
- **readme:** Fix the init command name ([c23940b](https://github.com/NedcloarBR/nestjs-toolkit/commit/c23940b03a6060c9acc059ae10656cf164397abd))
- **readme:** Document application configuration ([22ed85d](https://github.com/NedcloarBR/nestjs-toolkit/commit/22ed85d22810670e1094b28b9e0613ad3c0a9374))

## Features

- **cli:** Add make:config command ([ce83a4a](https://github.com/NedcloarBR/nestjs-toolkit/commit/ce83a4a149d838e6b6b6344baa573378d798c318))
- **cli:** Store config dir and schema in the cli config ([aed6e74](https://github.com/NedcloarBR/nestjs-toolkit/commit/aed6e74e714ac28b715803ba46a70d049b51b773))
- **config:** Export the config subsystem ([997f5f2](https://github.com/NedcloarBR/nestjs-toolkit/commit/997f5f2ed6905bfd871b250f9a15ed7dac3865b4))
- **config:** Add defineEnv with typed namespaces ([63466e4](https://github.com/NedcloarBR/nestjs-toolkit/commit/63466e492edcf416c5761cb5b917daef7a209621))
- **config:** Validate env schemas with strict coercion ([63412a0](https://github.com/NedcloarBR/nestjs-toolkit/commit/63412a0ea8e29f34da0377fa60d7927fd5a1bb42))
- **config:** Load config files from a directory ([56332d8](https://github.com/NedcloarBR/nestjs-toolkit/commit/56332d83f408bbede0565aa962d0d0464bf72842))
- **config:** Derive config namespaces from file names ([93d2777](https://github.com/NedcloarBR/nestjs-toolkit/commit/93d2777254e166f4999ebe3958e5b65a5ce84480))
- **config:** Load optional peers on demand ([2872bd9](https://github.com/NedcloarBR/nestjs-toolkit/commit/2872bd967734bb26f69bc6cc74d0a3cf6a647036))
- **config:** Add shared config and standard schema types ([64d5da3](https://github.com/NedcloarBR/nestjs-toolkit/commit/64d5da3a82dd68c681fb6ffa8fd653188799602f))

# [2.0.0](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.3.4...v2.0.0) - (2026-09-10)

## Bug Fixes

- **cli:** Add node shebang to the bin entrypoint ([7e9eba0](https://github.com/NedcloarBR/nestjs-toolkit/commit/7e9eba06991956b5f7071e4c777e4f52ef01e4a7))
- **cli:** Import nest-commander constants with file extension ([1dd2285](https://github.com/NedcloarBR/nestjs-toolkit/commit/1dd22852e7d60220c444f0157d9c2d62cd3d4b74))

## Documentation

- **readme:** Document ESM-only install and peer requirements ([2ab5d0f](https://github.com/NedcloarBR/nestjs-toolkit/commit/2ab5d0f55734b6f8bd51ff2c477e882590c76d7a))

## Features

- **pkg:** Publish the package as ESM only ([a98e186](https://github.com/NedcloarBR/nestjs-toolkit/commit/a98e18649b924b8b34edb8c0a4c89fe593b4ca58))
  - **BREAKING CHANGE:** the package now ships as ESM only ("type": "module")
with no CommonJS build, and an "exports" map that blocks deep imports.

## Refactor

- **cli:** Load version through a json import attribute ([15c3cc6](https://github.com/NedcloarBR/nestjs-toolkit/commit/15c3cc646d2bbc778b512b3bf10fabab013b3747))
- **esm:** Replace __dirname and __filename with import.meta ([df797e4](https://github.com/NedcloarBR/nestjs-toolkit/commit/df797e47438cab4d524926f1ca023c2fb30b1a61))
- **esm:** Add explicit .js extensions to relative imports ([e483a89](https://github.com/NedcloarBR/nestjs-toolkit/commit/e483a893ba5ce9c0801fcfba0f8a5b8568b5354b))

## Styling

- Apply biome formatting to untouched files ([44bbefb](https://github.com/NedcloarBR/nestjs-toolkit/commit/44bbefbd6e8e903304c326b8c45860d5f6e16925))

# [1.3.4](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.3.3...v1.3.4) - (2026-06-26)

## Features

- **cli:** Add generic key command with custom env vars ([40f74d8](https://github.com/NedcloarBR/nestjs-toolkit/commit/40f74d8b9d3ff4cb9b0aba7b391d3c2fc0722224))

# [1.3.3](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.3.2...v1.3.3) - (2026-06-24)

## Bug Fixes

- **mixins:** Rebind typeorm metadata onto composed class ([727d57f](https://github.com/NedcloarBR/nestjs-toolkit/commit/727d57f2ba794d828460e79ec31e079d468869bd))

# [1.3.2](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.3.1...v1.3.2) - (2026-06-04)

## Bug Fixes

- Remove @Injectable from classes instantiated manually to prevent DI resolution errors ([ab81364](https://github.com/NedcloarBR/nestjs-toolkit/commit/ab81364738d02eb915df9a43b57d971a760539e2))

# [1.3.1](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.3.0...v1.3.1) - (2026-06-04)

## Bug Fixes

- Move @nestjs/common and @nestjs/core to peerDependencies to prevent duplicate instances ([d60da1b](https://github.com/NedcloarBR/nestjs-toolkit/commit/d60da1bf31756660ad9d2107c5c3350485384f1f))

# [1.3.0](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.2.1...v1.3.0) - (2026-06-04)

## Bug Fixes

- Set commander name explicitly to display correct binary name in help ([f005d7b](https://github.com/NedcloarBR/nestjs-toolkit/commit/f005d7bac9b98202943f1d45355f433fd558ba6e))

## Features

- Add utility types (Awaitable, Maybe, DeepPartial, Prettify, and more) ([a1e2ad0](https://github.com/NedcloarBR/nestjs-toolkit/commit/a1e2ad0fd19ace08094e0096fd1f4489717ef96a))
- Add http param decorators (ClientIp, RequestId, Headers) ([0c9dc53](https://github.com/NedcloarBR/nestjs-toolkit/commit/0c9dc533f09c16b0054fae1c138337d068d047e4))
- Add http utilities ([d90f0e1](https://github.com/NedcloarBR/nestjs-toolkit/commit/d90f0e1af526fb83b1968e0797fa59451f6889f4))

# [1.2.1](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.2.0...v1.2.1) - (2026-06-04)

## Bug Fixes

- Copy package.json to dist/ on postbuild to resolve runtime path error ([ba661cb](https://github.com/NedcloarBR/nestjs-toolkit/commit/ba661cb40d79638508ab8f7c73c0669f24a11bf4))

# [1.2.0](https://github.com/NedcloarBR/nestjs-toolkit/compare/v1.1.0...v1.2.0) - (2026-06-04)

## Features

- Add mixin utilities ([9226b5f](https://github.com/NedcloarBR/nestjs-toolkit/commit/9226b5fa5c7c5d848136b967136b5fb568e12bfd))

# [1.0.0]
(https://github.com/NedcloarBR/nestjs-toolkittree/v1.0.0) - (2025-10-13)

## Bug Fixes

- Remove private field ([fbb8812](https://github.com/NedcloarBR/nestjs-toolkit/commit/fbb88127e4464000af877b1ac30cee2b9b9b777a))
- Package name ([0bd7f79](https://github.com/NedcloarBR/nestjs-toolkit/commit/0bd7f7925235cdf913006cbde4d3aa993e090713))
- Imports ([292f344](https://github.com/NedcloarBR/nestjs-toolkit/commit/292f3446332380bcbd7383a2881a0ac07f490f29))

## Features

- Update imports ([193cbb4](https://github.com/NedcloarBR/nestjs-toolkit/commit/193cbb4c6bca2c792a2605c9de82cfbe1308b0bb))
- Add category command ([05c9ac0](https://github.com/NedcloarBR/nestjs-toolkit/commit/05c9ac0c759a126c10a9e781798acba4778765a3))
- Use enum for command category ([58b99e5](https://github.com/NedcloarBR/nestjs-toolkit/commit/58b99e54a34a3e14991a658c9fa40755b0ace973))
- Move init command to category folder ([11ac67d](https://github.com/NedcloarBR/nestjs-toolkit/commit/11ac67d368f86b4e6814bae098469f0c970fe4e9))
- Add per-command help and update categorized help ([7e54a1b](https://github.com/NedcloarBR/nestjs-toolkit/commit/7e54a1bae96e4345b7376237ac008ae914ced431))
- Disable default help command ([fb78cd9](https://github.com/NedcloarBR/nestjs-toolkit/commit/fb78cd9efcaec98a1b23c40165b39c99408af7d1))
- Update barrel files ([e97f2f8](https://github.com/NedcloarBR/nestjs-toolkit/commit/e97f2f807e26ac2802db765bc7661cd3a447386a))
- Update keys commands ([b2c93a3](https://github.com/NedcloarBR/nestjs-toolkit/commit/b2c93a31893613e6e144ea18af0cdf7bce8d9743))
- **cli/ui:** Add custom main help ([3a85988](https://github.com/NedcloarBR/nestjs-toolkit/commit/3a85988d43202cf88acc2cbce4ac214c15a8c92a))
- Add category to commands metadata ([d29b558](https://github.com/NedcloarBR/nestjs-toolkit/commit/d29b5584f89ca5011f16b6627585cdf286183469))
- Update app:key command and key utils ([ac6fe85](https://github.com/NedcloarBR/nestjs-toolkit/commit/ac6fe85713c38b8f5c8d0e9cdd379f348928e9f7))
- Initial commit ([c64b8eb](https://github.com/NedcloarBR/nestjs-toolkit/commit/c64b8ebdcafd4fc859c605a991389e614375a436))

## Performance

- Improve method to get commands list ([5c63c98](https://github.com/NedcloarBR/nestjs-toolkit/commit/5c63c98cdc48c9337dcc0d4c49aed24e983ea879))

## Refactor

- Rename app module to cli module ([925f323](https://github.com/NedcloarBR/nestjs-toolkit/commit/925f323b5cc545a4ab5f0a7d5c0d87fcc456c28f))

