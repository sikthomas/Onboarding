import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      try {
        const res = await fetch("http://127.0.0.1:8000/onboarding/me/", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4>Loading user data...</h4>
      </div>
    );
  }

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row>
          {/* Profile Card */}
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image">
                    <a href="#!" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="User Avatar"
                        className="rounded-circle"
                        src={require("../../assets/img/theme/team-4-800x800.jpg")}
                      />
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div className="d-flex justify-content-between">
                  <Button className="mr-4" color="info" size="sm">
                    Connect
                  </Button>
                  <Button className="float-right" color="default" size="sm">
                    Message
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0 pt-md-4">
                <div className="text-center">
                  <h3>
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="h5 font-weight-300">
                    <i className="ni ni-email-83 mr-2" />
                    {user.email}
                  </div>
                  <div className="h5 mt-4">
                    <i className="ni ni-badge mr-2" />
                    {user.is_superuser && user.is_staff
                      ? "Admin & Staff"
                      : user.is_staff
                      ? "Staff"
                      : "User"}
                  </div>
                  <hr className="my-4" />
                  <p>
                    Username: <strong>{user.username}</strong>
                  </p>
                  <p>User ID: <strong>{user.id}</strong></p>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Account Info Card */}
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My Account</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button color="primary" size="sm">
                      Settings
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <h6 className="heading-small text-muted mb-4">
                    User Information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="input-username">Username</label>
                          <Input
                            className="form-control-alternative"
                            value={user.username}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="input-email">Email</label>
                          <Input
                            className="form-control-alternative"
                            value={user.email}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="input-first-name">First Name</label>
                          <Input
                            className="form-control-alternative"
                            value={user.first_name}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="input-last-name">Last Name</label>
                          <Input
                            className="form-control-alternative"
                            value={user.last_name}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                    </Row>
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

export default Profile;
