# Definição das telas e estados

**Fonte visual**: [`docs/design_system.md`](../../docs/design_system.md)

**Comportamentos**: [`behaviors/`](behaviors/)

## Rotas

| Rota | Acesso | Conteúdo | Ações autenticadas |
|---|---|---|---|
| `/` | Público | Redireciona para `/workshops` | Nenhuma |
| `/colaboradores` | Público | Busca, total, paginação e cards de colaboradores | Criar, editar, arquivar e restaurar |
| `/workshops` | Público | Busca, total, paginação e cards de workshops | Criar, editar, arquivar e restaurar |
| `/workshops/[id]` | Público | Dados do workshop e participantes ativos | Editar workshop e manter participantes |
| `/login` | Público | Formulário com nome de usuário e senha | Redireciona usuário autenticado |

Não haverá rota de cadastro, painel administrativo duplicado, landing page ou rota obrigatória de gráficos.

## Estrutura global

- Header sticky com 64px no mobile e 72px no desktop.
- Nome textual "Workshops FAST" no lugar de logo ou favicon de marca.
- Navegação para Workshops e Colaboradores; login ou logout no extremo oposto.
- Menu móvel acessível com `aria-expanded`, fechamento por Escape e retorno de foco.
- Container centralizado de no máximo 1200px, com 24px laterais no mobile e 40px no desktop.
- Poppins em títulos e Inter no corpo; fontes empacotadas pelo build e servidas localmente em runtime.
- Fundo geral `gray-50`, superfícies brancas, texto principal `gray-900`/`gray-700` e ação primária roxa.
- Alternador de tema no header com nome acessível e estado perceptível por texto/ícone.
- Tema inicial conforme `prefers-color-scheme`, escolha manual persistida e script anterior à hidratação
  para impedir flash; superfícies e textos usam tokens semânticos equivalentes nos dois temas.

## Listagens

- Campo de busca identificado, acionado com debounce curto e preservado durante paginação.
- Total de resultados anunciado após a consulta.
- Cards em uma coluna no mobile, duas no tablet e três no desktop.
- Cards mudam discretamente elevação, borda e posição no hover sem alterar o fluxo; a transição usa a
  duração/curva do design system e remove deslocamento com `prefers-reduced-motion`.
- Paginação anterior/próxima baseada em deslocamento e limite, com estado disabled correto.
- O filtro de status aparece somente autenticado e permite Ativos, Arquivados ou Todos.
- Controles administrativos permanecem ausentes do DOM para visitantes.

## Detalhe do workshop

- Cabeçalho com nome, badge de estado para administrador, data e intervalo 16h–17h.
- Descrição em seção própria e participantes ativos em cards compactos.
- Estado vazio específico quando não houver participantes visíveis.
- Administrador pode abrir o painel de edição ou o painel de participantes sem sair da página.
- No painel de participantes, o administrador pesquisa colaboradores ativos, mantém a seleção entre
  pesquisas, confirma remoções e vê inclusões, remoções ou substituições imediatamente após o sucesso.

## Formulários e ações

- Criar e editar usam painel lateral sobre Radix Dialog.
- O painel prende o foco, fecha por Escape, possui título e descrição e devolve o foco ao acionador.
- O painel entra e sai horizontalmente por `transform`, com animação curta e fluida; movimento reduzido
  elimina o deslizamento sem afetar abertura, fechamento ou gerenciamento de foco.
- Arquivar usa AlertDialog com nome do alvo, consequência, cancelar como ação inicial e confirmação explícita.
- Workshop exige data/hora válida, descrição, motivo de arquivamento e substituto opcional quando aplicável.
- O painel de edição também carrega os participantes atuais e usa a mesma seleção pesquisável da criação:
  apenas colaboradores ativos são opções, os associados são identificados textualmente e a seleção persiste
  entre buscas. Salvar executa primeiro os dados do workshop e, se a composição mudou, a substituição em lote;
  uma falha posterior mantém o painel aberto, explica a atualização parcial e recarrega o estado confirmado.
- Na criação de workshop, uma seleção múltipla permite pesquisar e escolher colaboradores ativos antes
  do envio; a seleção persiste entre pesquisas e informa a quantidade escolhida.
- Participantes podem ser substituídos em lote por seleção múltipla e ajustados individualmente.
- Participantes já associados não aparecem como candidatos individuais; carregamento e falha de pesquisa
  são comunicados, remoções usam confirmação e cada sucesso gera toast sem fechar o painel.
- O detalhe anuncia a quantidade atual e a atualiza junto com os cards após cada mutação confirmada.
- Validações aparecem junto ao campo e num resumo anunciado quando o envio falhar.

## Estados compartilhados

| Estado | Representação | Acessibilidade |
|---|---|---|
| Carregando | Skeletons com dimensões dos cards | Texto não visual `Carregando` e região `aria-busy` |
| Vazio | Título curto, explicação e ação aplicável | Não é anunciado como erro |
| Erro | Mensagem acionável e botão Tentar novamente | Região `role=alert` após falha |
| Sucesso | Conteúdo atualizado e toast breve | Toast em região `status` sem roubar foco |
| Salvando | Botão bloqueado e rótulo em progresso | `aria-disabled` e texto descritivo |

## Componentes do design system

- `Button`: primário, secundário, danger e tamanhos pequeno/padrão.
- `TextField`, `SearchField`, `Select` e seleção múltipla com label persistente.
- `Card`, `Badge`, `Pagination`, `Skeleton`, `EmptyState`, `ErrorState` e `Toast`.
- `Sheet` sobre Radix Dialog, `ConfirmDialog` sobre AlertDialog e menu sobre DropdownMenu.
- `ThemeToggle` usa preferência persistida, ícone Lucide e rótulo que anuncia o tema de destino.
- Ícones Lucide com 20px ou 24px; ícones decorativos ocultos da árvore acessível.
- Badges usam texto `gray-900` e combinam rótulo com ponto, ícone ou borda funcional; cor nunca atua sozinha.

## Responsividade e movimento

- Breakpoints mobile-first: 640, 768, 1024, 1280 e 1536px.
- Botões de formulário ocupam largura total no mobile e automática a partir do tablet.
- Painel lateral ocupa a viewport no mobile e largura limitada no desktop.
- Títulos reduzem conforme a escala responsiva do design system sem provocar overflow.
- Hover nunca é necessário para descobrir uma ação.
- `prefers-reduced-motion: reduce` remove deslocamentos e reduz transições não essenciais.
- Tema claro e escuro compartilham tokens funcionais; bordas, foco, overlays, estados e campos mantêm
  contraste mínimo sem depender de inversões automáticas do navegador.

## Critérios de validação visual

- Contraste mínimo 4,5:1 para texto normal, 3:1 para texto grande e componentes.
- Foco visível com outline de 2px e ordem de tabulação correspondente à leitura.
- Zoom de 200% não elimina conteúdo nem exige rolagem horizontal nas rotas principais.
- Fluxos críticos executáveis apenas por teclado.
- Auditoria automatizada com axe nas telas e Lighthouse no fluxo final.
