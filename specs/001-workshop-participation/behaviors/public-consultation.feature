# language: pt
@publico @US1 @US2
Funcionalidade: Consultar colaboradores e workshops
  Como visitante
  Quero pesquisar colaboradores e workshops ativos
  Para conhecer os eventos e suas participações

  @FR-001 @FR-002 @FR-003 @FR-008
  Cenário: Consultar colaboradores por nome
    Dado que existem colaboradores ativos chamados "Ana" e "Bruno"
    Quando pesquiso colaboradores por "Ana" com deslocamento 0 e limite 20
    Então vejo somente "Ana"
    E vejo o total, o deslocamento e o limite da consulta

  @FR-002 @FR-028
  Cenário: Pesquisa de colaboradores sem resultado
    Dado que nenhum colaborador ativo corresponde a "Inexistente"
    Quando concluo a pesquisa
    Então vejo o estado vazio de colaboradores
    E não vejo uma mensagem de falha

  @FR-004 @FR-005 @FR-006 @FR-008
  Cenário: Consultar workshops do mais recente para o mais antigo
    Dado que existem workshops ativos em trimestres diferentes
    Quando abro a listagem de workshops
    Então os workshops aparecem da realização mais recente para a mais antiga
    E posso pesquisar e paginar os resultados

  @FR-007
  Cenário: Abrir detalhes de workshop
    Dado que um workshop ativo possui participantes ativos
    Quando abro seus detalhes
    Então vejo nome, data, horário e descrição
    E vejo os participantes ativos

  @FR-007 @FR-016
  Cenário: Ocultar participante arquivado
    Dado que um participante do workshop foi arquivado
    Quando um visitante abre os detalhes do workshop
    Então o participante arquivado não aparece
    E sua participação continua armazenada

  @FR-028
  Esquema do Cenário: Comunicar o estado da consulta
    Dado que a consulta está no estado "<estado>"
    Quando a página apresenta o resultado
    Então vejo a comunicação "<comunicacao>"

    Exemplos:
      | estado       | comunicacao                         |
      | carregamento | conteúdo em carregamento            |
      | vazio        | nenhum resultado encontrado         |
      | sucesso      | resultados disponíveis              |
      | erro         | falha e ação para tentar novamente  |
