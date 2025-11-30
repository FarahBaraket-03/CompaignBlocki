// fonctions.js
import Web3 from 'web3';

const CONTRACT_ADDRESS = '......';
const CONTRACT_ABI = ".............";



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

// Méthode unique pour annuler une campagne
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

        const transaction = this.contract.methods.cancelCampaign(pId);
        const result = await this.sendTransactionWithFallback(transaction, this.account);
        
        console.log('✅ Campagne annulée avec succès:', result);
        return result;
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

        const transaction = this.contract.methods.claimRefundAfterCancellation(pId);
        const result = await this.sendTransactionWithFallback(transaction, this.account);
        
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

}



export default new ContractFunctions();