import React, {useContext, useState} from "react";
import {Button, Card, Modal, Table} from "react-bootstrap";
import {useHistory, useRouteMatch} from "react-router-dom";
import {useQuery} from "urql";
import ImageGallery from "react-image-gallery";
import "./EstateView.css";
import {PAGES} from "../../../pages";
import {useSelector, useStore} from "react-redux";
import {RootState} from "../../../store";
import {CurrentAddressContext, RealEstateTokenContext} from "../../../hardhat/SymfoniContext";
import {toast} from "react-toastify";
const {fromWei} = require("web3-utils");

const RealEstateQuery = `
  query($id: String) {
    realEstates(where: { id: $id}) {
      id
      photos
      price
      registerDate
      isFinanced
      isAcceptingEstate
      ownerIsHolder
      lastModified
      status
      owner {
       id
       name
      }
      interestedIn {
        id
        name
        cellphone
      }
      place {
        street
        number
        city
        neighbour
        region
      }
    }
  }
`;

const RealEstateAuditQuery = `
query($id: String) {
    realEstateAudits(where: { realEstateId: $id}, orderBy: blockNumber, orderDirection: desc) {
      id
      blockNumber
      causedBy
      action
    }
}
`


const RealEstateTimeTravelQuery = `
  query($id: String, $blockNumber: Int) {
    realEstates(block: { number: $blockNumber }) {
      id
      photos
      price
      registerDate
      lastModified
      isFinanced
      isAcceptingEstate
      ownerIsHolder
      status
      owner {
       id
       name
      }
      interestedIn {
        id
        name
        cellphone
      }
      place {
        street
        number
        city
        neighbour
        region
      }
    }
  }
`;

const OCCUPIED = "OCCUPIED";


function RealEstateAuditDataModal(props: { show: boolean, onClose: () => void, realEstateId?: string, causedBy?: string, blockNumber?: number }) {

    const [auditQueryResult] = useQuery({
        query: RealEstateTimeTravelQuery,
        variables: {
            blockNumber: props.blockNumber
        }
    })

    const {data, fetching, error} = auditQueryResult;

    if (fetching) return <p>Carregando...</p>

    if(error) return <p>Error: {JSON.stringify(error)}</p>

    const realEstateData = data.realEstates?.find((r: any) => r.id === props.realEstateId);

    return (
        <Modal show={props.show} onHide={props.onClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Dados do imóvel no evento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {realEstateData ?
                    <RealEstateInformation realEstate={realEstateData}/> :
                    <p>Dados não encontrados</p>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={props.onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

function AuditEvents({realEstateId}: { realEstateId: string }) {

    const [auditQueryResult] = useQuery({
        query: RealEstateAuditQuery,
        variables: {
            id: realEstateId
        }
    })

    const [showModal, setShowModal] = useState(false);

    const [modalData, setModalData] = useState({})

    const {data, fetching, error} = auditQueryResult;

    if (fetching) return <p>Carregando...</p>

    if(error) return <p>Error: {JSON.stringify(error)}</p>

    return (
        <>
            <Card>
            <Card.Header>
                Histórico de atividades
            </Card.Header>
            <Card.Body>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Ação</th>
                        <th>Usuário</th>
                        <th>Número do bloco</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.realEstateAudits?.map((e: any) => {
                        return (
                            <tr key={e.id} style={{cursor: "pointer"}} onClick={t => {
                                setShowModal(true);
                                setModalData({
                                    realEstateId: realEstateId,
                                    causedBy: e.causedBy,
                                    blockNumber: parseInt(e.blockNumber)
                                });
                            }}>
                                <td>{e.action}</td>
                                <td>{e.causedBy}</td>
                                <td>{e.blockNumber}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
            </Card.Body>
            </Card>
            {showModal && <RealEstateAuditDataModal
                show={showModal}
                onClose={() => setShowModal(false)}
                {...modalData}/>}
        </>
    );
}

function InterestedIn(props: { usersInterested?: any}) {
    return <Card>
        <Card.Header>
            Interessados em comprar
        </Card.Header>
        <Card.Body>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Telefone</th>
                </tr>
                </thead>
                <tbody>
                {props?.usersInterested?.map((u: any) => {
                    return (
                        <tr key={u.id}>
                            <td>{u.name ?? u.id}</td>
                            <td>{u.cellphone}</td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
        </Card.Body>
    </Card>;
}



function RealEstateInformation({realEstate}: {realEstate: any}) {
    const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleString()

    return <>
        <Card>
            <Card.Header>Onde</Card.Header>
            <Card.Body>
                Estado: {realEstate.place.region} <br/>
                Cidade: {realEstate.place.city} <br/>
                Bairro: {realEstate.place.neighbour} <br/>
                Rua: {realEstate.place.street} <br/>
                Número: {realEstate.place.number}
            </Card.Body>
        </Card>

        <Card>
            <Card.Header>Proprietário</Card.Header>
            <Card.Body>
                Proprietário: {realEstate.owner.name} <br/>
                Imovél está no nome do proprietário? {realEstate.ownerIsHolder ? "Sim" : "Não"} <br/>
            </Card.Body>
        </Card>

        <Card>
            <Card.Header>Negociação</Card.Header>
            <Card.Body>
                Aceita negociação de outro imóvel? {realEstate.isAcceptingEstate ? "Sim" : "Não"} <br/>
                Imovél é financiado? {realEstate.isFinanced ? "Sim" : "Não"} <br/>
                Imóvel está {realEstate.status === OCCUPIED ? "ocupado" : "livre"}
            </Card.Body>
        </Card>


        <Card>
            <Card.Header>Status</Card.Header>
            <Card.Body>
                Criado em: {formatDate(realEstate.registerDate)} <br/>
                Última atualização: {formatDate(realEstate.lastModified)}
            </Card.Body>
        </Card>
    </>;
}

export const EstateView: React.FC = () => {
    const match = useRouteMatch<{id: string}>();
    const realEstateId = match.params.id;
    const history = useHistory();
    const user = useSelector((store: RootState) => store.user);
    const [currentAddress] = useContext(CurrentAddressContext)
    const realEstateContract = useContext(RealEstateTokenContext);

    const [realEstateResult] = useQuery({ query: RealEstateQuery, variables: { id: realEstateId }})

    const {data, fetching, error} = realEstateResult;

    const realEstate = data?.realEstates[0];
    const photos = realEstate?.photos?.map((original: string) => { return { original } });

    if (fetching) return <p>Carregando...</p>

    if(error) return <p>Error: {JSON.stringify(error)}</p>

    if(!realEstate) return <p>Not Found state by id {realEstateId}</p>

    const isUserInterested = realEstate?.interestedIn?.some((user: any) => user.id.toLowerCase() === currentAddress.toLowerCase())

    const isUserOwner = currentAddress.toLowerCase() === realEstate.owner?.id?.toLowerCase()

    const showInterest = !isUserOwner && !isUserInterested

    return (
        <>
            <Card>
                <Card.Header>
                    Imóvel
                </Card.Header>
                <Card.Body>

                    {photos && <ImageGallery additionalClass="photos" items={photos} showPlayButton={false}/>}

                </Card.Body>
            </Card>

            <Card className="information">
                <Card.Header>
                    Informações
                </Card.Header>
                <Card.Body>
                    <p><strong>Preço em Ether</strong>: {fromWei(realEstate.price, 'ether')}</p>

                    <RealEstateInformation realEstate={realEstate}/>

                    {showInterest &&
                    <Button className="mr-2" onClick={_ => {
                        realEstateContract.instance!.registerInterest(realEstateId)
                            .then(e => toast('Interesse registado', {type: 'success'}))
                            .catch(e => toast('Falha ao registrar interesse: ' + JSON.stringify(e), {type: 'error'}))

                    }}>Comprar</Button>}

                    {user.isAdmin &&
                    <Button onClick={_ => history.push(PAGES.admin.editRealEstate + "/" + realEstate.id)}>
                        Editar dados
                    </Button>}
                </Card.Body>
            </Card>

            {user.isAdmin && <InterestedIn usersInterested={realEstate?.interestedIn}/>}

            {user.isAdmin && <AuditEvents realEstateId={realEstateId}/>}
        </>
    )
}
