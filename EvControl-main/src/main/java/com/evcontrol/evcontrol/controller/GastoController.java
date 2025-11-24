package com.evcontrol.evcontrol.controller;

import com.evcontrol.evcontrol.domain.gasto.*;
import jakarta.validation.Valid;
import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@Validated
@RequestMapping("/gastos")
public class GastoController {

    @Autowired
    private GastoService gastoService;

    //criar
    @PostMapping
    public ResponseEntity<GastoResponseDTO> criar(@RequestBody @Valid GastoRequestDTO dto){
        //converto para entidade pra poder usar no service, pois service só usa entidade
        Gasto gasto = GastoMapper.toEntity(dto);
        //a resposta que o service devolve é uma entidade
        Gasto salvo = gastoService.criar(gasto);
        //pego a entidade e converto em dto para poder retornar
        GastoResponseDTO response = GastoMapper.toDTO(salvo);

        return ResponseEntity.created(URI.create("/gastos/" + salvo.getId())).body(response);
    }

    //editar
    @PutMapping("/{id}")
    public ResponseEntity<GastoResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid GastoRequestDTO dto){
        Gasto gasto = GastoMapper.toEntity(dto);
        Gasto atualizar = gastoService.atualizar(id, gasto);
        GastoResponseDTO response = GastoMapper.toDTO(atualizar);

        return ResponseEntity.ok(response);
    }

    //listar
    @GetMapping
    public ResponseEntity<List<GastoResponseDTO>> listar(){
        List<Gasto> gastos = gastoService.listar();
        List<GastoResponseDTO> response = gastos.stream()
                .map(GastoMapper::toDTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    //listarPor mês
    @GetMapping("/filtro")
    public ResponseEntity<List<GastoResponseDTO>> listarPorMes(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano){

        List<Gasto> gastos;

        if(mes != null && ano != null){
            gastos = gastoService.listarPorMes(mes, ano);
        }else {
            gastos = gastoService.listar();
        }

        List<GastoResponseDTO> response = gastos.stream()
                .map(GastoMapper::toDTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    //deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        gastoService.deletar(id);

        return ResponseEntity.noContent().build();
    }
}
