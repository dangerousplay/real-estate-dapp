import React, {useContext, useState} from "react";
import {Button, Card, Col, Form, InputGroup} from "react-bootstrap";
import {CountryDropdown, RegionDropdown} from "react-country-region-selector";
import {RealEstateTokenContext} from "../../hardhat/SymfoniContext";
import {RealEstateToken} from "../../hardhat/typechain/RealEstateToken";

import {toast} from "react-toastify";

const onFormSubmit = async (e: any, contract: RealEstateToken) => {
    e.preventDefault()

    const formData = new FormData(e.target),
        formDataObj = Object.fromEntries(formData.entries())

    console.log(formDataObj)

    const { street, country, city, neighbour, region } = formDataObj;

    const place = {
        street,
        country,
        city,
        neighbour,
        region,
        number: formDataObj.placeNumber
    }

    const estate = {
        status: formDataObj.estateStatus,
        isTrading: formDataObj.isTrading || false,
        price: formDataObj.estatePrice,
        place,
        photos: []
    }

    console.log(estate)

    const tx = await contract.safeMint(formDataObj.ownerName as string, estate as any)
    await tx.wait()

    toast('Imóvel registrado', { type: "success", theme: 'dark' })
}


const Register: React.FC = () => {
    const [country, setCountry] = useState("");
    const [region, setRegion] = useState("");
    const realEstateContract = useContext(RealEstateTokenContext)

    return (
    <Card>
        <Card.Header>Registrar imóvel</Card.Header>
        <Card.Body>

            <Form onSubmit={e => onFormSubmit(e, realEstateContract.instance!)}>
                <Card>
                    <Card.Header>Dados de endereço</Card.Header>
                    <Card.Body>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>País</Form.Label>
                                <div>
                                    <CountryDropdown
                                        value={country}
                                        onChange={(val) => setCountry(val)} name="country"/>
                                </div>
                            </Form.Group>

                            <Form.Group as={Col}>
                                <Form.Label>Estado</Form.Label>
                                <div>
                                    <RegionDropdown
                                        country={country}
                                        value={region}
                                        onChange={(val) => setRegion(val)} name="region"/>
                                </div>
                            </Form.Group>

                            <Form.Group as={Col}>
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control type="text" placeholder="Cidade" name="city"/>
                            </Form.Group>

                            <Form.Group as={Col}>
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control type="text" placeholder="Bairro" name="neighbour"/>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>Rua</Form.Label>
                                <Form.Control type="text" placeholder="Av. Barreto" name="street"/>
                            </Form.Group>

                            <Form.Group as={Col}>
                                <Form.Label>Número</Form.Label>
                                <Form.Control type="text" placeholder="583" name="placeNumber"/>
                            </Form.Group>
                        </Form.Row>
                    </Card.Body>
                </Card>

                <br/>

                <Card>
                    <Card.Header>Imóvel</Card.Header>
                    <Card.Body>
                        <Form.Group>
                            <Form.Label>Situação do imóvel</Form.Label>
                            <Form.Check type="radio" label="Ocupado" name="estateStatus" value={0}/>
                            <Form.Check type="radio" label="Livre" name="estateStatus" value={1}/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Check type="checkbox" label="Imóvel está no nome do proprietário"
                                        name="ownerIsHolder" value="true"/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Proprietário</Form.Label>
                            <Form.Control type="text" placeholder="Joao" name="ownerName"/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Valor do imóvel</Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Prepend>
                                    <InputGroup.Text>$</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control type="number" required name="estatePrice" />
                                <Form.Control.Feedback type="invalid">
                                    Informe um valor
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                    </Card.Body>
                </Card>

                <br/>

                <Form.Group>
                    <Form.Check type="checkbox" label="Proprietário aceita negociação (outro imóvel)"
                                name="isTrading" value="true"/>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Registrar
                </Button>
            </Form>
        </Card.Body>
    </Card>
    )
}

export default Register;