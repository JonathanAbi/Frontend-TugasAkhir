import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { Table } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    dataset_type: "",
    model_type: "",
    units_layer_1: "",
    units_layer_2: "",
    epochs: "",
    batch_size: "",
  });

  const [formDataFuture, setFormDataFuture] = useState({
    dataset_type: "",
    model_type: "",
    days_to_predict: null,
  });

  const [result, setResult] = useState(null);
  const [resultFuture, setResultFuture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFuture, setLoadingFuture] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [processedDataFuture, setProcessedDataFuture] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChangeFuture = (e) => {
    const { name, value } = e.target;
    setFormDataFuture({ ...formDataFuture, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResult(response.data);
      const processedData = response.data.predictions.map((item) => ({
        ...item,
        difference: (item.actual - item.predicted).toFixed(2),
      }));
      setProcessedData(processedData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };

  const handleSubmitFuture = async () => {
    try {
      setLoadingFuture(true);
      const response = await axios.post(
        "http://localhost:5000/predict_future",
        formDataFuture,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResultFuture(response.data);
      const processedDataFuture = response.data.prediction_dates.map((date, index) => ({
        key: index,
        prediction_dates: date, 
        predicted_close: response.data.predicted_close[index]
      }));
      setProcessedDataFuture(processedDataFuture);
      console.log(processedDataFuture)
      setLoadingFuture(false);
    } catch (error) {
      setLoadingFuture(false);
      console.error("Error:", error);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
    },
    {
      title: "Actual Price",
      dataIndex: "actual",
      key: "actual",
      align: "center",
    },
    {
      title: "Predicted Price",
      dataIndex: "predicted",
      key: "predicted",
      align: "center",
    },
    {
      title: "Difference",
      dataIndex: "difference",
      key: "difference",
      align: "center",
      render: (text) => {
        const datasetType = formData.dataset_type;
  
        let threshold = 0;
        if (datasetType === "btc") {
          threshold = 500;
        } else if (datasetType === "eth") {
          threshold = 50;
        } else if (datasetType === "bnb") {
          threshold = 10;
        }
  
        const value = parseFloat(text);
        let color = "black";
  
        if (Math.abs(value) <= threshold) {
          color = "green"; // Jika oke
        } else if (Math.abs(value) <= threshold * 1.5) {
          color = "orange"; // Mendekati batas
        } else {
          color = "red"; // Di luar batas
        }
  
        return <span style={{ color }}>{text}</span>;
      },
    },
  ];
  const columnsFuture = [
    {
      title: "Prediction Dates",
      dataIndex: "prediction_dates",
      key: "prediction_dates",
      align: "center",
    },
    {
      title: "Prediction Close",
      dataIndex: "predicted_close",
      key: "predicted_close",
      align: "center",
    },
  ];

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Cryptocurrency Prediction</h1>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group controlId="dataset_type">
            <Form.Label>Dataset Type</Form.Label>
            <Form.Control
              as="select"
              name="dataset_type"
              value={formData.dataset_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Dataset</option>
              <option value="btc">BTC</option>
              <option value="eth">ETH</option>
              <option value="bnb">BNB</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group controlId="model_type">
            <Form.Label>Model Type</Form.Label>
            <Form.Control
              as="select"
              name="model_type"
              value={formData.model_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Model Type</option>
              <option value="gru">GRU</option>
              <option value="bilstm">BiLSTM</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Form.Group controlId="units_layer_1">
            <Form.Label>Units Layer 1</Form.Label>
            <Form.Control
              as="select"
              name="units_layer_1"
              value={formData.units_layer_1}
              onChange={handleChange}
              required
            >
              <option value="">Select Units Layer 1</option>
              <option value="32">32</option>
              <option value="100">100</option>
              <option value="128">128</option>
            </Form.Control>
          </Form.Group>
        </Col>

        {formData.model_type === "bilstm" && (
          <Col md={6} className="mb-3">
            <Form.Group controlId="units_layer_2">
              <Form.Label>Units Layer 2</Form.Label>
              <Form.Control
                as="select"
                name="units_layer_2"
                value={formData.units_layer_2}
                onChange={handleChange}
                required
              >
                <option value="">Select Units Layer 2</option>
                <option value="32">32</option>
                <option value="100">100</option>
                <option value="128">128</option>
              </Form.Control>
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Form.Group controlId="epochs">
            <Form.Label>Epochs</Form.Label>
            <Form.Control
              as="select"
              name="epochs"
              value={formData.epochs}
              onChange={handleChange}
              required
            >
              <option value="">Select Epochs</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="150">150</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group controlId="batch_size">
            <Form.Label>Batch Size</Form.Label>
            <Form.Control
              as="select"
              name="batch_size"
              value={formData.batch_size}
              onChange={handleChange}
              required
            >
              <option value="">Select Batch Size</option>
              <option value="32">32</option>
              <option value="64">64</option>
              <option value="120">120</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Button variant="primary" onClick={handleSubmit} block disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>

      {result && (
        <>
          <Card className="my-4 mx-auto">
            <Card.Body>
              <Card.Title>Prediction Result</Card.Title>
              <Card.Text>RMSE: {result.rmse}</Card.Text>
              {result.plot_path && (
                <div>
                  <h5>Plot:</h5>
                  <img
                    src={`http://localhost:5000/plot/${result.plot_path}`}
                    alt="Prediction Plot"
                    style={{ width: "100%", maxWidth: "600px" }}
                  />
                </div>
              )}
              <Card.Title>Details</Card.Title>
              <Table
                dataSource={processedData}
                columns={columns}
                pagination={true}
              />
            </Card.Body>
          </Card>
        </>
      )}
      <h1 className="text-center mt-5">Future Prediction</h1>
      <Row>
        <Col md={4} className="mb-3">
          <Form.Group controlId="dataset_type">
            <Form.Label>Dataset Type</Form.Label>
            <Form.Control
              as="select"
              name="dataset_type"
              value={formDataFuture.dataset_type}
              onChange={handleChangeFuture}
              required
            >
              <option value="">Select Dataset</option>
              <option value="btc">BTC</option>
              <option value="eth">ETH</option>
              <option value="bnb">BNB</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={4} className="mb-3">
          <Form.Group controlId="model_type">
            <Form.Label>Model Type</Form.Label>
            <Form.Control
              as="select"
              name="model_type"
              value={formDataFuture.model_type}
              onChange={handleChangeFuture}
              required
            >
              <option value="">Select Model Type</option>
              <option value="gru">GRU</option>
              <option value="bilstm">BiLSTM</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4} className="mb-3">
          <Form.Group controlId="days_to_predict">
            <Form.Label>Days To Predict</Form.Label>
            <Form.Control
              type="number"
              name="days_to_predict"
              value={formDataFuture.days_to_predict}
              onChange={handleChangeFuture}
              required
              min="1"
            />
          </Form.Group>
        </Col>
      </Row>
      <Button
        variant="primary"
        onClick={handleSubmitFuture}
        block
        disabled={loadingFuture}
        className="mb-3"
      >
        {loadingFuture ? "Loading..." : "Submit"}
      </Button>
      {resultFuture && (
        <Table
          dataSource={processedDataFuture}
          columns={columnsFuture}
          pagination={true}
        />
      )}
    </Container>
  );
}

export default App;
