import {Route} from "react-router-dom";
import React from "react";
import {PAGES} from "../../pages";
import {EstateList} from "./estate-list/EstateList";


const Routes: React.FC = () => {
    return (
        <>
            <Route path={PAGES.estate.market} strict>
                <EstateList/>
            </Route>
        </>
    )
}

export default Routes;