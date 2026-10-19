# Hijab Store Islamic 🧕✨

> Loja online premium de moda modesta islâmica, hijabs de luxo, abayas e roupas de oração no Brasil.

---

## 🎨 Paleta de Cores e Identidade Visual

- **Preto Carvão**: `#171717` (Header, Rodapé, Destaques)
- **Cinza Escuro**: `#222222` (Barras de Navegação e Menus)
- **Cinza Médio**: `#666666` (Textos e legendas secundárias)
- **Prata Claro**: `#BDBDBD` (Linhas de contraste e ícones)
- **Marfim Claro**: `#F5F3EF` (Fundo dos produtos para máxima fidelidade de cor)
- **Dourado Nobre**: `#B9A27A` (Acentos de luxo, botões e selos)

---

## 🛍️ Principais Funcionalidades

1. **Catálogo Completo com Filtros Rápidos**:
   - Hijabs (Chiffon de Seda, Jersey Modal, etc.)
   - Khimars (Tradicionais longos e triangulares)
   - Abayas (Estilo Dubai, clássicas bordadas)
   - Vestidos Modestos (Evasê e fluidos)
   - Conjuntos Femininos (Túnicas e pantalonas)
   - Roupas de Oração (Conjuntos com bolsa inclusa)
   - Acessórios (Pins magnéticos de alta fixação e toucas underscarf)

2. **Experiência de Compra Interativa**:
   - Busca em tempo real por nome, cor, tecido ou categoria.
   - Ordenação inteligente (Preço crescente/decrescente, Avaliação, Novidades).
   - Modal de Visualização Rápida com galeria de imagens, especificações de tecido e seletor de cores.
   - Sacola de Compras com gaveta lateral (slide-out), ajuste de quantidades, cupom de desconto (`BEMVINDA10`) e frete grátis automático acima de R$ 199.
   - **Checkout Direto via WhatsApp**: Gera o resumo formatado da compra com itens, cores, quantidades e valores em Real (R$).
   - Lista de Favoritos (Wishlist) persistente no navegador.

3. **Mídias Sociais & Atendimento**:
   - Seção de fotos integrada inspirada no feed do Instagram.
   - Seção de vídeos curtos inspirada em tutoriais do TikTok.
   - Botão flutuante do WhatsApp para atendimento humanizado e dúvidas de medidas.

---

## 🚀 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor em desenvolvimento
npm run dev

# Ou iniciar em produção
npm start

# Executar testes unitários
npm test
```

O servidor iniciará em `http://localhost:3000`.

---

## 🌐 Variáveis de Ambiente (Opcionais)

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta onde a aplicação responderá |
| `WHATSAPP_NUMBER` | `5511999999999` | Número com DDI e DDD para atendimento |
| `INSTAGRAM_URL` | `https://instagram.com/hijabstoreislamic` | Link do perfil do Instagram |
| `TIKTOK_URL` | `https://tiktok.com/@hijabstoreislamic` | Link do perfil do TikTok |

---

## 🚂 Implantação no Railway

A aplicação é 100% compatível com a infraestrutura da Railway:
- Arquivo `railway.json` pré-configurado com Nixpacks.
- Endpoint de monitoramento e verificação de integridade: `/health`.
- `Dockerfile` disponível como alternativa.
- Vinculado automaticamente ao branch `main` no GitHub.
