import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, DollarSign, Settings, Plus } from 'lucide-react';
import { Tontine } from '../../types';
import { generateInviteCode, formatCurrency } from '../../utils/dateUtils';

interface CreateTontineProps {
  onBack: () => void;
  onSave: (tontine: Partial<Tontine>) => void;
  editingTontine?: Tontine;
}

export const CreateTontine: React.FC<CreateTontineProps> = ({ onBack, onSave, editingTontine }) => {
  const [formData, setFormData] = useState({
    name: editingTontine?.name || '',
    description: editingTontine?.description || '',
    amount: editingTontine?.amount?.toString() || '',
    frequency: editingTontine?.frequency || 'monthly' as 'daily' | 'weekly' | 'monthly' | 'custom',
    customDays: editingTontine?.customDays?.toString() || '',
    maxParticipants: editingTontine?.maxParticipants?.toString() || '',
    startDate: editingTontine?.startDate ? editingTontine.startDate.toISOString().split('T')[0] : '',
    orderType: editingTontine?.orderType || 'manual' as 'manual' | 'random',
    gainType: editingTontine?.gainType || 'money' as 'money' | 'pack',
    packDescription: editingTontine?.packDescription || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
    if (!formData.maxParticipants || parseInt(formData.maxParticipants) < 2) {
      newErrors.maxParticipants = 'Au moins 2 participants requis';
    }
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (formData.frequency === 'custom' && (!formData.customDays || parseInt(formData.customDays) <= 0)) {
      newErrors.customDays = 'Nombre de jours requis pour la fréquence personnalisée';
    }
    if (formData.gainType === 'pack' && !formData.packDescription.trim()) {
      newErrors.packDescription = 'Description du pack requise';
    }

    // Check if start date is in the future
    if (formData.startDate && new Date(formData.startDate) <= new Date()) {
      newErrors.startDate = 'La date de début doit être dans le futur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const tontineData: Partial<Tontine> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      customDays: formData.frequency === 'custom' ? parseInt(formData.customDays) : undefined,
      maxParticipants: parseInt(formData.maxParticipants),
      startDate: new Date(formData.startDate),
      orderType: formData.orderType,
      gainType: formData.gainType,
      packDescription: formData.gainType === 'pack' ? formData.packDescription.trim() : undefined,
      status: 'draft',
      currentCycle: 0,
      participants: [],
      inviteCode: editingTontine?.inviteCode || generateInviteCode(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSave(tontineData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{editingTontine ? 'Modifier la tontine' : 'Créer une nouvelle tontine'}</h1>
          <p className="text-gray-600">Configurez les paramètres de votre tontine</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Informations de base</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la tontine *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Tontine Familiale 2024"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants *
              </label>
              <input
                type="number"
                id="maxParticipants"
                min="2"
                max="50"
                value={formData.maxParticipants}
                onChange={(e) => handleChange('maxParticipants', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.maxParticipants ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="8"
              />
              {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Décrivez l'objectif de votre tontine..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Paramètres financiers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant par participant (XAF) *
              </label>
              <input
                type="number"
                id="amount"
                min="100"
                step="1"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="10000"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              {formData.amount && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="gainType" className="block text-sm font-medium text-gray-700 mb-2">
                Type de gain
              </label>
              <select
                id="gainType"
                value={formData.gainType}
                onChange={(e) => handleChange('gainType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="money">Argent</option>
                <option value="pack">Pack/Produit</option>
              </select>
            </div>
          </div>

          {formData.gainType === 'pack' && (
            <div className="mt-6">
              <label htmlFor="packDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description du pack *
              </label>
              <input
                type="text"
                id="packDescription"
                value={formData.packDescription}
                onChange={(e) => handleChange('packDescription', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.packDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Pack électroménager, Matériel informatique..."
              />
              {errors.packDescription && <p className="mt-1 text-sm text-red-600">{errors.packDescription}</p>}
            </div>
          )}
        </div>

        {/* Schedule Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Calendar className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Planification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence des paiements
              </label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {formData.frequency === 'custom' && (
              <div>
                <label htmlFor="customDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de jours *
                </label>
                <input
                  type="number"
                  id="customDays"
                  min="1"
                  max="365"
                  value={formData.customDays}
                  onChange={(e) => handleChange('customDays', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.customDays ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="14"
                />
                {errors.customDays && <p className="mt-1 text-sm text-red-600">{errors.customDays}</p>}
              </div>
            )}

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-2">
                Ordre de ramassage
              </label>
              <select
                id="orderType"
                value={formData.orderType}
                onChange={(e) => handleChange('orderType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="manual">Manuel (défini par l'initiateur)</option>
                <option value="random">Tirage aléatoire</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {editingTontine ? 'Modifier la tontine' : 'Créer la tontine'}
          </button>
        </div>
      </form>
    </div>
  );
};