# Trama — v17.12.42

Aplicação web de organização financeira pessoal, feita com HTML, CSS e JavaScript.

## Recursos da interface

- Planejamento financeiro por mês, com receitas, despesas e valores a guardar.
- Cofre para organizar valores e metas.
- Cadastro visual de cartões e acompanhamento de faturas/parcelas.
- Temas e personalização visual.
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

## Abrir localmente

Abra `index.html` no navegador. Para testar comportamentos específicos de navegador, uma extensão como Live Server no VS Code pode servir os arquivos por HTTP local.

## Publicar no Vercel

Este pacote é um site estático sem etapa de compilação. Ao importar o repositório no Vercel, a raiz do projeto deve ser a pasta que contém `index.html`. Não configure `dist` ou `build` como pasta de saída, pois essas pastas não existem neste projeto. `style.css` já inclui os módulos CSS e não depende de diretórios auxiliares.

Depois de enviar os arquivos ao GitHub, confirme em **Deployments** que o Vercel concluiu a nova publicação.

## Dados e autenticação

- Os dados são salvos localmente no navegador por padrão (`localStorage`). A sincronização em nuvem depende de um ambiente compatível com os conectores já referenciados no código.
- O acesso por e-mail/senha é uma prévia local, não uma autenticação segura de produção.
- Os botões Google/Apple e a recuperação por e-mail ainda não estão conectados a provedores reais.
- Os lembretes do navegador exigem que a Trama esteja aberta, conforme indicado na interface.

Antes de usar com dados financeiros reais ou disponibilizar publicamente como serviço, conecte e teste um sistema de autenticação e armazenamento seguro apropriado.

## Créditos

Consulte [`CREDITS.md`](CREDITS.md) para os créditos dos recursos visuais utilizados.
