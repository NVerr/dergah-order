import { printer as ThermalPrinter, types as PrinterTypes } from "node-thermal-printer";

// Die Drucker-IP wird über eine Umgebungsvariable konfiguriert, damit sie
// sich beim Umzug von zuhause in die Moschee ändern lässt, ohne Code
// anzufassen. Siehe .env: PRINTER_IP=192.168.1.xxx
const PRINTER_IP = process.env.PRINTER_IP;
const PRINTER_PORT = process.env.PRINTER_PORT ?? "9100";

type PrintOrderItem = {
  name: string;
  quantity: number;
  toppings?: string[];
};

type PrintableOrder = {
  orderNumber: number;
  items: PrintOrderItem[];
};

/**
 * Druckt einen Bon mit Bestellnummer und allen Artikeln.
 *
 * Wirft absichtlich KEINEN Fehler nach außen, sondern gibt true/false
 * zurück – ein fehlgeschlagener Druck soll niemals die Bestellung selbst
 * gefährden. Der Aufrufer entscheidet, was mit dem Ergebnis passiert.
 */
export async function printOrder(order: PrintableOrder): Promise<boolean> {
  if (!PRINTER_IP) {
    console.error(
      "[printer] PRINTER_IP ist nicht gesetzt – Druck übersprungen."
    );
    return false;
  }

  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${PRINTER_IP}:${PRINTER_PORT}`,
      width: 48, // Zeichen pro Zeile bei 80mm-Papier, Standardschrift
      options: {
        timeout: 5000,
      },
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.error(
        `[printer] Drucker unter ${PRINTER_IP}:${PRINTER_PORT} nicht erreichbar.`
      );
      return false;
    }

    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println("Sipariş");
    printer.setTextSize(3, 3);
    printer.println(String(order.orderNumber));
    printer.setTextSize(0, 0);
    printer.bold(false);
    printer.drawLine();

    printer.alignLeft();
    for (const item of order.items) {
      printer.println(`${item.quantity}x  ${item.name}`);
      if (item.toppings && item.toppings.length > 0) {
        printer.println(`     + ${item.toppings.join(", ")}`);
      }
    }

    // ── Punkt 4: Türkischer Hinweistext am Ende des Bons ──
    printer.newLine();
    printer.drawLine();
    printer.alignCenter();
    printer.println("Siparisiniz hazir oldigunda");
    printer.println("lutfen zili calarak haber verin.");
    printer.newLine();

    printer.cut();

    await printer.execute();
    return true;
  } catch (error) {
    console.error("[printer] Druckvorgang fehlgeschlagen:", error);
    return false;
  }
}
