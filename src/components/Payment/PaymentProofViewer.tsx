import React, { useState } from 'react';
import { X, Download, Eye, FileText, Calendar, Clock, CreditCard, Phone, Hash, Wifi, CheckCircle, XCircle } from 'lucide-react';
import { PaymentProof, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

interface PaymentProofViewerProps {
  payment: Payment;
  onClose: () => void;
  onValidate?: () => void;
  onReject?: (reason: string) => void;
  canValidate?: boolean;
}

export const PaymentProofViewer: React.FC<PaymentProofViewerProps> = ({
  payment,
  onClose,
  onValidate,
  onReject,
  canValidate = false
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageError, setImageError] = useState(false);

  const proof = payment.paymentProof;
  if (!proof) return null;

  const handleReject = () => {
    if (rejectionReason.trim() && onReject) {
      onReject(rejectionReason.trim());
      setShowRejectModal(false);
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'MTN': return 'text-yellow-600 bg-yellow-100';
      case 'Orange': return 'text-orange-600 bg-orange-100';
      case 'Moov': return 'text-blue-600 bg-blue-100';
      case 'Wave': return 'text-purple-600 bg-purple-100';
      case 'Bank': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-700 bg-green-100 border-green-200';
      case 'participant_paid': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Paiement confirmé';
      case 'participant_paid': return 'En attente de validation';
      case 'rejected': return 'Paiement rejeté';
      default: return 'En attente';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Justificatif de paiement</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cycle {payment.cycle} • {formatCurrency(payment.amount)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Justificatif</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {proof.fileType === 'image' ? (
                    <div className="relative">
                      {!imageError ? (
                        <img
                          src={proof.fileUrl}
                          alt="Justificatif de paiement"
                          className="w-full h-auto max-h-96 object-contain"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gray-50">
                          <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Impossible de charger l'image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 space-x-2">
                        <a
                          href={proof.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm transition-all duration-200"
                          title="Voir en plein écran"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={proof.fileUrl}
                          download={proof.fileName}
                          className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm transition-all duration-200"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-50">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-sm font-medium text-gray-900 mb-2">{proof.fileName}</p>
                        <div className="space-x-2">
                          <a
                            href={proof.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ouvrir PDF
                          </a>
                          <a
                            href={proof.fileUrl}
                            download={proof.fileName}
                            className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-200"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Téléchargé le {formatDate(proof.uploadedAt)} à {proof.uploadedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Transfer Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Détails du transfert</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Montant
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(proof.transferDetails.amount)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Wifi className="h-4 w-4 mr-2" />
                          Réseau
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getNetworkColor(proof.transferDetails.network)}`}>
                          {proof.transferDetails.network}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Numéro bénéficiaire
                      </div>
                      <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">
                        {proof.transferDetails.recipientNumber}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Hash className="h-4 w-4 mr-2" />
                        Numéro de transfert
                      </div>
                      <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">
                        {proof.transferDetails.transferNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date
                        </div>
                        <p className="text-sm bg-gray-100 px-3 py-2 rounded-lg">
                          {formatDate(proof.transferDetails.transferDate)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Heure
                        </div>
                        <p className="text-sm bg-gray-100 px-3 py-2 rounded-lg">
                          {proof.transferDetails.transferTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {payment.status === 'rejected' && payment.rejectionReason && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                      <div>
                        <h5 className="text-sm font-medium text-red-800">Paiement rejeté</h5>
                        <p className="text-sm text-red-700 mt-1">{payment.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {canValidate && payment.status === 'participant_paid' && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full sm:w-auto px-6 py-3 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter le paiement
                </button>
                <button
                  onClick={onValidate}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider le paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeter le paiement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Veuillez indiquer la raison du rejet de ce paiement :
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Ex: Montant incorrect, justificatif illisible, informations manquantes..."
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};