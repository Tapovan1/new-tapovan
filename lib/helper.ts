import {
  standards,
  getClassesForStandard,
  getSubjectsForStandard,
  isValidStandardClassCombination,
  isValidStandardSubjectCombination,
  type StandardKey,
} from "@/lib/constants/index";

// Validation helpers
export const validateAssignment = (
  standard: string,
  className: string,
  subject: string
) => {
  const standardKey = standard as StandardKey;

  if (!standards[standardKey]) {
    return { valid: false, error: "Invalid standard" };
  }

  if (!isValidStandardClassCombination(standardKey, className)) {
    return {
      valid: false,
      error: `Class ${className} is not available for Standard ${standard}`,
    };
  }

  if (!isValidStandardSubjectCombination(standardKey, subject)) {
    return {
      valid: false,
      error: `Subject ${subject} is not available for Standard ${standard}`,
    };
  }

  return { valid: true, error: null };
};

// Format display names
export const formatStandardName = (standard: string): string => {
  if (standard === "KG1" || standard === "KG2") {
    return standard;
  }
  return `Standard ${standard}`;
};

export const formatClassName = (className: string): string => {
  return className;
};

export const formatSubjectName = (subject: string): string => {
  return subject;
};

// Get assignment display string
export const getAssignmentDisplayString = (
  standard: string,
  className: string,
  subject: string
): string => {
  return `${formatStandardName(standard)} - ${className} - ${subject}`;
};

// Filter functions for dropdowns
export const getAvailableClassesForStandard = (standard: string) => {
  return getClassesForStandard(standard as StandardKey);
};

export const getAvailableSubjectsForStandard = (standard: string) => {
  return getSubjectsForStandard(standard as StandardKey);
};

// Check if assignment combination exists
export const isValidAssignmentCombination = (
  standard: string,
  className: string,
  subject: string
): boolean => {
  const validation = validateAssignment(standard, className, subject);
  return validation.valid;
};
