import { Telegraf } from "telegraf";
import { Markup } from "telegraf";
import DDPClient from "ddp";
import axios from "axios";
import cheerio from "cheerio";

const bot = new Telegraf("6968501326:AAEfZf3aZxUNFV3quVC7qTLVtOcejgwcurM");

const web_link = "https://snazzy-sfogliatella-b19ff2.netlify.app/";

const paid = true;

var connection = new DDPClient({
  host: "localhost",
  port: 3000, //Port and IP of your meteor server
});

connection.connect(function (err) {
  connection.subscribe("links");
});

connection.on("message", async function (msg) {
  const parsedMsg = JSON.parse(msg);
  if (parsedMsg.msg === "added") {
    try {
      const scrapeAndLog = async () => {
        const userToken = await performScraping(parsedMsg.fields.model, "2002");
        connection.call("links.appendRecentData", [
          {
            linkId: parsedMsg.id,
            newData: userToken[0],
          },
        ]);
        console.log(userToken[0]);
      };
      await scrapeAndLog();
      setInterval(async () => {
        await scrapeAndLog();
      }, 60000);
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

async function performScraping(model, carYear) {
  const data = [];
  const axiosResponse = await axios.request({
    method: "GET",
    url: `https://www.ss.lv/lv/transport/cars/audi/${model}/`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  const $ = cheerio.load(axiosResponse.data);

  $("tr").each((index, element) => {
    const title = $(element).find(".d1 a").attr("href");

    if (title) {
      const url = "https://www.ss.lv/" + title;

      data.push(url);
    }
  });

  return data;
}

bot.command("start", async (ctx) => {
  connection.on("message", async function (msg) {
    const parsedMsg = JSON.parse(msg);
    console.log(parsedMsg);
    // Check if the message indicates an advertisement was added
    if (parsedMsg.msg === "added") {
      try {
        // Immediately send a message
        ctx.reply("Sludinajumu mekletajs pievienots");
      } catch (error) {
        console.error("Error:", error);
      }
    }
    if (parsedMsg.msg === "changed") {
      try {
        // Immediately send a message
        ctx.reply("Jauns sludinajums pievienots: " + parsedMsg.fields.newData);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });
  ctx.replyWithHTML(
    "Search for...",
    Markup.inlineKeyboard([
      Markup.button.callback("Car", "car_button"),
      Markup.button.callback("House", "house_button"),
    ])
  );

  // Do not put anything that listens for messages herea
});
bot.action("car_button", async (ctx) => {
  return await ctx.reply(
    "open webapp",
    Markup.keyboard([Markup.button.webApp("Open", web_link)])
  );
});

bot.on("successful_payment", async (ctx, next) => {
  // reply in case of positive payment
  await ctx.reply("SuccessfulPayment");
  paid = true;
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
