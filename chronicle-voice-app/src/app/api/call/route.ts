import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { phoneNumber } = body;

    // Log the request (for debugging)
    console.log(
      "Backend received call request",
      phoneNumber ? `to ${phoneNumber}` : "to default number"
    );

    // Get API key from environment variables
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "VAPI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use provided phone number or fall back to default
    const customerNumber = phoneNumber || process.env.DEFAULT_PHONE_NUMBER;
    if (!customerNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "No phone number provided and no default set",
        },
        { status: 400 }
      );
    }

    // Phone number ID to use for outbound call
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    //const voiceId = 'eleven_monolingual_v1'; // Example voice ID

    // Simple system message for the assistant
    /*const messages = [
            {
                role: "system",
                content: "You are a helpful journal assistant. Ask the user about their day and help them reflect on it."
            },
            {
                role: "assistant",
                content: "Hi there! I'm your journal assistant. How was your day today?"
            }
        ];*/

    // Prepare request to VAPI API
    const requestBody = {
      // assistant: {
      //     transcriber: {
      //         provider: 'deepgram',
      //         language: 'en',
      //         model: 'nova-2'
      //     },
      //     model: {
      //         provider: 'cerebras',
      //         model: 'llama-3.3-70b',
      //         maxTokens: 512,
      //         temperature: 0.7,
      //         messages: messages,
      //     },
      //     voice: {
      //         provider: '11labs',
      //         voiceId: voiceId,
      //         model: 'eleven_turbo_v2_5',
      //         stability: 0.3,
      //         similarityBoost: 0.5,
      //     },
      //     name: 'Chronicle Journal Assistant',
      //     firstMessageMode: 'assistant-speaks-first',
      //     backgroundSound: 'office',
      //     endCallMessage: 'Thank you for journaling today. Have a great day!',
      //     silenceTimeoutSeconds: 30,
      //     maxDurationSeconds: 300, // 5 minutes
      //     endCallPhrases: ['Thanks for the call, have a great day', 'goodbye'],
      // },
      assistantId: "a7651967-ea3c-495e-ab15-b5c2775ec736",
      phoneNumberId: phoneNumberId,
      customer: {
        number: customerNumber,
      },
    };

    // Call VAPI API
    const vapiResponse = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Process VAPI response
    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error("VAPI API error:", vapiResponse.status, errorText);
      return NextResponse.json(
        { success: false, message: `VAPI API error: ${vapiResponse.status}` },
        { status: 500 }
      );
    }

    const callData = await vapiResponse.json();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Call initiated successfully",
      callId: callData.id,
      status: callData.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing call request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: `Failed to process call request: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
