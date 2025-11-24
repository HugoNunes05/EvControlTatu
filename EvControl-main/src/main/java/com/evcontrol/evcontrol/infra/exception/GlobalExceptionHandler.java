package com.evcontrol.evcontrol.infra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // CORREÇÃO: Pegar a mensagem específica do campo com erro
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage) // Isso pega a mensagem do @Future
                .collect(Collectors.toList());

        // CORREÇÃO: Usar a primeira mensagem específica em vez de "Erro de validação"
        String mainMessage = errors.isEmpty() ? "Erro de validação" : errors.get(0);

        ErrorResponse errorResponse = new ErrorResponse(mainMessage, errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Adicione também tratamento para ConstraintViolationException
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(jakarta.validation.ConstraintViolationException ex) {
        List<String> errors = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getMessage())
                .collect(Collectors.toList());

        String mainMessage = errors.isEmpty() ? "Erro de validação" : errors.get(0);

        ErrorResponse errorResponse = new ErrorResponse(mainMessage, errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    public static class ErrorResponse {
        private String message;
        private List<String> details;

        public ErrorResponse(String message, List<String> details) {
            this.message = message;
            this.details = details;
        }

        // getters e setters
        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<String> getDetails() {
            return details;
        }

        public void setDetails(List<String> details) {
            this.details = details;
        }
    }
}