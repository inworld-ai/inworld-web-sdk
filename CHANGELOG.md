## 2022-05-012 v1.3.0

* Allow to use extended capabilities and scene props
* Allow to send and receive custom proto packet

## 2022-05-011 v1.2.0

* Replace CancelResponses by Mutation.CancelResponses on the protocol level
* Send TextEvent before CancelResponses on text interruption
* Continue audio playing after interruption in Safari

## 2022-05-01 v1.1.0

* Allow to interrupt character manually
* Replace character getters by direct property access
* Fix function call that checks its narrated action

## 2022-04-26 v1.0.0

* Add mute/unmute events support
* Allow to build history transcript inside SDK
* Add parameters to triggers
* Replace checking emotions behavior and strength by direct property access

## 2022-04-20 v0.9.7

* Improve chat example UI: add validation and rename fields
* Add narrated actions support
* Prevent starting/ending the audio session two times in a row

## 2022-03-31 v0.9.6

* Remove deprecated emotions attributes: joy, fear, trust and surprise
* Add phonemes support
* Add animation view mode to chat example

## 2022-03-14 v0.9.5

* Return sent packet as result of message send call

## 2022-03-09 v0.9.4

* Fix sending messages after reconnect

## 2022-03-09 v0.9.3

* Combine packet directly before sending

## 2022-03-09 v0.9.2

* Mark scene as loaded after character list is set

## 2022-03-08 v0.9.1

* Ensure scene is loaded once for simultaneously sent packets
