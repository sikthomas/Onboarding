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
  UncontrolledTooltip,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useNavigate } from "react-router-dom";
import { FaPen, FaTrash, FaListUl } from "react-icons/fa";

const ViewForms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ store current user permissions
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchData = async () => {
      try {
        // ✅ 1. Fetch current user info
        const userRes = await authFetch("http://127.0.0.1:8000/onboarding/me/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setIsSuperuser(userData.is_superuser);
          setIsStaff(userData.is_staff);
        } else {
          console.warn("Failed to fetch user info");
        }

        // ✅ 2. Fetch forms
        const formsRes = await authFetch("http://127.0.0.1:8000/onboarding/user-forms/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const formsData = await formsRes.json();

        // ✅ 3. Fetch submissions
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

  // ✅ Delete Form Handler
  const handleDelete = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;

    const token = localStorage.getItem("access");
    try {
      const res = await authFetch(`http://127.0.0.1:8000/onboarding/${formId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 204) {
        alert("Form deleted successfully");
        setForms(forms.filter((f) => f.id !== formId));
      } else {
        const data = await res.json();
        alert(`Failed to delete form: ${data.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting the form.");
    }
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
                    <th scope="col" className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No forms found.
                      </td>
                    </tr>
                  ) : (
                    forms.map((form) => (
                      <tr key={form.id}>
                        <td>{form.name}</td>
                        <td>{form.description || "No description"}</td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* Fill Form */}
                            <Button
                              id={`fill-${form.id}`}
                              color="primary"
                              size="sm"
                              onClick={() => navigate(`/admin/fill_form/${form.id}`)}
                            >
                              <FaPen />
                            </Button>
                            <UncontrolledTooltip target={`fill-${form.id}`}>
                              Fill Form
                            </UncontrolledTooltip>

                            {/* Responses */}
                            <Button
                              id={`responses-${form.id}`}
                              color="info"
                              size="sm"
                              onClick={() => navigate(`/admin/responses/${form.id}`)}
                            >
                              <FaListUl />
                              <span className="ms-1">
                                ({getFormResponseCount(form.id)})
                              </span>
                            </Button>
                            <UncontrolledTooltip target={`responses-${form.id}`}>
                              View Responses
                            </UncontrolledTooltip>

                            {/* ✅ Delete Button visible only for superuser + staff */}
                            {isSuperuser && isStaff && (
                              <>
                                <Button
                                  id={`delete-${form.id}`}
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDelete(form.id)}
                                >
                                  <FaTrash />
                                </Button>
                                <UncontrolledTooltip target={`delete-${form.id}`}>
                                  Delete Form
                                </UncontrolledTooltip>
                              </>
                            )}
                          </div>
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
