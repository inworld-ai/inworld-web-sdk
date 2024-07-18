## [Unreleased]

### Changed

- Await for CLOSED WebSocket connection state after CLOSING one
- Allow to change scene user parameters

## [2.7.1] - 2024-06-27

### Fixed

- Add user to scene automatically in case of one-to-one conversation
- Allow to pass user as participant to multi-character conversation
- Use character name as scene name if scene is not provided

## [2.7.0] - 2024-06-21

### Added

- Support Push-to-talk feature

### Changed

- Support new runtime protocol session configuration
- Expose Inworld error codes

## [2.6.0] - 2024-05-31

### Added

- Multi-character conversation support (2.0)

## [2.5.0] - 2024-05-03

### Added

- Allow to like, dislike or undo feedback
- Handle runtime warnings

### Changed

- Change internal way to open session

### Added

- Allow to change scene and add characters to current scene

## [2.4.1] - 2024-03-06

### Fixed

- Fix playback props initialization

## [2.4.0] - 2024-03-05

### Added

- Make sample rate configurable

## [2.3.1] - 2024-02-12

### Fixed

- Use `targets` property only for multi characters mode

## [2.3.0] - 2024-01-31

### Added

- Multi characters support

## [2.2.2] - 2024-01-26

### Fixed

- Fix copy history transcript action

## [2.2.1] - 2024-01-23

### Fixed

- Fix replacing player placeholder for narrated actions inside history

## [2.2.0] - 2024-01-20

### Added

- Outgoing narrated actions support

## [2.1.1] - 2024-01-15

### Fixed

- Fix esm package building

## [2.1.0] - 2024-01-13

### Added

- Add `diff` to the `onHistoryChange` callback as the second parameter

### Fixed

- Use the JS built file instead of the JSON one to determine the current package version

### Changed

- Update license information

## [2.0.1] - 2023-12-01

### Fixed

- Updated typescript to v5

## [2.0.0] - 2023-11-29

- Move Web SDK to Web Core

## [1.9.3] - 2023-11-27

### Added

- Update proto files to new structure

## [1.9.2] - 2023-11-20

### Added

- Improve client request format

### Fixed

- Improve test coverage

## [1.9.1] - 2023-10-19

### Fixed

- Stop playing and recording sound on connection manual closing

## [1.9.0] - 2023-10-04

### Added

- Scene name pattern validation
- Allow to get the conversation state
- Allow to propagate previous conversation state to new connection

## [1.8.0] - 2023-09-29

### Added

- Expose `interactionId` and `utteranceId` of interrupted packets

## [1.7.0] - 2023-09-27

### Added

- Allow to add previous state packets to history

### Fixed

- Send a `MUTE` event when auto-reconnecting prior to transmitting any other packets, provided that a `MUTE` event was sent prior to the disconnection

## [1.6.2] - 2023-09-20

### Added

- Allow to use async `onDisconnect` and `onError`

### Fixed

- Include the correlationId in both the fromProto conversion method and the associated historical items
- Include overlooked trigger parameters to corresponding history item

## [1.6.1] - 2023-09-13

### Fixed

- Include overlooked calls to the `historyItem` method for queued packets

## [1.6.0] - 2023-09-08

### Added

- Allow to extend history item
- Add `correlationId` to text, custom and cancel response packets
- Wrap narrated actions with asterisks

### Removed

- Remove excess extended capabilities generic type

### Fixed

- Generate proto packet just once to dispatching it to the WebSocket connection

## [1.5.3] - 2023-08-30

### Fixed

- Ensure `beforeLoadScene` and `afterLoadScene` are present before call them

## [1.5.2] - 2023-08-29

### Added

- Allow to propagate previous dialog to new connection
- Allow manage load scene response and request via extension

### Fixed

- Resolve the issue of script loading occurring before the document is ready
- Fix mute/unmute volume changing for currently playing audio track

## [1.5.1] - 2023-08-04

- Use correct link to GitHub page

## [1.5.0] - 2023-08-04

- Allow to propagate user profile fields
- Propagate audio duration to onBeforePlaying and onAfterPlaying callbacks
- Use UUID as user persistent id by default

## [1.4.2] - 2023-07-25

- Updated example project Generate Token

## [1.4.1] - 2023-07-25

- Added Innequin model to the Chat example

## [1.4.0] - 2023-07-06

- Added SSL support to generate_token example
- Added audio playback config to examples
- Use gradual fading to stop the character's audio playback
- Fix Validate stop playback settings
- Fix Move interpolate function to helpers
- Add audio playback config to example

## [1.3.2] - 2023-05-30

- Fix audio playback for iOS mobile using LTE

## [1.3.1] - 2023-05-30

- Fix audio recording for iOS mobile using LTE

## [1.3.0] - 2023-05-12

- Allow to use extended capabilities and scene props
- Allow to send and receive custom proto packet

## [1.2.0] - 2023-05-11

- Replace CancelResponses by Mutation.CancelResponses on the protocol level
- Send TextEvent before CancelResponses on text interruption
- Continue audio playing after interruption in Safari

## [1.1.0] - 2023-05-01

- Allow to interrupt character manually
- Replace character getters by direct property access
- Fix function call that checks its narrated action

## [1.0.0] - 2023-04-26

- Add mute/unmute events support
- Allow to build history transcript inside SDK
- Add parameters to triggers
- Replace checking emotions behavior and strength by direct property access

## [0.9.7] - 2023-04-20

- Improve chat example UI: add validation and rename fields
- Add narrated actions support
- Prevent starting/ending the audio session two times in a row

## [0.9.6] - 2023-03-31

- Remove deprecated emotions attributes: joy, fear, trust and surprise
- Add phonemes support
- Add animation view mode to chat example

## [0.9.5] - 2023-03-14

- Return sent packet as result of message send call

## [0.9.4] - 2023-03-09

- Fix sending messages after reconnect

## [0.9.3] - 2023-03-09

- Combine packet directly before sending

## [0.9.2] - 2023-03-09

- Mark scene as loaded after character list is set

## [0.9.1] - 2023-03-08

- Ensure scene is loaded once for simultaneously sent packets
