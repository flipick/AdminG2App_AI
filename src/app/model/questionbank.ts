export interface IQuestionBank {
  questionBankId: number;
  title: string;
  duration: number;
  courseId: number;
  tenantId: number;
  qbankMappingId: number;
  totalQuestion: number;
  status: string;
  totalRowCount: number;
  contentTypeUrl: string;
}