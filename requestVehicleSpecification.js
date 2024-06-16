import { Markup } from "telegraf";

export default function requestVehicleSpecification(ctx) {
  return ctx.replyWithHTML(
    "Search for...",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Car", "car_button"),
        Markup.button.callback("House", "house_button"),
      ],
    ])
  );
}
// SEIT BUS IZVELE VAI GRIB MAJU VAI MASINU
