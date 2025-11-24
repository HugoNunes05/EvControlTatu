package com.evcontrol.evcontrol.domain.gasto;

public class GastoMapper {

    //Gasto para GastoResponseDTO
    public static GastoResponseDTO toDTO(Gasto gasto){
        if(gasto == null) return null;

        return new GastoResponseDTO(
                gasto.getId(),
                gasto.getDescricao(),
                gasto.getValor(),
                gasto.getData()
        );
    }

    public static Gasto toEntity(GastoRequestDTO dto){
        if(dto == null) return null;

        return new Gasto(
                null,
                dto.descricao(),
                dto.valor(),
                dto.data()
        );
    }

}
