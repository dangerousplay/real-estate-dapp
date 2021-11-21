import React from "react"
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {PAGES} from "../pages";
import {LinkContainer} from 'react-router-bootstrap'
import {useSelector} from "react-redux";
import {RootState} from "../store";



export const Header: React.FC = () => {
    const user = useSelector((state: RootState) => state.user)

   return (
     <header>
         <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
             <LinkContainer to="/">
                <Navbar.Brand>IMobily</Navbar.Brand>
             </LinkContainer>
             <Navbar.Toggle aria-controls="responsive-navbar-nav" />
             <Navbar.Collapse id="responsive-navbar-nav">
                 <Nav className="mr-auto">
                     <LinkContainer to={PAGES.estate.market}>
                         <Nav.Link>Catálogo</Nav.Link>
                     </LinkContainer>
                 </Nav>
                 <Nav>
                     {user.isAdmin &&
                     <NavDropdown title="Admin" id="admin-dropdown">
                         <LinkContainer to={PAGES.admin.registerEstate}>
                             <NavDropdown.Item>Registrar imóvel</NavDropdown.Item>
                         </LinkContainer>
                         <LinkContainer to={PAGES.admin.userApproval}>
                             <NavDropdown.Item>Aprovar usuários</NavDropdown.Item>
                         </LinkContainer>
                         <LinkContainer to={PAGES.admin.dashboard}>
                             <NavDropdown.Item>Dashboard</NavDropdown.Item>
                         </LinkContainer>
                     </NavDropdown> }
                     { !user.isRegistered &&
                     <LinkContainer to={PAGES.signup}>
                        <Nav.Link>Registrar</Nav.Link>
                     </LinkContainer> }
                 </Nav>
             </Navbar.Collapse>
         </Navbar>
     </header>
   )
}