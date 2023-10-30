import fetch from "isomorphic-fetch";
import { saveSession, retrieveSession } from "./session";

// Initial configuration used when creating a journey manager
interface Config {
  apiVersion?: "v1" | "v2";
  apiKey: string;
  journeyId?: string;
  journeyAssistantId: string;
  voiceOverride?: string;
  languageOverride?: string;
  preventRepeats?: boolean;
  contactId: string;
  implementation?: "native";
  debug?: boolean;
  dev?: boolean;
  timeoutSettings?: {
    seconds: number;
    stepId: string;
  };
}

export interface StepData {
  stepId?: string;
  journeyId?: string;
  forceEnd?: boolean;
  forceEscalate?: boolean;
  forceAutomate?: boolean;
  bidirectional?: boolean;
  payload?: object;
}

// The journey manager object
export interface VoiceCompass {
  updateStep: (data: StepData) => Promise<StepUpdate>;
  getLastStepId: () => string | null;
}

export interface StepUpdate {
  escalate?: boolean;
  end?: boolean;
  error?: string;
  warning?: string;
}

const legacyApiUrl = "https://api.voicecompass.ai/v1";

const devApiUrl = "https://dev.journeys.voicecompass.ai/v1";

const prodApiUrl = "https://journeys.voicecompass.ai/v1";

export const create = (config: Config): VoiceCompass => {
  const session = retrieveSession(config.contactId);

  const searchParams = new URLSearchParams(window.location.search);

  const token: string = searchParams.get("token") || session?.token || "";

  // Defined using a literal so typos can be avoided during checking
  const mode: "compose" | null =
    (searchParams.get("mode") || session?.mode) === "compose"
      ? "compose"
      : null;

  const contactId = config.contactId || session?.contactId;

  if (!contactId) {
    console.warn(
      'No contact ID provided. Please call the Voice Compass client `create` method with a `contactId` field extracted from the URL. Example code: `new URLSearchParams(window.location.search).get("cid")`'
    );
  }

  const apiUrl =
    !config.apiVersion || config.apiVersion === "v2"
      ? config.dev
        ? devApiUrl
        : prodApiUrl
      : legacyApiUrl;

  let timeout: number | null = null;

  let previousStepId: string | undefined = session?.previousStepId;
  let currentJourneyId: string | undefined =
    session?.journeyId || config.journeyId;

  const saveVcSession = () => {
    saveSession({
      contactId,
      journeyId: currentJourneyId,
      previousStepId,
      token,
      mode: mode || undefined
    });
  };

  saveVcSession();

  const switchJourney = (journeyId: string) => {
    currentJourneyId = journeyId;
    saveVcSession();
  };

  const sendUpdateRequest = (stepData: StepData): Promise<StepUpdate> => {
    const { forceEnd, forceEscalate, forceAutomate, ...rest } = stepData;

    const payload = {
      ...rest,
      end: forceEnd,
      escalate: forceEscalate,
      automate: forceAutomate,
      contactId,
      implementation: config.implementation,
      botId: config.journeyAssistantId,
      journeyId: stepData.journeyId || config.journeyId,
      voice: config.voiceOverride,
      language: config.languageOverride
    };

    return fetch(`${apiUrl}/track`, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then((res: StepUpdate) => {
        if (config.debug) {
          console.info(
            `${String.fromCodePoint(0x02713)} step: ${payload.stepId}`,
            payload
          );
        }
        return res;
      })
      .catch((err: Error) => {
        if (config.debug) {
          console.error(
            `${String.fromCodePoint(0x000d7)} step: ${payload.stepId}`,
            err
          );
        }
        return {
          // TODO: look into propagating more error context
          error: "Something went wrong"
        };
      });
  };

  const resetCallTimeout = () => {
    // If there is an active timeout, remove it
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }

    const { timeoutSettings } = config;

    // If timeout logic is configured, set it up here
    if (timeoutSettings) {
      timeout = (setTimeout(() => {
        sendUpdateRequest({
          stepId: timeoutSettings.stepId,
          forceEnd: true
        });
      }, timeoutSettings.seconds * 1000) as unknown) as number;
    }
  };

  resetCallTimeout();

  const updateStep = (stepData: StepData) => {
    if (stepData.stepId === previousStepId && config.preventRepeats) {
      const warning = `Duplicate step ID detected, step update prevented: ${stepData.stepId}`;
      if (config.debug) {
        console.warn(warning);
      }
      return Promise.resolve({
        warning: warning
      });
    }
    if (stepData.journeyId && stepData.journeyId !== currentJourneyId) {
      switchJourney(stepData.journeyId);
    }
    previousStepId = stepData.stepId;
    saveVcSession();
    resetCallTimeout();
    return sendUpdateRequest(stepData);
  };

  return {
    updateStep,
    getLastStepId: () => {
      return previousStepId || null;
    }
  };
};
