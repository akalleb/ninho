import { useState, useLayoutEffect, useCallback } from 'react';

/**
 * Custom hook for managing wizard step navigation
 * Handles step state, validation, and navigation logic
 */
export const useWizardSteps = (initialStep = 1) => {
  const [wizardState, setWizardState] = useState({
    status: 'process',
    validation: false,
    isFinished: false,
    current: initialStep,
  });

  /**
   * Update step styling based on active/success states
   * This handles DOM manipulation for step indicators
   */
  useLayoutEffect(() => {
    const activeElement = document.querySelectorAll('.ant-steps-item-active');
    const successElement = document.querySelectorAll('.ant-steps-item-finish');

    activeElement.forEach((element) => {
      if (element.previousSibling) {
        const bgImage = element.previousSibling;
        if (bgImage.classList.contains('success-step-item')) {
          bgImage.classList.remove('success-step-item');
        } else {
          bgImage.classList.remove('wizard-step-item');
        }
        bgImage.classList.add('wizard-steps-item-active');
      }
    });

    successElement.forEach((element) => {
      if (element.previousSibling) {
        const bgImage = element.previousSibling;
        bgImage.classList.remove('wizard-steps-item-active');
        bgImage.classList.add('success-step-item');
      }
    });
  });

  /**
   * Move to next step with validation
   */
  const goNext = useCallback((validateForm) => {
    if (validateForm) {
      return validateForm()
        .then(() => {
          setWizardState((prev) => ({
            ...prev,
            status: 'process',
            current: prev.current + 1,
            validation: true,
          }));
        })
        .catch(() => {
          setWizardState((prev) => ({
            ...prev,
            validation: false,
          }));
        });
    }
    // If no validation function, just go to next step
    setWizardState((prev) => ({
      ...prev,
      status: 'process',
      current: prev.current + 1,
    }));
  }, []);

  /**
   * Move to previous step
   */
  const goPrev = useCallback(() => {
    setWizardState((prev) => ({
      ...prev,
      status: 'process',
      current: prev.current - 1,
    }));
  }, []);

  /**
   * Complete wizard (finish state)
   */
  const finish = useCallback((onConfirm) => {
    if (onConfirm) {
      const confirmed = onConfirm();
      if (confirmed) {
        setWizardState((prev) => ({
          ...prev,
          status: 'finish',
          isFinished: true,
          current: 0,
        }));
      }
    } else {
      setWizardState((prev) => ({
        ...prev,
        status: 'finish',
        isFinished: true,
        current: 0,
      }));
    }
  }, []);

  /**
   * Reset validation status
   */
  const resetValidation = useCallback(() => {
    setWizardState((prev) => ({
      ...prev,
      validation: false,
    }));
  }, []);

  /**
   * Reset wizard to initial state
   */
  const resetWizard = useCallback(() => {
    setWizardState({
      status: 'process',
      validation: false,
      isFinished: false,
      current: initialStep,
    });
  }, [initialStep]);

  return {
    status: wizardState.status,
    validation: wizardState.validation,
    isFinished: wizardState.isFinished,
    current: wizardState.current,
    goNext,
    goPrev,
    finish,
    resetValidation,
    resetWizard,
  };
};

