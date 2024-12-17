import { CapabilitiesConfiguration } from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import { Capabilities } from '../common/data_structures';

export class Capability {
  static toProto(capabilities: Capabilities): CapabilitiesConfiguration {
    const {
      audio = true,
      debugInfo = false,
      emotions = false,
      interruptions = false,
      logs,
      logsWarning,
      logsInfo,
      logsDebug,
      logsInternal,
      narratedActions = false,
      multiModalActionPlanning: multiModalActionPlanning = false,
      perceivedLatencyReport: perceivedLatencyReport = true,
      phonemes: phonemeInfo = false,
      pingPongReport: pingPongReport = true,
      silence: silenceEvents = false,
    } = capabilities;

    return {
      audio,
      debugInfo,
      emotions,
      interruptions,
      logs: logs ?? false,
      logsWarning: logsWarning ?? logs ?? true,
      logsInfo: logsInfo ?? logs ?? false,
      logsDebug: logsDebug ?? logs ?? false,
      logsInternal: logsInternal ?? logs ?? false,
      multiAgent: true,
      multiModalActionPlanning,
      narratedActions,
      perceivedLatencyReport,
      phonemeInfo,
      pingPongReport,
      silenceEvents,
    };
  }
}
