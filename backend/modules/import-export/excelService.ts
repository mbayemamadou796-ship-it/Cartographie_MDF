export const excelService = {
  parseExcel: async (fileBuffer: Buffer) => ({ members: [], errors: [] }),
  generateExcel: async (members: any[]) => Buffer.from('')
};
