<!-- markdownlint-disable MD013 MD024 -->

# Change Log

## [Unreleased]
## [1.1.1] 2026-03-06

### Added

- Added a memory leak fix on reload

### Fixed

- Fix object var forwarding not falsy values

## [1.1.0] 2025-12-19

### Added

- Add option to console.warn when an non-existent step is parsed
- Add comment step
- Add ig.EVENT_STEP.FORCE_LEVEL_UP
- Add `logType` to ig.EVENT_STEP.LOG
- Add `game.entities.name.entity_name` variable

### Changed

- Replace marker position vec resolve with a more general `game.entities.name.` variable

### Fixed

- Fix step macros not replacing arguments with the literal type of number

## [1.0.0] 2025-12-17

Initial release
