import { describe, expect, it } from "vitest";

import { maskCNPJ, maskCPF, maskPhone, onlyDigits } from "@/lib/masks";
import { formatCEP, formatCNPJ, slugify } from "@/lib/normalize";

/**
 * Formatação de documentos e telefone.
 *
 * Isto aparece direto nos formulários de cadastro de pessoa e de empresa. Se
 * quebrar, a usuária vê o próprio CPF embaralhado enquanto digita.
 */

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("123.456.789-01")).toBe("12345678901");
    expect(onlyDigits("(51) 99912-1296")).toBe("51999121296");
  });

  it("devolve string vazia quando não há dígito", () => {
    expect(onlyDigits("abc-.")).toBe("");
  });
});

describe("maskCPF", () => {
  it("formata um CPF completo", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });

  it("formata parcialmente enquanto a usuária digita", () => {
    expect(maskCPF("123")).toBe("123");
    expect(maskCPF("1234")).toBe("123.4");
    expect(maskCPF("1234567")).toBe("123.456.7");
  });

  it("ignora o excedente além de 11 dígitos", () => {
    expect(maskCPF("123456789012345")).toBe("123.456.789-01");
  });

  it("aceita entrada já formatada sem duplicar separadores", () => {
    expect(maskCPF("123.456.789-01")).toBe("123.456.789-01");
  });
});

describe("maskCNPJ", () => {
  it("formata um CNPJ completo", () => {
    expect(maskCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("ignora o excedente além de 14 dígitos", () => {
    expect(maskCNPJ("123456780001999999")).toBe("12.345.678/0001-99");
  });
});

describe("maskPhone", () => {
  it("formata celular com nove dígitos", () => {
    expect(maskPhone("51999121296")).toBe("(51) 99912-1296");
  });

  it("formata fixo com oito dígitos", () => {
    expect(maskPhone("5133334444")).toBe("(51) 3333-4444");
  });
});

describe("slugify", () => {
  it("gera o slug público de uma empresa", () => {
    expect(slugify("Construtora X")).toBe("construtora-x");
  });

  it("remove acentos", () => {
    expect(slugify("Construção Ação")).toBe("construcao-acao");
  });

  it("não deixa hífen sobrando nas pontas", () => {
    expect(slugify("  Empresa Ltda.  ")).toBe("empresa-ltda");
  });

  it("colapsa separadores repetidos", () => {
    expect(slugify("A & B --- C")).toBe("a-b-c");
  });
});

describe("formatCNPJ", () => {
  it("formata quando há exatamente 14 dígitos", () => {
    expect(formatCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("devolve a entrada intacta quando o tamanho não bate", () => {
    expect(formatCNPJ("123")).toBe("123");
  });
});

describe("formatCEP", () => {
  it("formata um CEP de 8 dígitos", () => {
    expect(formatCEP("90010000")).toBe("90010-000");
  });

  it("devolve a entrada intacta quando o tamanho não bate", () => {
    expect(formatCEP("900")).toBe("900");
  });
});
