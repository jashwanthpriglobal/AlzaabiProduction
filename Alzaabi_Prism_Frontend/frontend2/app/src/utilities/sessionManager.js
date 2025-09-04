import config from '../config';

export async function addOrUpdateSessionInRecents(sessionId, lastMessage = "", title = "", token) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/session`, {
    // const response = await fetch(`http://127.0.0.1:8000/api/session`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ session_id: sessionId, lastMessage, title })
    });
    if (!response.ok) {
      throw new Error("Failed to update session");
    }
  } catch (error) {
    console.error("Error updating session:", error);
  }
}


export async function getRecentSessions(token) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/sessions`, {
    // const response = await fetch(`http://127.0.0.1:8000/api/sessions`, {

      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to load sessions");
    }

    let data = await response.json();

    return data.sessions.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
}



export async function deleteSession(sessionId, token) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/session?session_id=${sessionId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to delete session");
    }
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}


export async function isNewSession(sessionId, token) {
  try {
    const recents = await getRecentSessions(token);
    return !recents.some((session) => session.session_id === sessionId);
  } catch (error) {
    console.error("Error checking if session is new:", error);
    return true;
  }
}
