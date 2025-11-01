export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const normCNPJ = (v?: string) => v ? onlyDigits(v).slice(0,14) : undefined;

export const normPhone = (v?: string) => v ? onlyDigits(v).slice(0,11) : undefined;

export const slugify = (v: string) =>
  v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
   .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

export const formatCNPJ = (v: string) => {
  const digits = onlyDigits(v);
  if (digits.length !== 14) return v;
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`;
};

export const formatPhone = (v: string) => {
  const digits = onlyDigits(v);
  if (digits.length === 10) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6,10)}`;
  } else if (digits.length === 11) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7,11)}`;
  }
  return v;
};

export const formatCEP = (v: string) => {
  const digits = onlyDigits(v);
  if (digits.length !== 8) return v;
  return `${digits.slice(0,5)}-${digits.slice(5,8)}`;
};
