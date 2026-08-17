# Feature Specification: Rastreamento de Participação em Workshops

**Feature Directory**: `001-workshop-participation`

**Created**: 2026-08-16

**Status**: Draft

**Input**: Aplicação web para consulta pública e administração segura de workshops, colaboradores e
participações, seguindo o desafio técnico e as decisões aprovadas no planejamento.

## Clarifications

### Session 2026-08-16

- Q: Como o administrador mantém a sessão? → A: Acesso curto em memória e renovação rotativa por sete dias.
- Q: Como participantes são atualizados? → A: Substituição da lista e inclusão ou remoção individual.
- Q: Como o administrador inicial é mantido? → A: As credenciais de ambiente são sincronizadas na inicialização.
- Q: Onde ficam os controles administrativos? → A: Nas mesmas telas públicas, ocultos sem autenticação.
- Q: Como registros são excluídos? → A: Arquivamento lógico com listagem e restauração administrativa.
- Q: A periodicidade é uma regra? → A: Sim; quinta-feira, das 16h às 17h, um workshop ativo por trimestre.
- Q: Qual fuso rege a agenda? → A: `America/Recife`.
- Q: Como ocorre uma substituição? → A: O anterior é arquivado manualmente antes da criação do substituto.
- Q: Como o histórico de substituição é preservado? → A: Evento com motivo padronizado e substituto opcional.
- Q: Como as listagens são navegadas? → A: Busca textual e paginação por deslocamento e limite.
- Q: O que acontece com participações de colaborador arquivado? → A: Permanecem armazenadas, mas ficam ocultas.
- Q: Qual padrão visual rege o produto? → A: `docs/design_system.md`, sem logo na primeira versão.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar colaboradores (Priority: P1)

Como visitante, quero consultar e pesquisar colaboradores ativos para conhecer as pessoas que podem
participar dos workshops.

**Why this priority**: A lista de colaboradores é uma entrega principal e pode ser validada sem qualquer
função administrativa.

**Independent Test**: Abrir a listagem pública, pesquisar por parte de um nome e navegar pelos resultados.

**Acceptance Scenarios**:

1. **Given** que existem colaboradores ativos, **When** o visitante abre a listagem, **Then** os nomes são
   exibidos em ordem alfabética com o total e os controles de paginação.
2. **Given** uma pesquisa informada, **When** há nomes correspondentes, **Then** somente os resultados
   correspondentes são apresentados.
3. **Given** que nenhum colaborador corresponde ao filtro, **When** a consulta termina, **Then** um estado
   vazio claro é exibido sem tratar a situação como erro.

---

### User Story 2 - Explorar workshops e participantes (Priority: P2)

Como visitante, quero consultar workshops e abrir seus detalhes para conhecer tema, data, descrição e
participantes ativos.

**Why this priority**: Esta jornada entrega o objetivo central de rastrear a participação nos eventos.

**Independent Test**: Navegar da lista de workshops para um detalhe e verificar os participantes exibidos.

**Acceptance Scenarios**:

1. **Given** que existem workshops ativos, **When** o visitante abre a listagem, **Then** eles aparecem da
   data mais recente para a mais antiga.
2. **Given** um workshop da lista, **When** o visitante abre seus detalhes, **Then** nome, data, horário,
   descrição e participantes ativos são exibidos.
3. **Given** um workshop sem participantes visíveis, **When** o detalhe é exibido, **Then** a página informa
   que ainda não há participantes.

---

### User Story 3 - Autenticar administrador (Priority: P3)

Como administrador, quero entrar e sair com credenciais válidas para acessar as ações de manutenção sem
expor essas ações a visitantes.

**Why this priority**: Toda alteração depende de uma identidade administrativa válida.

**Independent Test**: Entrar, recarregar a aplicação, confirmar a sessão renovada e sair.

**Acceptance Scenarios**:

1. **Given** credenciais válidas, **When** o administrador entra, **Then** as ações administrativas aparecem.
2. **Given** credenciais inválidas, **When** o login é enviado, **Then** uma mensagem genérica é exibida e
   nenhuma sessão é criada.
3. **Given** uma sessão renovável válida, **When** a aplicação é recarregada, **Then** o acesso é restaurado.
4. **Given** uma sessão ativa, **When** o administrador sai, **Then** as ações são ocultadas e a renovação é
   invalidada.

---

### User Story 4 - Administrar colaboradores (Priority: P4)

Como administrador autenticado, quero criar, editar, arquivar e restaurar colaboradores para manter o
cadastro sem apagar o histórico armazenado.

**Why this priority**: Participações dependem de um cadastro confiável de colaboradores.

**Independent Test**: Criar um colaborador, alterar seu nome, arquivá-lo, encontrá-lo entre os inativos e
restaurá-lo.

**Acceptance Scenarios**:

1. **Given** um nome válido, **When** o administrador cria um colaborador, **Then** ele aparece na listagem.
2. **Given** um colaborador existente, **When** o administrador edita o nome, **Then** o valor atualizado é
   exibido após a confirmação.
3. **Given** confirmação explícita, **When** o administrador arquiva um colaborador, **Then** ele desaparece
   das consultas públicas sem perder suas associações armazenadas.
4. **Given** um colaborador arquivado, **When** o administrador o restaura, **Then** ele volta às consultas
   públicas e às participações relacionadas.

---

### User Story 5 - Administrar workshops (Priority: P5)

Como administrador autenticado, quero criar, editar, arquivar, substituir e restaurar workshops para
manter a agenda trimestral e seu histórico.

**Why this priority**: A gestão dos eventos sustenta as consultas e o registro de participação.

**Independent Test**: Criar um workshop válido, editar seus dados, arquivá-lo com motivo e restaurá-lo.

**Acceptance Scenarios**:

1. **Given** uma quinta-feira às 16h em trimestre livre, **When** o administrador cria o workshop, **Then**
   ele é disponibilizado publicamente.
2. **Given** data, horário ou trimestre inválidos, **When** a alteração é enviada, **Then** ela é rejeitada com
   uma explicação acionável.
3. **Given** um workshop ativo, **When** o administrador o arquiva com motivo, **Then** ele deixa de ser
   público e um evento de arquivamento é preservado.
4. **Given** um workshop arquivado sem conflito ativo, **When** o administrador o restaura, **Then** ele volta
   a ser público.
5. **Given** um workshop arquivado para substituição, **When** o substituto é criado no mesmo trimestre,
   **Then** a relação entre os dois é registrada.

---

### User Story 6 - Registrar participações (Priority: P6)

Como administrador autenticado, quero definir os colaboradores presentes em cada workshop para que os
detalhes públicos reflitam a participação registrada.

**Why this priority**: Esta jornada completa o relacionamento principal do domínio.

**Independent Test**: Substituir a lista de participantes, incluir um colaborador e remover outro.

**Acceptance Scenarios**:

1. **Given** colaboradores ativos válidos, **When** o administrador substitui a lista, **Then** a nova lista
   passa a ser a fonte integral da participação.
2. **Given** um colaborador ainda não associado, **When** ele é incluído, **Then** a operação é concluída uma
   vez mesmo se repetida.
3. **Given** um participante associado, **When** ele é removido, **Then** deixa de aparecer nos detalhes.
4. **Given** um colaborador arquivado, **When** uma inclusão é tentada, **Then** a operação é rejeitada sem
   alterar as demais participações.

### Edge Cases

- Uma página iniciada além do total retorna lista vazia e preserva os metadados da consulta.
- Limites ausentes usam o padrão; limites acima do máximo são rejeitados ou normalizados de modo documentado.
- Consultas sem correspondência exibem estado vazio; falhas reais exibem estado de erro com nova tentativa.
- Um workshop arquivado não é encontrado por visitantes, mas continua disponível na visão administrativa.
- Restaurar um workshop quando já existe outro ativo no trimestre resulta em conflito e não altera dados.
- Mover um workshop para trimestre ocupado resulta em conflito e preserva os dados anteriores.
- A criação de substituto rejeita referência a workshop ativo, inexistente ou de outro trimestre.
- Participações duplicadas não criam registros duplicados.
- Arquivar colaborador não apaga participações; restaurá-lo torna essas participações visíveis novamente.
- Expiração de acesso tenta uma única renovação; falha de renovação encerra a sessão sem loop de requisições.
- Alterar a senha configurada do administrador invalida sessões anteriores.
- Ações destrutivas exigem confirmação e continuam acessíveis por teclado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir consulta pública de colaboradores ativos.
- **FR-002**: A consulta de colaboradores MUST aceitar pesquisa textual, deslocamento e limite.
- **FR-003**: Colaboradores MUST ser ordenados alfabeticamente por nome.
- **FR-004**: O sistema MUST permitir consulta pública de workshops ativos.
- **FR-005**: A consulta de workshops MUST aceitar pesquisa textual, deslocamento e limite.
- **FR-006**: Workshops MUST ser ordenados da realização mais recente para a mais antiga.
- **FR-007**: O detalhe público MUST exibir nome, realização, descrição e participantes ativos.
- **FR-008**: Todas as consultas paginadas MUST informar itens, total, deslocamento e limite.
- **FR-009**: Consultas públicas MUST funcionar sem autenticação.
- **FR-010**: O sistema MUST autenticar exclusivamente o administrador provisionado pelo ambiente.
- **FR-011**: O sistema MUST NOT oferecer cadastro público ou gestão pública de contas.
- **FR-012**: Ações de criação, edição, arquivamento, restauração e participação MUST exigir administrador.
- **FR-013**: Controles administrativos MUST permanecer ausentes da interface de visitantes.
- **FR-014**: O administrador MUST poder criar e editar colaboradores com nome não vazio.
- **FR-015**: O administrador MUST poder arquivar e restaurar colaboradores.
- **FR-016**: Arquivar colaborador MUST preservar suas participações armazenadas e ocultá-las publicamente.
- **FR-017**: O administrador MUST poder criar e editar nome, realização e descrição de workshops.
- **FR-018**: Um workshop válido MUST ocorrer numa quinta-feira às 16h no fuso `America/Recife`; o término
  é às 17h.
- **FR-019**: Somente um workshop ativo MUST existir por trimestre civil.
- **FR-020**: O administrador MUST poder arquivar workshop informando motivo Manual ou Substituição.
- **FR-021**: Cada arquivamento de workshop MUST preservar data, responsável, motivo e substituto opcional.
- **FR-022**: Um substituto MUST referenciar um workshop previamente arquivado do mesmo trimestre.
- **FR-023**: Restaurar workshop MUST falhar sem alteração quando houver conflito no trimestre.
- **FR-024**: O administrador MUST poder substituir integralmente a lista de participantes.
- **FR-025**: O administrador MUST poder incluir ou remover um participante individualmente.
- **FR-026**: Operações individuais de participação MUST ser idempotentes.
- **FR-027**: Somente colaboradores e workshops ativos MUST aceitar novas participações.
- **FR-028**: A interface MUST apresentar estados distintos de carregamento, vazio, sucesso e erro.
- **FR-029**: Todas as jornadas MUST ser operáveis por teclado, com foco visível e nomes acessíveis.
- **FR-030**: Informação de estado MUST NOT depender exclusivamente de cor.
- **FR-031**: A interface MUST adaptar navegação, listagens, formulários e ações a mobile, tablet e desktop.
- **FR-032**: A sessão MUST sobreviver a recargas enquanto sua renovação continuar válida.
- **FR-033**: Encerrar sessão ou sincronizar nova senha administrativa MUST invalidar renovações anteriores.
- **FR-034**: O sistema MUST apresentar erros de validação, ausência, conflito e autorização de forma uniforme.
- **FR-035**: Dados MUST permanecer disponíveis após reinicialização do serviço.
- **FR-036**: O comportamento funcional MUST ser equivalente nas duas configurações de banco suportadas.
- **FR-037**: Para cada arquivo de configuração de ambiente ou configuração local excluído do
  versionamento, o projeto MUST manter um exemplo rastreado que identifique o arquivo de destino,
  documente todas as chaves suportadas, diferencie valores obrigatórios e opcionais e use somente
  placeholders seguros.

### Key Entities

- **Colaborador**: Pessoa identificada por ID e nome, com estado ativo ou arquivado e participações preservadas.
- **Workshop**: Evento identificado por ID, nome, realização e descrição, sujeito à agenda trimestral e
  ao estado ativo ou arquivado.
- **Participação**: Associação única entre colaborador e workshop indicando presença.
- **Administrador**: Identidade provisionada que possui permissão exclusiva para alterar dados.
- **Sessão administrativa**: Acesso curto e renovação revogável associados ao administrador.
- **Evento de arquivamento**: Registro histórico de arquivamento de workshop com motivo, responsável,
  instante, restauração e substituto opcional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitantes concluem cada consulta principal em no máximo três interações a partir do header.
- **SC-002**: Em condições locais normais, 95% das consultas exibem resultado ou estado vazio em até dois segundos.
- **SC-003**: 100% das ações de alteração ficam ocultas para visitantes e são rejeitadas sem autorização válida.
- **SC-004**: Um administrador conclui criação, edição, arquivamento e restauração de cada cadastro em até
  dois minutos por operação.
- **SC-005**: 100% dos cenários críticos documentados podem ser concluídos apenas com teclado.
- **SC-006**: Todas as combinações de texto e controle verificadas atingem contraste WCAG AA.
- **SC-007**: A mesma suíte de comportamento passa nas duas configurações de persistência suportadas.
- **SC-008**: Nenhuma credencial real, token, chave privada ou banco local aparece entre os arquivos versionados.
- **SC-009**: Uma instalação nova cria exatamente um administrador e inicializações seguintes não duplicam a conta.
- **SC-010**: Após a integração, todas as jornadas antes executadas com dados controlados produzem os mesmos
  resultados observáveis com dados reais.
- **SC-011**: 100% dos arquivos locais de ambiente ou configuração referenciados pelos fluxos do projeto
  possuem um exemplo rastreado que permite preparar o arquivo sem deduzir nomes de chaves ou incluir
  credenciais reais.

## Assumptions

- O volume inicial é compatível com listagens paginadas de até milhares de colaboradores e workshops.
- Nomes não são usados como identificadores únicos; a identidade é o ID atribuído pelo sistema.
- A duração do workshop é fixa em uma hora e não precisa ser armazenada separadamente.
- Pesquisas textuais ignoram diferenças entre maiúsculas e minúsculas.
- O design system versionado é a referência visual; requisitos de acessibilidade prevalecem sobre exemplos
  de combinação de cores que não atinjam o contraste mínimo.
- A primeira versão não inclui logo, landing page, cadastro público, gestão de administradores, importação,
  exportação, notificações ou gráficos.
- Gráficos de participação podem ser adicionados somente após todos os critérios obrigatórios estarem completos.
