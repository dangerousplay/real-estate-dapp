import React, {useContext} from "react";
import {Card, Table} from "react-bootstrap";
import {useQuery} from "urql";
import {calculateOutdatedTime, timestampToDateString} from "../../utils/RealEstate";
import {CurrentAddressContext} from "../../hardhat/SymfoniContext";
import {useHistory} from "react-router-dom";
import {PAGES} from "../../pages";

const {fromWei} = require("web3-utils");

const RealEstateOutdatedQuery = `
  query($date: BigInt) {
    realEstates(where: { lastModified_lte: $date }) {
      id
      price
      lastModified
      owner {
        name
      }
    }
  }
`;

const RealEstateBuyersPendingQuery = `
  query($agencyOwner: String) {
    realEstates(where: { interestedIn_not: [] }, agencyOwner: $agencyOwner) {
      id
      price
      lastModified
      owner {
        name
      }
    }
  }
`;


function RealEstateWithPendingBuyers() {
    const [currentAddress] =  useContext(CurrentAddressContext);

    const [queryResult] = useQuery({
        query: RealEstateBuyersPendingQuery,
        variables: {
            agencyOwner: currentAddress
        }
    })

    const {data, fetching, error} = queryResult;

    if(fetching) return (<p>Carregando dados</p>)
    if(error) return (<p>Erro ao carregar dados: {JSON.stringify(error)}</p>)

    return <Card>
        <Card.Header>Imóveis com pessoas interessadas</Card.Header>
        <Card.Body>
            <RealEstateInformation data={data?.realEstates}/>
        </Card.Body>
    </Card>;
}

function RealEstateInformation({data}: {data: any}) {
    const history = useHistory()

    return <Table striped bordered hover>
        <thead>
        <tr>
            <th>Proprietário</th>
            <th>Valor</th>
            <th>Última modificação</th>
        </tr>
        </thead>
        <tbody>
        {data?.map((e: any) => {
            return (
                <tr key={e.id} style={{cursor: "pointer"}} onClick={t => {
                    history.push(PAGES.estate.view + "/" + e.id)
                }}>
                    <td>{e.owner.name}</td>
                    <td>{fromWei(e.price, 'ether')}</td>
                    <td>{timestampToDateString(e.lastModified)}</td>
                </tr>
            )
        })}
        </tbody>
    </Table>;
}

function RealEstatesOutdated() {
    const [queryResult] = useQuery({
        query: RealEstateOutdatedQuery,
        variables: {
            date: calculateOutdatedTime()
        }
    })

    const {data, fetching, error} = queryResult;

    if(fetching) return (<p>Carregando dados</p>)
    if(error) return (<p>Erro ao carregar dados: {JSON.stringify(error)}</p>)

    return <Card>
        <Card.Header>Imóveis desatualizados</Card.Header>
        <Card.Body>
            <RealEstateInformation data={data?.realEstates}/>
        </Card.Body>
    </Card>
}

const Dashboard: React.FC = () => {
    return (
        <>
            <RealEstateWithPendingBuyers/>
            <RealEstatesOutdated/>
        </>
    )
}

export default Dashboard;