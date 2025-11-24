package com.evcontrol.evcontrol.controller;

import com.evcontrol.evcontrol.domain.usuario.Usuario;
import com.evcontrol.evcontrol.infra.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> autenticar(@RequestBody LoginRequest request) {
        System.out.println("Tentativa de login para usuário: " + request.username());

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            Usuario usuario = (Usuario) auth.getPrincipal();
            System.out.println("Usuário autenticado: " + usuario.getUsername());

            String token = jwtUtil.gerarToken(usuario.getUsername());
            System.out.println("Token gerado: " + token);

            return ResponseEntity.ok(new TokenResponse(token, "Login realizado com sucesso!"));

        } catch (AuthenticationException e) {
            System.out.println("Erro na autenticação: " + e.getMessage());
            return ResponseEntity.status(401).body(new ErrorResponse("Credenciais inválidas!"));
        }
    }

    public record LoginRequest(String username, String password) {}

    public record TokenResponse(String token, String message) {}

    public record ErrorResponse(String error) {}
}