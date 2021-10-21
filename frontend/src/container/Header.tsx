import React from "react"
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {PAGES} from "../pages";
import {LinkContainer} from 'react-router-bootstrap'



export const Header: React.FC = () => {
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
                     <NavDropdown title="Admin" id="admin-dropdown">
                         <LinkContainer to={PAGES.admin.registerEstate}>
                             <NavDropdown.Item>Registrar imóvel</NavDropdown.Item>
                         </LinkContainer>
                     </NavDropdown>
                     <LinkContainer to={PAGES.signup}>
                        <Nav.Link>Registrar</Nav.Link>
                     </LinkContainer>
                 </Nav>
             </Navbar.Collapse>
         </Navbar>
     </header>
   )
}