# [51] Rate limiter em memória com bucket compartilhado

| Campo | Valor |
|---|---|
| **ID** | `51` |
| **Fase** | `6 — Segurança e dados` |
| **Risco** | médio |
| **Depende de** | `50` |
| **Estimativa** | média |
| **Criada por** | task `00` (investigação), 2026-08-26 |

## Objetivo

Fazer o limite de tentativas de login proteger sem trancar usuária legítima
fora da plataforma.

## Evidência

O limitador existe e funciona — durante a investigação ele devolveu
`429 Muitas tentativas. Tente novamente mais tarde.` e invalidou uma bateria de
testes. Ter o limitador é bom. A implementação em `src/lib/rate-limit.ts` tem
três problemas concretos:

```ts
const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 5;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";          // <-- todos caem no mesmo balde
}
```

### 1. Sem `x-forwarded-for`, todo mundo divide o mesmo balde

`getClientIp` devolve a string literal `"unknown"` quando os headers de proxy
não existem. Todas essas requisições compartilham **uma única** cota de 5 por 15
minutos. Foi exatamente o que aconteceu na investigação: 5 logins legítimos e a
sexta tentativa levou 429.

Em produção atrás de proxy os headers normalmente existem. Mas se a
configuração de proxy mudar, ou se alguma rota for chamada sem eles, a
plataforma inteira fica limitada a 5 logins a cada 15 minutos. É negação de
serviço autoinfligida.

### 2. `Map` em memória não sobrevive a nada

O estado se perde a cada restart e não é compartilhado entre instâncias. Em
deploy serverless (Vercel), cada instância tem o próprio `Map` — com N
instâncias, o limite real vira 5×N, e um atacante distribuído passa reto.

### 3. Conta login bem-sucedido, não só falha

O contador incrementa em toda tentativa. Cinco logins **corretos** em 15 minutos
já esgotam a cota. Numa rede compartilhada — casa, trabalho, centro comunitário,
casa de acolhimento — várias usuárias saem pelo mesmo IP. Considerando o público
desta plataforma, é um cenário provável, não hipotético.

## Passos

1. **Corrija o balde compartilhado primeiro** — é o de maior impacto e o mais
   barato. Sem header de proxy confiável, prefira limitar por **e-mail
   tentado** em vez de por IP, ou combine os dois. Nunca colapse identidades
   distintas numa chave `"unknown"`.

2. **Conte só o que interessa.** Incremente em falha de autenticação; em
   sucesso, zere o contador daquela chave. Login que funciona não é sinal de
   ataque.

3. **Afrouxe o limite para o caso legítimo e endureça para o suspeito.** Cinco
   tentativas por 15 minutos é agressivo para IP compartilhado. Considere
   escalonar: as primeiras tentativas livres, atraso progressivo depois.

4. **Persistência**: se o deploy for serverless, `Map` não serve. Avalie o
   banco (já existe Postgres) ou um KV. Se a decisão for manter em memória
   porque o deploy é de instância única, **documente isso explicitamente** em
   `docs/autorizacao.md`, para ninguém migrar para serverless sem perceber.

5. Devolva o header `Retry-After` junto do 429, e mostre na UI quanto tempo
   falta — hoje a mensagem não diz.

6. Cubra com teste: 6 tentativas erradas → 429; tentativa correta depois do
   sucesso não conta; e-mails diferentes não compartilham cota.

## Critérios de aceite

- [ ] Requisição sem header de proxy não cai mais numa chave única
      compartilhada.
- [ ] Login bem-sucedido não consome cota.
- [ ] Resposta 429 inclui `Retry-After` e a UI informa o tempo de espera.
- [ ] A decisão sobre persistência está documentada, qualquer que seja ela.
- [ ] Testes cobrindo os três cenários acima.

## Verificação

```bash
for i in 1 2 3 4 5 6; do printf "tentativa %s: %s\n" "$i" "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"maria@exemplo.com","password":"errada"}')"; done
```

Depois, com a senha correta, confirme que a usuária legítima ainda entra.

## Riscos e armadilhas

Afrouxar demais devolve a superfície de força bruta. O alvo não é remover o
limite: é distinguir usuária legítima de atacante, que é o que a implementação
atual não faz.

## Nota de ambiente

Como o `Map` é em memória, **reiniciar o dev server zera o limitador**. Útil
para testar; e é também a prova de que o estado não persiste.
