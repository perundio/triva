# Advanced configuration

- **Multiple SMTP providers:** Not built-in. You can run multiple instances with different env (e.g. different `SMTP_*` and `PORT`) or add a small router that selects config by domain/header.
- **Custom subject/from:** Currently subject is fixed ("Новое сообщение с формы") and from is `SMTP_FROM`. To make them configurable, extend env and the mailer options in `src/services/mailer.js` and optionally allow overrides from form fields (with strict allowlists to avoid header injection).
