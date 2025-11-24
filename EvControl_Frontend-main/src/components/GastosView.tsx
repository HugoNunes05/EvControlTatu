import "./gastos.css";
import { useEffect, useMemo, useState } from "react";
import {
  getGastos,
  getGastosPorMes,
  createGasto,
  updateGasto,
  deleteGasto,
  getGastoTotalMes,
} from "../services/gastos";

type Gasto = {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
};

type Mode = "list" | "form";

function toISO(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function GastosView() {
  const today = new Date();
  const [mes, setMes] = useState<number>(today.getMonth() + 1);
  const [ano, setAno] = useState<number>(today.getFullYear());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Gasto | null>(null);

  const [descricao, setDescricao] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [data, setData] = useState<string>(toISO(today));

  const [modalExcluirAberto, setModalExcluirAberto] = useState<boolean>(false);
  const [gastoSelecionado, setGastoSelecionado] = useState<Gasto | null>(null);

  const total = useMemo(
    () => gastos.reduce((acc, g) => acc + Number(g.valor || 0), 0),
    [gastos]
  );
  const [totalMesApi, setTotalMesApi] = useState<number | null>(null);

  const mostrarAlerta = (tipo: "sucesso" | "erro", mensagem: string) => {
    const alertaDiv = document.createElement("div");
    alertaDiv.className = `alerta alerta-${tipo}`;
    alertaDiv.innerText = mensagem;
    document.body.appendChild(alertaDiv);
    setTimeout(() => alertaDiv.remove(), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = mes && ano ? await getGastosPorMes(mes, ano) : await getGastos();
      setGastos(resp.data || []);
      if (mes && ano) {
        const t = await getGastoTotalMes(mes, ano);
        setTotalMesApi(t.data as unknown as number);
      } else setTotalMesApi(null);
    } catch {
      mostrarAlerta("erro", "Erro ao carregar gastos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [mes, ano]);

  const resetForm = () => {
    setDescricao("");
    setValor("");
    setData(toISO(new Date()));
    setEditing(null);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const payload: Gasto = { descricao, valor: Number(valor), data };
    try {
      if (editing?.id) await updateGasto(editing.id, payload);
      else await createGasto(payload);
      resetForm();
      setMode("list");
      fetchData();
      mostrarAlerta("sucesso", "Gasto salvo com sucesso!");
    } catch {
      mostrarAlerta("erro", "Erro ao salvar gasto.");
    }
  };

  const onEdit = (g: Gasto) => {
    setEditing(g);
    setDescricao(g.descricao);
    setValor(String(g.valor));
    setData(g.data);
    setMode("form");
  };

  const onDelete = (g: Gasto) => {
    if (!g.id) return mostrarAlerta("erro", "Gasto inválido.");
    setGastoSelecionado(g);
    setModalExcluirAberto(true);
  };

  const confirmarExcluir = async () => {
    if (!gastoSelecionado?.id) return;
    try {
      await deleteGasto(gastoSelecionado.id);
      fetchData();
      mostrarAlerta("sucesso", "Gasto excluído com sucesso!");
    } catch {
      mostrarAlerta("erro", "Erro ao excluir gasto.");
    } finally {
      setModalExcluirAberto(false);
      setGastoSelecionado(null);
    }
  };

  return (
    <div className="gastos-container">
      <header className="gastos-header">
        <div className="gastos-filtros">
          <div className="filtro-item">
            <label>Mês:</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              <option value={0}>Todos</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-item">
            <label>Ano:</label>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn-novo-gasto" onClick={() => setMode("form")}>
          Novo gasto
        </button>
      </header>

      {/* Tabela de gastos */}
      {mode === "list" && (
        <table className="gastos-tabela">
          <thead>
            <tr>
              <th>Descrição</th>
              <th align="right">Valor (R$)</th>
              <th>Data</th>
              <th align="center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id}>
                <td>{g.descricao}</td>
                <td align="right">{g.valor.toFixed(2)}</td>
                <td>{g.data}</td>
                <td>
                  <button onClick={() => onEdit(g)}>Editar</button>
                  <button onClick={() => onDelete(g)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Novo Gasto */}
      {mode === "form" && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={submit}>
            <h2>{editing ? "Editar Gasto" : "Novo Gasto"}</h2>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              placeholder="Digite a descrição do gasto"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              placeholder="R$0,00"
            />
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
            <div className="modal-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => { resetForm(); setMode("list"); }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {editing ? "Salvar alterações" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Exclusão */}
      {modalExcluirAberto && gastoSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Exclusão</h2>
            <p>Deseja realmente excluir o gasto <strong>{gastoSelecionado.descricao}</strong>?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setModalExcluirAberto(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={confirmarExcluir}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
