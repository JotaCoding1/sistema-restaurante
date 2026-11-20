// Página do Caixa — composição: identity, payments.

import { $, poll } from "../shared/dom.js";
import { icon } from "../shared/icons.js";
import { mountHero } from "../shared/layout.js";

import { requireRole, mountUserTopbar } from "../modules/identity/index.js";
import { mountCashierDesk } from "../modules/payments/index.js";

const user = requireRole("CASHIER");
if (user) start();

function start() {
  mountUserTopbar(user);
  mountHero($("#hero"), {
    area: "Caixa",
    title: "Um bom encontro, do início ao fim.",
    subtitle: "Confira a conta e finalize cada atendimento com cuidado."
  });
  $("#billsIcon").innerHTML = icon("wallet", "icon--lg");

  const desk = mountCashierDesk({
    listEl: $("#billList"),
    billEl: $("#billPanel"),
    countEl: $("#billsCount")
  });

  desk.refresh();
  poll(desk.refresh);
}
