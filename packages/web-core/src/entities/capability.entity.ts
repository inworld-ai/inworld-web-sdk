import { CapabilitiesConfiguration } from '../../proto/ai/inworld/engine/configuration/configuration.pb';
import { Capabilities } from '../common/data_structures';

export class Capability {
  static toProto(capabilities: Capabilities): CapabilitiesConfiguration {
    const {
      audio = true,
      debugInfo = false,
      emotions = false,
      interruptions = false,
      logsWarning = true,
      logsInfo = true,
      logsDebug = false,
      logsInternal = false,
      narratedActions = false,
      multiModalActionPlanning: multiModalActionPlanning = false,
      perceivedLatencyReport: perceivedLatencyReport = false,
      phonemes: phonemeInfo = false,
      pingPongReport: pingPongReport = true,
      silence: silenceEvents = false,
    } = capabilities;

    return {
      audio,
      debugInfo,
      emotions,
      interruptions,
      logs: logsWarning || logsInfo || logsDebug || logsInternal,
      logsWarning: logsWarning,
      logsInfo: logsInfo,
      logsDebug: logsDebug,
      logsInternal: logsInternal,
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
