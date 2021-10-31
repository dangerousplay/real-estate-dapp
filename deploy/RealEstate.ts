module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();


    const userManagement = await deploy("UserManagement", {
        from: deployer,
        proxy: {
            methodName: "initialize",
        }
    })

    console.log("User Management contract address: ", userManagement.address)

    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const realEstate = await deploy("RealEstateToken", {
        from: deployer,
        proxy: {
            methodName: "initialize",
        },
        args: [userManagement.address]
    });

    console.log("RealEstate contract address: ", realEstate.address)

};
