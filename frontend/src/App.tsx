import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import {Header} from "./container/Header";
import {Route, Switch} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import {PAGES} from "./pages";

import RegisterEstate from "./container/management/RegisterEstate";

import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UserRegister from "./container/signup";


function App() {

  return (
      <Symfoni autoInit={true} >
          <Header/>
          <ToastContainer />
          <Switch>
              <Route path={PAGES.admin.registerEstate} strict>
                  <RegisterEstate/>
              </Route>

              <Route path={PAGES.signup} strict>
                  <UserRegister/>
              </Route>

              <Route path="/" strict>
              </Route>
          </Switch>
      </Symfoni>
  );
}

export default App;
