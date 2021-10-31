import {Route} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import React from "react";
import {PAGES} from "../../pages";
import RegisterEstate from "./RegisterEstate";
import UserApproval from "./UserApproval";


const Routes: React.FC = () => {
    const user = useSelector((state: RootState) => state.user)

    if (!user.isAdmin) {
        return <></>
    }

    return (
        <>
            <Route path={PAGES.admin.registerEstate} strict>
                <RegisterEstate/>
            </Route>

            <Route path={PAGES.admin.userApproval} strict>
                <UserApproval/>
            </Route>
        </>
    )
}

export default Routes;