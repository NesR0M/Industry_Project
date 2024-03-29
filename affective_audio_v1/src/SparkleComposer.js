import React, { useEffect, useState } from "react";
import OpenAI from "openai";
import {
  notationExample,
  promptRandom,
  promptLadder,
  promptChords,
} from "./prompts";
import { createMidi } from "./midiUtils";
import { Form, Button, Card, Row, Col } from "react-bootstrap";

const SparkleComposer = ({ apiKey, baselineJsonData, sparklesJsonData }) => {
  const [openai, setOpenai] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (apiKey) {
      const openaiInstance = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      setOpenai(openaiInstance);
    } else {
      console.error("OpenAI API key is not provided.");
      setError("OpenAI API key is not provided.");
    }
  }, [apiKey]);

  const cleanGPTOutput = (inputString) => {
    let startIndex = inputString.indexOf("{");
    let braceCount = 0;
    let endIndex = startIndex;

    if (startIndex === -1) {
      console.error("JSON data not found in the message");
      return null;
    }

    while (endIndex < inputString.length) {
      if (inputString[endIndex] === "{") {
        braceCount++;
      } else if (inputString[endIndex] === "}") {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
      endIndex++;
    }

    if (braceCount !== 0) {
      console.error("Incomplete JSON data");
      return null;
    }

    return inputString.substring(startIndex, endIndex + 1);
  };

  const composeGPT = async (promptToUse) => {
    if (!openai) {
      console.error("OpenAI instance is not initialized.");
      setError("OpenAI instance is not initialized.");
      return;
    }

    console.log("gpt is composing...");
    let prompt;
    if (baselineJsonData === null) {
      prompt =
        promptToUse +
        "This is the baseline and you compose a melody to that:" +
        notationExample +
        "The file needs to be 20 Seconds long. Give me only the MIDI File Syntax nothing else.";
    } else {
      prompt =
        promptToUse +
        "This is the baseline and you compose a melody to that:" +
        baselineJsonData +
        "Give me only the MIDI File Syntax nothing else.";
    }

    try {
      let completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
      });

      let output = completion.choices[0]?.message?.content;
      if (!output) {
        console.error("No output received from OpenAI.");
        return;
      }
      console.log("This was the original message: " + output);

      let composition = cleanGPTOutput(output);
      if (!composition) {
        console.error("Invalid or incomplete JSON data received.");
        return;
      }
      console.log(composition);

      try {
        const midiJsonData = JSON.parse(composition);
        sparklesJsonData(midiJsonData);
        createMidi(midiJsonData);
      } catch (jsonError) {
        console.error("Error parsing JSON data: ", jsonError);
      }
    } catch (error) {
      console.error("Error with OpenAI completion:", error);
    }
  };

  return (
    <Card bg="dark" text="white" className="mb-3">
      <Card.Body>
        <Card.Title style={{ textAlign: "left", fontWeight: "bold" }}>
          Sparkles Composer
        </Card.Title>
        <Form>
          <Row className="align-items-center">
            <Col>
              <Button
                variant="outline-light"
                onClick={() => composeGPT(promptChords)}
                disabled={!apiKey} // Disable the button if apiKey is not set
              >
                Generate Chords
              </Button>
            </Col>
            <Col>
              <Button
                variant="outline-light"
                onClick={() => composeGPT(promptLadder)}
                disabled={!apiKey} // Disable the button if apiKey is not set
              >
                Generate Ladder
              </Button>
            </Col>
            <Col>
              <Button
                variant="outline-light"
                onClick={() => composeGPT(promptRandom)}
                disabled={!apiKey} // Disable the button if apiKey is not set
              >
                Generate Twinkles
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SparkleComposer;
