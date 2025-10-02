import React, { useEffect, useState } from "react";
import {Button,Card,CardHeader,CardBody,Container,Row,Col,Form,FormGroup,Input,Label,Spinner} from "reactstrap";
import Header from "components/Headers/Header.js";
import { authFetch } from "utils/authFetch";
import { useNavigate } from "react-router-dom";

const AssignForm = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingForms, setLoadingForms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch forms for dropdown
  useEffect(() => {
    const fetchForms = async () => {
      setLoadingForms(true);
      try {
        const res = await authFetch(
          "http://127.0.0.1:8000/onboarding/forms/available/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch forms");
        const data = await res.json();
        setForms(data);
      } catch (error) {
        console.error(error);
        setForms([]);
      } finally {
        setLoadingForms(false);
      }
    };
    fetchForms();
  }, [token]);

  // 💾 Handle form assignment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForm || !selectedGroup) {
      alert("⚠️ Please select a form and a group");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(
        "http://127.0.0.1:8000/onboarding/forms/assign/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            form: selectedForm,
            group: selectedGroup,
          }),
        }
      );

      if (res.ok) {
        alert("✅ Form assigned successfully!");
        setSelectedForm("");
        setSelectedGroup("");
        navigate("/admin/view-form"); // redirect after success
      } else {
        const err = await res.json();
        console.error("Failed to assign form:", err);
        alert("❌ Failed to assign form: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error submitting form assignment:", error);
      alert("❌ Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="8" className="mx-auto mb-5">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Assign Form to Group</h3>
                <p className="text-muted mt-2">
                  Select a form and assign it to either Staff or Client group.
                  Admins automatically see all forms.
                </p>
              </CardHeader>
              <CardBody>
                {loadingForms ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : forms.length === 0 ? (
                  <p className="text-danger">No forms available.</p>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* Form Dropdown */}
                    <FormGroup>
                      <Label for="formSelect">Select Form</Label>
                      <Input
                        id="formSelect"
                        type="select"
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                      >
                        <option value="">-- Choose a Form --</option>
                        {forms.map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                    {/* Group Dropdown */}
                    <FormGroup>
                      <Label for="groupSelect">Select Group</Label>
                      <Input
                        id="groupSelect"
                        type="select"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                      >
                        <option value="">-- Choose a Group --</option>
                        <option value="staff">Staff</option>
                        <option value="client">Client</option>
                      </Input>
                    </FormGroup>

                    <div className="text-right">
                      <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? "Assigning..." : "🚀 Assign Form"}
                      </Button>
                    </div>
                  </Form>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AssignForm;
