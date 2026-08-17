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

  @FR-043
  Cenário: Criar workshop com participantes
    Dado que estou criando um workshop em trimestre válido
    E pesquiso e seleciono colaboradores ativos sem duplicidade
    Quando concluo a criação
    Então o workshop e as participações são criados juntos
    E o detalhe apresenta imediatamente a lista e a quantidade selecionadas

  @FR-041 @FR-042 @FR-044
  Cenário: Editar workshop e sua composição de participantes no mesmo painel
    Dado que um workshop ativo já possui participantes
    Quando abro seu painel de edição
    Então a composição atual é carregada e seus participantes são identificados
    Quando pesquiso colaboradores ativos, incluo um e removo outro
    Então a seleção permanece consistente sem duplicidades
    Quando confirmo a edição
    Então os dados e a lista confirmados são recarregados e apresentados juntos

  @FR-044
  Cenário: Informar falha parcial ao editar dados e participantes
    Dado que a atualização dos dados do workshop foi concluída
    E a substituição da lista de participantes falha
    Quando a falha é recebida
    Então o painel permanece aberto com uma explicação da atualização parcial
    E o estado confirmado é recarregado antes de uma nova tentativa

  @FR-043 @FR-027
  Cenário: Rejeitar participante inválido durante a criação
    Dado que a criação referencia um colaborador arquivado, inexistente ou repetido
    Quando tento criar o workshop
    Então toda a operação é rejeitada
    E nenhum workshop ou participação é criado

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
