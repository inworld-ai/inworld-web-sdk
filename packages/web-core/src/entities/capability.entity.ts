import { CapabilitiesConfiguration } from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import { Capabilities } from '../common/data_structures';

export class Capability {
  static toProto(capabilities: Capabilities): CapabilitiesConfiguration {
    const {
      audio = true,
      debugInfo = false,
      emotions = false,
      interruptions = false,
      narratedActions = false,
      phonemes: phonemeInfo = false,
      silence: silenceEvents = false,
    } = capabilities;

    return {
      audio,
      debugInfo,
      emotions,
      interruptions,
      multiAgent: true,
      narratedActions,
      phonemeInfo,
      silenceEvents,
    };
  }
}
