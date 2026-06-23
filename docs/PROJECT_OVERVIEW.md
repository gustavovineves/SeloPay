# Visão Geral do Projeto — SeloPay

## O problema

Acordos informais entre pessoas — empréstimos, prestações de serviço, parcelamentos, freelances — são extremamente comuns, mas raramente documentados. Isso gera:

- Conflitos sobre o que foi combinado
- Inadimplência sem evidência
- Perda de confiança em relacionamentos pessoais e profissionais
- Dificuldade de cobrança informal
- Risco para quem paga antecipado ou entrega antes de receber

## A solução

O SeloPay oferece uma infraestrutura digital leve para:

1. **Registrar** o acordo com partes, valor, prazo e descrição
2. **Proteger** o valor por meio de garantia simulada (escrow)
3. **Confirmar** mutuamente o cumprimento antes de liberar o dinheiro
4. **Contestar** com envio de evidências se algo der errado
5. **Resolver** disputas com análise administrativa
6. **Rastrear** reputação de cada participante ao longo do tempo

## Contexto acadêmico

O SeloPay é o projeto de TCC de Ciência da Computação. Seu objetivo é demonstrar a viabilidade técnica de uma plataforma de confiança digital usando tecnologias modernas e arquitetura de produção — ainda que todos os componentes financeiros sejam simulados.

**Não é** um produto financeiro real. **Não** movimenta dinheiro real. **Não** tem registro em órgão regulador.

## Atores do sistema

| Ator | Papel |
|------|-------|
| **Pagador** | Cria o acordo, deposita a garantia, confirma o cumprimento |
| **Recebedor** | Aceita ou recusa o acordo, confirma o recebimento |
| **Administrador** | Analisa disputas e registra decisões no painel admin |

## Tipos de acordo

### Acordo simples

Registro digital de um compromisso sem bloqueio financeiro. Útil para compromissos de serviço, prazos e obrigações não financeiras. Afeta histórico e reputação.

### Acordo com garantia (principal)

O pagador deposita o valor combinado, que fica bloqueado até que ambas as partes confirmem o cumprimento. Três fontes disponíveis:

- **Carteira interna:** desconta do saldo disponível
- **Pix simulado:** simula um pagamento externo via QR Code fictício
- **Cartão virtual SeloPay:** bloqueia o limite do cartão interno

## Ciclo de vida do acordo

```
RASCUNHO (opcional)
     │
AGUARDANDO ACEITE ──(1h sem resposta)──► EXPIRADO
     │
     ├─(recusa)──► REJEITADO
     │
     ▼
AGUARDANDO DEPÓSITO
     │
     ▼
ATIVO ────────────────────────────────► CONCLUÍDO
     │                                   (dupla confirmação)
     ├─(contestação)──► EM DISPUTA
     │                       │
     │                  (admin decide)
     │                       ├──► CONCLUÍDO
     │                       └──► CANCELADO
     │
     └─(renegociação)──► EM RENEGOCIAÇÃO ──► ATIVO (nova data)
```

## SeloKey

Cada usuário possui uma **SeloKey** — uma chave pública no formato `@nome6HEX` (ex: `@gustavo8C7D9E`). É usada para identificar o recebedor na criação de acordos, sem expor CPF ou e-mail.

## Score de reputação

Cada usuário começa com **100 pontos**. O score é atualizado por:

- Acordos concluídos (+5)
- Disputas ganhas (+5)
- Renegociações aceitas (+2)
- Disputas abertas contra você (-5)
- Disputas perdidas (-10)

O score impacta diretamente o **limite do cartão virtual** SeloPay.

## Blockchain interno

Cada evento relevante gera um `BlockchainRecord` com hash SHA256 encadeado. Isso cria um histórico imutável e auditável de todas as ações do acordo, visualizável na tela de "Prova Blockchain" do app.

> Nota: este não é um blockchain público ou distribuído. É uma implementação conceitual em banco de dados PostgreSQL para fins acadêmicos.
