package com.evcontrol.evcontrol.domain.gasto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GastoRequestDTO(
        @NotBlank @Size(max = 120) String descricao,
        @NotNull @Positive BigDecimal valor,
        @NotNull LocalDate data
) {}
