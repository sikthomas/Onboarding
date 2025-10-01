import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col, Spinner } from "reactstrap";

const Header = () => {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    users: 0,
    forms: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchUserAndCounts = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Fetch current user
        const userRes = await fetch("http://127.0.0.1:8000/onboarding/me/", { headers });
        const userData = await userRes.json();
        setUser(userData);

        // Fetch counts for everyone (we need submissions at least)
        const submissionsRes = await fetch("http://127.0.0.1:8000/onboarding/count-submissions/", { headers });
        const submissionsData = await submissionsRes.json();

        const updatedCounts = { submissions: submissionsData.count || 0 };

        // If admin+staff, fetch other counts
        if (userData.is_superuser && userData.is_staff) {
          const [usersRes, formsRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/onboarding/count-users/", { headers }),
            fetch("http://127.0.0.1:8000/onboarding/count-forms/", { headers }),
          ]);

          const usersData = await usersRes.json();
          const formsData = await formsRes.json();

          updatedCounts.users = usersData.count || 0;
          updatedCounts.forms = formsData.count || 0;
        }

        setCounts(updatedCounts);
      } catch (error) {
        console.error("Error fetching header data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCounts();
  }, [token]);

  if (loading) {
    return (
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8 text-center">
        <Spinner color="light" />
      </div>
    );
  }

  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            {user?.is_superuser && user?.is_staff ? (
              <>
                {/* Admin+Staff: Show all cards */}
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Total Users
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{counts.users}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                            <i className="fas fa-users" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Total Forms Created
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{counts.forms}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                            <i className="fas fa-file-alt" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Total Responses Received
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{counts.submissions}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                            <i className="fas fa-paper-plane" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            New Forms
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{counts.forms}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                            <i className="fas fa-file-alt" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </>
            ) : (
              <>
                {/* Non-admin users: show only submissions count */}
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Total Responses
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{counts.submissions}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                            <i className="fas fa-paper-plane" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </>
            )}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Header;
