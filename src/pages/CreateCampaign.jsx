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
    image: '',
    category: '', // Nouveau champ: catégorie
    website: '', // Nouveau: site web
    facebook: '', // Nouveau: Facebook
    twitter: '', // Nouveau: Twitter (X)
    linkedin: '', // Nouveau: LinkedIn
    instagram: '', // Nouveau: Instagram
    discord: '', // Nouveau: Discord
    otherLink: '' // Nouveau: autre lien
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Catégories disponibles
  const categories = [
    { id: 'charity', name: 'Charity & Non-Profit', icon: '🤝' },
    { id: 'startup', name: 'Startup & Business', icon: '💼' },
    { id: 'community', name: 'Community Projects', icon: '👥' },
    { id: 'technology', name: 'Technology & Innovation', icon: '🚀' },
    { id: 'art', name: 'Art & Creative', icon: '🎨' },
    { id: 'education', name: 'Education & Research', icon: '📚' },
    { id: 'environment', name: 'Environment & Sustainability', icon: '🌱' },
    { id: 'health', name: 'Health & Wellness', icon: '🏥' },
    { id: 'gaming', name: 'Gaming & Entertainment', icon: '🎮' },
    { id: 'other', name: 'Other', icon: '📋' }
  ];

  const handleFormFieldChange = (fieldName, e) => {
    const value = e.target.value;
    setForm({ ...form, [fieldName]: value });
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
    
    // Prévisualisation d'image automatique
    if (fieldName === 'image' && value) {
      checkIfImage(value, (exists) => {
        if (exists) {
          setImagePreview(value);
          setErrors(prev => ({ ...prev, image: '' }));
        } else {
          setImagePreview('');
        }
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title?.trim()) newErrors.title = 'Le titre est requis';
    else if (form.title.length < 5) newErrors.title = 'Le titre doit faire au moins 5 caractères';
    
    if (!form.description?.trim()) newErrors.description = 'La description est requise';
    else if (form.description.length < 20) newErrors.description = 'La description doit faire au moins 20 caractères';
    
    if (!form.target || parseFloat(form.target) <= 0) newErrors.target = 'L\'objectif doit être supérieur à 0';
    else if (parseFloat(form.target) > 1000) newErrors.target = 'L\'objectif ne peut pas dépasser 1000 ETH';
    
    if (!form.deadline) newErrors.deadline = 'La date limite est requise';
    else if (new Date(form.deadline) <= new Date()) newErrors.deadline = 'La date doit être dans le futur';
    else if (new Date(form.deadline) > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      newErrors.deadline = 'La date ne peut pas dépasser 1 an';
    }
    
    if (!form.image?.trim()) newErrors.image = 'L\'image est requise';
    
    if (!form.category) newErrors.category = 'La catégorie est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      alert('Veuillez vous connecter à votre portefeuille');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    
    checkIfImage(form.image, async (exists) => {
      if (exists) {
        try {
          // Préparer les données pour l'upload IPFS
          const campaignData = {
            ...form,
            socialLinks: {
              website: form.website,
              facebook: form.facebook,
              twitter: form.twitter,
              linkedin: form.linkedin,
              instagram: form.instagram,
              discord: form.discord,
              other: form.otherLink
            }
          };

          await createCampaign(campaignData);
          alert('🎉 Campagne créée avec succès!');
          navigate('/');
        } catch (error) {
          console.error('Erreur création campagne:', error);
          alert('❌ Erreur lors de la création: ' + error.message);
        }
      } else {
        setErrors(prev => ({ ...prev, image: 'URL d\'image invalide' }));
        setImagePreview('');
      }
      setIsUploading(false);
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
  };

  const handleCategorySelect = (categoryId) => {
    setForm({ ...form, category: categoryId });
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-[#1c1c24] flex items-center justify-center p-4">
        <div className="bg-[#2c2f32] rounded-[20px] p-8 max-w-md w-full text-center border-2 border-[#8c6dfd]">
          <div className="w-20 h-20 bg-[#3a3a43] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[32px]">🔐</span>
          </div>
          <h1 className="font-epilogue font-bold text-[28px] text-white mb-4">
            Connexion Requise
          </h1>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] mb-6">
            Veuillez vous connecter à votre portefeuille pour créer une campagne de crowdfunding.
          </p>
          <CustomButton 
            btnType="button"
            title="Se connecter avec MetaMask"
            styles="bg-[#8c6dfd] hover:bg-[#7b5dfa] w-full py-3"
            handleClick={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c24] to-[#2c2f32] py-8 px-2">
      {(isLoading || isUploading) && <Loader message={isUploading ? "Validation de l'image..." : "Création de la campagne..."} />}
      
      <div className="max-w-1xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xl">✨</span>
            </div>
            <h1 className="font-epilogue font-bold text-[32px] bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] bg-clip-text text-transparent">
              Créer une Campagne
            </h1>
          </div>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] max-w-2xl mx-auto">
            Lancez votre projet et collectez des fonds grâce à la puissance de la blockchain Ethereum. 
            Remplissez les informations ci-dessous pour commencer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#8c6dfd] rounded-full mr-3"></div>
                    Informations de Base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      labelName="Votre Nom"
                      placeholder="John Doe"
                      inputType="text"
                      value={form.name}
                      handleChange={(e) => handleFormFieldChange('name', e)}
                      error={errors.name}
                      optional
                    />
                    <FormField 
                      labelName="Titre de la Campagne *"
                      placeholder="Sauver les océans"
                      inputType="text"
                      value={form.title}
                      handleChange={(e) => handleFormFieldChange('title', e)}
                      error={errors.title}
                    />
                  </div>
                  
                  <FormField 
                    labelName="Description *"
                    placeholder="Décrivez votre projet en détail... Quelle est sa mission ? Comment les fonds seront-ils utilisés ?"
                    isTextArea
                    value={form.description}
                    handleChange={(e) => handleFormFieldChange('description', e)}
                    error={errors.description}
                    rows={4}
                  />
                </div>

                {/* Catégorie */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#4acd8d] rounded-full mr-3"></div>
                    Catégorie du Projet *
                  </h3>
                  
                  <div className="mb-4">
                    <label className="font-epilogue font-semibold text-[16px] text-white mb-3 block">
                      Sélectionnez une catégorie
                    </label>
                    {errors.category && (
                      <p className="text-red-500 text-sm mb-3">{errors.category}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.id)}
                          className={`p-4 rounded-[12px] border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                            form.category === category.id
                              ? 'border-[#8c6dfd] bg-[#8c6dfd]/10'
                              : 'border-[#3a3a43] bg-[#2c2f32] hover:border-[#4acd8d] hover:bg-[#1c1c24]'
                          }`}
                        >
                          <span className="text-2xl mb-2">{category.icon}</span>
                          <span className="font-epilogue font-semibold text-[14px] text-white text-center">
                            {category.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    {form.category && (
                      <div className="mt-4 p-3 bg-[#2c2f32] rounded-[10px] border border-[#4acd8d]">
                        <p className="font-epilogue font-semibold text-white flex items-center">
                          <span className="mr-2">
                            {categories.find(c => c.id === form.category)?.icon}
                          </span>
                          Catégorie sélectionnée: {categories.find(c => c.id === form.category)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectif et date */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#4acd8d] rounded-full mr-3"></div>
                    Objectif et Durée
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      labelName="Objectif (ETH) *"
                      placeholder="0.50"
                      inputType="number"
                      step="0.01"
                      min="0.01"
                      max="1000"
                      value={form.target}
                      handleChange={(e) => handleFormFieldChange('target', e)}
                      error={errors.target}
                    />
                    <FormField 
                      labelName="Date de Fin *"
                      placeholder=""
                      inputType="date"
                      value={form.deadline}
                      handleChange={(e) => handleFormFieldChange('deadline', e)}
                      error={errors.deadline}
                      min={getMinDate()}
                      max={getMaxDate()}
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#1dc071] rounded-full mr-3"></div>
                    Image de la Campagne
                  </h3>
                  
                  <FormField 
                    labelName="URL de l'Image *"
                    placeholder="https://example.com/image.jpg"
                    inputType="url"
                    value={form.image}
                    handleChange={(e) => handleFormFieldChange('image', e)}
                    error={errors.image}
                  />
                  
                  {/* Prévisualisation d'image */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="font-epilogue font-semibold text-[14px] text-white mb-2">
                        Aperçu de l'image:
                      </p>
                      <div className="relative rounded-[10px] overflow-hidden border-2 border-[#4acd8d]">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-48 object-cover"
                          onError={() => {
                            setImagePreview('');
                            setErrors(prev => ({ ...prev, image: 'Image non accessible' }));
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          ✓ Valide
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Liens sociaux et web */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#FF6B35] rounded-full mr-3"></div>
                    Liens et Réseaux Sociaux
                  </h3>
                  
                  <p className="font-epilogue font-normal text-[14px] text-[#808191] mb-4">
                    Ajoutez des liens vers votre site web et réseaux sociaux pour plus de visibilité.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField 
                        labelName="Site Web"
                        placeholder="https://votre-projet.com"
                        inputType="url"
                        value={form.website}
                        handleChange={(e) => handleFormFieldChange('website', e)}
                        icon="🌐"
                        optional
                      />
                      <FormField 
                        labelName="Facebook"
                        placeholder="https://facebook.com/votre-page"
                        inputType="url"
                        value={form.facebook}
                        handleChange={(e) => handleFormFieldChange('facebook', e)}
                        icon="📘"
                        optional
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField 
                        labelName="Twitter (X)"
                        placeholder="https://twitter.com/votre-compte"
                        inputType="url"
                        value={form.twitter}
                        handleChange={(e) => handleFormFieldChange('twitter', e)}
                        icon="🐦"
                        optional
                      />
                      <FormField 
                        labelName="LinkedIn"
                        placeholder="https://linkedin.com/company/votre-entreprise"
                        inputType="url"
                        value={form.linkedin}
                        handleChange={(e) => handleFormFieldChange('linkedin', e)}
                        icon="💼"
                        optional
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField 
                        labelName="Instagram"
                        placeholder="https://instagram.com/votre-compte"
                        inputType="url"
                        value={form.instagram}
                        handleChange={(e) => handleFormFieldChange('instagram', e)}
                        icon="📸"
                        optional
                      />
                      <FormField 
                        labelName="Discord"
                        placeholder="https://discord.gg/votre-serveur"
                        inputType="url"
                        value={form.discord}
                        handleChange={(e) => handleFormFieldChange('discord', e)}
                        icon="🎮"
                        optional
                      />
                    </div>
                    
                    <FormField 
                      labelName="Autre Lien"
                      placeholder="https://autre-lien.com"
                      inputType="url"
                      value={form.otherLink}
                      handleChange={(e) => handleFormFieldChange('otherLink', e)}
                      icon="🔗"
                      optional
                    />
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="flex justify-center pt-4">
                  <CustomButton 
                    btnType="submit"
                    title={
                      isLoading || isUploading 
                        ? "Création en cours..." 
                        : "🚀 Lancer la Campagne"
                    }
                    styles="bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] hover:from-[#7b5dfa] hover:to-[#3dbc7d] w-full md:w-auto px-8 py-4 rounded-[15px] font-bold text-[18px] transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading || isUploading}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar informative */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Carte d'information */}
              <div className="bg-gradient-to-br from-[#8c6dfd] to-[#4acd8d] rounded-[20px] p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">💫</span>
                  </div>
                  <h3 className="font-epilogue font-bold text-[20px]">
                    Avantages
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      100% des fonds collectés
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Pas de frais intermédiaires
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Sécurité blockchain
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Transparence totale
                    </span>
                  </li>
                </ul>
              </div>

              {/* Conseils par catégorie */}
              <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43]">
                <h3 className="font-epilogue font-bold text-[18px] text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">💡</span>
                  Conseils par Catégorie
                </h3>
                <div className="space-y-3">
                  {form.category && categories.find(c => c.id === form.category) && (
                    <div className="bg-[#1c1c24] rounded-[10px] p-3">
                      <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                        {categories.find(c => c.id === form.category)?.icon} 
                        {categories.find(c => c.id === form.category)?.name}
                      </p>
                      <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                        {form.category === 'charity' && 'Montrez l\'impact concret de chaque don et partagez des témoignages.'}
                        {form.category === 'startup' && 'Présentez votre business model et votre équipe. Les investisseurs aiment voir la roadmap.'}
                        {form.category === 'community' && 'Impliquez la communauté dès le début. Montrez le soutien local.'}
                        {form.category === 'technology' && 'Démontrez l\'innovation et l\'utilité de votre technologie. Prototypes et démos aident.'}
                        {form.category === 'art' && 'Partagez votre vision artistique. Des visuels de qualité sont essentiels.'}
                        {form.category === 'education' && 'Expliquez l\'impact éducatif et les bénéficiaires. Les partenariats institutionnels sont un plus.'}
                        {form.category === 'environment' && 'Quantifiez l\'impact environnemental. Les données scientifiques renforcent la crédibilité.'}
                        {form.category === 'health' && 'Respectez les régulations. Les certifications et avis d\'experts sont importants.'}
                        {form.category === 'gaming' && 'Montrez du gameplay et l\'engagement de la communauté. Les bêta-testeurs aident.'}
                        {form.category === 'other' && 'Clarifiez votre vision unique. Expliquez pourquoi votre projet est spécial.'}
                      </p>
                    </div>
                  )}
                  <div className="bg-[#1c1c24] rounded-[10px] p-3">
                    <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                      Image attrayante
                    </p>
                    <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                      Choisissez une image de qualité qui représente bien votre projet
                    </p>
                  </div>
                  <div className="bg-[#1c1c24] rounded-[10px] p-3">
                    <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                      Liens sociaux
                    </p>
                    <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                      Ajoutez vos réseaux pour plus de crédibilité et de visibilité
                    </p>
                  </div>
                </div>
              </div>

              {/* Importance des catégories */}
              <div className="bg-[#2c2f32] rounded-[20px] p-4 border-2 border-[#8c6dfd]">
                <h3 className="font-epilogue font-bold text-[16px] text-white mb-2 flex items-center">
                  <span className="text-[#8c6dfd] mr-2">🏷️</span>
                  Pourquoi choisir une catégorie ?
                </h3>
                <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                  La catégorie aide les donateurs à trouver votre projet et garantit que votre campagne atteint le bon public. Elle améliore la découvrabilité de 40%.
                </p>
              </div>

              {/* Statut de connexion */}
              <div className="bg-[#2c2f32] rounded-[20px] p-4 border-2 border-[#4acd8d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-epilogue font-semibold text-[14px] text-white">
                      Connecté
                    </span>
                  </div>
                  <span className="font-epilogue font-normal text-[12px] text-[#808191]">
                    {address.substring(0, 6)}...{address.substring(38)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;