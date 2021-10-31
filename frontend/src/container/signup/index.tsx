import React, {useContext, useState} from "react";
import {Button, Card, Col, Form, InputGroup} from "react-bootstrap";
import {UserManagementContext} from "../../hardhat/SymfoniContext";

import {toast} from "react-toastify";
import {UserManagement} from "../../hardhat/typechain/UserManagement";
import { useForm } from "react-hook-form";



const onFormSubmit = (contract: UserManagement) => {
    return (formData: any) => {
        console.log(formData)

        contract.register(formData)
            .then(tx => tx.wait())
            .then(r => toast('Registro enviado', { type: "success", theme: 'dark' }))
            .catch(e => toast(`Falha no registro: ${JSON.stringify(e)}`, { type: "error", theme: 'dark'}))
    }
}


const UserRegister: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const userManagement = useContext(UserManagementContext)

    return (
        <Card>
            <Card.Header>Registrar</Card.Header>
            <Card.Body>

                <Form onSubmit={handleSubmit(onFormSubmit(userManagement.instance!))}>
                    <Card>
                        <Card.Header>Dados de cadastro</Card.Header>
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" placeholder="Joao"
                                              {...register("name", { required: true })}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" placeholder="example@com.br"
                                              {...register("email", { required: true })}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control type="text" placeholder="51988888888"
                                              {...register("cellphone", { required: true, pattern: /[0-9]{11}/ })}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <br/>

                    <Button variant="primary" type="submit">
                        Registrar
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default UserRegister;