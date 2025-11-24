# 🧱 Dockerfile para o projeto EvControl (Spring Boot + Java 21 + PostgreSQL Neon)

# 1️⃣ Usa imagem base com JDK 21 (oficial da Eclipse Temurin)
FROM eclipse-temurin:21-jdk

# 2️⃣ Define o diretório de trabalho no container
WORKDIR /app

# 3️⃣ Copia arquivos do Maven Wrapper e o pom.xml
COPY mvnw .
COPY .mvn/ .mvn/
COPY pom.xml .

# 4️⃣ Faz download das dependências antes do código (acelera o build)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 5️⃣ Copia o código fonte para dentro do container
COPY src ./src

# 6️⃣ Compila o projeto e gera o .jar (ignorando testes)
RUN ./mvnw clean package -DskipTests

# 7️⃣ Expõe a porta padrão usada pelo Spring Boot
EXPOSE 8080

# 8️⃣ Define variáveis de ambiente (Render vai sobrescrever com as suas)
ENV SPRING_PROFILES_ACTIVE=prod

# 9️⃣ Executa o JAR gerado (de acordo com seu pom.xml)
CMD ["java", "-jar", "target/evcontrol-0.0.1-SNAPSHOT.jar"]