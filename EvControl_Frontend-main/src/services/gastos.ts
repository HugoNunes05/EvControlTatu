// src/services/gastos.ts
import api from "./api";

export interface Gasto {
  id?: number;
  descricao: string;
  valor: number;
  data: string; // formato YYYY-MM-DD
}


export const getGastos = () => api.get<Gasto[]>("/gastos");

export const getGastosPorMes = (mes?: number, ano?: number) =>
  api.get<Gasto[]>("/gastos/filtro", { params: { mes, ano } });


export const createGasto = (gasto: Gasto) => {
  const payload = {
    descricao: gasto.descricao.trim(),
    valor: Number(gasto.valor),
    data: gasto.data.split("T")[0], 
  };
  return api.post("/gastos", payload);
};


export const updateGasto = (id: number, gasto: Gasto) => {
  const payload = {
    descricao: gasto.descricao.trim(),
    valor: Number(gasto.valor),
    data: gasto.data.split("T")[0],
  };
  return api.put(`/gastos/${id}`, payload);
};


export const deleteGasto = (id: number) => api.delete(`/gastos/${id}`);


export const getGastoTotalMes = (mes: number, ano: number) =>
  api.get<number>("/financas/gastoTotalMes", { params: { mes, ano } });


export const getGastoTotalAno = (ano: number) =>
  api.get<number>("/financas/gastoTotalAno", { params: { ano } });
