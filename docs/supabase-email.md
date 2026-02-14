## Objetivo

Este projeto usa Supabase Auth para:

- Confirmação de cadastro por e-mail
- Recuperação de senha (link de redefinição)
- Convites (opcional) para criação de conta por administradores

## Entregabilidade (evitar spam no Gmail)

Não existe garantia absoluta de “não cair no spam”, mas as boas práticas abaixo reduzem muito o risco:

- Use um domínio próprio no remetente (ex.: `no-reply@seudominio.com`) e evite `gmail.com` no campo From.
- Configure DNS do domínio: SPF + DKIM + DMARC alinhados com o remetente.
- Prefira SMTP transacional (SendGrid, Mailgun, Postmark, SES) em vez do provedor padrão, quando aplicável.
- Mantenha conteúdo do e-mail simples (HTML limpo + texto alternativo) e com instruções claras.
- Evite anexos e links desnecessários; mantenha 1 CTA principal (Confirmar / Redefinir senha).

No Supabase, isso é feito em **Authentication → Emails** (configuração do remetente e/ou SMTP).

## Modelos de e-mail (templates)

No Supabase, personalize em **Authentication → Emails → Templates**.

### Confirmação de cadastro (Signup confirmation)

Use a variável do Supabase `{{ .ConfirmationURL }}` como link/botão de confirmação. Referência: documentação oficial de templates do Supabase. [1]

Sugestão de texto:

- Título: Confirme seu e-mail
- Corpo: “Recebemos seu cadastro no Sistema Ninho. Para ativar sua conta, confirme seu e-mail clicando no botão abaixo.”
- CTA: Confirmar e-mail (`href="{{ .ConfirmationURL }}"`)
- Rodapé: “Se você não solicitou este cadastro, ignore este e-mail.”

Observação: alguns provedores corporativos fazem “link scanning” e podem consumir o token do link. O Supabase recomenda levar em conta esse comportamento em templates e fluxos. [1]

### Recuperação de senha (Password recovery)

Recomendado: enviar apenas o link de redefinição (não enviar senha temporária).

- CTA: Redefinir senha (use o link do recovery do Supabase configurado para redirecionar para `/auth/resetPassword`)
- Instruções: “Este link expira. Se você não solicitou, ignore.”

### Convite (Invite)

Para contas criadas por administradores, prefira convite por e-mail (o usuário define a própria senha no primeiro acesso), em vez de “senha temporária”.

## Segurança: por que não enviar “senha temporária” por e-mail

Enviar senha por e-mail é uma prática insegura:

- e-mail pode ser acessado/encaminhado/armazenado por terceiros
- a senha vira um segredo que trafega em texto claro por canais fora do controle do sistema

Alternativas seguras:

- Confirmação + “Definir senha” via link de convite/recovery
- Magic link/OTP (quando fizer sentido)

## Variáveis e URLs do projeto

- `NEXT_PUBLIC_SITE_URL`: URL pública do frontend (ex.: `http://localhost:3000` em dev; domínio real em produção)
- Rotas usadas nos e-mails:
  - Confirmação: `/auth/callback`
  - Redefinição: `/auth/resetPassword`

## Referências

[1] https://supabase.com/docs/guides/auth/auth-email-templates

