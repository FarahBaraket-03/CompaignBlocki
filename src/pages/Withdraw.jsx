// pages/Withdraw.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { money } from '../assets';

const Withdraw = () => {
  const navigate = useNavigate();
  const { 
    address, 
    isInitialized, 
    connect, 
    getWithdrawableCampaigns, 
    withdrawFunds, 
    getWithdrawalStats, 
    checkWithdrawalEligibility 
  } = useStateContext();
  
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [stats, setStats] = useState({ 
    totalAvailable: '0', 
    totalWithdrawn: '0', 
    withdrawableCampaigns: 0, 
    totalCampaigns: 0 
  });
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialized && address) {
        setIsLoading(true);
        try {
          const [withdrawableCampaigns, statsData] = await Promise.all([
            getWithdrawableCampaigns(),
            getWithdrawalStats()
          ]);
          
          setCampaigns(withdrawableCampaigns);
          setStats(statsData);
        } catch (error) {
          console.error('Erreur chargement données:', error);
          setStatusMessage('Erreur lors du chargement des données');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isInitialized, address, getWithdrawableCampaigns, getWithdrawalStats]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setStatusMessage('Erreur de connexion: ' + error.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign) {
      setStatusMessage('Veuillez sélectionner une campagne');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Vérification en cours...');

    try {
      // Vérification d'éligibilité
      setStatusMessage('Vérification des conditions...');
      const eligibility = await checkWithdrawalEligibility(selectedCampaign);
      
      if (!eligibility.eligible) {
        setStatusMessage(eligibility.message);
        setTimeout(() => setStatusMessage(''), 3000);
        setIsProcessing(false);
        return;
      }

      // Confirmation utilisateur
      const confirmWithdraw = window.confirm(
        `Êtes-vous sûr de vouloir retirer ${eligibility.availableAmount} ETH de cette campagne ?`
      );

      if (!confirmWithdraw) {
        setIsProcessing(false);
        setStatusMessage('');
        return;
      }

      // Effectuer le retrait
      setStatusMessage('Transaction en cours...');
      await withdrawFunds(selectedCampaign);
      
      setStatusMessage('✅ Retrait effectué avec succès !');
      
      // Recharger les données après succès
      setTimeout(async () => {
        setIsLoading(true);
        try {
          const [updatedCampaigns, updatedStats] = await Promise.all([
            getWithdrawableCampaigns(),
            getWithdrawalStats()
          ]);
          
          setCampaigns(updatedCampaigns);
          setStats(updatedStats);
          setSelectedCampaign('');
        } catch (error) {
          console.error('Erreur rechargement:', error);
        } finally {
          setIsLoading(false);
          setIsProcessing(false);
          setStatusMessage('');
        }
      }, 2000);

    } catch (error) {
      console.error('Erreur retrait:', error);
      setStatusMessage('❌ Erreur: ' + error.message);
      
      setTimeout(() => {
        setIsProcessing(false);
        setStatusMessage('');
      }, 5000);
    }
  };

  const getAvailableBalance = (campaignId) => {
    const campaign = campaigns.find(c => c.pId === parseInt(campaignId));
    if (!campaign) return '0.0000';
    return (parseFloat(campaign.amountCollected) - parseFloat(campaign.fundsWithdrawn)).toFixed(4);
  };

  // Afficher le loader principal pendant le chargement
  if (isLoading && !isProcessing) {
    return (
      <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4 min-h-[400px]">
        <Loader message="Chargement des données..." />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
        <div className="text-center">
          <h1 className="font-epilogue font-bold text-[25px] text-white mb-4">
            Retrait de Fonds
          </h1>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] mb-6">
            Veuillez vous connecter pour gérer vos retraits
          </p>
          <CustomButton 
            btnType="button"
            title="Se connecter"
            styles="bg-[#8c6dfd]"
            handleClick={handleConnect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isProcessing && <Loader message={statusMessage} />}
      
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] text-white">
            Retrait de Fonds
          </h1>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] mt-2">
            Gérez les retraits de vos campagnes terminées avec succès
          </p>
        </div>

        {/* Message de statut */}
        {statusMessage && !isProcessing && (
          <div className={`p-4 rounded-[10px] mb-6 ${
            statusMessage.includes('✅') 
              ? 'bg-green-500/20 border border-green-500' 
              : statusMessage.includes('❌')
              ? 'bg-red-500/20 border border-red-500'
              : 'bg-[#2c2f32]'
          }`}>
            <p className="font-epilogue font-normal text-[14px] text-white">
              {statusMessage}
            </p>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Fonds Disponibles</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#4acd8d] mt-1">
              {stats.totalAvailable} ETH
            </p>
          </div>
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Campagnes Éligibles</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#8c6dfd] mt-1">
              {stats.withdrawableCampaigns}
            </p>
          </div>
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Déjà Retiré</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#1dc071] mt-1">
              {stats.totalWithdrawn} ETH
            </p>
          </div>
        </div>

        {/* Formulaire de retrait */}
        <div className="bg-[#2c2f32] rounded-[10px] p-6 mb-8">
          <h2 className="font-epilogue font-semibold text-[20px] text-white mb-6">
            Effectuer un Retrait
          </h2>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <img src={money} alt="money" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-epilogue font-normal text-[16px] text-[#808191]">
                Aucune campagne éligible pour le retrait
              </p>
              <p className="font-epilogue font-normal text-[14px] text-[#808191] mt-2">
                Les campagnes doivent être terminées et avoir atteint leur objectif.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <FormField 
                labelName="Sélectionner une Campagne"
                inputType="select"
                value={selectedCampaign}
                handleChange={(e) => setSelectedCampaign(e.target.value)}
                options={campaigns.map(campaign => ({
                  value: campaign.pId,
                  label: `${campaign.title} - ${getAvailableBalance(campaign.pId)} ETH disponible`
                }))}
              />

              {selectedCampaign && (
                <div className="bg-[#1c1c24] p-4 rounded-[10px]">
                  <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                    Montant disponible: <span className="text-[#4acd8d] font-semibold">
                      {getAvailableBalance(selectedCampaign)} ETH
                    </span>
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <CustomButton 
                  btnType="submit"
                  title={isProcessing ? "Traitement..." : "Effectuer le Retrait"}
                  styles={`w-full md:w-auto ${
                    isProcessing 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-[#1dc071] hover:bg-[#17a862]'
                  }`}
                  disabled={!selectedCampaign || isProcessing}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdraw;