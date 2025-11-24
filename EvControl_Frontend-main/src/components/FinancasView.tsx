import { useEffect, useState } from "react";
import axios from "axios";
import "./financas.css";

const API_BASE = "http://localhost:8080/financas";

export default function FinancasView() {
  const hoje = new Date();
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());

  const [gastoMes, setGastoMes] = useState<number | null>(null);
  const [gastoAno, setGastoAno] = useState<number | null>(null);
  const [reservaMes, setReservaMes] = useState<number | null>(null);
  const [reservaAno, setReservaAno] = useState<number | null>(null);

  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const formatar = (valor: number | null) =>
    (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const carregarTotais = async () => {
    setCarregando(true);
    setErro(null);
    try {
      console.log("Iniciando carregamento de totais...");
      const [gastoMesResp, gastoAnoResp, reservaMesResp, reservaAnoResp] =
        await Promise.all([
          axios.get(`${API_BASE}/gastoTotalMes`, { params: { mes, ano } }),
          axios.get(`${API_BASE}/gastoTotalAno`, { params: { ano } }),
          axios.get(`${API_BASE}/reservaTotalMes`, { params: { mes, ano } }),
          axios.get(`${API_BASE}/reservaTotalAno`, { params: { ano } }),
        ]);
      
      console.log("Respostas recebidas:", {
        gastoMes: gastoMesResp.data,
        gastoAno: gastoAnoResp.data,
        reservaMes: reservaMesResp.data,
        reservaAno: reservaAnoResp.data
      });

      // Convertendo para número, garantindo que seja um número válido
      setGastoMes(Number(gastoMesResp.data));
      setGastoAno(Number(gastoAnoResp.data));
      setReservaMes(Number(reservaMesResp.data));
      setReservaAno(Number(reservaAnoResp.data));
    } catch (e: any) {
      console.error("Erro ao carregar finanças:", e);
      setErro("Erro ao carregar dados. Verifique o console para mais detalhes.");
      // Define valores como 0 em caso de erro
      setGastoMes(0);
      setGastoAno(0);
      setReservaMes(0);
      setReservaAno(0);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTotais();
  }, [mes, ano]);

  const saldoMes = (reservaMes ?? 0) - (gastoMes ?? 0);
  const saldoAno = (reservaAno ?? 0) - (gastoAno ?? 0);
  const totalMes = (reservaMes ?? 0) + (gastoMes ?? 0);
  const percGasto = totalMes > 0 ? ((gastoMes ?? 0) / totalMes) * 100 : 0;
  const percReserva = totalMes > 0 ? ((reservaMes ?? 0) / totalMes) * 100 : 0;

  if (carregando) {
    return <div className="loading">Carregando...</div>;
  }

  if (erro) {
    return <div className="erro">{erro}</div>;
  }

  return (
    <div className="financas-container">

      {/* BLOCO MÊS */}
      <div className="bloco bloco-mes">
        <div className="inputs-container">
          <div className="input-wrapper">
            <label>Mês</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="input">
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="input input-ano"
            />
          </div>
        </div>

        <div className="cards-grid">
          <Card titulo="Gastos do Mês" valor={gastoMes} cor="#e74c3c" />
          <Card titulo="Reservas do Mês" valor={reservaMes} cor="#27ae60" />
          <SaldoCard titulo="Saldo do Mês" valor={saldoMes} />
        </div>

        <div className="grafico-mes">
          <h3 className="titulo-centralizado">Distribuição do Mês</h3>
          <div className="barra-grafico">
            <div className="barra-gastos" style={{ width: `${percGasto}%` }} title={`Gastos: ${percGasto.toFixed(1)}%`} />
            <div className="barra-reservas" style={{ width: `${percReserva}%` }} title={`Reservas: ${percReserva.toFixed(1)}%`} />
          </div>
          <div className="legenda-grafico">
            <span className="cor-gasto">Gastos: {formatar(gastoMes)}</span>
            <span className="cor-reserva">Reservas: {formatar(reservaMes)}</span>
          </div>
        </div>
      </div>

      {/* BLOCO ANO */}
      <div className="bloco bloco-ano">
        <div className="inputs-container">
          <div className="input-wrapper">
            <label>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="input input-ano"
            />
          </div>
        </div>

        <div className="cards-grid">
          <Card titulo="Gastos do Ano" valor={gastoAno} cor="#e67e22" />
          <Card titulo="Reservas do Ano" valor={reservaAno} cor="#2ecc71" />
          <SaldoCard titulo="Saldo do Ano" valor={saldoAno} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */
function Card({ titulo, valor, cor }: { titulo: string; valor: number | null; cor: string }) {
  return (
    <div className="card" style={{ borderColor: cor }}>
      <h3 className="card-titulo" style={{ color: cor }}>{titulo}</h3>
      <p className="card-valor">{valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    </div>
  );
}

function SaldoCard({ titulo, valor }: { titulo: string; valor: number | null }) {
  const positivo = (valor ?? 0) >= 0;
  const cor = positivo ? "#27ae60" : "#e74c3c";
  return (
    <div className="card" style={{ borderColor: cor }}>
      <h3 className="card-titulo" style={{ color: cor }}>{titulo}</h3>
      <p className="card-valor card-valor-saldo">{valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    </div>
  );
}