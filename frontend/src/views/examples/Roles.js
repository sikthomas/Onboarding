/*!
=========================================================
* Assign Role Page - Argon Dashboard React
=========================================================
*/

import React, { useEffect, useState } from "react";
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
import { authFetch } from "utils/authFetch";
import { useNavigate } from "react-router-dom";

const AssignRole = () => {

  const navigate=useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("access");

  // 🔹 Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
      const res = await authFetch("http://127.0.0.1:8000/onboarding/users/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

        if (!res.ok) {
          console.error("Failed to fetch users");
          setUsers([]);
          return;
        }

        const data = await res.json();
        console.log("Fetched users:", data); // debug
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  // 💾 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) {
      alert("⚠️ Please select both a user and a role");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("http://127.0.0.1:8000/onboarding/roles/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: selectedUser,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        alert("✅ Role assigned successfully!");
        setSelectedUser("");
        setSelectedRole("");

        navigate("/admin/view-form");

      } else {
        const err = await res.json();
        console.error("Failed to assign role:", err);
        alert("❌ Failed to assign role: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error submitting role:", error);
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
                <h3 className="mb-0">Assign Role to User</h3>
                <p className="text-muted mt-2">
                  Select a user and assign them either Admin or Client role
                </p>
              </CardHeader>
              <CardBody>
                {loadingUsers ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-danger">No users found.</p>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* User Dropdown */}
                    <FormGroup>
                      <Label for="userSelect">Select User</Label>
                      <Input
                        id="userSelect"
                        type="select"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        <option value="">-- Choose a User --</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                    {/* Role Dropdown */}
                    <FormGroup>
                      <Label for="roleSelect">Select Role</Label>
                      <Input
                        id="roleSelect"
                        type="select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <option value="">-- Choose a Role --</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="client">Client</option>
                      </Input>
                    </FormGroup>

                    <div className="text-right">
                      <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? "Assigning..." : "🚀 Assign Role"}
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

export default AssignRole;
