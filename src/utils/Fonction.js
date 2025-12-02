// fonctions.js
import Web3 from 'web3';

const CONTRACT_ADDRESS = '0x4b81330284965C390D10adB368D0cC764C758644';
const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            }
        ],
        "name": "CampaignCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "target",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newDeadline",
                "type": "uint256"
            }
        ],
        "name": "DeadlineUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationMade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "RefundClaimed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaigns",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "target",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountCollected",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "image",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "fundsWithdrawn",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "cancelCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "claimRefundAfterCancellation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "claimRefundIfGoalNotMet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_target",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_image",
                "type": "string"
            }
        ],
        "name": "createCampaign",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "donateToCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "donorContributions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "getCampaignDetails",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "target",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountCollected",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "image",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "fundsWithdrawn",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCampaigns",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "target",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountCollected",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "internalType": "address[]",
                        "name": "donators",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "donations",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundsWithdrawn",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CrowdFunding.Campaign[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "getDonators",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_donor",
                "type": "address"
            }
        ],
        "name": "getDonorContribution",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_donor",
                "type": "address"
            }
        ],
        "name": "isRefundClaimed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numberOfCampaigns",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "refundClaimed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "refundDonation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_newDeadline",
                "type": "uint256"
            }
        ],
        "name": "updateDeadline",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];



class ContractFunctions {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🔄 Initialisation de Web3...');
            
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                console.log('✅ Web3 initialisé');
                
                // Demander la connexion au compte
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                this.account = accounts[0];
                console.log('✅ Compte connecté:', this.getShortAddress(this.account));
                
                // Initialiser le contrat
                this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                this.isInitialized = true;
                console.log('✅ Contrat initialisé avec succès');
                
                return true;
            } else {
                throw new Error('MetaMask non détecté. Veuillez installer MetaMask.');
            }
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async connectWallet() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }
            return this.account;
        } catch (error) {
            console.error('❌ Erreur connexion portefeuille:', error);
            throw error;
        }
    }

    

    async getCampaigns() {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Récupération des campagnes...');
            
            // D'abord, obtenir le nombre de campagnes
            const numberOfCampaigns = await this.contract.methods.numberOfCampaigns().call();
            console.log('Nombre de campagnes:', numberOfCampaigns);

            // Ensuite, obtenir toutes les campagnes
            const campaigns = await this.contract.methods.getCampaigns().call();
            console.log('Campagnes brutes:', campaigns);
            
            const parsedCampaigns = campaigns.map((campaign, i) => {
                // Vérifier si la campagne existe (champs non vides)
                if (!campaign.owner || campaign.owner === '0x0000000000000000000000000000000000000000') {
                    return null;
                }

                return {
                    owner: campaign.owner,
                    title: campaign.title || 'Untitled',
                    description: campaign.description || 'No description',
                    target: this.web3.utils.fromWei(campaign.target.toString(), 'ether'),
                    deadline: campaign.deadline,
                    amountCollected: this.web3.utils.fromWei(campaign.amountCollected.toString(), 'ether'),
                    image: campaign.image || 'https://via.placeholder.com/600x400?text=No+Image',
                    isActive: campaign.isActive,
                    fundsWithdrawn: this.web3.utils.fromWei(campaign.fundsWithdrawn.toString(), 'ether'),
                    pId: i
                };
            }).filter(campaign => campaign !== null); // Filtrer les campagnes null

            console.log('Campagnes parsées:', parsedCampaigns);
            return parsedCampaigns;
        } catch (error) {
            console.error('❌ Erreur dans getCampaigns:', error);
            throw error;
        }
    }

    async getUserCampaigns() {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const allCampaigns = await this.getCampaigns();
            const filteredCampaigns = allCampaigns.filter((campaign) => 
                campaign.owner.toLowerCase() === this.account.toLowerCase()
            );
            
            console.log('Campagnes utilisateur:', filteredCampaigns);
            return filteredCampaigns;
        } catch (error) {
            console.error('❌ Erreur getUserCampaigns:', error);
            throw error;
        }
    }

    async donate(pId, amount) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        const amountWei = this.web3.utils.toWei(amount, 'ether');
        console.log(`🔄 Don de ${amount} ETH (${amountWei} wei) à la campagne ${pId}`);

        const transaction = this.contract.methods.donateToCampaign(pId).send({from: this.account, value: amountWei});
       
        console.log('✅ Don effectué avec succès:', transaction);
        return transaction;
    } catch (error) {
        console.error('❌ Erreur donation:', error);
        throw error;
    }
}

    async getDonations(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Récupération des donateurs pour campagne:', pId);
            const donations = await this.contract.methods.getDonators(pId).call();
            console.log('Donateurs bruts:', donations);

            const numberOfDonations = donations[0].length;
            const parsedDonations = [];

            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donator: donations[0][i],
                    donation: this.web3.utils.fromWei(donations[1][i].toString(), 'ether')
                });
            }

            console.log('Donateurs parsés:', parsedDonations);
            return parsedDonations;
        } catch (error) {
            console.error('❌ Erreur getDonations:', error);
            // Retourner un tableau vide en cas d'erreur
            return [];
        }
    }

    async getCampaignDetails(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const details = await this.contract.methods.getCampaignDetails(pId).call();

            const parsedDetails = {
                owner: details.owner,
                title: details.title || 'Untitled',
                description: details.description || 'No description',
                target: this.web3.utils.fromWei(details.target.toString(), 'ether'),
                deadline: details.deadline,
                amountCollected: this.web3.utils.fromWei(details.amountCollected.toString(), 'ether'),
                image: details.image || 'https://via.placeholder.com/600x400?text=No+Image',
                isActive: details.isActive,
                fundsWithdrawn: this.web3.utils.fromWei(details.fundsWithdrawn.toString(), 'ether'),
                pId: parseInt(pId)
            };

            console.log('Détails parsés:', parsedDetails);
            return parsedDetails;
        } catch (error) {
            console.error('❌ Erreur getCampaignDetails:', error);
            throw error;
        }
    }

    async refundDonation(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Remboursement pour campagne:', pId);
            const result = await this.contract.methods
                .refundDonation(pId)
                .send({ from: this.account });
            
            console.log('✅ Remboursement effectué avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur refundDonation:', error);
            throw error;
        }
    }

    async claimRefundIfGoalNotMet(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Remboursement objectif non atteint pour campagne:', pId);
            const result = await this.contract.methods
                .claimRefundIfGoalNotMet(pId)
                .send({ from: this.account });
            
            console.log('✅ Remboursement effectué avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur claimRefundIfGoalNotMet:', error);
            throw error;
        }
    }


    // Version ultra-simplifiée sans besoin du nom de méthode
async sendTransactionUltraSimple(transaction, from, value = null) {
    try {
        const txOptions = { from };
        
        if (value) {
            txOptions.value = value;
        }
        
        // Utiliser une limite de gas fixe pour toutes les opérations
        // 300000 est généralement suffisant pour la plupart des opérations
        txOptions.gas = '300000';
        
        console.log('🔄 Envoi transaction ultra simple:', {
            from: this.getShortAddress(from),
            value: value ? `${this.web3.utils.fromWei(value, 'ether')} ETH` : '0 ETH',
            gas: txOptions.gas
        });
        
        return await transaction.send(txOptions);
        
    } catch (error) {
        console.error('❌ Erreur transaction ultra simple:', error);
        
        // Si erreur de gas, essayer avec une limite plus élevée
        if (error.message.includes('gas') || error.message.includes('out of gas')) {
            console.log('🔄 Tentative avec plus de gas (500000)...');
            try {
                const txOptionsRetry = { from };
                if (value) txOptionsRetry.value = value;
                txOptionsRetry.gas = '500000';
                
                return await transaction.send(txOptionsRetry);
            } catch (retryError) {
                console.error('❌ Erreur retry transaction:', retryError);
                throw retryError;
            }
        }
        
        throw error;
    }
}

   // Fonction.js - Méthode updateDeadline avec gestion RPC améliorée
async updateDeadline(pId, newDeadline) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        // Vérifier qu'on a un compte connecté (nécessaire pour les transactions)
        if (!this.account) {
            throw new Error('Veuillez vous connecter avec MetaMask pour effectuer cette action');
        }

        // Convertir la date en timestamp
        const newDeadlineTimestamp = Math.floor(new Date(newDeadline).getTime() / 1000);
        const deadlineString = newDeadlineTimestamp.toString();
        
        console.log('🔄 Mise à jour deadline campagne:', {
            pId: pId,
            newDeadline: newDeadline,
            timestamp: deadlineString,
            account: this.getShortAddress(this.account)
        });

        // Validations
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (newDeadlineTimestamp <= currentTimestamp) {
            throw new Error('La nouvelle date doit être dans le futur');
        }

        const campaign = await this.getCampaignDetails(pId);
        if (!campaign) {
            throw new Error('Campagne non trouvée');
        }
        
        if (campaign.owner.toLowerCase() !== this.account.toLowerCase()) {
            throw new Error('Seul le propriétaire peut modifier la date limite');
        }

        if (!campaign.isActive) {
            throw new Error('Impossible de modifier une campagne annulée');
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > Number(campaign.deadline)) {
            throw new Error('Impossible de modifier la date d\'une campagne déjà terminée');
        }

        const transaction = await this.contract.methods.updateDeadline(pId, deadlineString).send({ from: this.account });
        // const result = await this.sendTransactionUltraSimple(transaction, this.account);
        
        console.log('✅ Deadline mise à jour avec succès:', transaction);
        return transaction;
    } catch (error) {
        console.error('❌ Erreur updateDeadline:', error);
        
        // Suggestions basées sur le type d'erreur
        if (error.message.includes('RPC') || error.message.includes('endpoint')) {
            throw new Error('Problème de connexion réseau. Veuillez réessayer dans quelques minutes ou changer de réseau dans MetaMask.');
        }
        
        throw error;
    }
}

    async getDonorContribution(campaignId, donorAddress) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const contribution = await this.contract.methods
                .getDonorContribution(campaignId, donorAddress)
                .call();
            
            return this.web3.utils.fromWei(contribution.toString(), 'ether');
        } catch (error) {
            console.error('❌ Erreur getDonorContribution:', error);
            throw error;
        }
    }

    async isRefundClaimed(campaignId, donorAddress) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const isClaimed = await this.contract.methods
                .isRefundClaimed(campaignId, donorAddress)
                .call();
            
            return isClaimed;
        } catch (error) {
            console.error('❌ Erreur isRefundClaimed:', error);
            return false;
        }
    }

    getShortAddress(address) {
        return address ? `${address.substring(0, 6)}...${address.substring(38)}` : '';
    }

    // Méthode pour vérifier l'état de la connexion
    getConnectionStatus() {
        return {
            isInitialized: this.isInitialized,
            account: this.account,
            web3: !!this.web3,
            contract: !!this.contract
        };
    }

    // Dans la classe ContractFunctions - Ajouter ces méthodes

// Méthode pour récupérer les campagnes éligibles au retrait
    async getWithdrawableCampaigns() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération des campagnes éligibles au retrait...');
        
        const allCampaigns = await this.getCampaigns();
        const withdrawableCampaigns = allCampaigns.filter(campaign => {
            const isOwner = campaign.owner.toLowerCase() === this.account.toLowerCase();
            const isEnded = new Date() > new Date(Number(campaign.deadline) * 1000);
            const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
            const hasAvailableFunds = parseFloat(campaign.amountCollected) > parseFloat(campaign.fundsWithdrawn);
            const isActive = campaign.isActive;
            
            return isOwner && isEnded && goalReached && hasAvailableFunds && isActive;
        });

        console.log('Campagnes éligibles au retrait:', withdrawableCampaigns);
        return withdrawableCampaigns;
    } catch (error) {
        console.error('❌ Erreur getWithdrawableCampaigns:', error);
        throw error;
    }
    }


// Méthode pour récupérer les statistiques de retrait
    async getWithdrawalStats() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        const userCampaigns = await this.getUserCampaigns();
        
        let totalAvailable = 0;
        let totalWithdrawn = 0;
        let withdrawableCampaigns = 0;

        for (const campaign of userCampaigns) {
            const available = parseFloat(campaign.amountCollected) - parseFloat(campaign.fundsWithdrawn);
            totalAvailable += available;
            totalWithdrawn += parseFloat(campaign.fundsWithdrawn);
            
            const isEnded = new Date() > new Date(Number(campaign.deadline) * 1000);
            const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
            
            if (available > 0 && isEnded && goalReached && campaign.isActive) {
                withdrawableCampaigns++;
            }
        }

        return {
            totalAvailable: totalAvailable.toFixed(4),
            totalWithdrawn: totalWithdrawn.toFixed(4),
            withdrawableCampaigns,
            totalCampaigns: userCampaigns.length
        };
    } catch (error) {
        console.error('❌ Erreur getWithdrawalStats:', error);
        throw error;
    }
    }   



// Méthode utilitaire pour les messages d'erreur
    getWithdrawalErrorMessage(isOwner, isEnded, goalReached, hasAvailableFunds, isActive) {
    if (!isOwner) return "Vous n'êtes pas le propriétaire de cette campagne";
    if (!isActive) return "La campagne n'est plus active";
    if (!isEnded) return "La campagne n'est pas encore terminée";
    if (!goalReached) return "L'objectif de la campagne n'a pas été atteint";
    if (!hasAvailableFunds) return "Aucun fonds disponible pour le retrait";
    return "Retrait non autorisé";
    }


    async sendTransactionWithFallback(transaction, from) {
    try {
        // Estimation du gas
        const gasEstimate = await transaction.estimateGas({ from });

        const gasEstimateNumber = Number(gasEstimate);
        // Envoi avec buffer de sécurité
        return await transaction.send({ 
            from, 
            gas: Math.floor(gasEstimate * 1.2) // 20% de buffer
        });
    } catch (error) {
        console.error('❌ Erreur transaction:', error);
        throw error;
    }
}

// Méthode unique pour retirer les fonds
async withdrawFunds(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Retrait des fonds pour campagne:', pId);
        
        // Vérifier l'éligibilité avant de procéder
        const eligibility = await this.checkWithdrawalEligibility(pId);
        if (!eligibility.eligible) {
            throw new Error(eligibility.message);
        }

        const transaction = this.contract.methods.withdrawFunds(pId);
        const result = await this.sendTransactionWithFallback(transaction, this.account);
        
        console.log('✅ Fonds retirés avec succès:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur withdrawFunds:', error);
        throw error;
    }
}


toBigInt(value) {
        if (typeof value === 'bigint') return value;
        if (typeof value === 'number') return BigInt(Math.floor(value));
        if (typeof value === 'string') {
            // Supprimer les décimales pour les nombres à virgule
            if (value.includes('.')) {
                value = value.split('.')[0];
            }
            return BigInt(value);
        }
        return BigInt(value.toString());
    }

    // Méthode utilitaire pour comparer des BigInt
    compareBigInt(a, b) {
        const bigA = this.toBigInt(a);
        const bigB = this.toBigInt(b);
        if (bigA > bigB) return 1;
        if (bigA < bigB) return -1;
        return 0;
    }

    // Méthode utilitaire pour convertir en nombre sécurisé
    toSafeNumber(value) {
        try {
            if (typeof value === 'bigint') {
                return Number(value.toString());
            }
            if (typeof value === 'string') {
                return parseInt(value, 10);
            }
            return Number(value);
        } catch (error) {
            console.warn('⚠️ Erreur conversion nombre:', error);
            return 0;
        }
    }

// Méthode unique pour annuler une campagne (version corrigée)
async cancelCampaign(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Annulation campagne:', pId);
        
        // Vérifier que l'utilisateur est le propriétaire
        const campaign = await this.getCampaignDetails(pId);
        if (campaign.owner.toLowerCase() !== this.account.toLowerCase()) {
            throw new Error('Seul le propriétaire peut annuler la campagne');
        }

        // Vérifier que la campagne est active
        if (!campaign.isActive) {
            throw new Error('La campagne est déjà annulée ou inactive');
        }

        const transaction = this.contract.methods.cancelCampaign(pId).send({ from: this.account });
        
        
        console.log('✅ Campagne annulée avec succès:', transaction);
        return transaction;
    } catch (error) {
        console.error('❌ Erreur cancelCampaign:', error);
        throw error;
    }
}

// Méthode unique pour récupérer les fonds après annulation
async claimRefundAfterCancellation(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération fonds après annulation pour campagne:', pId);
        
        // Vérifier que l'utilisateur a effectué un don
        const contribution = await this.getDonorContribution(pId, this.account);
        if (parseFloat(contribution) === 0) {
            throw new Error('Aucun don trouvé pour cette campagne');
        }

        // Vérifier que la campagne est annulée
        const campaign = await this.getCampaignDetails(pId);
        if (campaign.isActive) {
            throw new Error('La campagne doit être annulée pour récupérer les fonds');
        }

        const result = this.contract.methods.claimRefundAfterCancellation(pId).send({ from: this.account });
        
        
        console.log('✅ Fonds récupérés avec succès:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur claimRefundAfterCancellation:', error);
        throw error;
    }
}

// Amélioration de la vérification d'éligibilité
async checkWithdrawalEligibility(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        const campaign = await this.getCampaignDetails(pId);
        const currentTime = Math.floor(Date.now() / 1000);
        
        const isOwner = campaign.owner.toLowerCase() === this.account.toLowerCase();
        const isEnded = currentTime > Number(campaign.deadline);
        const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
        const hasAvailableFunds = parseFloat(campaign.amountCollected) > parseFloat(campaign.fundsWithdrawn);
        const isActive = campaign.isActive;

        const eligible = isOwner && isEnded && goalReached && hasAvailableFunds && isActive;
        const availableAmount = (parseFloat(campaign.amountCollected) - parseFloat(campaign.fundsWithdrawn)).toFixed(6);

        return {
            eligible,
            isOwner,
            isEnded,
            goalReached,
            hasAvailableFunds,
            isActive,
            availableAmount,
            message: eligible 
                ? `Vous pouvez retirer ${availableAmount} ETH` 
                : this.getWithdrawalErrorMessage(isOwner, isEnded, goalReached, hasAvailableFunds, isActive)
        };
    } catch (error) {
        console.error('❌ Erreur checkWithdrawalEligibility:', error);
        throw error;
    }
}

// Méthode pour récupérer tous les dons d'un utilisateur
    async getUserDonations() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération des dons de l\'utilisateur...');
        
        // Récupérer toutes les campagnes
        const allCampaigns = await this.getCampaigns();
        const userDonations = [];

        // Parcourir toutes les campagnes pour trouver les dons de l'utilisateur
        for (let i = 0; i < allCampaigns.length; i++) {
            try {
                // Récupérer la contribution de l'utilisateur pour cette campagne
                const contribution = await this.contract.methods
                    .getDonorContribution(i, this.account)
                    .call();
                
                const contributionAmount = this.web3.utils.fromWei(contribution.toString(), 'ether');
                
                // Si l'utilisateur a fait un don à cette campagne
                if (parseFloat(contributionAmount) > 0) {
                    const campaign = allCampaigns[i];
                    const isRefundClaimed = await this.contract.methods
                        .isRefundClaimed(i, this.account)
                        .call();
                    
                    // Déterminer le statut du don
                    let status = 'active';
                    let statusMessage = 'Don actif';
                    
                    if (isRefundClaimed) {
                        status = 'refunded';
                        statusMessage = 'Remboursé';
                    } else if (!campaign.isActive) {
                        status = 'cancelled';
                        statusMessage = 'Campagne annulée';
                    } else if (new Date() > new Date(Number(campaign.deadline) * 1000)) {
                        if (parseFloat(campaign.amountCollected) < parseFloat(campaign.target)) {
                            status = 'failed';
                            statusMessage = 'Objectif non atteint - Remboursable';
                        } else {
                            status = 'success';
                            statusMessage = 'Objectif atteint';
                        }
                    }

                    userDonations.push({
                        campaignId: i,
                        campaignTitle: campaign.title,
                        campaignDescription: campaign.description,
                        campaignImage: campaign.image,
                        campaignOwner: campaign.owner,
                        amountDonated: contributionAmount,
                        campaignTarget: campaign.target,
                        campaignAmountCollected: campaign.amountCollected,
                        campaignDeadline: campaign.deadline,
                        campaignIsActive: campaign.isActive,
                        isRefundClaimed: isRefundClaimed,
                        status: status,
                        statusMessage: statusMessage,
                        canRefund: this.canUserRefund(campaign, isRefundClaimed, contributionAmount),
                        donationDate: this.estimateDonationDate(campaign.deadline) // Estimation
                    });
                }
            } catch (error) {
                console.warn(`Erreur récupération don campagne ${i}:`, error);
                // Continuer avec la campagne suivante
            }
        }

        // Trier par montant décroissant
        userDonations.sort((a, b) => parseFloat(b.amountDonated) - parseFloat(a.amountDonated));

        console.log('Dons utilisateur récupérés:', userDonations);
        return userDonations;
    } catch (error) {
        console.error('❌ Erreur getUserDonations:', error);
        throw error;
    }
    }

// Méthode utilitaire pour déterminer si un utilisateur peut demander un remboursement
    canUserRefund(campaign, isRefundClaimed, contributionAmount) {
    if (isRefundClaimed || parseFloat(contributionAmount) === 0) {
        return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const campaignEnded = currentTime > Number(campaign.deadline);
    const goalNotReached = parseFloat(campaign.amountCollected) < parseFloat(campaign.target);

    // Conditions pour le remboursement :
    // 1. Campagne annulée par le propriétaire
    if (!campaign.isActive) return true;
    
    // 2. Campagne terminée et objectif non atteint
    if (campaignEnded && goalNotReached) return true;
    
    // 3. Pendant la durée de la campagne (remboursement standard)
    if (!campaignEnded) return true;

    return false;
    }

// Méthode utilitaire pour estimer la date du don (approximative)
    estimateDonationDate(deadline) {
    // Estimation basée sur la deadline (suppose que le don a été fait récemment)
    const deadlineDate = new Date(Number(deadline) * 1000);
    const estimatedDonationDate = new Date(deadlineDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 jours avant la fin
    return Math.floor(estimatedDonationDate.getTime() / 1000);
    }   

// Méthode pour récupérer les statistiques des dons de l'utilisateur
    async getUserDonationStats() {
    try {
        const userDonations = await this.getUserDonations();
        
        const totalDonated = userDonations.reduce((sum, donation) => 
            sum + parseFloat(donation.amountDonated), 0
        );
        
        const activeDonations = userDonations.filter(d => 
            d.status === 'active' || d.status === 'success'
        ).length;
        
        const refundedDonations = userDonations.filter(d => 
            d.status === 'refunded'
        ).length;
        
        const campaignsSupported = new Set(userDonations.map(d => d.campaignId)).size;

        return {
            totalDonated: totalDonated.toFixed(4),
            totalDonations: userDonations.length,
            activeDonations,
            refundedDonations,
            campaignsSupported,
            averageDonation: userDonations.length > 0 ? (totalDonated / userDonations.length).toFixed(4) : '0'
        };
    } catch (error) {
        console.error('❌ Erreur getUserDonationStats:', error);
        throw error;
    }
    }

    // Dans la classe ContractFunctions (Fonction.js)
async getDonatorsnum(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }
        
        console.log('🔄 Récupération du nombre de donateurs pour campagne:', pId);
        
        // Récupération directe du nombre de donateurs (plus efficace)
        const donations = await this.contract.methods.getDonators(pId).call();
        const numberOfDonators = donations[0].length;
        
        console.log(`Nombre de donateurs pour campagne ${pId}:`, numberOfDonators);
        return numberOfDonators;
    } catch (error) {
        console.error('❌ Erreur getDonatorsnum:', error);
        // Retourner 0 en cas d'erreur
        return 0;
    }
}


}


export default new ContractFunctions();