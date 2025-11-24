package com.evcontrol.evcontrol.infra.config;

import com.evcontrol.evcontrol.domain.usuario.Usuario;
import com.evcontrol.evcontrol.domain.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String usernameDeTeste = "hugo";

        System.out.println("=== INICIALIZADOR DE DADOS ===");
        System.out.println("Verificando se usuário existe: " + usernameDeTeste);

        if (usuarioRepository.findByUsername(usernameDeTeste).isEmpty()) {
            Usuario novoUsuario = new Usuario();
            novoUsuario.setUsername(usernameDeTeste);

            String senhaSimples = "112233";
            String senhaCriptografada = passwordEncoder.encode(senhaSimples);
            novoUsuario.setPassword(senhaCriptografada);

            usuarioRepository.save(novoUsuario);

            System.out.println(">>> USUÁRIO CRIADO COM SUCESSO <<<");
            System.out.println(">>> Username: " + usernameDeTeste);
            System.out.println(">>> Senha: " + senhaSimples);
            System.out.println(">>> Senha criptografada: " + senhaCriptografada);
            System.out.println("================================");
        } else {
            System.out.println(">>> Usuário '" + usernameDeTeste + "' já existe no banco de dados.");
            System.out.println("================================");
        }
    }
}