import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col } from "reactstrap";

const UserHeader = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      try {
        const res = await fetch("http://127.0.0.1:8000/onboarding/me/", {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
      style={{
        minHeight: "600px",
        backgroundImage:
          "url(" + require("../../assets/img/theme/profile-cover.jpg") + ")",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <span className="mask bg-gradient-default opacity-8" />
      <Container className="d-flex align-items-center" fluid>
        <Row>
          <Col lg="7" md="10">
            <h1 className="display-2 text-white">
              Hello {user ? user.username : "User"}
            </h1>
            <p className="text-white mt-0 mb-5">
              This is your profile page. You can see the progress you've made
              with your work and manage your projects or assigned tasks.
            </p>
            <Button
              color="info"
              href="#!"
              onClick={(e) => e.preventDefault()}
            >
              Edit profile
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserHeader;
