# Design System - Guia de Identidade Visual

## Visao Geral

Este design system combina elementos modernos de SaaS (FlowUp) com a solidez corporativa (FAST Solucoes), criando uma identidade visual que transmite **inovacao com credibilidade**.

---

## 1. Cores

### Paleta Principal

```css
/* Cores Primarias */
--primary: #6B4CFF;        /* Roxo vibrante - cor da marca */
--primary-hover: #5A3BDF;  /* Roxo mais escuro para hover */
--primary-light: #8B7AFF;  /* Roxo claro para fundos */

/* Cores Neutras */
--white: #FFFFFF;
--gray-50: #F9FAFB;        /* Fundo secundario */
--gray-100: #F3F4F6;       /* Bordas e divisores */
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;       /* Texto secundario */
--gray-600: #4B5563;
--gray-700: #374151;       /* Texto primario */
--gray-800: #1F2937;
--gray-900: #111827;       /* Titulos */
--black: #000000;

/* Cores de Destaque (opcional) */
--accent: #F97316;         /* Laranja para destaques */
--accent-hover: #EA580C;

/* Cores Funcionais */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Uso das Cores

| Elemento | Cor | Fundo |
|----------|-----|-------|
| **Botao primario** | --white | --primary |
| **Botao secundario** | --primary | --white (com border) |
| **Titulo H1-H3** | --gray-900 | --white |
| **Texto corpo** | --gray-700 | --white |
| **Texto secundario** | --gray-500 | --white |
| **Links** | --primary | --white |
| **Cards** | --gray-700 | --white |
| **Fundo pagina** | --gray-700 | --gray-50 |
| **Fundo secao** | --gray-700 | --white |
| **Bordas** | --gray-200 | --white |

---

## 2. Tipografia

### Fontes

```css
/* Fontes Principais */
--font-heading: 'Inter', 'Poppins', sans-serif;
--font-body: 'Inter', 'Roboto', sans-serif;
--font-mono: 'Fira Code', 'JetBrains Mono', monospace;
```

### Escala Tipografica

```css
/* Titulos */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */

/* Pesos */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Altura de linha */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Hierarquia

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| **H1 (Hero)** | --text-5xl | --font-bold | --gray-900 |
| **H2 (Secoes)** | --text-4xl | --font-bold | --gray-900 |
| **H3 (Subsecoes)** | --text-2xl | --font-semibold | --gray-900 |
| **H4 (Cards)** | --text-xl | --font-semibold | --gray-900 |
| **Body grande** | --text-lg | --font-normal | --gray-700 |
| **Body** | --text-base | --font-normal | --gray-700 |
| **Body pequeno** | --text-sm | --font-normal | --gray-500 |
| **Legenda** | --text-xs | --font-normal | --gray-500 |

---

## 3. Espacamento

### Sistema de Grid

```css
/* Container */
--container-max: 1200px;
--container-padding: 1.5rem;  /* 24px */

/* Espacamento vertical entre secoes */
--section-spacing: 5rem;      /* 80px */
--section-spacing-sm: 3rem;   /* 48px */

/* Espacamento interno de componentes */
--spacing-xs: 0.25rem;        /* 4px */
--spacing-sm: 0.5rem;         /* 8px */
--spacing-md: 1rem;           /* 16px */
--spacing-lg: 1.5rem;         /* 24px */
--spacing-xl: 2rem;           /* 32px */
--spacing-2xl: 3rem;          /* 48px */
--spacing-3xl: 4rem;          /* 64px */
```

### Layout

- **Container centralizado** com max-width de 1200px
- **Padding lateral** de 24px em mobile, 40px em desktop
- **Espacamento entre secoes** de 80px (5rem)
- **Espacamento entre elementos** dentro de secoes: 32px-48px

---

## 4. Componentes

### 4.1 Botoes

```css
/* Botao Primario */
.btn-primary {
  background: var(--primary);
  color: var(--white);
  padding: 0.75rem 1.5rem;    /* 12px 24px */
  border-radius: 0.5rem;      /* 8px */
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 76, 255, 0.3);
}

/* Botao Secundario */
.btn-secondary {
  background: var(--white);
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  border: 2px solid var(--primary);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary-light);
  border-color: var(--primary-hover);
}

/* Tamanhos */
.btn-sm { padding: 0.5rem 1rem; font-size: var(--text-sm); }
.btn-lg { padding: 1rem 2rem; font-size: var(--text-lg); }
```

### 4.2 Cards

```css
.card {
  background: var(--white);
  border-radius: 0.75rem;     /* 12px */
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--gray-100);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
}

/* Variacoes */
.card-flat {
  box-shadow: none;
  border: 1px solid var(--gray-200);
}

.card-elevated {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### 4.3 Inputs e Forms

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  color: var(--gray-700);
  background: var(--white);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107, 76, 255, 0.1);
}

.input::placeholder {
  color: var(--gray-400);
}

.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--spacing-xs);
}
```

### 4.4 Badges e Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-primary {
  background: var(--primary-light);
  color: var(--primary);
}

.badge-success {
  background: #D1FAE5;
  color: var(--success);
}

.badge-warning {
  background: #FEF3C7;
  color: var(--warning);
}
```

---

## 5. Elementos de Marca

### 5.1 Logo

- **Posicionamento:** Canto superior esquerdo do header
- **Tamanho minimo:** 120px de largura
- **Espacamento:** 24px das bordas
- **Versoes:** 
  - Primary: Logo completo (icon + wordmark)
  - Icon only: Para favicon e espacos pequenos
  - Monocromatica: Para fundos escuros

### 5.2 Iconografia

- **Estilo:** Line icons, minimalista
- **Espessura de stroke:** 1.5px - 2px
- **Tamanho padrao:** 20px, 24px, 32px
- **Cores:** 
  - Primary: --primary
  - Secondary: --gray-500
  - Inverted: --white

**Bibliotecas recomendadas:**
- Lucide Icons
- Heroicons
- Phosphor Icons

### 5.3 Ilustracoes (opcional)

- **Estilo:** Flat design moderno
- **Paleta:** Usar cores da marca com variacoes
- **Uso:** Hero sections, empty states, onboarding
- **Nao usar:** Clipart, fotos de banco de imagens genericas

---

## 6. Padroes de Layout

### 6.1 Header

```
┌────────────────────────────────────────────┐
│ [Logo]  [Nav]              [CTA Button]    │
└────────────────────────────────────────────┘
```

- **Altura:** 72px (desktop), 64px (mobile)
- **Fundo:** --white com border-bottom: 1px solid --gray-100
- **Posicionamento:** Sticky no topo
- **Padding:** 0 24px

### 6.2 Hero Section

```
┌────────────────────────────────────────────┐
│                                            │
│         [Headline H1 - 2-3 linhas]         │
│                                            │
│      [Subheadline - 1-2 frases]            │
│                                            │
│         [CTA Primary] [CTA Secondary]      │
│                                            │
│         [Imagem/Ilustracao]                │
│                                            │
└────────────────────────────────────────────┘
```

- **Padding:** 120px 0 (desktop), 80px 0 (mobile)
- **Fundo:** --white ou gradiente suave (--primary-light)
- **Alinhamento:** Centro ou esquerda (max 600px de largura de texto)

### 6.3 Secoes de Conteudo

```
┌────────────────────────────────────────────┐
│                                            │
│              [H2 - Titulo da Secao]        │
│                                            │
│         [Grid de Cards 2-3 colunas]        │
│                                            │
└────────────────────────────────────────────┘
```

- **Padding:** var(--section-spacing) 0
- **Fundo:** Alternar entre --white e --gray-50
- **Container:** Centralizado, max-width 1200px

### 6.4 Footer

```
┌────────────────────────────────────────────┐
│ [Logo]  [Links]  [Social]  [Contato]       │
│                                            │
│         [Copyright e infos legais]         │
└────────────────────────────────────────────┘
```

- **Padding:** 80px 0 40px 0
- **Fundo:** --gray-900
- **Texto:** --gray-300
- **Links:** --gray-300, hover: --white

---

## 7. Responsividade

### Breakpoints

```css
/* Mobile first */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Desktop grande */
--breakpoint-2xl: 1536px; /* Desktop extra grande */
```

### Diretrizes

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| **Container** | 100% - 48px | 100% - 48px | 1200px |
| **Grid cards** | 1 coluna | 2 colunas | 3 colunas |
| **H1** | 36px | 42px | 60px |
| **H2** | 28px | 32px | 48px |
| **Padding secoes** | 64px | 80px | 96px |
| **Botoes** | Full width | Auto | Auto |

---

## 8. Microinteracoes

### Transicoes

```css
/* Padrao para todos os elementos interativos */
.transition-default {
  transition: all 0.2s ease-in-out;
}

/* Hover em cards */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Hover em botoes */
.btn-hover {
  transition: background 0.2s ease, transform 0.2s ease;
}
```

### Estados

- **Hover:** Elevacao sutil + mudanca de cor
- **Active:** Scale down de 2-4%
- **Focus:** Outline de 2px na cor primaria
- **Disabled:** Opacity 0.5, cursor not-allowed

---

## 9. Acessibilidade

### Contraste

- **Texto normal:** Minimo 4.5:1 (WCAG AA)
- **Texto grande:** Minimo 3:1
- **Elementos UI:** Minimo 3:1

### Navegacao por Teclado

- Todos os elementos interativos devem ser focaveis
- Ordem de tab logica e visivel
- Focus states claros e visiveis

### ARIA

- Usar labels descritivos em botoes e inputs
- Implementar aria-expanded para menus
- Usar role apropriado para componentes customizados

---

## 10. Exemplo de Uso

### Pagina Inicial (Estrutura)

```html
<!-- Header -->
<header class="sticky top-0 bg-white border-b border-gray-100">
  <nav class="container mx-auto px-6 h-18 flex items-center justify-between">
    <!-- Logo, Links, CTA -->
  </nav>
</header>

<!-- Hero -->
<section class="py-30 bg-white">
  <div class="container mx-auto px-6">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">
      Transforme sua gestao de projetos
    </h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl">
      Automatize tarefas, acompanhe resultados e entregue no prazo.
    </p>
    <div class="flex gap-4">
      <button class="btn-primary">Comecar gratis</button>
      <button class="btn-secondary">Ver demo</button>
    </div>
  </div>
</section>

<!-- Features -->
<section class="py-24 bg-gray-50">
  <div class="container mx-auto px-6">
    <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
      Tudo que voce precisa
    </h2>
    <div class="grid md:grid-cols-3 gap-8">
      <!-- Cards de features -->
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-gray-300 py-20">
  <div class="container mx-auto px-6">
    <!-- Links, Logo, Copyright -->
  </div>
</footer>
```

---

## 11. Recursos e Ferramentas

### Desenvolvimento

- **Tailwind CSS:** Framework CSS utilitario
- **shadcn/ui:** Componentes baseados no design system
- **Radix UI:** Componentes acessiveis e sem estilo

### Testes

- **WebAIM Contrast Checker:** Verificar contraste de cores
- **Lighthouse:** Auditoria de acessibilidade
- **axe DevTools:** Testes de acessibilidade

---

## 12. Checklists

### Antes de Publicar

- [ ] Todas as cores tem contraste adequado
- [ ] Todos os botoes tem estados hover/focus/active
- [ ] Tipografia esta consistente em toda a aplicacao
- [ ] Espacamento segue o sistema definido
- [ ] Componentes estao responsivos
- [ ] Navegacao por teclado funciona
- [ ] Labels e ARIA attributes estao presentes
- [ ] Logo e marca estao aplicados corretamente

### Manutencao

- [ ] Novos componentes seguem o design system
- [ ] Alteracoes de cor sao testadas em todos os estados
- [ ] Documentacao esta atualizada
- [ ] Versoes do design system sao versionadas

---

## Referencias

- **FlowUp:** flowup.me - Inspiracao para modernidade e clareza
- **FAST Solucoes:** fastsolucoes.com.br - Inspiracao para autoridade e estrutura
- **shadcn/ui:** Componentes e padroes de UI
- **Tailwind UI:** Exemplos de layouts e componentes

