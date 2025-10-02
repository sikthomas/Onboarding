import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Maps from "views/examples/Maps.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
import Icons from "views/examples/Icons.js";
import CreateForm from "views/examples/CreateForm";
import ViewForms from "views/examples/ViewForm";
import FillForm from "views/examples/FillForm";
import ViewResponses from "views/examples/ViewResponses";
import AssignRole from "views/examples/Roles";
import AssignForm from "views/examples/AssignForm";
import UsersList from "views/examples/Users";

// All routes
const allRoutes = [
  {
    path: "/view_form",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <ViewForms />,
    layout: "/admin",
  },
{
  path: "/users",
  name: "Users",
  icon: "ni ni-single-02 text-primary", 
  component: <UsersList />,
  layout: "/admin",
  adminOnly: true,
},
{
  path: "/assign-role",
  name: "Assign Role",
  icon: "ni ni-settings-gear-65 text-warning", 
  component: <AssignRole />,
  layout: "/admin",
  adminOnly: true,
},

  {
  path: "/create_form",
  name: "Create Form",
  icon: "ni ni-collection text-success", 
  component: <CreateForm />,
  layout: "/admin",
  adminOnly: true,
},
{
  path: "/assign_form",
  name: "Assign Form",
  icon: "ni ni-send text-info", // represents sending/assigning
  component: <AssignForm />,
  layout: "/admin",
  adminOnly: true,
},
{
  path: "/user-profile",
  name: "User Profile",
  icon: "ni ni-circle-08 text-warning", // profile icon
  component: <Profile />,
  layout: "/admin",
},


  {
    path: "/login",
    name: "Logout",
    icon: "ni ni-user-run text-danger", 
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/fill_form/:id",
    component: <FillForm />,
    layout: "/admin",
  },
  {
    path: "/responses/:id",
    component: <ViewResponses />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
  },
];

// Function to filter routes based on user role
export const getRoutesForUser = (user) => {
  if (!user) return allRoutes.filter(r => r.layout !== "/admin"); // fallback
  if (user.is_superuser && user.is_staff) return allRoutes; // admin+staff see all
  return allRoutes.filter(r => !r.adminOnly); // hide adminOnly routes
};

export default allRoutes;
