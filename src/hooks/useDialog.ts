import { useState, useCallback } from 'react';

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const initialState: DialogState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
};

export const useDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>(initialState);

  const showDialog = useCallback((options: Omit<DialogState, 'isOpen'>) => {
    setDialogState({
      ...options,
      isOpen: true,
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(initialState);
  }, []);

  // Convenience methods for different dialog types
  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'success',
      onConfirm,
      confirmText: 'OK',
      showCancel: false,
    });
  }, [showDialog]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'error',
      onConfirm,
      confirmText: 'OK',
      showCancel: false,
    });
  }, [showDialog]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'warning',
      onConfirm,
      confirmText: 'OK',
      showCancel: false,
    });
  }, [showDialog]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'info',
      onConfirm,
      confirmText: 'OK',
      showCancel: false,
    });
  }, [showDialog]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showDialog({
      title,
      message,
      type: 'warning',
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      showCancel: true,
    });
  }, [showDialog]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};

export default useDialog;
