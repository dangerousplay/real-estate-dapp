import React, {useContext, useLayoutEffect, useState} from "react";
import {Button, Card, Col, Form, InputGroup} from "react-bootstrap";
import {CountryDropdown, RegionDropdown} from "react-country-region-selector";
import {CurrentAddressContext, RealEstateTokenContext} from "../../hardhat/SymfoniContext";
import {RealEstateToken} from "../../hardhat/typechain/RealEstateToken";
import AsyncSelect from 'react-select/async';
import {toast} from "react-toastify";
import {urqlClient} from "../../graphq";
import {ImageUpload} from "../../components/image/ImageUpload";
import {ipfsUrl} from "../../configuration";
import {useHistory, useParams} from "react-router-dom";
import {PAGES} from "../../pages";
import {useQuery} from "urql";
import {BigNumberish} from "ethers";

const {toWei, fromWei} = require("web3-utils");
const cc = require('cryptocompare')



const realEstateQuery = `
  query($id: String) {
    realEstates(where: { id: $id}) {
      photos
      price
      isTrading
      status
      registerDate
      isAcceptingEstate
      isFinanced
      lastModified
      ownerIsHolder
      owner {
       name
       id
      }
      place {
        country
        street
        number
        city
        neighbour
        region
      }
    }
  }
`;

async function registerEstate(contract: RealEstateToken, owner: File | string, estate: any, history: any) {
    try {
        const tx = await contract.safeMint(owner as string, estate as any)
        await tx.wait()

        toast('Imóvel registrado', {type: "success", theme: 'dark'})

        history.push(PAGES.estate.market)
    } catch (e) {
        toast('Falha no registro do imóvel: ' + JSON.stringify(e), {type: "error", theme: 'dark'})
    }
}

async function updateEstate(contract: RealEstateToken, tokenId: BigNumberish, estate: any, history: any) {
    try {
        const tx = await contract.updateRealEstateMetadata(tokenId, estate as any)
        await tx.wait()

        toast('Imóvel atualizado', {type: "success", theme: 'dark'})

        history.push(PAGES.estate.market)
    } catch (e) {
        toast('Falha na atualização do imóvel: ' + JSON.stringify(e), {type: "error", theme: 'dark'})
    }
}

const onFormSubmit = async (e: any, photos: string[], contract: RealEstateToken, history: any, realEstateId?: string) => {
    e.preventDefault()

    const formData = new FormData(e.target),
        formDataObj = Object.fromEntries(formData.entries())

    const {
        street, country, city,
        neighbour, region, ownerIsHolder,
        isAcceptingEstate, owner,
        estateStatus,
        isTrading,
        agencyOwner,
        isFinanced,
        placeNumber
    } = formDataObj;

    const place = {
        street,
        country,
        city,
        neighbour,
        region,
        number: placeNumber
    }

    const estatePrice = toWei(formDataObj.estatePrice as any, 'ether')

    const estate = {
        status: estateStatus,
        isTrading: isTrading || false,
        isFinanced: isFinanced || false,
        price: estatePrice,
        ownerIsHolder,
        isAcceptingEstate: isAcceptingEstate || false,
        agencyOwner,
        place,
        photos
    }

    if(realEstateId) {
        await updateEstate(contract, realEstateId, estate, history)
    } else {
        await registerEstate(contract, owner, estate, history);
    }
}


function EstateInput(props: {setPhotos: (photos: string[]) => void, realEstate?: any }) {
    const USERS_QUERY = `
      query users($name: String) {
        users(first: 10, where: { name_contains: $name }) {
          label: name
          value: id
        }
      }
    `;

    const searchUsers = (query: any) => {
        return async (name: string) => {
            const users = await urqlClient
                .query(query, { name })
                .toPromise();

            return users.data.users
        };
    }

    const realEstate = props.realEstate

    const price = realEstate?.price != null ?
        fromWei(realEstate?.price, 'ether') : 0

    const [currentAddress] = useContext(CurrentAddressContext)

    const [ethUSDPrice, setEthUSDPrice] = useState(0)
    const [realEstatePrice, setRealEstatePrice] = useState(price)

    useLayoutEffect(() => {
        cc.price('ETH', ['USD'])
            .then((prices: any) => {
                setEthUSDPrice(prices['USD'])
            }).catch(console.error)

        props.setPhotos(realEstate?.photos)
    }, [])

    const agencyOwner = realEstate?.agencyOwner ?? currentAddress;

    const isOccupied = realEstate?.status === "OCCUPIED"

    const owner = realEstate?.owner != null ?
        {label: realEstate?.owner!.name!, value: realEstate?.owner!.id!} :
        undefined

    return <Card>
        <Card.Header>Imóvel</Card.Header>
        <Card.Body>
            <Form.Group>
                <Form.Label>Situação do imóvel</Form.Label>
                <Form.Check type="radio" label="Ocupado" defaultChecked={isOccupied} name="estateStatus" value={0}/>
                <Form.Check type="radio" label="Livre" defaultChecked={!isOccupied} name="estateStatus" value={1}/>
            </Form.Group>

            <Form.Group>
                <Form.Check type="checkbox" label="Imóvel está no nome do proprietário"
                            defaultChecked={realEstate?.ownerIsHolder}
                            name="ownerIsHolder" value="true"/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Proprietário</Form.Label>
                <AsyncSelect loadOptions={searchUsers(USERS_QUERY)}
                             defaultValue={owner}
                             name="owner"/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Owner do agenciamento</Form.Label>
                <Form.Control type="text" value={agencyOwner} readOnly name="agencyOwner"/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Fotos</Form.Label>
                <ImageUpload ipfsUrl={ipfsUrl} inputName="photos"
                             defaultPhotos={realEstate?.photos}
                             onImagesChanged={props.setPhotos}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Valor do imóvel</Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Prepend>
                        <InputGroup.Text>$</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control type="number" required min={0} name="estatePrice"
                                  defaultValue={realEstatePrice}
                                  onChange={e => setRealEstatePrice(parseFloat(e.target.value))}/>
                    <Form.Control.Feedback type="invalid">
                        Informe um valor
                    </Form.Control.Feedback>
                </InputGroup>
                <p>
                    Valor em dollar: { ethUSDPrice * (realEstatePrice > -1 ? realEstatePrice : 0) }
                </p>
            </Form.Group>
        </Card.Body>
    </Card>;
}


function EstatePlaceInput({realEstate}: { realEstate: any}) {
    const place = realEstate?.place;

    const [country, setCountry] = useState(place?.country);
    const [region, setRegion] = useState(place?.region);

    return <Card>
        <Card.Header>Dados de endereço</Card.Header>
        <Card.Body>
            <Form.Row>
                <Form.Group as={Col}>
                    <Form.Label>País</Form.Label>
                    <div>
                        <CountryDropdown
                            value={country}
                            defaultOptionLabel={"Selecione o país"}
                            onChange={e => {
                                setCountry(e)
                            }} name="country"/>
                    </div>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Estado</Form.Label>
                    <div>
                        <RegionDropdown
                            country={country}
                            value={region}
                            defaultOptionLabel={"Selecione o estado"}
                            onChange={e => {
                                setRegion(e)
                            }} name="region"/>
                    </div>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control type="text"
                                  defaultValue={place?.city}
                                  placeholder="Cidade" name="city" required/>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control type="text"
                                  defaultValue={place?.neighbour}
                                  placeholder="Bairro" name="neighbour" required/>
                </Form.Group>
            </Form.Row>

            <Form.Row>
                <Form.Group as={Col}>
                    <Form.Label>Rua</Form.Label>
                    <Form.Control type="text"
                                  defaultValue={place?.street}
                                  placeholder="Av. Barreto" name="street" required/>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Número</Form.Label>
                    <Form.Control type="text"
                                  defaultValue={place?.number}
                                  placeholder="583" name="placeNumber" required/>
                </Form.Group>
            </Form.Row>
        </Card.Body>
    </Card>;
}


const Register: React.FC = () => {
    const realEstateContract = useContext(RealEstateTokenContext)
    const [estatePhotos, setEstatePhotos] = useState<string[]>([])
    const realEstateId = useParams<{estateId?: string}>().estateId;

    const [queryResult] = useQuery({
        query: realEstateQuery,
        variables: {
            id: realEstateId
        }
    });

    const {fetching, data, error} = queryResult;

    const realEstateData = data?.realEstates ? data?.realEstates[0] : null;

    const history = useHistory();

    const isEditing = realEstateId != undefined

    if(isEditing) {
        if(fetching) return (<p>Carregando dados</p>)
        if(error) return (<p>Falha ao carregar dados: {JSON.stringify(error)}</p>)
    }

    return (
    <Card>
        <Card.Header>{isEditing ? "Editando imóvel": "Registrar imóvel"}</Card.Header>
        <Card.Body>

            <Form onSubmit={e => onFormSubmit(e, estatePhotos, realEstateContract.instance!, history, realEstateId)}>
                <EstatePlaceInput realEstate={realEstateData}/>

                <br/>

                <EstateInput setPhotos={setEstatePhotos} realEstate={realEstateData}/>

                <br/>

                <Form.Group>
                    <Form.Check type="checkbox"
                                defaultChecked={realEstateData?.isAcceptingEstate}
                                label="Proprietário aceita negociação de outro imóvel?"
                                name="isAcceptingEstate" value="true"/>
                </Form.Group>

                <Form.Group>
                    <Form.Check type="checkbox" label="Imóvel está a venda?"
                                defaultChecked={realEstateData?.isTrading}
                                name="isTrading" value="true"/>
                </Form.Group>

                <Form.Group>
                    <Form.Check type="checkbox" label="Imóvel é financiado?"
                                defaultChecked={realEstateData?.isFinanced}
                                name="isFinanced" value="true"/>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Salvar
                </Button>
            </Form>
        </Card.Body>
    </Card>
    )
}

export default Register;