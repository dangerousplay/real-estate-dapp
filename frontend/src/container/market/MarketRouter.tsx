import {Route} from "react-router-dom";
import React from "react";
import {PAGES} from "../../pages";
import {EstateList} from "./estate-list/EstateList";
import {EstateView} from "./estate-view/EstateView";


const Routes: React.FC = () => {
    return (
        <>
            <Route path={PAGES.estate.view + "/:id" } strict component={EstateView}/>
            <Route path={PAGES.estate.market} strict component={EstateList}/>
        </>
    )
}

export default Routes;