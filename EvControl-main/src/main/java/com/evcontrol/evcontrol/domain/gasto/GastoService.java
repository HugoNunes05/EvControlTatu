package com.evcontrol.evcontrol.domain.gasto;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class GastoService {

    @Autowired
    private GastoRepository gastoRepository;


    //criar
    @Transactional
    public Gasto criar(Gasto g){
        return gastoRepository.save(g);
    }

    //editar
    public Gasto atualizar(Long id, Gasto dados){
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Id não encontrado!"));

        gasto.setDescricao(dados.getDescricao());
        gasto.setValor(dados.getValor());
        gasto.setData(dados.getData());

        return gastoRepository.save(gasto);
    }

    //listar
    public List<Gasto> listar(){
            return gastoRepository.findAll();
    }

    //listar por mês
    public List<Gasto> listarPorMes(int mes, int ano){
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Gasto> gastos = gastoRepository.findByDataBetween(inicio, fim);

        return gastos;
    }

    //deletar
    public void deletar(Long id){
        gastoRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Id não encontrado!"));

        gastoRepository.deleteById(id);
    }

    //valor total no mês
    public BigDecimal gastoTotalMes(int mes, int ano){
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Gasto> gastos = gastoRepository.findByDataBetween(inicio, fim);

        BigDecimal gastoTotal = gastos.stream()
                .map(Gasto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return gastoTotal;
    }

    //valor total no ano
    public BigDecimal gastoTotalAno(int ano){
        LocalDate inicio = LocalDate.of(ano, 1, 1);
        LocalDate fim = LocalDate.of(ano, 12, 31);

        List<Gasto> gastos = gastoRepository.findByDataBetween(inicio, fim);

        BigDecimal gastoTotal = gastos.stream()
                .map(Gasto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return gastoTotal;
    }
}
