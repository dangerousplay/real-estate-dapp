import React, { useContext, useEffect, useState } from 'react';
import { GreeterContext, RealEstateTokenContext } from "./../hardhat/SymfoniContext";
import {web3c} from "../web3";
import {BigNumberish} from "ethers";

interface Props { }




export const Greeter: React.FC<Props> = () => {
    const greeter = useContext(GreeterContext)
    const realEstate = useContext(RealEstateTokenContext)
    const [message, setMessage] = useState("");
    const [estate, setEstate] = useState({});
    const [inputGreeting, setInputGreeting] = useState("");
    useEffect(() => {
        const doAsync = async () => {
            if (!greeter.instance) return
            console.log("Greeter is deployed at ", greeter.instance.address)
            setMessage(await greeter.instance.greet())

        };
        doAsync();
    }, [greeter])

    const handleSetGreeting = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!greeter.instance) throw Error("Greeter instance not ready")
        if (greeter.instance) {
            const tx = await greeter.instance.setGreeting(inputGreeting)
            console.log("setGreeting tx", tx)
            await tx.wait()
            console.log("New greeting mined, result: ", await greeter.instance.greet())
        }
    }

    const createEstate = async (e: any) => {
        e.preventDefault()
        if (!realEstate.instance) throw Error("Real Estate instance not ready")

        const estate = {
            place: {
                street: "string",
                number: "string",
                city: "string",
                country: "string",
                neighbour: "string",
                region: "string"
            },
            status: "0",
            isTrading: true,
            price: 100,
            photos: []
        };

        const web32 = await web3c;

        const tx = await realEstate.instance.safeMint('0x4444444444444444444444444444444444444444', estate)

        console.log("safeMint tx", tx)
        await tx.wait()
        const total = await realEstate.instance.totalSupply();

        console.log("Total supply", total);

        const information = await realEstate.instance.information(total.add(-1));
        const owner = await realEstate.instance.ownerOf(total.add(-1));

        setEstate(information);

        console.log("New greeting mined, result: ", information)
        console.log("Owner: ", owner)
    };
    return (
        <div>
            <p>{message}</p>
            <input onChange={(e) => setInputGreeting(e.target.value)}></input>
            <button onClick={(e) => handleSetGreeting(e)}>Set greeting</button>
            <div>
                <p>Estate: { JSON.stringify(estate) } </p>
                <button onClick={(e) => createEstate(e)}>Create a random estate</button>
            </div>
        </div>
    )
}