package com.evcontrol.evcontrol.domain.gasto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GastoResponseDTO(
        Long id,
        String descricao,
        BigDecimal valor,
        LocalDate data
) {}