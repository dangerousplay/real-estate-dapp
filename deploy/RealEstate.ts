module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();


    const userManagement = await deploy("UserManagement", {
        from: deployer
    })

    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const realEstate = await deploy("RealEstateToken", {
        from: deployer,
        proxy: {
            methodName: "initialize",
        },
        args: [userManagement.address]
    });

};
