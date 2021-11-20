import React, {useContext} from "react";
import {Button, Card, Form} from "react-bootstrap";
import {UserManagementContext} from "../../hardhat/SymfoniContext";

import {toast} from "react-toastify";
import {UserManagement} from "../../hardhat/typechain/UserManagement";
import {useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

const onFormSubmit = (contract: UserManagement, history: any) => {
    return (formData: any) => {
        console.log(formData)

        contract.register(formData)
            .then(tx => tx.wait())
            .then(r => {
                toast('Registro enviado', { type: "success", theme: 'dark' })
                history.push("/")
            })
            .catch(e => toast(`Falha no registro: ${JSON.stringify(e)}`, { type: "error", theme: 'dark'}))
    }
}


const UserRegister: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const userManagement = useContext(UserManagementContext)
    const history = useHistory();

    return (
        <Card>
            <Card.Header>Registrar</Card.Header>
            <Card.Body>

                <Form onSubmit={handleSubmit(onFormSubmit(userManagement.instance!, history))}>
                    <Card>
                        <Card.Header>Dados de cadastro</Card.Header>
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" placeholder="Joao" isInvalid={errors.name}
                                              {...register("name", { required: true, minLength: 3 })}
                                />
                                <p style={{color: "red"}}>
                                {errors.name && "Nome deve ter mais de 3 caracteres"}
                                </p>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" placeholder="example@com.br" isInvalid={errors.email}
                                              {...register("email", { required: true, pattern: EMAIL_REGEX })}
                                />
                                <p style={{color: "red"}}>
                                {errors.email && "Email inválido"}
                                </p>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control type="text" placeholder="51988888888" isInvalid={errors.cellphone}
                                              {...register("cellphone", { required: true, pattern: /[0-9]{11}/ })}
                                />
                                <p style={{color: "red"}}>
                                    {errors.cellphone && "Telefone inválido. Deve seguir o formato 51988888888"}
                                </p>


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