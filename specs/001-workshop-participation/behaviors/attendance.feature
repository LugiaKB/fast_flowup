# language: pt
@participacao @US6
Funcionalidade: Registrar participantes do workshop
  Como administrador autenticado
  Quero manter a lista de presença
  Para publicar a participação correta

  @FR-024
  Cenário: Substituir integralmente a lista de participantes
    Dado que um workshop ativo possui participantes
    Quando envio uma nova lista de colaboradores ativos
    Então somente os colaboradores da nova lista permanecem associados

  @FR-025 @FR-026
  Cenário: Incluir participante de forma idempotente
    Dado que um colaborador ativo ainda não participa do workshop ativo
    Quando solicito sua inclusão duas vezes
    Então existe somente uma participação para o colaborador e workshop

  @FR-025 @FR-026
  Cenário: Remover participante de forma idempotente
    Dado que um colaborador participa do workshop ativo
    Quando solicito sua remoção duas vezes
    Então não existe participação visível para o colaborador e workshop

  @FR-027
  Cenário: Rejeitar colaborador arquivado
    Dado que um colaborador está arquivado
    Quando tento incluí-lo num workshop ativo
    Então a operação é rejeitada
    E as demais participações permanecem inalteradas

  @FR-027
  Cenário: Rejeitar alteração em workshop arquivado
    Dado que um workshop está arquivado
    Quando tento substituir sua lista de participantes
    Então a operação é rejeitada
    E as participações armazenadas permanecem inalteradas
