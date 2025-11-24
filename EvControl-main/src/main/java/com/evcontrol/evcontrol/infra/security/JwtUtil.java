package com.evcontrol.evcontrol.infra.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Key SECRET_KEY = Keys.hmacShaKeyFor("umaChaveSecretaMuitoSeguraParaJWT123".getBytes());
    private static final long EXPIRATION_TIME = 86400000;

    public String gerarToken(String username) {
        System.out.println("🔑 Gerando token para usuário: " + username);

        return Jwts.builder()
                .setSubject(username)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validarToken(String token) {
        System.out.println("✅ Validando token...");

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token.replace("Bearer ", ""))
                    .getBody();

            return claims.getSubject();
        } catch (Exception e) {
            System.out.println("❌ Token inválido!");
            return null;
        }
    }
}