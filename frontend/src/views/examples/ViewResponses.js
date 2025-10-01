import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "utils/authFetch";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Spinner,
  Button,
} from "reactstrap";
import Header from "components/Headers/Header.js";

const ViewResponses = () => {
  const { id } = useParams(); // form id
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchResponses = async () => {
      try {
        const response = await authFetch("http://127.0.0.1:8000/onboarding/submissions/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // ✅ Filter only responses for this form
        const filtered = data.filter((res) => res.form === parseInt(id));
        setResponses(filtered);
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-7 text-center">
        <Spinner color="primary" />
      </Container>
    );
  }

  if (responses.length === 0) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Card className="shadow text-center p-5">
            <h3>No responses found for this form.</h3>
          </Card>
        </Container>
      </>
    );
  }

  // ✅ Extract table headers from the first response's keys
  const firstData = responses[0].data;
  const headers = Object.keys(firstData);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Responses for Form #{id}</h3>
                <Button color="secondary" size="sm" onClick={() => window.history.back()}>
                  ← Back
                </Button>
              </CardHeader>

              <CardBody>
                <Table className="align-items-center table-flush" responsive bordered>
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      {headers.map((key, index) => (
                        <th key={index}>{key}</th>
                      ))}
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((res, index) => (
                      <tr key={res.id}>
                        <td>{index + 1}</td>
                        {headers.map((key) => (
                          <td key={key}>{res.data[key] || "-"}</td>
                        ))}
                        <td>{new Date(res.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default ViewResponses;
