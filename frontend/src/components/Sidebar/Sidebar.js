import { useState, useEffect } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import {
  Button, Collapse, NavItem, NavLink, Nav, Container, Row, Col,
  Form, InputGroup, Input, InputGroupAddon, InputGroupText, Navbar, NavbarBrand,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Media
} from "reactstrap";

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  const [user, setUser] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  const activeRoute = (routeName) => props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  const toggleCollapse = () => setCollapseOpen((data) => !data);
  const closeCollapse = () => setCollapseOpen(false);

  const createLinks = (routes) => {
  return routes.map((prop, key) => (
    <NavItem key={key} className="mb-2">
      <NavLink 
        to={prop.layout + prop.path} 
        tag={NavLinkRRD} 
        onClick={closeCollapse}
        className="d-flex align-items-center"
      >
        <i className={`${prop.icon} mr-2`} style={{ fontSize: "1.1rem" }} />
        <span 
          className="nav-link-text"
          style={{ fontSize: "1.05rem", fontWeight: 600 }}
        >
          {prop.name}
        </span>
      </NavLink>
    </NavItem>
  ));
};


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch("http://127.0.0.1:8000/onboarding/me/", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);

        // Filter routes
        const routes = props.routes || [];
        if (data.is_superuser && data.is_staff) {
          setFilteredRoutes(routes); // admin+staff sees all
        } else {
          setFilteredRoutes(routes.filter(r => !r.adminOnly)); // hide adminOnly
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [props.routes]);

  const { logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) navbarBrandProps = { to: logo.innerLink, tag: Link };
  else if (logo && logo.outterLink) navbarBrandProps = { href: logo.outterLink, target: "_blank" };

  return (
    <Navbar className="navbar-vertical fixed-left navbar-light bg-white" expand="md" id="sidenav-main">
      <Container fluid>
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>

        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            {logo.imgSrc ? <img alt={logo.imgAlt} className="navbar-brand-img" src={logo.imgSrc} /> :
              <h2 className="font-weight-bold mb-0" style={{ color: "blue" }}>{logo.text || "KYC ONBOARDING"}</h2>}
          </NavbarBrand>
        ) : null}

        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          <Nav navbar>{createLinks(filteredRoutes)}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = { routes: [{}] };
Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
