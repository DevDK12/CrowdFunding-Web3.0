import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {

    const { contract } = useContract('0x61a566D6ec60fC14E9fA8728434718a47b17E5D1');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

    const address = useAddress();
    const connect = useMetamask();




    const publishCampaign = async (form) => {

        try {
            const data = await createCampaign({args: [
                address, // owner
                form.title, // title
                form.description, // description
                form.target, // target
                new Date(form.deadline).getTime(), // deadline
                form.image // image
            ]});


            console.log("contract call success", data)

        } catch (error) {
            console.log("contract call failure", error)
        }
    }




    const getCampaigns = async () => {

        const campaigns = await contract.call('getCampaigns');

        // console.log(campaigns);
        const parsedCampaings = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i,
            key: i,
        }));

        return parsedCampaings;
    }



    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();

        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

        return filteredCampaigns;
    }



    const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', [pId] ,
            { value: ethers.utils.parseEther(amount) }
        );

        return data;
    }



    const getDonations = async (pId) => {

        const donations = await contract.call('getDonators', [pId]);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            })
        }

        return parsedDonations;
    }




    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);