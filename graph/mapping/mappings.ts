import {EstateChanged, EstateRegistered, InterestRegistered, Transfer} from "../types/RealEstate/RealEstate";
import {EstatePlace, RealEstate, RealEstateAudit} from "../types/schema";
import {ethereum, log} from '@graphprotocol/graph-ts'


const ESTATE_STATUS_OCCUPIED: string = "OCCUPIED";
const ESTATE_STATUS_AVAILABLE: string = "AVAILABLE";


const REAL_ESTATE_REGISTERED_EVENT: string = "REGISTERED"
const REAL_ESTATE_CHANGED_EVENT: string = "CHANGED"
const REAL_ESTATE_TRANSFERRED_EVENT: string = "TRANSFERRED"


function convertEstateStatus(estate: i32): string {
    switch (estate) {
        case 0: return ESTATE_STATUS_OCCUPIED
        default: return ESTATE_STATUS_AVAILABLE
    }
}

function createAuditEvent(event: ethereum.Event, realEstateId: string, action: string): void {
    const auditEvent = new RealEstateAudit(event.transaction.hash.toHex() + event.logIndex.toHex())

    auditEvent.action = action
    auditEvent.blockNumber = event.block.number
    auditEvent.causedBy = event.transaction.from.toHex()
    auditEvent.realEstateId = realEstateId

    auditEvent.save();
}

export function handleRealEstateRegistered(event: EstateRegistered): void {
    const estateId = event.params.tokenId.toHex();

    const estateEvent = event.params.estate;
    const owner = event.params.owner.toHex();

    const estateEventPlace = estateEvent.place;

    log.debug("Receiving a real estate registered event for {}", [estateId]);

    const realEstate = new RealEstate(estateId);
    const estatePlace = new EstatePlace(estateId);

    estatePlace.region = estateEventPlace.region;
    estatePlace.city = estateEventPlace.city;
    estatePlace.country = estateEventPlace.country;
    estatePlace.street = estateEventPlace.street;
    estatePlace.number = estateEventPlace.number;
    estatePlace.neighbour = estateEventPlace.neighbour;

    realEstate.photos = estateEvent.photos;
    realEstate.price = estateEvent.price;
    realEstate.isTrading = estateEvent.isTrading;
    realEstate.isAcceptingEstate = estateEvent.isAcceptingEstate;
    realEstate.isFinanced = estateEvent.isFinanced;
    realEstate.ownerIsHolder = estateEvent.ownerIsHolder;
    realEstate.owner = owner
    realEstate.place = estatePlace.id;
    realEstate.status = convertEstateStatus(estateEvent.status);
    realEstate.agencyOwner = estateEvent.agencyOwner.toHex()
    realEstate.registerDate = event.block.timestamp;
    realEstate.lastModified = event.block.timestamp;

    createAuditEvent(event, estateId, REAL_ESTATE_REGISTERED_EVENT);

    estatePlace.save();
    realEstate.save();
}

export function handleRealEstateChanged(event: EstateChanged): void {
    const realEstateId = event.params.tokenId.toHex();

    const realEstateEvent = event.params.estate;
    const realEstateEventPlace = realEstateEvent.place;

    log.debug("Receiving a real estate change event for {}", [realEstateId]);

    const realEstate = RealEstate.load(realEstateId);

    if(!realEstate) {
        log.info("Real estate not found with id {}", [realEstateId])
        return;
    }

    const realEstatePlace = EstatePlace.load(realEstateId);

    if(!realEstatePlace) {
        log.info("Real estate place not found with id {}", [realEstateId])
        return;
    }

    realEstate.isAcceptingEstate = realEstateEvent.isAcceptingEstate;
    realEstate.status = convertEstateStatus(realEstateEvent.status);
    realEstate.agencyOwner = realEstateEvent.agencyOwner.toHex()
    realEstate.photos = realEstateEvent.photos;
    realEstate.isTrading = realEstateEvent.isTrading;
    realEstate.isFinanced = realEstateEvent.isFinanced;
    realEstate.price = realEstateEvent.price;
    realEstate.ownerIsHolder = realEstateEvent.ownerIsHolder;
    realEstate.lastModified = event.block.timestamp;

    realEstatePlace.region = realEstateEventPlace.region;
    realEstatePlace.city = realEstateEventPlace.city;
    realEstatePlace.country = realEstateEventPlace.country;
    realEstatePlace.street = realEstateEventPlace.street;
    realEstatePlace.number = realEstateEventPlace.number;
    realEstatePlace.neighbour = realEstateEventPlace.neighbour;

    createAuditEvent(event, realEstateId, REAL_ESTATE_CHANGED_EVENT);

    realEstate.save();
    realEstatePlace.save();
}

export function handleInterestRegistered(event: InterestRegistered): void {
    const realEstateId = event.params.tokenId.toHex();

    log.debug("Receiving a real estate interest registered event for {}", [realEstateId]);

    const realEstate = RealEstate.load(realEstateId);

    if(!realEstate) {
        log.info("Real estate not found with id {}", [realEstateId])
        return;
    }

    let interested = [event.params.user.toHex()];

    if(realEstate.interestedIn)
        interested = interested.concat(realEstate.interestedIn!)

    realEstate.interestedIn = interested;

    realEstate.save()
}

export function handleRealEstateTransfer(event: Transfer): void {
    createAuditEvent(event, event.params.tokenId.toHex(), REAL_ESTATE_TRANSFERRED_EVENT);
}

