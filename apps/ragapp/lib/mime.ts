export const isPdf = (m: string) => m === "application/pdf";
export const isImage = (m: string) => /^image\//.test(m);
