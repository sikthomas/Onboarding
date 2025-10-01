import React, { useEffect, useState } from "react";
import { authFetch } from "utils/authFetch";
import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Button,
  Spinner,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useNavigate } from "react-router-dom";

const ViewForms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]); // ✅ store all submissions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchData = async () => {
      try {
        // ✅ Fetch forms
        const formsRes = await authFetch("http://127.0.0.1:8000/onboarding/user-forms/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const formsData = await formsRes.json();

        // ✅ Fetch submissions
        const subsRes = await authFetch("http://127.0.0.1:8000/onboarding/submissions/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const subsData = await subsRes.json();

        setForms(formsData);
        setSubmissions(subsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Helper: count responses per form
  const getFormResponseCount = (formId) => {
    return submissions.filter((s) => s.form === formId).length;
  };

  if (loading) {
    return (
      <Container className="mt-7 text-center">
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Created Forms</h3>
              </CardHeader>

              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Form Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Actions</th>
                    <th scope="col">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No forms found.
                      </td>
                    </tr>
                  ) : (
                    forms.map((form) => (
                      <tr key={form.id}>
                        <td>{form.name}</td>
                        <td>{form.description || "No description"}</td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => navigate(`/admin/fill_form/${form.id}`)}
                          >
                            Fill Form
                          </Button>
                        </td>
                        <td>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => navigate(`/admin/responses/${form.id}`)}
                          >
                            Responses ({getFormResponseCount(form.id)})
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              <CardFooter className="py-4 text-center">
                Showing {forms.length} forms
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default ViewForms;
