import React, { useEffect, useState } from "react";
import { authFetch } from "utils/authFetch";
import {Button,Card,CardHeader,CardBody,Container,Row,Col,Form,FormGroup,Input,Label,Spinner} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useParams, useNavigate } from "react-router-dom";

const FillForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/onboarding/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id, token]);

  const handleChange = (fieldName, value) =>
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

  const handleFileChange = (fieldName, file) =>
    setFormData((prev) => ({ ...prev, [fieldName]: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value instanceof File) data.append(key, value);
      else if (Array.isArray(value)) value.forEach((v) => data.append(key, v));
      else data.append(key, value);
    });

    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/onboarding/${id}/submit/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        }
      );

      if (response.ok) {
        alert("✅ Form submitted!");
        navigate("/admin/view_form");
      } else {
        const err = await response.json();
        alert("❌ " + JSON.stringify(err));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <Container className="mt--7 text-center">
          <Spinner color="primary" />
        </Container>
      </>
    );

  if (!form)
    return (
      <>
        <Header />
        <Container className="mt--7 text-center">
          <h4 className="text-danger">Form not found ❌</h4>
        </Container>
      </>
    );

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="10" className="mx-auto">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3>Fill Form: {form.name}</h3>
                <p className="text-muted">{form.description}</p>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  {form.sections?.map((section) => (
                    <div key={section.id} className="mb-5">
                      <h4>{section.title}</h4>
                      {section.description && (
                        <p className="text-muted">{section.description}</p>
                      )}

                      {section.fields?.map((field) => {
                        switch (field.field_type) {
                          case "text":
                          case "email":
                          case "number":
                          case "date":
                            return (
                              <FormGroup key={field.id}>
                                <Label>{field.label}</Label>
                                <Input
                                  type={field.field_type}
                                  required={field.required}
                                  placeholder={field.placeholder || ""}
                                  onChange={(e) =>
                                    handleChange(field.name, e.target.value)
                                  }
                                />
                              </FormGroup>
                            );

                          case "file":
                            return (
                              <FormGroup key={field.id}>
                                <Label>{field.label}</Label>
                                <Input
                                  type="file"
                                  required={field.required}
                                  onChange={(e) =>
                                    handleFileChange(field.name, e.target.files[0])
                                  }
                                />
                              </FormGroup>
                            );

                          case "radio":
                            return (
                              <FormGroup key={field.id}>
                                <Label>{field.label}</Label>
                                {field.options?.map((opt) => (
                                  <div key={opt.id} className="form-check">
                                    <Input
                                      type="radio"
                                      name={field.name}
                                      value={opt.value}
                                      required={field.required}
                                      onChange={(e) =>
                                        handleChange(field.name, e.target.value)
                                      }
                                    />
                                    <Label className="form-check-label">
                                      {opt.label}
                                    </Label>
                                  </div>
                                ))}
                              </FormGroup>
                            );

                          case "checkbox":
                            return (
                              <FormGroup key={field.id}>
                                <Label>{field.label}</Label>
                                {field.options?.map((opt) => (
                                  <div key={opt.id} className="form-check">
                                    <Input
                                      type="checkbox"
                                      value={opt.value}
                                      onChange={(e) => {
                                        const prev = formData[field.name] || [];
                                        if (e.target.checked)
                                          handleChange(field.name, [...prev, opt.value]);
                                        else
                                          handleChange(
                                            field.name,
                                            prev.filter((v) => v !== opt.value)
                                          );
                                      }}
                                    />
                                    <Label className="form-check-label">{opt.label}</Label>
                                  </div>
                                ))}
                              </FormGroup>
                            );

                          default:
                            return null;
                        }
                      })}
                      <hr />
                    </div>
                  ))}
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
