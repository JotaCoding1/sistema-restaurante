// Erro de negócio com status HTTP. Use com: throw new AppError("Mensagem de erro", 400);
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Algo que ainda não foi implementado
export const notImplemented = (what) => new AppError(`Não implementado: ${what}`, 501);

// Garante que os campos existem no objeto
export function requireFields(obj, ...fields) {
  for (const f of fields) {
    if (obj?.[f] === undefined || obj[f] === null || obj[f] === "") {
      throw new AppError(`Campo obrigatório: ${f}`, 400);
    }
  }
}

// Garante que os campos existem no objeto e são do tipo esperado
export function errorHandler(err, req, res, next) {
  if (!err.status) console.error(err);
  res.status(err.status ?? 500).json({
    message: err.status ? err.message : "Erro interno do servidor"
  });
}