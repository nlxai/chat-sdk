interface SessionData {
  contactId?: string;
  journeyId?: string;
  previousStepId?: string;
  mode?: string;
  token?: string;
}

const sessionStorageKey = "voicecompass-session";

export const saveSession = (session: SessionData) => {
  sessionStorage.setItem(
    sessionStorageKey,
    JSON.stringify({
      savedAt: new Date().getTime(),
      session
    })
  );
};

export const clearSession = () => {
  sessionStorage.removeItem(sessionStorageKey);
};

export const retrieveSession = (contactId?: string): SessionData | null => {
  try {
    const data = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "");
    const session = data?.session;
    const savedAt = data?.savedAt;
    if (
      session &&
      // If a contact ID is available, invalidate the session in case it has since changed
      (!contactId || session.contactId === contactId) &&
      savedAt &&
      new Date().getTime() - savedAt < 15 * 60 * 1000
    ) {
      return session;
    }
  } catch (err) {
    return null;
  }
  return null;
};
