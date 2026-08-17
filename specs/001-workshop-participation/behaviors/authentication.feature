# language: pt
@autenticacao @US3
Funcionalidade: Autenticar administrador
  Como administrador
  Quero manter uma sessão renovável e revogável
  Para alterar dados com segurança

  @FR-010 @FR-012 @FR-013
  Cenário: Entrar com credenciais válidas
    Dado que o administrador inicial existe
    Quando informo as credenciais válidas
    Então uma sessão administrativa é iniciada
    E os controles de alteração aparecem nas telas públicas

  @FR-010 @FR-034
  Cenário: Rejeitar credenciais inválidas
    Dado que estou na tela de login
    Quando informo credenciais inválidas
    Então vejo uma mensagem genérica de autenticação inválida
    E nenhuma sessão é iniciada

  @FR-032
  Cenário: Restaurar acesso após recarregar a aplicação
    Dado que possuo renovação válida
    Quando recarrego a aplicação sem token de acesso em memória
    Então a sessão é renovada uma única vez
    E continuo autenticado

  @FR-033
  Cenário: Encerrar sessão
    Dado que estou autenticado
    Quando encerro a sessão
    Então a renovação atual é invalidada
    E os controles administrativos desaparecem

  @FR-033
  Cenário: Revogar sessões ao sincronizar nova senha
    Dado que existem sessões emitidas para o administrador
    Quando a senha configurada é alterada e sincronizada
    Então todas as renovações anteriores são invalidadas
    E a nova senha passa a autenticar o administrador

  @FR-011
  Cenário: Não oferecer cadastro público
    Dado que sou visitante
    Quando navego pela aplicação
    Então não encontro ação nem rota de cadastro de conta
