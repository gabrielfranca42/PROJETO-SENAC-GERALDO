# Contribuição e Controle de Branches

## Objetivo

Este documento define um padrão simples de contribuição para o projeto, com foco em organização das alterações, controle de branches e padronização dos commits.

## Estratégia de Branches

A branch principal do projeto é:

- `main` → versão principal e estável do projeto

As novas alterações devem ser feitas em branches separadas, seguindo os padrões abaixo:

- `feature/nome-da-feature` → novas funcionalidades ou melhorias
- `fix/nome-do-ajuste` → correções de erros
- `docs/nome-do-ajuste` → alterações de documentação
- `ci/nome-do-ajuste` → ajustes relacionados à integração contínua
- `chore/nome-do-ajuste` → tarefas técnicas e manutenção interna

## Fluxo de contribuição

1. Criar uma nova branch a partir da `main`
2. Realizar as alterações necessárias
3. Fazer commits com mensagens padronizadas
4. Enviar a branch para o repositório remoto
5. Abrir um Pull Request para revisão e integração

## Exemplo de criação de branch

```bash
git checkout -b feature/devops-backend

```