import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle, Calendar, Clock, CreditCard, Phone, Hash, Wifi } from 'lucide-react';
import { PaymentProof, UploadProgress } from '../../types';
import { paymentService } from '../../services/firebaseService';
import { formatCurrency } from '../../utils/dateUtils';

interface PaymentProofUploadProps {
  paymentId: string;
  expectedAmount: number;
  onUploadComplete: (proof: PaymentProof) => void;
  onCancel: () => void;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  paymentId,
  expectedAmount,
  onUploadComplete,
  onCancel
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });
  const [transferDetails, setTransferDetails] = useState({
    amount: expectedAmount,
    recipientNumber: '',
    transferNumber: '',
    network: 'MTN',
    transferDate: new Date().toISOString().split('T')[0],
    transferTime: new Date().toTimeString().slice(0, 5)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrors({ file: 'Format non supporté. Utilisez JPG, PNG ou PDF.' });
      return;
    }

    if (selectedFile.size > maxSize) {
      setErrors({ file: 'Fichier trop volumineux. Maximum 10MB.' });
      return;
    }

    setFile(selectedFile);
    setErrors({});

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = 'Veuillez sélectionner un fichier';
    if (!transferDetails.recipientNumber.trim()) newErrors.recipientNumber = 'Numéro bénéficiaire requis';
    if (!transferDetails.transferNumber.trim()) newErrors.transferNumber = 'Numéro de transfert requis';
    if (transferDetails.amount <= 0) newErrors.amount = 'Montant invalide';
    if (!transferDetails.transferDate) newErrors.transferDate = 'Date requise';
    if (!transferDetails.transferTime) newErrors.transferTime = 'Heure requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !file) return;

    setUploadProgress({ progress: 0, uploading: true });

    try {
      // Upload file to Firebase Storage
      const fileUrl = await paymentService.uploadPaymentProof(file, paymentId);
      
      const proof: PaymentProof = {
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl,
        fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
        uploadedAt: new Date(),
        transferDetails: {
          ...transferDetails,
          transferDate: new Date(transferDetails.transferDate),
        }
      };

      setUploadProgress({ progress: 100, uploading: false });
      onUploadComplete(proof);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ 
        progress: 0, 
        uploading: false, 
        error: 'Erreur lors du téléchargement' 
      });
    }
  };

  const networks = [
    { value: 'MTN', label: 'MTN Mobile Money', color: 'text-yellow-600' },
    { value: 'Orange', label: 'Orange Money', color: 'text-orange-600' },
    { value: 'Moov', label: 'Moov Money', color: 'text-blue-600' },
    { value: 'Wave', label: 'Wave', color: 'text-purple-600' },
    { value: 'Bank', label: 'Virement bancaire', color: 'text-green-600' },
    { value: 'Other', label: 'Autre', color: 'text-gray-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Justificatif de paiement</h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Téléchargez une capture d'écran ou un reçu de votre paiement de {formatCurrency(expectedAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capture d'écran ou reçu *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {file ? (
                <div className="space-y-4">
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                  ) : (
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez-déposez votre fichier ici ou
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    parcourir
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG ou PDF - Maximum 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
          </div>

          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Montant transféré *
              </label>
              <input
                type="number"
                value={transferDetails.amount}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="10000"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Wifi className="h-4 w-4 inline mr-1" />
                Réseau de paiement *
              </label>
              <select
                value={transferDetails.network}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, network: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {networks.map(network => (
                  <option key={network.value} value={network.value}>
                    {network.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Numéro bénéficiaire *
              </label>
              <input
                type="text"
                value={transferDetails.recipientNumber}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, recipientNumber: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.recipientNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="6XX XXX XXX"
              />
              {errors.recipientNumber && <p className="mt-1 text-sm text-red-600">{errors.recipientNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Numéro de transfert *
              </label>
              <input
                type="text"
                value={transferDetails.transferNumber}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, transferNumber: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.transferNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="MP240101.1234.A12345"
              />
              {errors.transferNumber && <p className="mt-1 text-sm text-red-600">{errors.transferNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date du transfert *
              </label>
              <input
                type="date"
                value={transferDetails.transferDate}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, transferDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.transferDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transferDate && <p className="mt-1 text-sm text-red-600">{errors.transferDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Heure du transfert *
              </label>
              <input
                type="time"
                value={transferDetails.transferTime}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, transferTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.transferTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transferTime && <p className="mt-1 text-sm text-red-600">{errors.transferTime}</p>}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress.uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm text-blue-700">Téléchargement en cours... {uploadProgress.progress}%</span>
              </div>
            </div>
          )}

          {uploadProgress.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{uploadProgress.error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploadProgress.uploading || !file}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {uploadProgress.uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer le paiement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};