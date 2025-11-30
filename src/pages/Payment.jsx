// pages/UserDonations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, Loader } from '../components';
import { money } from '../assets';

const Payement = () => {
  const navigate = useNavigate();
  const { address, isInitialized, connect, getUserDonations, getUserDonationStats, refundDonation, claimRefundIfGoalNotMet, claimRefundAfterCancellation } = useStateContext();
  
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

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
    try {
      if (refundType === 'standard') {
        await refundDonation(campaignId);
      } else if (refundType === 'goalNotMet') {
        await claimRefundIfGoalNotMet(campaignId);
      } else if (refundType === 'afterCancellation') {
        await claimRefundAfterCancellation(campaignId);
      }
      
      alert('Remboursement effectué avec succès!');
      // Recharger les données
      const [updatedDonations, updatedStats] = await Promise.all([
        getUserDonations(),
        getUserDonationStats()
      ]);
      setDonations(updatedDonations);
      setStats(updatedStats);
    } catch (error) {
      console.error('Erreur remboursement:', error);
      alert('Erreur lors du remboursement: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-[#4acd8d]';
      case 'success': return 'text-[#1dc071]';
      case 'failed': return 'text-[#ff6b6b]';
      case 'refunded': return 'text-[#6c757d]';
      case 'cancelled': return 'text-[#ffc107]';
      default: return 'text-[#808191]';
    }
  };

  if (!isInitialized) {
    return (
      <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
        <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
          <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white ">
            Mes Dons
          </h1>
        </div>
        <div className="text-center mt-8">
          <p className="font-epilogue font-normal text-[16px] text-[#808191] mb-6">
            Veuillez vous connecter pour voir vos dons
          </p>
          <CustomButton 
            btnType="button"
            title="Se connecter"
            styles="bg-[#8c6dfd]"
            handleClick={connect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {loading && <Loader message="Chargement de vos dons..." />}
      
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Mes Dons
        </h1>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Total Donné</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#4acd8d] mt-1">
              {stats.totalDonated || '0'} ETH
            </p>
          </div>
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Dons Effectués</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#8c6dfd] mt-1">
              {stats.totalDonations || '0'}
            </p>
          </div>
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Campagnes</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#1dc071] mt-1">
              {stats.campaignsSupported || '0'}
            </p>
          </div>
          <div className="bg-[#2c2f32] p-4 rounded-[10px] text-center">
            <h3 className="font-epilogue font-semibold text-[16px] text-white">Moyenne</h3>
            <p className="font-epilogue font-bold text-[20px] text-[#ffc107] mt-1">
              {stats.averageDonation || '0'} ETH
            </p>
          </div>
        </div>
      )}

      {/* Liste des dons */}
      <div className="w-full">
        <h2 className="font-epilogue font-semibold text-[20px] text-white mb-6">
          Historique des Dons
        </h2>
        
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <img src={money} alt="money" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="font-epilogue font-normal text-[18px] text-[#808191] mb-4">
              Vous n'avez fait aucun don pour le moment
            </p>
            <CustomButton 
              btnType="button"
              title="Découvrir les campagnes"
              styles="bg-[#8c6dfd]"
              handleClick={() => navigate('/')}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.campaignId} className="bg-[#2c2f32] rounded-[10px] p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={donation.campaignImage} 
                        alt={donation.campaignTitle}
                        className="w-16 h-16 rounded-[10px] object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                        }}
                      />
                      <div>
                        <h3 className="font-epilogue font-semibold text-[18px] text-white mb-1">
                          {donation.campaignTitle}
                        </h3>
                        <p className="font-epilogue font-normal text-[14px] text-[#808191] mb-2">
                          {donation.campaignDescription.length > 100 
                            ? `${donation.campaignDescription.substring(0, 100)}...` 
                            : donation.campaignDescription
                          }
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="font-epilogue font-semibold text-[#4acd8d]">
                            {donation.amountDonated} ETH
                          </span>
                          <span className={`font-epilogue font-medium ${getStatusColor(donation.status)}`}>
                            {donation.statusMessage}
                          </span>
                          <span className="font-epilogue font-normal text-[#808191]">
                            Campagne #{donation.campaignId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 md:mt-0 md:ml-4">
                    {donation.canRefund && (
                      <CustomButton 
                        btnType="button"
                        title="Demander Remboursement"
                        styles="bg-[#ff6b6b] hover:bg-[#ff5252]"
                        handleClick={() => {
                          let refundType = 'standard';
                          if (!donation.campaignIsActive) refundType = 'afterCancellation';
                          else if (new Date() > new Date(Number(donation.campaignDeadline) * 1000)) refundType = 'goalNotMet';
                          
                          handleRefund(donation.campaignId, refundType);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payement;