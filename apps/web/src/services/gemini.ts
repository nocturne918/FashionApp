import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../env";

// Gemini API key 
const API_KEY = env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "Gemini API key not set. Please update the API_KEY in src/services/gemini.ts"
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;


//Get Gemini text response with image context

export async function getGeminiResponse(
  prompt: string,
  imageUrls: string[] = []
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  try {
    // Use Gemini 2.5 Flash for text/image analysis
    let model;
    let modelName = "gemini-2.5-flash";

    try {
      model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Using model: ${modelName}`);
    } catch (modelError) {
      console.warn(`Model ${modelName} not available, trying alternatives...`);
      // Try alternative models
      const alternatives = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-thinking-exp",
        "gemini-1.5-pro",
      ];

      for (const altModel of alternatives) {
        try {
          model = genAI.getGenerativeModel({ model: altModel });
          modelName = altModel;
          console.log(`Using alternative model: ${altModel}`);
          break;
        } catch {
          continue;
        }
      }

      if (!model) {
        throw new Error(`Failed to initialize Gemini model. Tried: ${modelName}, ${alternatives.join(", ")}`);
      }
    }

    // If we have images, use vision model
    if (imageUrls.length > 0) {
      const imageParts = await Promise.all(
        imageUrls.map(async (url) => {
          // Convert data URL or URL to base64
          let base64Data: string;
          if (url.startsWith("data:image/")) {
            base64Data = url.split(",")[1];
          } else {
            // Fetch image and convert to base64
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            base64Data = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(",")[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }

          return {
            inlineData: {
              data: base64Data,
              mimeType: url.startsWith("data:image/")
                ? url.split(";")[0].split(":")[1]
                : "image/jpeg",
            },
          };
        })
      );

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return response.text();
    } else {
      // Text-only response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}


//Get Gemini image edit/generation using gemini  model
export async function getGeminiImageEdit(
  personImageUrl: string,
  clothingImageUrls: string[],
  prompt: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  try {
    console.log("Starting image edit with Gemini...");
    console.log("Person image:", personImageUrl.substring(0, 50) + "...");
    console.log("Clothing images count:", clothingImageUrls.length);
    console.log("Prompt:", prompt.substring(0, 100) + "...");

    // Use Gemini 2.5 Flash Image (Nano Banana)
    let model;
    let modelName = "gemini-2.5-flash-image";

    try {
      model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Using model: ${modelName}`);
    } catch (modelError) {
      console.warn(`Model ${modelName} not available, trying gemini-2.5-flash...`);
      // Try without 
      try {
        modelName = "gemini-2.5-flash";
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Using model: ${modelName}`);
      } catch (error2) {
        console.error("Both model names failed:", modelError, error2);
        throw new Error(`Failed to initialize Gemini model. Tried: gemini-2.5-flash-image, gemini-2.5-flash`);
      }
    }

    if (!model) {
      throw new Error("Failed to initialize Gemini model");
    }

    // Convert images to base64
    console.log("Converting images to base64...");
    const imageParts = await Promise.all(
      [personImageUrl, ...clothingImageUrls].map(async (url, idx) => {
        let base64Data: string;
        if (url.startsWith("data:image/")) {
          base64Data = url.split(",")[1];
        } else {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }

        console.log(`Image ${idx} converted, size: ${base64Data.length} bytes`);

        return {
          inlineData: {
            data: base64Data,
            mimeType: url.startsWith("data:image/")
              ? url.split(";")[0].split(":")[1]
              : "image/jpeg",
          },
        };
      })
    );

    console.log("Calling Gemini API with model:", modelName);
    // Use Gemini to generate the edited image

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...imageParts,
          ],
        },
      ],
    });

    console.log("Received response from Gemini");
    const response = result.response;
    console.log("Response structure:", JSON.stringify(response, null, 2).substring(0, 1000));

    // Check if the response contains an image 
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log("Candidate structure:", JSON.stringify(candidate, null, 2).substring(0, 500));

      if (candidate.content && candidate.content.parts) {
        const parts = candidate.content.parts;
        console.log("Response parts count:", parts.length);

        // Look for image data in the response parts
        for (const part of parts) {
          console.log("Part type:", typeof part, "Keys:", Object.keys(part || {}));

          // Check for inlineData 
          if (part && (part as any).inlineData && (part as any).inlineData.data) {
            console.log("Found image in inlineData!");
            const mimeType = (part as any).inlineData.mimeType || "image/jpeg";
            return `data:${mimeType};base64,${(part as any).inlineData.data}`;
          }

          // Check for functionCall or other response types
          if (part && (part as any).functionCall) {
            console.log("Found functionCall in response");
          }
        }
      }
    }

    // Try to get text response to see what we got
    try {
      const textResponse = response.text();
      console.log("Response text (first 500 chars):", textResponse.substring(0, 500));

      // Check if response contains a base64 image data URL
      const base64Match = textResponse.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        console.log("Found base64 image in text response");
        return base64Match[0];
      }

      // If we got text but no image, the model might not support image generation
      console.warn("Gemini returned text but no image. Full response:", textResponse);
      throw new Error(`Gemini model ${modelName} returned text instead of an image. This model may not support image generation. Response: ${textResponse.substring(0, 200)}`);
    } catch (textError) {
      // If text() fails, the response might be in a different format
      console.error("Could not extract text from response:", textError);
      throw new Error(`Gemini model ${modelName} did not return an image. Check console for response structure.`);
    }
  } catch (error) {
    console.error("Gemini image edit error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Full error details:", error);
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
}

