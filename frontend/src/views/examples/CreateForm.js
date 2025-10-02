import React, { useState } from "react";
import {Button,Card,CardHeader,CardBody,Container,Row,Col,Form,FormGroup,Input,Label} from "reactstrap";
import Header from "components/Headers/Header.js";
import { authFetch } from "utils/authFetch";

const CreateForm = () => {
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);

  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [newField, setNewField] = useState({
    label: "",
    field_type: "text",
    required: false,
    options: [],
  });
  const [newOption, setNewOption] = useState("");

  // Add section
  const addSection = () => {
    if (!newSection.title.trim()) return alert("Section title is required");
    setSections([...sections, { ...newSection, fields: [] }]);
    setNewSection({ title: "", description: "" });
  };

  // Remove section
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Add option to checkbox/radio field
  const addOptionToField = () => {
    if (!newOption.trim()) return;
    setNewField({
      ...newField,
      options: [...(newField.options || []), { value: newOption.trim(), label: newOption.trim() }],
    });
    setNewOption("");
  };

  // Add field to section
  const addFieldToSection = (sectionIndex) => {
    if (!newField.label.trim()) return alert("Field label is required");
    if ((newField.field_type === "checkbox" || newField.field_type === "radio") && newField.options.length === 0) {
      return alert("Options are required for checkbox/radio fields");
    }

    const updated = [...sections];
    updated[sectionIndex].fields.push({ ...newField });
    setSections(updated);

    setNewField({ label: "", field_type: "text", required: false, options: [] });
    setNewOption("");
  };

  const removeFieldFromSection = (sectionIndex, fieldIndex) => {
    const updated = [...sections];
    updated[sectionIndex].fields.splice(fieldIndex, 1);
    setSections(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: formName, slug: formSlug, description, sections };
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
        setFormName(""); setFormSlug(""); setDescription(""); setSections([]);
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
          <Col xl="10" className="mx-auto">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3>Create a New Dynamic Form</h3>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  {/* Basic form info */}
                  <FormGroup>
                    <Label>Form Name</Label>
                    <Input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Onboarding Form" required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Slug</Label>
                    <Input type="text" value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="onboarding-form" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Description</Label>
                    <Input type="textarea" rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this form" />
                  </FormGroup>
                  <hr />

                  {/* Add Section */}
                  <h4>Add Section</h4>
                  <Row className="align-items-end">
                    <Col md="5">
                      <Label>Section Title</Label>
                      <Input type="text" value={newSection.title} onChange={e => setNewSection({ ...newSection, title: e.target.value })} placeholder="Personal Info" />
                    </Col>
                    <Col md="5">
                      <Label>Section Description</Label>
                      <Input type="text" value={newSection.description} onChange={e => setNewSection({ ...newSection, description: e.target.value })} placeholder="Describe this section" />
                    </Col>
                    <Col md="2">
                      <Button color="primary" onClick={addSection}>+ Add Section</Button>
                    </Col>
                  </Row>

                  {/* List Sections */}
                  {sections.map((section, sIndex) => (
                    <Card key={sIndex} className="mt-4 p-3 shadow-sm">
                      <div className="d-flex justify-content-between">
                        <h5>{section.title} ({section.fields.length} fields)</h5>
                        <Button color="danger" size="sm" onClick={() => removeSection(sIndex)}>Remove Section</Button>
                      </div>
                      <p className="text-muted">{section.description}</p>

                      {/* Add Field */}
                      <Row className="align-items-end">
                        <Col md="4">
                          <Label>Field Label</Label>
                          <Input type="text" value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} placeholder="First Name" />
                        </Col>
                        <Col md="3">
                          <Label>Field Type</Label>
                          <Input type="select" value={newField.field_type} onChange={e => setNewField({ ...newField, field_type: e.target.value, options: [] })}>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="email">Email</option>
                            <option value="file">File Upload</option>
                            <option value="radio">Radio</option>
                            <option value="checkbox">Checkbox</option>
                          </Input>
                        </Col>
                        <Col md="2">
                          <Label>Required?</Label>
                          <Input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} /> Yes
                        </Col>
                        <Col md="3">
                          <Button color="primary" onClick={() => addFieldToSection(sIndex)}>+ Add Field</Button>
                        </Col>
                      </Row>

                      {/* Options for checkbox/radio */}
                      {(newField.field_type === "checkbox" || newField.field_type === "radio") && (
                        <Row className="mt-2 align-items-end">
                          <Col md="8">
                            <Label>Option</Label>
                            <Input type="text" value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Option text" />
                          </Col>
                          <Col md="4">
                            <Button color="secondary" onClick={addOptionToField}>+ Add Option</Button>
                          </Col>
                        </Row>
                      )}

                      {/* List Fields */}
                      <ul className="mt-3">
                        {section.fields.map((f, fIndex) => (
                          <li key={fIndex}>
                            <strong>{f.label}</strong> ({f.field_type}) {f.required ? "✅" : "❌"}
                            {(f.field_type === "checkbox" || f.field_type === "radio") && f.options && ` - Options: ${f.options.map(o => o.label).join(", ")}`}
                            <Button color="danger" size="sm" className="ml-2" onClick={() => removeFieldFromSection(sIndex, fIndex)}>Remove</Button>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}

                  <div className="text-right mt-4">
                    <Button color="success" type="submit">💾 Save Form</Button>
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
