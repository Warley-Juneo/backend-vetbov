# Protocolo de Inseminação e Diagnóstico de Vacas - VetBov

## Fluxo de Trabalho

O sistema VetBov implementa um fluxo de trabalho específico para o protocolo de inseminação e diagnóstico de vacas, dividido em quatro etapas principais:

### 1. D0 - Diagnóstico Inicial

* **Objetivo**: Realizar o diagnóstico inicial do animal e classificá-lo como gestante, solteira, parida ou descarte.
* **Ações**: 
  * Classificação de cada animal
  * Definição de quais animais prosseguirão no protocolo
  * Registro de observações relevantes

### 2. D8 - Aplicação do Implante

* **Objetivo**: Aplicar o implante nos animais selecionados no D0.
* **Ações**:
  * Aplicação do implante
  * Marcação de quais animais do D0 estavam presentes (com um "X")
  * Registro de observações relevantes

### 3. D11 - Retirada do Implante

* **Objetivo**: Retirar o implante aplicado no D8.
* **Ações**:
  * Remoção do implante
  * Marcação de quais animais estavam presentes (com um "X")
  * Registro de observações relevantes

### 4. DG - Diagnóstico de Gestação

* **Objetivo**: Verificar quais animais ficaram gestantes.
* **Ações**:
  * Classificação dos animais como gestantes ou não gestantes
  * Atualização do status do animal
  * Registro de observações relevantes

## API Endpoints

### Endpoints Básicos

* `GET /protocols` - Lista todos os protocolos (com filtros)
* `GET /protocols/:id` - Obtém detalhes de um protocolo específico
* `POST /protocols` - Cria um novo protocolo
* `PATCH /protocols/:id` - Atualiza um protocolo existente
* `DELETE /protocols/:id` - Remove um protocolo

### Endpoints Específicos do Fluxo

* `POST /protocols/d0` - Cria um novo protocolo D0 (inicia um ciclo)
* `POST /protocols/d8/:cycleId` - Cria um protocolo D8 para um ciclo específico
* `POST /protocols/d11/:cycleId` - Cria um protocolo D11 para um ciclo específico
* `POST /protocols/dg/:cycleId` - Cria um protocolo DG para um ciclo específico
* `GET /protocols/cycle/:cycleId` - Obtém todos os protocolos de um ciclo específico
* `GET /protocols/farm/:farmId/cycles` - Obtém todos os ciclos de uma fazenda
* `POST /protocols/cycle` - Inicia um ciclo completo (cria automaticamente todos os protocolos D0)

## Exemplos de Uso

### Iniciando um Ciclo

```json
POST /protocols/cycle
{
  "farmId": "farm-uuid",
  "animalIds": ["animal1-uuid", "animal2-uuid", "animal3-uuid"],
  "startDate": "2025-03-05T00:00:00.000Z",
  "technician": "Dr. João Silva"
}
```

### Registrando Presença no D8

```json
POST /protocols/d8/cycle-12345
{
  "animalId": "animal1-uuid",
  "farmId": "farm-uuid",
  "date": "2025-03-13T00:00:00.000Z",
  "presence": true,
  "observations": "Implante aplicado com sucesso"
}
```

### Atualizando o Status de um Animal após DG

```json
PATCH /animals/animal1-uuid
{
  "cattleStatus": "GESTANTE",
  "observations": "Diagnóstico de gestação positivo"
}
```

## Estrutura de Dados

### Protocol (Protocolo)

* `id`: Identificador único
* `date`: Data do protocolo
* `type`: Tipo do protocolo (D0, D8, D11, DG)
* `animalId`: ID do animal relacionado
* `farmId`: ID da fazenda
* `technician`: Nome do técnico responsável
* `observations`: Observações gerais
* `result`: Resultado do protocolo (GESTANTE, NAO_GESTANTE, PARIDA, SOLTEIRA, DESCARTE, EM_ANDAMENTO)
* `presence`: Presença confirmada (para D8 e D11)
* `cycleId`: Identificador do ciclo (agrupa protocolos relacionados)
* `nextProtocolDate`: Data prevista para o próximo protocolo

### Animal

* `id`: Identificador único
* `identifier`: Código ou brinco do animal
* `name`: Nome do animal (opcional)
* `breed`: Raça (opcional)
* `birthDate`: Data de nascimento (opcional)
* `weight`: Peso (opcional)
* `cattleStatus`: Status da vaca (PARIDA, SOLTEIRA, GESTANTE, DESCARTE)
* `status`: Status de saúde (HEALTHY, SICK, TREATING, DECEASED)
* `observations`: Observações gerais 