package com.evcontrol.evcontrol.controller;

import com.evcontrol.evcontrol.domain.gasto.GastoService;
import com.evcontrol.evcontrol.domain.reserva.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/financas")
@CrossOrigin(origins = "http://localhost:5173")
public class FinancaController {

    @Autowired
    private GastoService gastoService;

    @Autowired
    private ReservaService reservaService;

    //total Gasto Por mês
    @GetMapping("/gastoTotalMes")
    public ResponseEntity<BigDecimal> totalGastoPorMes(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano){

        BigDecimal total = BigDecimal.ZERO;

        if (mes != null & ano != null){
            total = gastoService.gastoTotalMes(mes, ano);
        }
        return ResponseEntity.ok(total);
    }

    //total Gasto Por ano
    @GetMapping("/gastoTotalAno")
    public ResponseEntity<BigDecimal> totalGastoPorAno(@RequestParam(required = false) Integer ano){

        BigDecimal total = BigDecimal.ZERO;

        if (ano != null){
            total = gastoService.gastoTotalAno(ano);
        }
        return ResponseEntity.ok(total);
    }

    //total Reserva Por mês
    @GetMapping("/reservaTotalMes")
    public ResponseEntity<BigDecimal> totalReservasPorMes(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano){

        BigDecimal total = BigDecimal.ZERO;

        if (mes != null & ano != null){
            total = reservaService.reservaTotalMes(mes, ano);
        }
        return ResponseEntity.ok(total);
    }

    //total Reserva Por ano
    @GetMapping("/reservaTotalAno")
    public ResponseEntity<BigDecimal> totalReservasPorAno(@RequestParam(required = false) Integer ano){

        BigDecimal total = BigDecimal.ZERO;

        if (ano != null){
            total = reservaService.reservaTotalAno(ano);
        }
        return ResponseEntity.ok(total);
    }



}
