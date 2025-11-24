import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

import GastosView from "./components/GastosView";
import FinancasView from "./components/FinancasView";

interface Reserva {
  id?: number;
  nomeCliente: string;
  dataReserva: string;
  valorCobrado: number;
  observacoes: string;
}

export default function App() {
  // Abas
  const [tab, setTab] = useState<"reservas" | "gastos" | "financas">("reservas");


  // Estado Reservas
  const [nomeBusca, setNomeBusca] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservasOriginais, setReservasOriginais] = useState<Reserva[]>([]);
  const [form, setForm] = useState<Reserva>({
    nomeCliente: "",
    dataReserva: "",
    valorCobrado: 0,
    observacoes: "",
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<Reserva | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(null);

  // API Reservas
  const api = "http://localhost:8080/reservas";

  const mostrarAlerta = (tipo: "sucesso" | "erro", mensagem: string) => {
    setAlerta({ tipo, mensagem });
    setTimeout(() => setAlerta(null), 3000);
  };

  const listarReservas = async () => {
    try {
      const response = await axios.get(api);
      setReservas(response.data);
      setReservasOriginais(response.data);
    } catch (err) {
      console.error(err);
      mostrarAlerta("erro", "Erro ao listar reservas!");
    }
  };

  useEffect(() => {
    listarReservas();
  }, []);

  // Busca Reservas
  const buscar = () => {
    const query = nomeBusca.trim().toLowerCase();
    if (!query) {
      setReservas(reservasOriginais);
      return;
    }
    const filtradas = reservasOriginais.filter((r) =>
      r.nomeCliente.toLowerCase().includes(query)
    );
    setReservas(filtradas);
  };

  // Função para extrair mensagem de erro do backend
  const extractErrorMessage = (err: any): string => {
  const errorData = err.response?.data;

  console.log('🔍 Estrutura do erro recebido:', errorData);

  // Caso 1: Se for um array (erros de validação do Spring)
  if (Array.isArray(errorData)) {
    const firstError = errorData[0];
    if (firstError && typeof firstError === 'object') {
      return firstError.defaultMessage || firstError.message || "Erro de validação";
    }
    return firstError || "Erro de validação";
  }

  // Caso 2: Se for objeto com a estrutura { message: "...", details: [...] }
  if (errorData && typeof errorData === 'object') {
    // Se tiver o array 'details' e não estiver vazio
    if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
      return errorData.details[0];
    }
    
    // Se tiver campo 'message'
    if (errorData.message) {
      return errorData.message;
    }
    
    // Outros campos comuns do Spring
    if (errorData.error) {
      return errorData.error;
    }
    
    // Se tiver campo 'errors' com array
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const firstError = errorData.errors[0];
      return firstError?.defaultMessage || firstError?.message || "Erro de validação";
    }
  }

  // Caso 3: String direta
  if (typeof errorData === 'string') {
    return errorData;
  }

  return "Erro ao processar a requisição!";
};

  // CRUD Reservas
  const criar = async () => {
  try {
    await axios.post(api, form);
    setForm({ nomeCliente: "", dataReserva: "", valorCobrado: 0, observacoes: "" });
    setModalAberto(false);
    listarReservas();
    mostrarAlerta("sucesso", "Reserva cadastrada com sucesso!");
  } catch (err: any) {
    console.log('🔴 ERRO DETALHADO:', err);
    console.log('📊 ESTRUTURA DO ERRO:', err.response?.data);
    
    let mensagemErro = "Erro ao criar reserva!";
    
    if (err.response?.data) {
      const errorData = err.response.data;
      
      // CAPTURA DA ESTRUTURA CORRIGIDA DO BACKEND
      // Primeiro tenta a mensagem principal
      if (errorData.message && errorData.message !== "Erro de validação") {
        mensagemErro = errorData.message;
      }
      // Depois tenta o primeiro item do array details
      else if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        mensagemErro = errorData.details[0];
      }
      // Se ainda for "Erro de validação", usa mensagem específica
      else if (errorData.message === "Erro de validação") {
        mensagemErro = "A data da reserva deve ser hoje ou no futuro";
      }
    }
    
    console.log('🎯 MENSAGEM QUE SERÁ EXIBIDA:', mensagemErro);
    mostrarAlerta("erro", mensagemErro);
  }
};

  const editar = async () => {
  try {
    await axios.put(`${api}/${form.id}`, form);
    setModalAberto(false);
    listarReservas();
    mostrarAlerta("sucesso", "Reserva atualizada com sucesso!");
  } catch (err: any) {
    console.log('🔴 ERRO DETALHADO:', err);
    console.log('📊 ESTRUTURA DO ERRO:', err.response?.data);
    
    let mensagemErro = "Erro ao editar reserva!";
    
    if (err.response?.data) {
      const errorData = err.response.data;
      
      // MESMA LÓGICA DA FUNÇÃO CRIAR
      if (errorData.message && errorData.message !== "Erro de validação") {
        mensagemErro = errorData.message;
      }
      else if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        mensagemErro = errorData.details[0];
      }
      else if (errorData.message === "Erro de validação") {
        mensagemErro = "A data da reserva deve ser hoje ou no futuro";
      }
    }
    
    console.log('🎯 MENSAGEM QUE SERÁ EXIBIDA:', mensagemErro);
    mostrarAlerta("erro", mensagemErro);
  }
};

  const excluir = async (id?: number) => {
    try {
      await axios.delete(`${api}/${id}`);
      setModalExcluirAberto(false);
      setModalInfoAberto(false);
      listarReservas();
      mostrarAlerta("sucesso", "Reserva excluída com sucesso!");
    } catch (err: any) {
      console.error('🔴 ERRO DETALHADO:', err);
      const mensagemErro = extractErrorMessage(err);
      mostrarAlerta("erro", mensagemErro);
    }
  };

  // Calendar
  const aoClicarNoDia = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const reservaExistente = reservas.find((r) => r.dataReserva === dateStr);

    if (reservaExistente) {
      setReservaSelecionada(reservaExistente);
      setModalInfoAberto(true);
    } else {
      setForm({ nomeCliente: "", dataReserva: dateStr, valorCobrado: 0, observacoes: "" });
      setModoEdicao(false);
      setModalAberto(true);
    }
  };

  const novaReserva = () => {
    setForm({ nomeCliente: "", dataReserva: "", valorCobrado: 0, observacoes: "" });
    setModoEdicao(false);
    setModalAberto(true);
  };

  // Modo escuro
  const [darkMode, setDarkMode] = useState<boolean>(false);
  useEffect(() => {
    const body = document.body;
    const root = document.getElementById("root");
    const app = document.querySelector(".app-container");
    if (darkMode) {
      body?.classList.add("dark");
      root?.classList.add("dark");
      app?.classList.add("dark");
    } else {
      body?.classList.remove("dark");
      root?.classList.remove("dark");
      app?.classList.remove("dark");
    }
  },
   [darkMode]);



  const temReserva = (date: Date) =>
    reservas.some((r) => r.dataReserva === date.toISOString().split("T")[0]);

  const [mesAtivo, setMesAtivo] = useState<Date>(new Date());
const mesAtivoRef = useRef<Date>(mesAtivo);

useEffect(() => {
  if (tab === "reservas") {
    // sempre volta para o mês atual
    setMesAtivo(new Date());
  } else {
    mesAtivoRef.current = mesAtivo;
  }
}, [tab]);


  return (
    <div className="app-container">
      <h1 className="titulo-principal">
        EvControl <br /> Gerenciamento de Reservas
      </h1>

      {/* Header moderno com abas e toggle */}
      <div className={`main-header ${darkMode ? "dark" : ""}`}>
        <div className="tabs">
          <button
            className={`tab ${tab === "reservas" ? "active" : ""}`}
            onClick={() => setTab("reservas")}
          >
            Reservas
          </button>
          <button
            className={`tab ${tab === "gastos" ? "active" : ""}`}
            onClick={() => setTab("gastos")}
          >
            Gastos
          </button>
          <button
            className={`tab ${tab === "financas" ? "active" : ""}`}
            onClick={() => setTab("financas")}
          >
            Finanças
          </button>
        </div>
        <div className="dark-mode-toggle">
          <button onClick={() => setDarkMode(d => !d)}>
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>
      </div>

      {/* ABA RESERVAS */}
      {tab === "reservas" && (
        <>
          <div className="mb-6 flex justify-center">
            <button onClick={novaReserva} className="btn-salvar">
              + Nova Reserva
            </button>
          </div>

          <div className="calendario-container">
            <Calendar
  onClickDay={aoClicarNoDia}
  className="react-calendar"
  activeStartDate={mesAtivo}
  onActiveStartDateChange={({ activeStartDate }) => {
    if (activeStartDate) setMesAtivo(activeStartDate);
  }}
  tileClassName={({ date, view }) => {
    if (view !== "month") return null;
    const mesmoMes = date.getMonth() === mesAtivo.getMonth();
    if (temReserva(date) && mesmoMes) return "dia-reservado";
    if (!mesmoMes) return "dia-vizinho";
    return "dia-livre";
  }}
  tileContent={({ date, view }) => {
    if (view !== "month") return null;
    const reserva = reservas.find(
      (r) => r.dataReserva === date.toISOString().split("T")[0]
    );
    if (reserva && date.getMonth() === mesAtivo.getMonth()) {
      return <div className="nome-cliente">{reserva.nomeCliente}</div>;
    }
    return null;
  }}
/>
          </div>

          {/* Busca */}
          <div className="buscaReserva">
            <h1>Reservas</h1>
            <div className="flex">
              <input
                type="text"
                placeholder="Buscar por nome"
                value={nomeBusca}
                onChange={(e) => setNomeBusca(e.target.value)}
              />
              <button onClick={buscar} className="btn-editar">🔍</button>
              <button
                onClick={() => {
                  setNomeBusca("");
                  setReservas(reservasOriginais);
                }}
                className="btn-cancelar"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Lista */}
          {reservas.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma reserva encontrada.</p>
          ) : (
            <div className="listaReserva">
              <ul className="space-y-2 w-full max-w-2xl">
                {reservas.map((r) => (
                  <li key={r.id}>
                    <div>
                      <p><strong>Data:</strong> {r.dataReserva}</p>
                      <p><strong>Cliente:</strong> {r.nomeCliente}</p>
                      <p><strong>Valor:</strong> R$ {r.valorCobrado}</p>
                      <p><strong>Obs:</strong> {r.observacoes}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setForm(r); setModoEdicao(true); setModalAberto(true); }}
                        className="btn-editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => { setReservaSelecionada(r); setModalExcluirAberto(true); }}
                        className="btn-excluir"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modal Cadastro/Edição */}
          {modalAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{modoEdicao ? "Editar Reserva" : "Cadastrar Reserva"}</h2>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={form.nomeCliente}
                  onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })}
                />
                <input
                  type="date"
                  value={form.dataReserva}
                  onChange={(e) => setForm({ ...form, dataReserva: e.target.value })}
                />
                <input
  type="text"
  placeholder="R$ 0,00"
  value={form.valorCobrado === 0 ? "" : form.valorCobrado.toString().replace(".", ",")}
  onChange={(e) => {
    const valor = e.target.value.replace(/[^0-9,]/g, "");
    const numero = parseFloat(valor.replace(",", ".")) || 0;
    setForm({ ...form, valorCobrado: numero });
  }}
  onBlur={(e) => {
    e.target.value =
      form.valorCobrado === 0
        ? ""
        : `R$ ${form.valorCobrado.toFixed(2).replace(".", ",")}`;
  }}
  onFocus={(e) => {
    e.target.value =
      form.valorCobrado === 0 ? "" : form.valorCobrado.toString().replace(".", ",");
  }}
/>
                <textarea
                  placeholder="Observações"
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
                <div>
                  <button onClick={() => setModalAberto(false)} className="btn-cancelar">Fechar</button>
                  <button onClick={modoEdicao ? editar : criar} className="btn-salvar">
                    {modoEdicao ? "Salvar Alterações" : "Cadastrar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Informações */}
          {modalInfoAberto && reservaSelecionada && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Reserva em {reservaSelecionada.dataReserva}</h2>
                <p><strong>Cliente:</strong> {reservaSelecionada.nomeCliente}</p>
                <p><strong>Valor:</strong> R$ {reservaSelecionada.valorCobrado}</p>
                <p><strong>Observações:</strong> {reservaSelecionada.observacoes}</p>
                <div>
                  <button
                    onClick={() => {
                      setForm(reservaSelecionada);
                      setModoEdicao(true);
                      setModalAberto(true);
                      setModalInfoAberto(false);
                    }}
                    className="btn-editar"
                  >
                    Editar
                  </button>
                  <button onClick={() => setModalExcluirAberto(true)} className="btn-excluir">
                    Excluir
                  </button>
                  <button onClick={() => setModalInfoAberto(false)} className="btn-cancelar">
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmar Exclusão */}
          {modalExcluirAberto && reservaSelecionada && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Confirmar Exclusão</h2>
                <p>
                  Deseja realmente excluir a reserva de <strong>{reservaSelecionada.nomeCliente}</strong>?
                </p>
                <div>
                  <button onClick={() => excluir(reservaSelecionada.id)} className="btn-excluir">Excluir</button>
                  <button onClick={() => setModalExcluirAberto(false)} className="btn-cancelar">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Alerta */}
          {alerta && <div className={`alerta alerta-${alerta.tipo}`}>{alerta.mensagem}</div>}
        </>
      )}

      {/* ABA GASTOS */}
      {tab === "gastos" && (
        <div style={{ marginTop: 8 }}>
          <GastosView />
        </div>
      )}

      {/* ABA FINANÇAS */}
      {tab === "financas" && (
        <div style={{ marginTop: 8 }}>
          <FinancasView />
        </div>
      )}
    </div>
  );
}