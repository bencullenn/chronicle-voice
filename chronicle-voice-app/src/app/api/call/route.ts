import { NextResponse } from "next/server";

// Assistant IDs
const NORMAL_ASSISTANT_ID = "a7651967-ea3c-495e-ab15-b5c2775ec736";
const SEVERANCE_ASSISTANT_ID = "a82442b3-01c0-44c6-aa48-9d84c05279d6";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { phoneNumber, mode } = body;

    // Log the request (for debugging)
    console.log(
      "Backend received call request",
      phoneNumber ? `to ${phoneNumber}` : "to default number",
      `with mode ${mode || "Normal"}`
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

    // Select assistant ID based on mode
    const assistantId =
      mode === "Severance" ? SEVERANCE_ASSISTANT_ID : NORMAL_ASSISTANT_ID;

    console.log(
      `Using assistant ID: ${assistantId} for mode: ${mode || "Normal"}`
    );

    // Prepare request to VAPI API
    const requestBody = {
      assistantId: assistantId,
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
      mode: mode || "Normal",
      assistantId: assistantId,
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
