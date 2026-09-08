const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const client = new Client({
  authStrategy: new LocalAuth()
});

// Mostra o QR Code para conectar o WhatsApp
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Quando conectar
client.on("ready", () => {
  console.log("✅ BOT CONECTADO!");
});

// Guarda os tickets
let tickets = {};

if (fs.existsSync("tickets.json")) {
  tickets = JSON.parse(fs.readFileSync("tickets.json"));
}

function salvarTickets() {
  fs.writeFileSync(
    "tickets.json",
    JSON.stringify(tickets, null, 2)
  );
}

// Recebe mensagens
client.on("message", async (msg) => {
  const texto = msg.body.toLowerCase().trim();
  const numero = msg.from;

  // Comando inicial
  if (
    texto === "oi" ||
    texto === "olá" ||
    texto === "ola" ||
    texto === "menu"
  ) {
    await msg.reply(
      "👋 *Olá! Bem-vindo ao atendimento!*\n\n" +
      "Escolha uma opção:\n\n" +
      "1️⃣ Comprar\n" +
      "2️⃣ Suporte\n" +
      "3️⃣ Abrir ticket\n\n" +
      "Digite o número da opção."
    );

    return;
  }

  // Comprar
  if (texto === "1") {
    await msg.reply(
      "🛒 *COMPRAS*\n\n" +
      "Digite o nome do produto que você deseja comprar."
    );

    return;
  }

  // Suporte
  if (texto === "2") {
    await msg.reply(
      "🛠️ *SUPORTE*\n\n" +
      "Explique seu problema em uma mensagem."
    );

    return;
  }

  // Criar ticket
  if (texto === "3" || texto === "ticket") {
    if (tickets[numero]) {
      await msg.reply(
        "⚠️ Você já possui um ticket aberto.\n" +
        "Envie *fechar* para encerrá-lo."
      );
      return;
    }

    const id = "TICKET-" + Date.now();

    tickets[numero] = {
      id: id,
      numero: numero,
      criadoEm: new Date().toISOString(),
      status: "aberto"
    };

    salvarTickets();

    await msg.reply(
      "🎫 *TICKET ABERTO!*\n\n" +
      "Número: `" + id + "`\n\n" +
      "Agora envie sua dúvida ou problema.\n" +
      "Um atendente poderá continuar o atendimento.\n\n" +
      "Para fechar o ticket, envie *fechar*."
    );

    return;
  }

  // Mensagem dentro do ticket
  if (tickets[numero] && tickets[numero].status === "aberto") {
    if (texto === "fechar") {
      tickets[numero].status = "fechado";
      tickets[numero].fechadoEm = new Date().toISOString();

      salvarTickets();

      await msg.reply(
        "🔒 *TICKET FECHADO!*\n\n" +
        "Obrigado por entrar em contato."
      );

      delete tickets[numero];
      salvarTickets();

      return;
    }

    await msg.reply(
      "📩 Mensagem recebida!\n\n" +
      "Seu ticket *" +
      tickets[numero].id +
      "* continua aberto. ✅"
    );

    return;
  }

  // Resposta padrão
  await msg.reply(
    "🤖 Não entendi sua mensagem.\n\n" +
    "Digite *menu* para ver as opções."
  );
});

client.initialize();
