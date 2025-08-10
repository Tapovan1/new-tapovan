export const EXAM_TYPES = [
  {
    id: "unit_test",
    name: "Unit Test",
  },
  {
    id: "weekly_test",
    name: "Weekly Test",
  },
  {
    id: "purak_exam_1",
    name: "Purak Exam - 1",
  },
  {
    id: "purak_exam_2",
    name: "Purak Exam - 2",
  },
  {
    id: "first_exam",
    name: "First Exam",
  },
  {
    id: "second_exam",
    name: "Second Exam",
  },
  {
    id: "preliminary_exam",
    name: "Preliminary Exam",
  },
  {
    id: "annual_exam",
    name: "Annual Exam",
  },
  {
    id: "test_exam",
    name: "Test Exam",
  },
];

export const getExamTypeById = (id: string) => {
  return EXAM_TYPES.find((examType) => examType.id === id) || EXAM_TYPES[0];
};
