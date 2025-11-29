// pages/CreateCampaign.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { money } from '../assets';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { createCampaign, address, isLoading } = useStateContext();
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', 
    deadline: '',
    image: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      alert('Veuillez vous connecter à votre portefeuille');
      return;
    }

    // Validation des champs requis
    if (!form.title || !form.description || !form.target || !form.deadline || !form.image) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(form.deadline) <= new Date()) {
      alert('La date limite doit être dans le futur');
      return;
    }

    checkIfImage(form.image, async (exists) => {
      if (exists) {
        try {
          await createCampaign(form);
          alert('Campagne créée avec succès!');
          navigate('/');
        } catch (error) {
          console.error('Erreur création campagne:', error);
          alert('Erreur lors de la création: ' + error.message);
        }
      } else {
        alert('URL d\'image invalide');
        setForm({ ...form, image: '' });
      }
    });
  };

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Créer une Campagne
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Votre Nom *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
          />
          <FormField 
            labelName="Titre de la Campagne *"
            placeholder="Écrivez un titre"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
        </div>

        <FormField 
          labelName="Description *"
          placeholder="Écrivez votre description"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange('description', e)}
        />

        <div className="w-full flex justify-start items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain"/>
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">
            Vous recevrez 100% du montant collecté
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Objectif *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          <FormField 
            labelName="Date de fin *"
            placeholder="Date de fin"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
        </div>

        <FormField 
          labelName="Image de la campagne *"
          placeholder="URL de l'image de votre campagne"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange('image', e)}
        />

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton 
            btnType="submit"
            title="Créer la campagne"
            styles="bg-[#1dc071]"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;