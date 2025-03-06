# Implementação de Autenticação JWT

Este documento descreve a implementação do sistema de autenticação JWT no backend da aplicação VetBov.

## Estrutura Implementada

1. **Módulo de Autenticação**
   - `AuthModule`: Configura o JWT e define os serviços e controladores de autenticação
   - `AuthService`: Implementa lógica de login, registro e validação de tokens
   - `AuthController`: Expõe endpoints para login, registro e verificação de token

2. **Estratégia JWT**
   - `JwtStrategy`: Define como extrair e validar tokens JWT
   - `JwtAuthGuard`: Protege rotas que requerem autenticação

3. **Controle de Acesso por Role**
   - `RolesGuard`: Implementa verificação de permissões baseada em roles
   - `Roles`: Decorador para definir as roles necessárias para cada rota

4. **Gerenciamento de Usuários**
   - Login com retorno de token JWT
   - Registro com retorno de token JWT
   - Alteração de senha
   - Recuperação de dados do usuário autenticado

## Endpoints Implementados

### Autenticação
- `POST /api/auth/login`: Autentica o usuário e retorna token JWT
- `POST /api/auth/register`: Registra novo usuário e retorna token JWT
- `GET /api/auth/verify`: Verifica se um token é válido

### Usuários
- `GET /api/users/me`: Retorna dados do usuário autenticado
- `POST /api/users/change-password`: Permite alterar a senha do usuário autenticado
- `GET /api/users`: Lista todos os usuários (protegido por role ADMIN)
- `GET /api/users/email/:email`: Busca usuário por email (protegido)
- `PATCH /api/users/email/:email`: Atualiza usuário (protegido)
- `DELETE /api/users/email/:email`: Remove usuário (protegido por role ADMIN)

## Estrutura do Token JWT

O token JWT contém as seguintes informações no payload:
- `sub`: ID do usuário
- `email`: Email do usuário
- `name`: Nome do usuário
- `role`: Role do usuário (ADMIN, USER, etc.)

## Configuração

As configurações do JWT estão no arquivo `.env`:
- `JWT_SECRET`: Chave secreta para assinar tokens
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: 24h)

## Proteção de Rotas

Para proteger uma rota com autenticação JWT:
```typescript
@UseGuards(JwtAuthGuard)
@Get('rota-protegida')
metodo() {
  // ...
}
```

Para proteger com verificação de role:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('rota-admin')
metodo() {
  // ...
}
```

Para acessar o usuário autenticado:
```typescript
@UseGuards(JwtAuthGuard)
@Get('perfil')
metodo(@CurrentUser() user) {
  return user;
}
``` 