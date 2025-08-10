export const standards = {
  KG1: {
    classes: ["Dhruv"],
    subjects: ["demo1"],
  },
  KG2: {
    classes: ["Dhruv"],
    subjects: ["demo1"],
  },
  "1": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Gujarati",
      "Mathematics",
      "English",
      "Hindi",
      "General Knowledge",
      "Computer",
    ],
  },
  "2": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Gujarati",
      "Mathematics",
      "English",
      "Hindi",
      "General Knowledge",
      "Computer",
    ],
  },
  "3": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Gujarati",
      "Mathematics",
      "English",
      "Hindi",
      "General Knowledge",
      "Computer",
      "Environment",
    ],
  },
  "4": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Gujarati",
      "Mathematics",
      "English",
      "Hindi",
      "General Knowledge",
      "Computer",
      "Environment",
    ],
  },
  "5": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Gujarati",
      "Mathematics",
      "English",
      "Hindi",
      "General Knowledge",
      "Computer",
      "Environment",
    ],
  },
  "6": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Mathematics",
      "Science",
      "Hindi",
      "Gujarati",
      "Sanskrit",
      "English",
      "Social Science",
      "G.K",
      "Geeta",
      "Computer",
    ],
  },
  "7": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
    subjects: [
      "Mathematics",
      "Science",
      "Hindi",
      "Gujarati",
      "Sanskrit",
      "English",
      "Social Science",
      "G.K",
      "Geeta",
      "Computer",
    ],
  },
  "8": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi", "Foundation"],
    subjects: [
      "Mathematics",
      "Science",
      "Hindi",
      "Gujarati",
      "Sanskrit",
      "English",
      "Social Science",
      "G.K",
      "Geeta",
      "Computer",
    ],
  },
  "9": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Foundation"],
    subjects: [
      "Hindi",
      "Sanskrit",
      "Maths",
      "Science",
      "Gujarati",
      "Social Science",
      "English",
    ],
  },
  "10": {
    classes: ["Nachiketa", "Dhruv", "Prahlad"],
    subjects: [
      "Sanskrit",
      "Maths",
      "Science",
      "Gujarati",
      "Social Science",
      "English",
    ],
  },
  "11": {
    classes: [
      "Dhruv",
      "Nachiketa",
      "Prahlad",
      "Jee",
      "Neet",
      "Eng-Jee",
      "Eng-Neet",
    ],
    subjects: [
      "Chemistry",
      "Physics",
      "Maths",
      "Biology",
      "English",
      "Computer",
      "Sanskrit",
    ],
  },
  "12": {
    classes: ["Maths", "Biology", "Jee", "Neet", "Eng-Jee", "Eng-Neet"],
    subjects: [
      "Chemistry",
      "Physics",
      "Maths",
      "Biology",
      "English",
      "Computer",
      "Sanskrit",
    ],
  },
} as const;

export type StandardKey = keyof typeof standards;
export type ClassData = (typeof standards)[StandardKey];
export type Subject = (typeof standards)[StandardKey]["subjects"][number];
export type ClassName = (typeof standards)[StandardKey]["classes"][number];

// Helper functions
export const getStandardsList = (): StandardKey[] => {
  return Object.keys(standards) as StandardKey[];
};

export const getClassesForStandard = (standard: StandardKey): string[] => {
  return standards[standard]?.classes || [];
};

export const getSubjectsForStandard = (standard: StandardKey): string[] => {
  return standards[standard]?.subjects || [];
};

export const getAllClasses = (): string[] => {
  const allClasses = new Set<string>();
  Object.values(standards).forEach((standard) => {
    standard.classes.forEach((className) => allClasses.add(className));
  });
  return Array.from(allClasses).sort();
};

export const getAllSubjects = (): string[] => {
  const allSubjects = new Set<string>();
  Object.values(standards).forEach((standard) => {
    standard.subjects.forEach((subject) => allSubjects.add(subject));
  });
  return Array.from(allSubjects).sort();
};

export const isValidStandardClassCombination = (
  standard: StandardKey,
  className: string
): boolean => {
  return standards[standard]?.classes.includes(className) || false;
};

export const isValidStandardSubjectCombination = (
  standard: StandardKey,
  subject: string
): boolean => {
  return standards[standard]?.subjects.includes(subject) || false;
};

// Get standards that have a specific class
export const getStandardsForClass = (className: string): StandardKey[] => {
  return Object.entries(standards)
    .filter(([_, data]) => data.classes.includes(className))
    .map(([standard, _]) => standard as StandardKey);
};

// Get standards that have a specific subject
export const getStandardsForSubject = (subject: string): StandardKey[] => {
  return Object.entries(standards)
    .filter(([_, data]) => data.subjects.includes(subject))
    .map(([standard, _]) => standard as StandardKey);
};

