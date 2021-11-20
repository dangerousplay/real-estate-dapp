import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {useContext, useEffect} from "react";
import {CurrentAddressContext, UserManagementContext} from "./hardhat/SymfoniContext";
import {useDispatch} from "react-redux";
import {UserManagement} from "./hardhat/typechain/UserManagement";

export enum UserStatus {
    NOT_FOUND = 2,
    PENDING = 1,
    REGISTERED = 0
}

export interface UserState {
    isAdmin: boolean
    isRegistered: boolean
    name: string
    email: string
    cellphone: string
}

const initialState: UserState = {
    isRegistered: false,
    name: '',
    email: '',
    cellphone: '',
    isAdmin: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logIn: (state, action: PayloadAction<UserState>) => {
            const {name, isAdmin, isRegistered, email, cellphone} = action.payload;

            state.isRegistered = isRegistered;
            state.isAdmin = isAdmin;
            state.email = email;
            state.name = name;
            state.cellphone = cellphone;
        }
    },
})


async function fetchUserData(userContext: UserManagement, dispatch: any, address: string): Promise<void> {
    let user: UserState = {...initialState}

    const isAdmin = await userContext.isAdmin(address)

    const userStatus = await userContext?.getUserStatus(address)

    if(userStatus == UserStatus.NOT_FOUND) {
        dispatch(logIn({...user, isRegistered: false, isAdmin}))
        return
    }

    const userData = await userContext.user(address)

    user = Object.assign(user, userData)

    dispatch(logIn({...user, isRegistered: true, isAdmin}))
}

export const UserProvider: React.FC = () => {
    const [currentAddress] = useContext(CurrentAddressContext)
    const userContext = useContext(UserManagementContext).instance!
    const dispatch = useDispatch()

    useEffect(() => {
        if(currentAddress)
            fetchUserData(userContext, dispatch, currentAddress).then(_ => {})
    }, [currentAddress, userContext])

    return (
        <></>
    )
}

// Action creators are generated for each case reducer function
export const { logIn } = userSlice.actions

export default userSlice.reducer