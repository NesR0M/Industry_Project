import React, { useState } from "react";
import { Midi } from "@tonejs/midi";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { notationExample, sparklesExample } from "./prompts"; // import examples

const MidiLoader = ({
  onBaselineCompositionComplete,
  onSparklesCompositionComplete,
  setBaselineData,
  setSparklesData,
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [midiType, setMidiType] = useState("baseline");

  const loadExampleData = () => {
    try {
      const baselineMidiJson = JSON.parse(notationExample);
      const sparklesMidiJson = JSON.parse(sparklesExample);

      setBaselineData(baselineMidiJson); // Update baseline data in App.js
      setSparklesData(sparklesMidiJson); // Update sparkles data in App.js
      console.log("Examples loaded...");
    } catch (e) {
      setError("Error loading example data: " + e.message);
      console.error("Error loading example data:", e);
    }
  };

  const resetData = () => {
    setBaselineData(null);
    setSparklesData(null);
    setError(null);
    console.log("Midi's deleted.");
  };

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onTypeChange = (event) => {
    setMidiType(event.target.value);
  };

  const onFileUpload = async () => {
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const midiData = new Uint8Array(e.target.result);
          const midi = new Midi(midiData);
          const toneJson = midi.toJSON();

          if (midiType === "baseline") {
            onBaselineCompositionComplete(toneJson);
          } else {
            onSparklesCompositionComplete(toneJson);
          }
        } catch (error) {
          console.error("Error processing MIDI file:", error);
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const fileData = () => {
    if (file) {
      return (
        <Card bg="dark" text="white" className="mt-3">
          <Card.Body>
            <Card.Title>File Details:</Card.Title>
            <Card.Text>File Name: {file.name}</Card.Text>
            <Card.Text>File Type: {file.type}</Card.Text>
            <Card.Text>
              Last Modified: {file.lastModifiedDate.toDateString()}
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }
  };

  // Inside your MidiLoader component
  return (
    <Card bg="dark" text="white" className="mb-3">
      <Card.Body>
        <Card.Title style={{ textAlign: "left", fontWeight: "bold" }}>
          Upload Midi
        </Card.Title>
        <Form>
          <Row className="align-items-center">
            <Col>
              <Form.Control
                type="file"
                onChange={onFileChange}
                accept=".mid,.midi"
              />
            </Col>
            <Col>
              <Form.Select value={midiType} onChange={onTypeChange}>
                <option value="baseline">Baseline</option>
                <option value="sparkles">Sparkles</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col>
              <Button
                variant="outline-light"
                onClick={onFileUpload}
                disabled={!file}
              >
                Upload Midi
              </Button>
            </Col>
            <Col>
              <Button variant="outline-light" onClick={loadExampleData}>
                Sample
              </Button>
            </Col>
            <Col>
              <Button variant="outline-danger" onClick={resetData}>
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
        {fileData()}
      </Card.Body>
    </Card>
  );
};

export default MidiLoader;
