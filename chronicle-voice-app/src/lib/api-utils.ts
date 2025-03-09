/**
 * Utility functions for interacting with the API endpoints
 */

/**
 * Fetches call data from VAPI, checks which calls exist in Supabase,
 * fetches transcripts for missing calls, and processes them through Anthropic.
 *
 * @returns {Promise<Object>} The processed call data
 */
export async function fetchAndProcessCalls() {
  try {
    // 1. Fetch all calls from VAPI
    const callsResponse = await fetch("/api/vapi/calls");
    if (!callsResponse.ok) {
      throw new Error(`Failed to fetch calls: ${callsResponse.status}`);
    }
    const callsData = await callsResponse.json();

    if (!callsData.success || !callsData.calls) {
      throw new Error("Failed to fetch calls from VAPI");
    }

    // Extract call IDs
    const callIds = callsData.calls.map((call: any) => call.id);

    // 2. Check which calls exist in our database
    const checkResponse = await fetch("/api/vapi/check-calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ callIds }),
    });

    if (!checkResponse.ok) {
      throw new Error(`Failed to check calls: ${checkResponse.status}`);
    }

    const checkData = await checkResponse.json();

    if (!checkData.success) {
      throw new Error("Failed to check calls in database");
    }

    // 3. For missing calls, fetch transcripts and store them
    if (checkData.missingCallIds.length > 0) {
      const transcriptResponse = await fetch("/api/vapi/transcripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callIds: checkData.missingCallIds }),
      });

      if (!transcriptResponse.ok) {
        throw new Error(
          `Failed to fetch transcripts: ${transcriptResponse.status}`
        );
      }

      const transcriptData = await transcriptResponse.json();

      if (!transcriptData.success) {
        throw new Error("Failed to fetch and store transcripts");
      }
    }

    // 4. Fetch all entries from Supabase to get accurate created_at dates
    const entriesResponse = await fetch("/api/entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!entriesResponse.ok) {
      throw new Error(`Failed to fetch entries: ${entriesResponse.status}`);
    }

    const entriesData = await entriesResponse.json();
    const entriesMap = new Map();

    if (entriesData.success && entriesData.entries) {
      // Create a map of call_id to created_at date
      entriesData.entries.forEach((entry: any) => {
        entriesMap.set(entry.call_id, entry.created_at);
      });
    }

    // 5. Process the calls (including cleaning up with OpenAI)
    const processedCalls = await Promise.all(
      callsData.calls.map(async (call: any) => {
        // Fetch the transcript from your database if needed

        // Clean up with OpenAI if needed
        // For demonstration, let's assume we clean up every transcript
        if (call.transcript) {
          const cleanResponse = await fetch("/api/anthropic/clean-transcript", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transcript: call.transcript,
              created_at:
                entriesMap.get(call.id) ||
                call.timestamp ||
                new Date().toISOString(),
            }),
          });

          if (cleanResponse.ok) {
            const cleanData = await cleanResponse.json();
            if (cleanData.success) {
              call.cleanedTranscript = cleanData.cleanedTranscript;
              call.created_at = cleanData.created_at;
            }
          }
        }

        return call;
      })
    );

    return {
      success: true,
      calls: processedCalls,
    };
  } catch (error) {
    console.error("Error in fetchAndProcessCalls:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Fetches a specific call's details and processes its transcript if needed
 *
 * @param {string} callId The ID of the call to fetch
 * @returns {Promise<Object>} The processed call data
 */
export async function fetchAndProcessCall(callId: string) {
  try {
    // Implement similar to above, but for a single call
    // This would be useful for individual call processing

    return {
      success: true,
      call: {
        /* processed call data */
      },
    };
  } catch (error) {
    console.error(`Error in fetchAndProcessCall for call ${callId}:`, error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
