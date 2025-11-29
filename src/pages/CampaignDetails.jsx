// pages/CampaignDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { donate, getDonations, getCampaignDetails, address, isLoading } = useStateContext();

  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const fetchCampaignDetails = async () => {
    try {
      const data = await getCampaignDetails(id);
      setCampaign(data);
    } catch (error) {
      console.error('Erreur chargement détails campagne:', error);
    }
  };

  const fetchDonators = async () => {
    try {
      const data = await getDonations(id);
      setDonators(data);
    } catch (error) {
      console.error('Erreur chargement donateurs:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
      fetchDonators();
    }
  }, [id]);

  const handleDonate = async () => {
    if (!address) {
      alert('Veuillez vous connecter à votre portefeuille');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    try {
      await donate(id, donationAmount);
      // Recharger les données après le don
      fetchCampaignDetails();
      fetchDonators();
      setDonationAmount('');
      alert('Don effectué avec succès!');
    } catch (error) {
      console.error('Erreur donation:', error);
      alert('Erreur lors du don: ' + error.message);
    }
  };

  if (!campaign) {
    return <Loader />;
  }

  const remainingDays = daysLeft(campaign.deadline);

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={campaign.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl" 
               onError={(e) => {
                 e.target.src = 'https://via.placeholder.com/600x400?text=Image+Non+Disponible';
               }} />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(campaign.target, campaign.amountCollected)}%`, maxWidth: '100%' }}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Jours restants" value={remainingDays} />
          <CountBox title={`Collecté sur ${campaign.target}`} value={campaign.amountCollected} />
          <CountBox title="Total donateurs" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Créateur</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <div className="w-[60%] h-[60%] bg-[#8c6dfd] rounded-full flex items-center justify-center text-white font-bold">
                  {campaign.owner ? campaign.owner.substring(2, 4).toUpperCase() : '??'}
                </div>
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {campaign.owner}
                </h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">
                  Propriétaire de la campagne
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Description</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {campaign.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donateurs</h4>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? donators.map((item, index) => (
                <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                  <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-all">
                    {index + 1}. {item.donator.substring(0, 6)}...{item.donator.substring(38)}
                  </p>
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-all">
                    {item.donation} ETH
                  </p>
                </div>
              )) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  Aucun donateur pour le moment. Soyez le premier!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Faire un don</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Soutenez cette campagne
            </p>
            <div className="mt-[30px]">
              <input 
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                min="0.001"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Soutenez parce que vous y croyez.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Soutenez ce projet sans récompense, simplement parce qu'il vous parle.
                </p>
              </div>

              <CustomButton 
                btnType="button"
                title="Faire un don"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;