// pages/UserDonations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, Loader } from '../components';
import { money} from '../assets';

const Payment = () => {
  const navigate = useNavigate();
  const { address, isInitialized, connect, getUserDonations, getUserDonationStats, refundDonation, claimRefundIfGoalNotMet, claimRefundAfterCancellation } = useStateContext();
  
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialized && address) {
        setLoading(true);
        try {
          const [userDonations, donationStats] = await Promise.all([
            getUserDonations(),
            getUserDonationStats()
          ]);
          setDonations(userDonations);
          setStats(donationStats);
        } catch (error) {
          console.error('Erreur chargement dons:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isInitialized, address, getUserDonations, getUserDonationStats]);

  const handleRefund = async (campaignId, refundType = 'standard') => {
    setRefundingId(campaignId);
    try {
      if (refundType === 'standard') {
        await refundDonation(campaignId);
      } else if (refundType === 'goalNotMet') {
        await claimRefundIfGoalNotMet(campaignId);
      } else if (refundType === 'afterCancellation') {
        await claimRefundAfterCancellation(campaignId);
      }
      
      // Recharger les données
      const [updatedDonations, updatedStats] = await Promise.all([
        getUserDonations(),
        getUserDonationStats()
      ]);
      setDonations(updatedDonations);
      setStats(updatedStats);
      
      alert('✅ Remboursement effectué avec succès!');
    } catch (error) {
      console.error('Erreur remboursement:', error);
      alert('❌ Erreur lors du remboursement: ' + error.message);
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#4acd8d]/10 text-[#4acd8d] border border-[#4acd8d]/30';
      case 'success': return 'bg-[#1dc071]/10 text-[#1dc071] border border-[#1dc071]/30';
      case 'failed': return 'bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/30';
      case 'refunded': return 'bg-[#6c757d]/10 text-[#6c757d] border border-[#6c757d]/30';
      case 'cancelled': return 'bg-[#ffc107]/10 text-[#ffc107] border border-[#ffc107]/30';
      default: return 'bg-[#808191]/10 text-[#808191] border border-[#808191]/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'refunded': return '↩️';
      case 'cancelled': return '⚠️';
      default: return '⚪';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f15] to-[#1c1c24] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#23232d] border border-[#3a3a43] rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8c6dfd] to-[#4a00e0] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="font-epilogue font-bold text-2xl text-white mb-3">
            Mes Dons
          </h1>
          <p className="font-epilogue text-[#b2b2bf] mb-8">
            Connectez-vous à votre portefeuille pour visualiser votre historique de dons et vos statistiques
          </p>
          <CustomButton 
            btnType="button"
            title="🔗 Se connecter"
            styles="bg-gradient-to-r from-[#8c6dfd] to-[#6a4dfd] hover:from-[#7a5dfd] hover:to-[#5a3dfd] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#8c6dfd]/30"
            handleClick={connect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f15] to-[#1c1c24] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {loading && <Loader message="Chargement de vos dons..." />}
        
        {/* En-tête */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#775ed2] to-[#4a00e0] rounded-xl">
              <span className="text-2xl">💝</span>
            </div>
            <div>
              <h1 className="font-epilogue font-bold text-3xl md:text-4xl text-white">
                Mes Dons
              </h1>
              <p className="font-epilogue text-[#b2b2bf] mt-1">
                Visualisez et gérez tous vos dons en un seul endroit
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques améliorées */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#4acd8d] to-[#1dc071] rounded-xl">
                  <span className="text-xl">💰</span>
                </div>
                <div className="text-left">
                  <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Total Donné</h3>
                  <p className="font-epilogue font-bold text-2xl text-white mt-1">
                    {stats.totalDonated || '0'} <span className="text-[#4acd8d]">ETH</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#8c6dfd] to-[#6a4dfd] rounded-xl">
                  <span className="text-xl">📊</span>
                </div>
                <div className="text-left">
                  <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Dons Effectués</h3>
                  <p className="font-epilogue font-bold text-2xl text-white mt-1">
                    {stats.totalDonations || '0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#1dc071] to-[#0da858] rounded-xl">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="text-left">
                  <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Campagnes</h3>
                  <p className="font-epilogue font-bold text-2xl text-white mt-1">
                    {stats.campaignsSupported || '0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#ffc107] to-[#ff9800] rounded-xl">
                  <span className="text-xl">📈</span>
                </div>
                <div className="text-left">
                  <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Moyenne par Don</h3>
                  <p className="font-epilogue font-bold text-2xl text-white mt-1">
                    {stats.averageDonation || '0'} <span className="text-[#ffc107]">ETH</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des dons */}
        <div className="bg-gradient-to-b from-[#23232d] to-[#1c1c24] border border-[#3a3a43] rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-epilogue font-bold text-2xl text-white">
                Historique des Dons
              </h2>
              <p className="font-epilogue text-[#b2b2bf] mt-1">
                {donations.length} don{donations.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <CustomButton 
              btnType="button"
              title=" Découvrir"
              styles="bg-gradient-to-r from-[#8c6dfd] to-[#6a4dfd] hover:from-[#7a5dfd] hover:to-[#5a3dfd] text-white font-semibold"
              handleClick={() => navigate('/')}
            />
          </div>
          
          {donations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-6 opacity-30">
                <img src={money} alt="money" className="w-full h-full" />
              </div>
              <h3 className="font-epilogue font-bold text-2xl text-white mb-3">
                Aucun don pour le moment
              </h3>
              <p className="font-epilogue text-[#b2b2bf] mb-8 max-w-md mx-auto">
                Faites votre premier don et soutenez des projets innovants qui changent le monde
              </p>
              <CustomButton 
                btnType="button"
                title="🎯 Explorer les campagnes"
                styles="bg-gradient-to-r from-[#8c6dfd] to-[#4a00e0] hover:from-[#7a5dfd] hover:to-[#3a00c0] text-white font-semibold py-3 px-8 rounded-xl text-lg"
                handleClick={() => navigate('/')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div 
                  key={donation.campaignId} 
                  className="group bg-gradient-to-r from-[#2c2f32] to-[#23232d] hover:from-[#3a3a43] hover:to-[#2c2f32] border border-[#3a3a43] hover:border-[#8c6dfd]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#8c6dfd]/10"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Image et infos de campagne */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="relative">
                          <img 
                            src={donation.campaignImage} 
                            alt={donation.campaignTitle}
                            className="w-25 h-25 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#3a3a43] group-hover:border-[#8c6dfd]/50 transition-colors"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80/2c2f32/808191?text=📷';
                            }}
                          />
                          <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)} {donation.statusMessage}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-epilogue font-bold text-xl text-white group-hover:text-[#8c6dfd] transition-colors mb-2">
                            {donation.campaignTitle}
                          </h3>
                          <p className="font-epilogue text-[#b2b2bf] mb-4 line-clamp-2">
                            {donation.campaignDescription}
                          </p>
                          
                          {/* Métadonnées */}
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-[#3a3a43]/50 rounded-lg px-3 py-2">
                              <span className="text-[#8c6dfd]">💰</span>
                              <span className="font-epilogue font-bold text-white">
                                {donation.amountDonated} ETH
                              </span>
                            </div>
                            
                            
                            <div className="flex items-center gap-2 bg-[#3a3a43]/50 rounded-lg px-3 py-2">
                              <span className="text-[#ffc107]">#</span>
                              <span className="font-epilogue text-white">
                                Campagne {donation.campaignId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="lg:w-auto">
                      {donation.canRefund && (
                        <div className="space-y-3">
                          <CustomButton 
                            btnType="button"
                            title={refundingId === donation.campaignId ? "⏳ Traitement..." : "↩️ Demander Remboursement"}
                            styles="bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] hover:from-[#ff5252] hover:to-[#ff3b3b] text-white font-semibold py-3 px-6 rounded-xl w-full transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b6b]/30"
                            handleClick={() => {
                              let refundType = 'standard';
                              if (!donation.campaignIsActive) refundType = 'afterCancellation';
                              else if (new Date() > new Date(Number(donation.campaignDeadline) * 1000)) refundType = 'goalNotMet';
                              
                              handleRefund(donation.campaignId, refundType);
                            }}
                            disabled={refundingId === donation.campaignId}
                          />
                          <p className="text-xs text-[#b2b2bf] text-center">
                            {!donation.campaignIsActive ? 'Campagne annulée' : 
                             new Date() > new Date(Number(donation.campaignDeadline) * 1000) ? 'Objectif non atteint' : 
                             'Remboursement standard'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        {donations.length > 0 && (
          <div className="mt-8 text-center">
            <p className="font-epilogue text-[#b2b2bf] text-sm">
              💡 Pour toute question concernant vos dons, contactez notre support
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;