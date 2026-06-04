# Changelog
All notable changes to this project will be documented in this file.

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

