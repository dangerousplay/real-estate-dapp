import React, {useContext} from "react";
import {useQuery} from "urql";
import {calculateOutdatedTime} from "../utils/RealEstate";
import {toast} from "react-toastify";
import {CurrentAddressContext} from "../hardhat/SymfoniContext";


const RealEstateOutdatedQuery = `
  query($date: BigInt) {
    realEstates(where: { lastModified_lte: $date }) {
      id
    }
  }
`;

const RealEstateBuyersPendingQuery = `
  query($agencyOwner: String) {
    realEstates(where: { interestedIn_not: [] }, agencyOwner: $agencyOwner) {
      id
    }
  }
`;


const showOutdatedNotification = ({data, error, fetching}: any) => {
    const toastId = 2

    if(error) toast("Falha ao buscar imóveis desatualizados", { type: "error"})
    if(data?.realEstates?.length > 0) toast("Há imóveis desatualizados", { type: "info", toastId })
}

const showBuyersPendingNotification = ({data, error, fetching}: any) => {
    const toastId = 1;

    if(error) toast("Falha ao buscar imóveis desatualizados", { type: "error"})
    if(data?.realEstates?.length > 0) toast("Há imóveis com compradores interessados", { type: "info", toastId })
}

const Notifications: React.FC = () => {
    const [currentAddress] = useContext(CurrentAddressContext);

    const [outdatedQuery] = useQuery({
        query: RealEstateOutdatedQuery,
        variables: {
            date: calculateOutdatedTime()
        }
    })

    const [buyersQuery] = useQuery({
        query: RealEstateBuyersPendingQuery,
        variables: {
            agencyOwner: currentAddress
        }
    })

    showOutdatedNotification(outdatedQuery);
    showBuyersPendingNotification(buyersQuery)

    return (<></>)
}

export default Notifications;