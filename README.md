# Trama

Aplicação web de organização financeira.

## Recursos da interface

- Planejamento financeiro por mês, com receitas, despesas e valores a guardar.
- Cofre para organizar valores e metas.
- Cadastro visual de cartões e acompanhamento de faturas/parcelas.
- Backup e restauração dos dados em arquivo JSON.
- Lembretes no navegador enquanto a aplicação estiver aberta.

## Estrutura do projeto

Todos os arquivos necessários ficam na raiz. O CSS está consolidado em `style.css`, e os ícones/imagens ficam ao lado do HTML e do JavaScript para evitar dependências de pastas ao enviar os arquivos pelo navegador.

```text
Trama/
├── index.html
├── script.js
├── style.css                # CSS completo, sem imports locais
├── trama-simbolo.svg
├── trama-simbolo.png
├── trama-bau-flaticon.png
├── trama-bau-flat-azul.png
├── icone-moeda-azul-trama.png
├── CREDITS.md
├── README.md
├── .editorconfig
└── .gitignore
```

**Importante:** mantenha os arquivos na mesma pasta. O projeto não precisa de `styles/`, `images/`, React, Vite, npm ou uma etapa de compilação.

## Créditos

Consulte [`CREDITS.md`](CREDITS.md) para os créditos dos recursos visuais utilizados.
