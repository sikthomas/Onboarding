/*!
=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
*/

import React, { useState } from "react";
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
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { authFetch } from "utils/authFetch";


const CreateForm = () => {
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [description, setDescription] = useState("");

  // 🔹 Sections (each with fields)
  const [sections, setSections] = useState([]);

  // 🔹 Temp state for creating new section
  const [newSection, setNewSection] = useState({
    title: "",
    description: "",
  });

  // 🔹 Temp state for adding a field
  const [newField, setNewField] = useState({
    label: "",
    field_type: "text",
    required: false,
  });

  // ➕ Add a new section
  const addSection = () => {
    if (!newSection.title.trim()) return alert("Section title is required");
    setSections([
      ...sections,
      { ...newSection, order: sections.length + 1, fields: [] },
    ]);
    setNewSection({ title: "", description: "" });
  };

  // 🗑 Remove section
  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  // ➕ Add field to a specific section
  const addFieldToSection = (sectionIndex) => {
    if (!newField.label.trim()) return alert("Field label is required");
    const updated = [...sections];
    updated[sectionIndex].fields.push({ ...newField });
    setSections(updated);
    setNewField({ label: "", field_type: "text", required: false });
  };

  // 🗑 Remove a field from a section
  const removeFieldFromSection = (sectionIndex, fieldIndex) => {
    const updated = [...sections];
    updated[sectionIndex].fields = updated[sectionIndex].fields.filter(
      (_, i) => i !== fieldIndex
    );
    setSections(updated);
  };

  // 💾 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formName,
      slug: formSlug,
      description,
      sections,
    };

    const token = localStorage.getItem("access");

    try {
      const response = await authFetch("http://127.0.0.1:8000/onboarding/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Form created successfully!");
        setFormName("");
        setFormSlug("");
        setDescription("");
        setSections([]);
      } else {
        alert("❌ Error: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <>
      <Header />

      <Container className="mt--7" fluid>
        <Row>
          <Col xl="10" className="mb-5 mb-xl-0 mx-auto">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Create a New Dynamic Form</h3>
              </CardHeader>

              <CardBody>
                <Form onSubmit={handleSubmit}>
                  {/* 🧱 Basic Form Info */}
                  <FormGroup>
                    <Label>Form Name</Label>
                    <Input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Onboarding Form"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Slug</Label>
                    <Input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="onboarding-form"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Description</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this form"
                    />
                  </FormGroup>

                  <hr />

                  {/* 🧩 Add Section */}
                  <h4 className="mt-4">Add Section</h4>
                  <Row className="align-items-end">
                    <Col md="5">
                      <Label>Section Title</Label>
                      <Input
                        type="text"
                        value={newSection.title}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            title: e.target.value,
                          })
                        }
                        placeholder="Personal Information"
                      />
                    </Col>
                    <Col md="5">
                      <Label>Section Description</Label>
                      <Input
                        type="text"
                        value={newSection.description}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe this section"
                      />
                    </Col>
                    <Col md="2" className="text-right">
                      <Button color="primary" onClick={addSection}>
                        + Add Section
                      </Button>
                    </Col>
                  </Row>

                  {/* 🧭 List Sections */}
                  <div className="mt-4">
                    {sections.map((section, sIndex) => (
                      <Card key={sIndex} className="p-3 mb-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">
                            {section.title}{" "}
                            <small className="text-muted">
                              ({section.fields.length} fields)
                            </small>
                          </h5>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => removeSection(sIndex)}
                          >
                            Remove Section
                          </Button>
                        </div>
                        <p className="text-muted">{section.description}</p>

                        {/* ➕ Add Field to Section */}
                        <Row className="align-items-end">
                          <Col md="4">
                            <Label>Label</Label>
                            <Input
                              type="text"
                              value={newField.label}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  label: e.target.value,
                                })
                              }
                              placeholder="e.g. First Name"
                            />
                          </Col>
                          <Col md="4">
                            <Label>Field Type</Label>
                            <Input
                              type="select"
                              value={newField.field_type}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  field_type: e.target.value,
                                })
                              }
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="email">Email</option>
                              <option value="select">Select</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="file">File Upload</option>
                            </Input>
                          </Col>
                          <Col md="3">
                            <Label>Required?</Label>
                            <Input
                              type="checkbox"
                              checked={newField.required}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  required: e.target.checked,
                                })
                              }
                            />{" "}
                            <span>Yes</span>
                          </Col>
                          <Col md="1">
                            <Button
                              color="primary"
                              onClick={() => addFieldToSection(sIndex)}
                            >
                              +
                            </Button>
                          </Col>
                        </Row>

                        {/* 📋 List Fields */}
                        <ul className="mt-3 list-unstyled">
                          {section.fields.map((f, fIndex) => (
                            <li key={fIndex} className="mb-2">
                              <strong>{f.label}</strong> ({f.field_type}){" "}
                              {f.required ? "✅ Required" : "❌ Optional"}{" "}
                              <Button
                                color="danger"
                                size="sm"
                                className="ml-2"
                                onClick={() =>
                                  removeFieldFromSection(sIndex, fIndex)
                                }
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>

                  <div className="text-right mt-4">
                    <Button color="success" type="submit">
                      💾 Save Form
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

export default CreateForm;
