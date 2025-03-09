/**
 * Service for handling VAPI voice calls
 */

/**
 * Initiates a call using vapi via backend API
 * @param phoneNumber Optional phone number to call. If not provided, will use the default number.
 * @param mode The mode of call - "Normal" or "Severance" which determines the assistant ID to use
 */
export const makeCall = async (phoneNumber?: string, mode?: string) => {
  try {
    const response = await fetch("/api/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: phoneNumber || null,
        mode: mode || "Normal",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    console.log("API response:", response);

    return await response.json();
  } catch (error) {
    console.error("Error calling the API:", error);
    throw error;
  }
};
