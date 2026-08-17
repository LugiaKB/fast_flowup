# language: pt
@administracao @US4 @US5
Funcionalidade: Administrar colaboradores e workshops
  Como administrador autenticado
  Quero manter cadastros sem apagar o histórico
  Para conservar dados públicos corretos

  @FR-014
  Cenário: Criar e editar colaborador
    Dado que estou autenticado
    Quando crio um colaborador com nome válido e depois altero seu nome
    Então o colaborador ativo aparece com o nome atualizado

  @FR-015 @FR-016
  Cenário: Arquivar e restaurar colaborador
    Dado que um colaborador ativo possui participações
    Quando confirmo seu arquivamento
    Então ele deixa de aparecer publicamente
    Quando restauro o colaborador
    Então ele e suas participações voltam a aparecer

  @FR-017 @FR-018 @FR-019
  Cenário: Criar workshop em horário e trimestre válidos
    Dado que o trimestre não possui workshop ativo
    E escolhi uma quinta-feira às 16h no fuso America/Recife
    Quando crio o workshop
    Então ele fica disponível publicamente
    E seu término é apresentado às 17h

  @FR-018 @FR-034
  Esquema do Cenário: Rejeitar agenda inválida
    Dado que estou criando um workshop
    Quando informo "<agenda>"
    Então a alteração é rejeitada sem criar workshop
    E vejo a explicação "<motivo>"

    Exemplos:
      | agenda                        | motivo                    |
      | quarta-feira às 16h           | dia deve ser quinta-feira |
      | quinta-feira às 15h           | horário deve ser 16h      |
      | trimestre com workshop ativo  | trimestre já ocupado      |

  @FR-020 @FR-021
  Cenário: Arquivar workshop com motivo
    Dado que existe um workshop ativo
    Quando confirmo o arquivamento com motivo Manual
    Então o workshop deixa de aparecer publicamente
    E o evento registra motivo, data e responsável

  @FR-020 @FR-021 @FR-022
  Cenário: Criar substituto de workshop arquivado
    Dado que arquivei manualmente um workshop com motivo Substituição
    Quando crio outro workshop no mesmo trimestre indicando o anterior
    Então o novo workshop fica ativo
    E o evento anterior aponta para o substituto

  @FR-023
  Cenário: Impedir restauração com conflito trimestral
    Dado que um workshop arquivado pertence a um trimestre ocupado por outro ativo
    Quando tento restaurar o workshop arquivado
    Então recebo um conflito
    E nenhum dos dois workshops é alterado
