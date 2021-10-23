import {EstateRegistered, Transfer} from "../types/RealEstate/RealEstate";
import {EstatePlace, RealEstate} from "../types/schema";


const ESTATE_STATUS_OCCUPIED: string = "OCCUPIED";
const ESTATE_STATUS_AVAILABLE: string = "AVAILABLE";


function convertEstateStatus(estate: i32): string {
    switch (estate) {
        case 0: return ESTATE_STATUS_OCCUPIED
        default: return ESTATE_STATUS_AVAILABLE
    }
}

export function handleEstateRegistered(event: EstateRegistered): void {
    const estateId = event.params.tokenId.toHex();

    const estateEvent = event.params.estate;

    const estateEventPlace = estateEvent.place;

    const estate = new RealEstate(estateId);
    const estatePlace = new EstatePlace(estateId);

    estatePlace.region = estateEventPlace.region;
    estatePlace.city = estateEventPlace.city;
    estatePlace.country = estateEventPlace.country;
    estatePlace.street = estateEventPlace.street;
    estatePlace.number = estateEventPlace.number;
    estatePlace.neighbour = estateEventPlace.neighbour;

    estate.photos = estateEvent.photos;
    estate.price = estateEvent.price;
    estate.isTrading = estateEvent.isTrading;
    estate.place = estatePlace.id;
    estate.status = convertEstateStatus(estateEvent.status);

    estatePlace.save();
    estate.save();
}

export function handleEstateTransfer(event: Transfer): void {

}

