import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle, Calendar, Clock, CreditCard, Phone, Hash, Wifi } from 'lucide-react';
import { paymentService } from '../../services/firebaseService';

interface PaymentScreenshotUploadProps {
  tontineId: string;
  participantId: string;
  expectedAmount: number;
  onUploadComplete: (screenshotUrl: string) => void;
  onCancel: () => void;
}

export const PaymentScreenshotUpload: React.FC<PaymentScreenshotUploadProps> = ({
  tontineId,
  participantId,
  expectedAmount,
  onUploadComplete,
  onCancel
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Format non supporté. Utilisez JPG ou PNG.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('Fichier trop volumineux. Maximum 10MB.');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner une capture d\'écran');
      return;
    }

    setUploading(true);

    try {
      const screenshotUrl = await paymentService.uploadPaymentScreenshot(file, tontineId, participantId);
      await paymentService.markPaymentAsPaid(tontineId, participantId, screenshotUrl, expectedAmount);
      onUploadComplete(screenshotUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Erreur lors du téléchargement');
      setUploading(false);
    }
  };

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
            Téléchargez une capture d'écran de votre paiement de {expectedAmount.toLocaleString()} FCFA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capture d'écran du paiement *
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
                  {preview && (
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
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
                    Glissez-déposez votre capture ici ou
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    parcourir
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG ou PNG - Maximum 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions :</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Prenez une capture d'écran claire de votre transaction</li>
              <li>• Assurez-vous que le montant et les détails sont visibles</li>
              <li>• Votre paiement sera en attente de validation par l'initiatrice</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {uploading ? (
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