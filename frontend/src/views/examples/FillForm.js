/*!
=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
*/

import React, { useEffect, useState } from "react";
import { authFetch } from "utils/authFetch";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useParams, useNavigate } from "react-router-dom";

const FillForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  // 🔹 Fetch Form by ID
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/onboarding/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Error fetching form:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, token]);

  // 🧩 Handle Input Change
  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // 💾 Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authFetch(`http://127.0.0.1:8000/onboarding/${id}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responses: formData }),
      });

      if (response.ok) {
        alert("✅ Form submitted successfully!");
        navigate("/admin/view_form");
      } else {
        const err = await response.json();
        alert("❌ Submission failed: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  // ⏳ Loading State
  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7 text-center">
          <Spinner color="primary" />
        </Container>
      </>
    );
  }

  // 🚫 Form Not Found
  if (!form) {
    return (
      <>
        <Header />
        <Container className="mt--7 text-center">
          <h4 className="text-danger">Form not found ❌</h4>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />

      <Container className="mt--7" fluid>
        <Row>
          <Col xl="10" className="mb-5 mb-xl-0 mx-auto">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Fill Form: {form.name}</h3>
                <p className="text-muted mt-2">{form.description}</p>
              </CardHeader>

              <CardBody>
                <Form onSubmit={handleSubmit}>
                  {form.sections && form.sections.length > 0 ? (
                    form.sections.map((section) => (
                      <div key={section.id} className="mb-5">
                        <h4>{section.title}</h4>
                        {section.description && (
                          <p className="text-muted">{section.description}</p>
                        )}

                        {section.fields.map((field) => (
                          <FormGroup key={field.id} className="mb-4">
                            <Label>{field.label}</Label>
                            <Input
                              type={
                                field.field_type === "number"
                                  ? "number"
                                  : field.field_type === "date"
                                  ? "date"
                                  : field.field_type === "email"
                                  ? "email"
                                  : "text"
                              }
                              required={field.required}
                              placeholder={field.placeholder || ""}
                              onChange={(e) =>
                                handleChange(field.label, e.target.value)
                              }
                            />
                          </FormGroup>
                        ))}
                        <hr />
                      </div>
                    ))
                  ) : (
                    <p>No sections found for this form.</p>
                  )}

                  <div className="text-right">
                    <Button color="success" type="submit">
                      💾 Submit Form
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default FillForm;
