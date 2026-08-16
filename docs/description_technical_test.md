# Desafio FastEstágio — Pessoa Desenvolvedora Full Stack

## Desafio: Rastreamento de Participação em Workshops

Na FAST Soluções, trimestralmente, sempre às quintas-feiras, das 16h às 17h, é realizado um workshop sobre algum tema relacionado ao desenvolvimento de software.

Esses eventos são oportunidades para nossos colaboradores aprenderem de forma descontraída e saírem um pouco da rotina. Apesar da presença opcional, a maioria dos colaboradores comparece.

Recentemente, o comitê responsável pela organização desses workshops expressou o desejo de aprofundar sua compreensão sobre os eventos, buscando informações mais detalhadas.

Com o objetivo de atender a essa demanda, a proposta é utilizar métricas geradas para construir uma interface web. Essa interface terá a capacidade de listar de maneira abrangente:

- Os detalhes de cada workshop.
- As atas de presença.
- A participação dos colaboradores.

Essa abordagem permitirá uma análise mais aprofundada e eficaz dos eventos, proporcionando insights valiosos para o aprimoramento contínuo de nossas iniciativas.

## Desafio 1ª — Etapa Backend

O trabalho consiste em desenvolver uma API REST em C# para listar os detalhes dos workshops e a presença dos colaboradores.

### Requisitos funcionais

Crie uma API REST obedecendo às regras abaixo.

### Definições

Considere que o colaborador possui as seguintes propriedades: `Id` e `Nome`.

```csharp
Colaborador (int Id, string Nome);
```

Considere que o workshop possui as seguintes propriedades:

- `Id`.
- `Nome`.
- `DataRealizacao`.
- `Descricao`.

### Processamento de atas

Implemente o CRUD completo dos seguintes endpoints:

- `/api/workshops`
- `/api/colaboradores`

### Bônus — opcional

#### Banco de dados

Adicione um mecanismo simples de persistência de dados para armazenar informações sobre:

- As atas de presença.
- Os workshops.
- Os colaboradores.

Utilize um banco de dados relacional, como MySQL ou SQL Server.

#### Autenticação e autorização

Adicione autenticação e autorização aos endpoints da API.

#### Documentação da API

Utilize o Swagger para documentar os endpoints da API.

## Desafio 2ª — Etapa Frontend

O trabalho consiste em desenvolver uma aplicação em JavaScript para analisar e rastrear a participação dos colaboradores nos workshops trimestrais da FAST Soluções.

### Requisitos funcionais

Crie uma interface web obedecendo às regras a seguir.

### Definições

Crie um mock considerando o modelo de classes abaixo.

Considere que o colaborador possui as seguintes propriedades: `Id` e `Nome`.

```csharp
Colaborador (int Id, string Nome);
```

Considere que o workshop possui as seguintes propriedades:

- `Id`.
- `Nome`.
- `DataRealizacao`.
- `Descricao`.
- Lista de colaboradores que participaram.

```csharp
Workshop (int Id, string Nome, DateTime DataRealizacao, string Descricao);
```

### Telas

1. **Primeira tela:** visualização da lista de todos os colaboradores.
2. **Segunda tela:** visualização da lista de todos os workshops.

### Detalhes da tela de workshops

Ao clicar no nome de um workshop na lista, exiba os detalhes do evento, incluindo a lista de colaboradores presentes.

### Bônus — opcional

#### Integração com o backend

Integre o frontend com o backend desenvolvido.

#### Gráficos de participação

Crie gráficos visuais para representar a participação dos colaboradores nos workshops ao longo do tempo.

### Dicas

- Crie um gráfico de barras que indique a quantidade de workshops dos quais determinado colaborador participou.
- Crie um gráfico de pizza que indique a quantidade de colaboradores por workshop.

## Critérios de avaliação

- **Funcionalidade:** o backend deve atender aos requisitos especificados.
- **Estrutura do código:** o código deve ser organizado, modular e seguir as melhores práticas de Clean Code.
- **Estilo e layout:** a interface da aplicação deve ser intuitiva, responsiva e agradável.
- **Bônus:** a implementação de recursos opcionais será considerada como um diferencial.

## Instruções

- Disponibilize uma API REST com os endpoints requisitados.
- Submeta o código em um repositório no GitHub.
- Forneça as instruções necessárias para executar o projeto localmente.
