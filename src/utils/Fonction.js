// fonctions.js
import Web3 from 'web3';

const CONTRACT_ADDRESS = ".............";
const CONTRACT_ABI = "..............."

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

    async createCampaign(form) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const targetWei = this.web3.utils.toWei(form.target, 'ether');
            const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);

            console.log('🔄 Création de campagne...', {
                title: form.title,
                target: form.target,
                targetWei: targetWei,
                deadline: form.deadline,
                deadlineTimestamp: deadlineTimestamp
            });

            const result = await this.contract.methods
                .createCampaign(
                    this.account,
                    form.title,
                    form.description,
                    targetWei,
                    deadlineTimestamp,
                    form.image
                )
                .send({ from: this.account });

            console.log('✅ Campagne créée avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur création campagne:', error);
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

            const result = await this.contract.methods
                .donateToCampaign(pId)
                .send({ 
                    from: this.account, 
                    value: amountWei 
                });

            console.log('✅ Don effectué avec succès:', result);
            return result;
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

            console.log('🔄 Récupération détails campagne:', pId);
            const details = await this.contract.methods.getCampaignDetails(pId).call();
            console.log('Détails bruts:', details);

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

    async withdrawFunds(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Retrait des fonds pour campagne:', pId);
            const result = await this.contract.methods
                .withdrawFunds(pId)
                .send({ from: this.account });
            
            console.log('✅ Fonds retirés avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur withdrawFunds:', error);
            throw error;
        }
    }

    async cancelCampaign(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Annulation campagne:', pId);
            const result = await this.contract.methods
                .cancelCampaign(pId)
                .send({ from: this.account });
            
            console.log('✅ Campagne annulée avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur cancelCampaign:', error);
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

    async claimRefundAfterCancellation(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Récupération fonds après annulation pour campagne:', pId);
            const result = await this.contract.methods
                .claimRefundAfterCancellation(pId)
                .send({ from: this.account });
            
            console.log('✅ Fonds récupérés avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur claimRefundAfterCancellation:', error);
            throw error;
        }
    }

    async updateDeadline(pId, newDeadline) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const newDeadlineTimestamp = Math.floor(new Date(newDeadline).getTime() / 1000);
            console.log('🔄 Mise à jour deadline campagne:', pId, '->', newDeadlineTimestamp);

            const result = await this.contract.methods
                .updateDeadline(pId, newDeadlineTimestamp)
                .send({ from: this.account });
            
            console.log('✅ Deadline mise à jour avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur updateDeadline:', error);
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
}

export default new ContractFunctions();