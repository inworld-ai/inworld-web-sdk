# When Inworld AI Web SDK should be extended

Certain features are not directly accessible through the Inworld AI Web SDK but are supported at the protocol level:

1. Some features are exclusively used within [Studio](https://studio.inworld.ai), and it is reasonable to hide their implementation.
1. Certain features are currently in the development phase and are not yet accessible on the production server from the backend. Nevertheless, it is necessary to test them before introducing new methods into DSL.


# How to extend Inworld AI Web SDK

Here are several ways to enhance the functionality of the Inworld AI Web SDK:

1. Extending the [Load Scene Request](#extend-load-scene-request). For example, it's possible to add additional capabilities.
1. Manual Parsing of [Load Scene Response](#parse-load-scene-response). For example, parse the load scene response to retrieve previous state packets and render them as part of conversation history.
1. Sending [Custom Packets](#send-custom-packet) (ensure you provide any necessary additional capabilities).
1. Extending [History Items](#extend-history-item).


## Extend load scene request

```ts
  import {
    InworldPacket as ProtoPacket,
    SessionControlResponseEvent,
  } from '@inworld/proto/generated/ai/inworld/packets/packets.pb';

  const beforeLoadScene = (packets: ProtoPacket[]) => {
    return packets.map((packet: ProtoPacket) => {
      const sessionConfiguration = packet.control?.sessionConfiguration;

      if (!sessionConfiguration) return packet;

      // Consistently present
      if (sessionConfiguration.capabilitiesConfiguration) {
        sessionConfiguration.capabilitiesConfiguration = {
          ...sessionConfiguration.capabilitiesConfiguration,
          regenerateResponse: true,
        };
      }

     // Consistently present.
      if (sessionConfiguration.clientConfiguration) {
        sessionConfiguration.clientConfiguration = {
          ...sessionConfiguration.clientConfiguration,
          id: 'custom-id',
        };
      }

      // Consistently present.
      if (sessionConfiguration.userConfiguration) {
        // Do something here.
      }

      // Consistently present.
      if (sessionConfiguration.sessionConfiguration) {
        // Do something here.
      }

      // Optional. It's present if continutation was set using setContinuation method.
      if (sessionConfiguration.continuation) {
        // Do something here.
      }

      return packet;
    });
  };

  const client = new InworldClient()
    .setConfiguration({ capabilities, history: { previousState : true } })
    .setUser(user)
    .setScene(sceneName)
    // If you have previousState propagate it here.
    // Don't forget to set history.previousState = true in setConfiguration method to attach previousState packets to history automatically.
    .setSessionContinuation({ previousState })
    ...
    .setExtension({ beforeLoadScene });

  this.connection = client.build();
```

## Parse load scene response

```ts
  const afterLoadScene = (response: SessionControlResponseEvent) => {
    // Do something with response.
    console.log(response.loadedScene);
    console.log(response.loadedCharacters);
    console.log(response.SessionHistoryResponse);
  };
  const client = new InworldClient()
    .setConfiguration({ capabilities })
    .setUser(user)
    .setScene(sceneName)
    ...
    .setExtension({ afterLoadScene });

  this.connection = client.build();
```

## Send custom packet

```ts
  interface RegenerateResponse {
    interactionId?: string;
  }

  interface ExtendedInworldPacket extends InworldPacket {
    isRegenerateResponse: boolean;
  }

  const sendRegenerateResponse = (interactionId?: string) => {
    const basePacket = this.connection.baseProtoPacket();

    return {
      ...basePacket,
      packetId: {
        ...basePacket.packetId,
        correlationId,
      },
      mutation: {
        regenerateResponse: {
          interactionId: interactionId ?? uuid(),
        },
      },
    };
  };

  const convertPacketFromProto = (proto) => {
    const packet = InworldPacket.fromProto(
      proto,
    ) as ExtendedInworldPacket;

    packet.isRegenerateResponse = true;

    return packet;
  };

  const interactionId = 'some-interaction-id';
  const client = new InworldClient<ExtendedInworldPacket>()
    .setConfiguration({ capabilities })
    .setUser(user)
    .setScene(sceneName)
    ...
    .setExtension({
      convertPacketFromProto,
      // See ## Extend load scene request
      beforeLoadScene,
    });

  this.connection = client.build();

  this.connection.sendCustomPacket(() => sendRegenerateResponse(interactionId));
```

## Extend history item

```ts
  type ExtendedHistoryItem = HistoryItem & { correlationId?: string };

  const client = new InworldClient<
    InworldPacket,
    ExtendedHistoryItem,
  >()
    .setConfiguration({ capabilities })
    .setUser(user)
    .setScene(sceneName)
    ...
    .setExtension({
      historyItem: (
        packet: ExtendedInworldPacket,
        item: HistoryItem,
      ) => ({
        ...item,
        correlationId: packet?.packetId?.correlationId,
      }),
    });
```
