package com.evcontrol.evcontrol.domain.reserva;

import com.evcontrol.evcontrol.infra.exception.RecursoNaoEncontradoException;
import com.evcontrol.evcontrol.infra.exception.RegraNegocioException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository repository;

    //CRIAR RESERVA
    @Transactional
    public Reserva criar(Reserva r){
        if(repository.existsByDataReserva(r.getDataReserva())){
            throw new RegraNegocioException("Data já reservada");
        }
        return repository.save(r);
    }

    //ATUALIZAR RESERVA --> VERIFICA SE A NOVA DATA ESTÁ DISPONIVEL ANTES DE ATUALIZAR
    public Reserva atualizar(Long id, ReservaAtualizadaDTO dados){
        Reserva atual = buscarPorId(id);
        if(dados.dataReserva() != null && repository.existsByDataReservaAndIdNot(dados.dataReserva(), id)){
                throw new RegraNegocioException("Nova data indisponível");
        }
        if(dados.nomeCliente() != null){
            atual.setNomeCliente(dados.nomeCliente());
        }

        if(dados.dataReserva() != null){
            atual.setDataReserva(dados.dataReserva());
        }

        if(dados.valorCobrado() != null){
            atual.setValorCobrado(dados.valorCobrado());
        }

        if(dados.observacoes() != null){
            atual.setObservacoes(dados.observacoes());
        }
        return repository.save(atual);
    }

    //BUSCAR RESERVA PELO ID PARA ATUALIZAR
    @Transactional(readOnly = true)
    public Reserva buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva" + id + " Não encontrada"));
    }

    //BUSCAR RESERVA PELO NOME
    @Transactional(readOnly = true)
    public List<Reserva> buscarNome(String nome){
        List<Reserva> reservas = repository.findAllByNomeClienteContainingIgnoreCase(nome);
        if(reservas.isEmpty()){
            throw new RecursoNaoEncontradoException("Nenhuma reserva encontrada para o nome " + nome);
        }
        return reservas;
    }

    @Transactional
    public void excluir(Long id){
        if (!repository.existsById(id)){
            throw new RecursoNaoEncontradoException("Reserva " + id + " não encontrado");
        }
        repository.deleteById(id);
    }

    public List<Reserva> listar(){
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Reserva> listarPorMes(int ano, int mes){
        YearMonth ym = YearMonth.of(ano, mes);
        var inicio = ym.atDay(1);
        var fim = ym.atEndOfMonth();
        return repository.findAllByDataReservaBetween(inicio, fim);
    }

    public boolean dataDisponivel(LocalDate data){
        return !repository.existsByDataReserva(data);
    }

    //valor total no mês
    public BigDecimal reservaTotalMes(int mes, int ano){
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Reserva> reservas = repository.findByDataReservaBetween(inicio, fim);

        BigDecimal reservasTotal = reservas.stream()
                .map(Reserva::getValorCobrado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return reservasTotal;
    }

    //valor total no ano
    public BigDecimal reservaTotalAno(int ano){
        LocalDate inicio = LocalDate.of(ano, 1, 1);
        LocalDate fim = LocalDate.of(ano, 12, 31);

        List<Reserva> reservas = repository.findByDataReservaBetween(inicio, fim);

        BigDecimal reservasTotal = reservas.stream()
                .map(Reserva::getValorCobrado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return reservasTotal;
    }

}
