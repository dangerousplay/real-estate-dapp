import {UserApproved, UserDenied, UserRegistered} from "../types/UserManagement/UserManagement";
import {User, UserAudit} from "../types/schema";
import {ethereum, log} from '@graphprotocol/graph-ts'


const USER_REGISTERED: string = "REGISTERED";
const USER_APPROVED: string = "APPROVED";
const USER_PENDING: string = "PENDING";
const USER_DENIED: string = "DENIED";


function createAuditEvent(event: ethereum.Event, userId: string, action: string): void {
    const auditEvent = new UserAudit(event.transaction.hash.toHex() + event.logIndex.toHex())

    auditEvent.action = action
    auditEvent.blockNumber = event.block.number
    auditEvent.causedBy = event.transaction.from.toHex()
    auditEvent.userId = userId

    auditEvent.save();
}

export function handleUserRegistered(event: UserRegistered): void {
    const eventData = event.params
    const userData = eventData.user;
    const userId = eventData.userAddress.toHex();

    log.debug("Receiving user registered event for {}", [userId])

    const user = new User(userId);

    user.status = USER_PENDING;
    user.cellphone = userData.cellphone;
    user.name = userData.name;
    user.email = userData.email;

    createAuditEvent(event, userId, USER_REGISTERED);

    user.save();
}

export function handleUserDenied(event: UserDenied): void {
    const eventData = event.params;
    const userId = eventData.userAddress.toHex();

    log.debug("Receiving user denied event for {}", [userId])

    const user = User.load(userId);

    if(!user) {
        log.info("User not found by id {} to update status", [userId])
        return
    }

    user.status = USER_DENIED;

    createAuditEvent(event, userId, USER_DENIED)

    user.save();
}

export function handleUserApproved(event: UserApproved): void {
    const eventData = event.params;
    const userId = eventData.userAddress.toHex();

    log.debug("Receiving user approved event for {}", [userId])

    const user = User.load(userId);

    if(!user) {
        log.info("User not found by id {} to update status", [userId])
        return
    }

    user.status = USER_REGISTERED;

    createAuditEvent(event, userId, USER_APPROVED)

    user.save();
}