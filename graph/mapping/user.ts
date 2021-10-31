import {UserApproved, UserDenied, UserRegistered} from "../types/UserManagement/UserManagement";
import {User} from "../types/schema";

const USER_REGISTERED: string = "REGISTERED";
const USER_PENDING: string = "PENDING";
const USER_DENIED: string = "DENIED";


export function handleUserRegistered(event: UserRegistered): void {
    const eventData = event.params
    const userData = eventData.user;

    const user = new User(eventData.userAddress.toHex());

    user.status = USER_PENDING;
    user.cellphone = userData.cellphone;
    user.name = userData.name;
    user.email = userData.email;

    user.save();
}

export function handleUserDenied(event: UserDenied): void {
    const eventData = event.params;

    const user = User.load(eventData.userAddress.toHex());

    if(!user) {
        return
    }

    user.status = USER_DENIED;

    user.save();
}

export function handleUserApproved(event: UserApproved): void {
    const eventData = event.params;

    const user = User.load(eventData.userAddress.toHex());

    if(!user) {
        return
    }

    user.status = USER_REGISTERED;

    user.save();
}