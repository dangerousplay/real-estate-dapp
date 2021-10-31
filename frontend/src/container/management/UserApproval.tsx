import React, {useContext} from "react";
import {Button, Card, Table} from "react-bootstrap";

import { useQuery } from 'urql';
import { UserManagementContext } from "../../hardhat/SymfoniContext";
import {toast} from "react-toastify";
import {UserManagement} from "../../hardhat/typechain/UserManagement";


const UsersPendingQuery = `
  query {
    users(where: { status: "PENDING" }) {
      id
      name
      email
      cellphone
    }
  }
`;


const approveUser = async (contract: UserManagement, id: string) => {
    const tx = await contract.approve(id);
    await tx.wait();

    toast('Usuário aprovado com sucesso', { type: "success", theme: 'dark' })
}

const denyUser = async (contract: UserManagement, id: string) => {
    const tx = await contract.denyUser(id);
    await tx.wait();

    toast('Usuário aprovado com sucesso', { type: "success", theme: 'dark' })
}


const UserPendingList: React.FC = () => {
    const [result, reexecuteQuery] = useQuery({
        query: UsersPendingQuery,
    });

    const {data, fetching, error} = result;
    const userContract = useContext(UserManagementContext)

    if (fetching) return <p>Loading...</p>;
    if (error) return <p>Oh no... {error.message}</p>;

    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Address</th>
                <th/>
            </tr>
            </thead>
            <tbody>
            {
                data.users.map((user: any) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.cellphone}</td>
                        <td>
                            {user.id}
                        </td>
                        <td>
                            <Button color="primary" style={{marginRight: "10px"}}
                                    onClick={e => {
                                        approveUser(userContract.instance!, user.id);
                                        setTimeout(() => reexecuteQuery(), 2000);
                                    }}>
                                Aprovar
                            </Button>
                            <Button color="danger"
                                    onClick={e => {
                                        denyUser(userContract.instance!, user.id);
                                        setTimeout(() => reexecuteQuery(), 2000);
                                    }}>
                                Negar
                            </Button>
                        </td>
                    </tr>
                ))
            }
            </tbody>
        </Table>
    )
}

const UserApproval: React.FC = () => {
    return (
        <Card>
            <Card.Header>
                Usuários aguardando aprovação
            </Card.Header>
            <Card.Body>
                <UserPendingList/>
            </Card.Body>
        </Card>
    )
}

export default UserApproval;