import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import {Header} from "./container/Header";
import {Route, Switch} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import {PAGES} from "./pages";

import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import UserRegister from "./container/signup";

import { Provider as UrqProvider } from 'urql';


import { Provider as ReduxProvider } from 'react-redux'
import {store} from './store';
import {UserProvider} from "./user";
import {urqlClient} from "./graphq";
import ManagementRouter from "./container/management/ManagementRouter";
import MarketRouter from "./container/market/MarketRouter";
import Notifications from "./container/Notifications";




function App() {
  return (
      <Symfoni autoInit={true} >
          <UrqProvider value={urqlClient}>
          <ReduxProvider store={store}>
          <UserProvider/>
          <Header/>
          <Notifications/>
          <ToastContainer />
              <section className="main-content">
              <Switch>
                  <Route path={PAGES.signup} strict>
                      <UserRegister/>
                  </Route>

                  <Route path={PAGES.admin.root} component={ManagementRouter}/>
                  <Route path={PAGES.estate.root} component={MarketRouter}/>

                  <Route path="/" strict>
                  </Route>
              </Switch>
              </section>
          </ReduxProvider>
          </UrqProvider>
      </Symfoni>
  );
}

export default App;
