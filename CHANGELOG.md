<!-- markdownlint-disable MD013 MD024 -->

# Change Log

## [Unreleased]

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
