import connexion from "../config/bdConnexion.js";
import logger from "../utils/logger.js";
import * as qrys from "./queries/invoices.js";

export const getInvoices = async () => {
  const result = await connexion.query(qrys.getInvoices);
  return result.rows;
};
export const getInvoice = async (idInvoice) => {
  const result = await connexion.query(qrys.getInvoiceByIdinvoice, [idInvoice]);
  return result.rows;
};

export const getInvoicesByRoute = async (idRoute) => {
  const invoicesByRoute = await connexion.query(qrys.getInvoicesByRoute, [
    idRoute,
  ]);
  return invoicesByRoute.rows;
};

export const getInvoiceByClientId = async (idClient) => {
  const facturasByCliente = await connexion.query(qrys.getInvoiceByClientId, [
    idClient,
  ]);
  return facturasByCliente.rows;
};
export const updateInvoice = async (
  idFactura,
  idCliente,
  idTipoPedido,
  estado,
  fechaVencimiento,
  importe,
  saldo,
  descuento
) => {
  const existRegister = connexion.query(qrys.getInvoiceByIdinvoice, [
    idFactura,
  ]);
  if ((await existRegister).rows.length == 0) {
    return { error: "No existe la Factura que intentas Actualizar" };
  } else {
    const result = await connexion.query(qrys.updateInvoiceByIdinvoice, [
      idFactura,
      idCliente,
      idTipoPedido,
      estado,
      fechaVencimiento,
      importe,
      saldo,
      descuento,
    ]);
    return result;
  }
};
export const getSaldoById = async (idInvoice) => {
  const result = await connexion.query(qrys.getRemainingPaymentByIdinvoice, [
    idInvoice,
  ]);
  return result.rows;
};
export const updateSaldoById = async (idInvoice, saldo) => {
  const result = await connexion.query(qrys.updateRemainingPaymentByIdinvoice, [
    idInvoice,
    saldo,
  ]);
  return result;
};
export const insertInvoiceAndDetailTransaction = async (
  idClient,
  typePayment,
  status,
  expirationDate,
  discount,
  detailInvoice,
  timestamp
) => {
  let executed = false;
  let totalAmount = 0;
  await detailInvoice.forEach((element) => {
    totalAmount += element.price * element.quantity;
  });
  const client = await connexion.connect();
  try {
    await client.query("BEGIN");
    const insertInvoice = await client.query(qrys.insertInvoice, [
      idClient,
      typePayment,
      status,
      timestamp,
      expirationDate,
      totalAmount,
      totalAmount,
      discount,
    ]);
    let line = 0;
    detailInvoice.forEach(async (element) => {
      const { idArticle, quantity, price, idWarehouse } = element;
      line += 1;
      await client.query(
        qrys.insertDetailsInvoices,
        [
          insertInvoice.rows[0].id_invoice,
          line,
          idArticle,
          quantity,
          price,
          idWarehouse,
        ],
        (err, result) => {
          if (err) {
            executed = false;
            logger.info("\nclient.query():", err);
            // Rollback before executing another transaction
            client.query("ROLLBACK");
            logger.info("Transaction ROLLBACK called");
          }

          logger.info(`client.query() COMMIT row count: ${result.rowCount}`);
        }
      );
      executed = true;
    });
    await client.query("COMMIT");
    client.release(true);
  } catch (error) {
    await client.query("ROLLBACK");
    client.release(true);
    throw error;
  }
  return executed;
};

export const getInvoicesByCurrentDay = async (idInvoice) => {
  const result = await connexion.query(qrys.getIvoicesByCurrentDay, [
    idInvoice,
  ]);
  return result.rows;
};

export const cancelInvoices = async (
  idInvoice,
  idUser,
  amount,
  locationGPS,
  comments,
  textTicket,
  printedTicket,
  timestamp,
  idPayment
) => {
  const client = await connexion.connect();

  let executed = false;
  let queryInvoice = null;
  let queryPayment = null;
  try {
    await client.query("BEGIN");
    logger.info("Begin transaction");
    logger.info(`MODEL: validating if the : ${idPayment} exist`);
    const paymentExist = await connexion.query(qrys.getPaymentsByPaymentId, [
      idPayment,
    ]);
    const { rowCount } = paymentExist;
    if (rowCount === 0) {
      // validando que la factura exista
      const result = await client.query(qrys.getRemainingPaymentToCancel, [
        idInvoice,
      ]);
      const { remaining_payment, status } = result.rows[0];
      // if remaining_payment the invoice exist
      if (remaining_payment) {
        // if an ammount exist create a payment
        if (status === 3) {
          client.query("ROLLBACK");
          queryInvoice = { error: "la factura ya se encuentra cancelada" };
          queryPayment = {
            error: "No se inserto nada por que la factura ya esta cancelada",
          };
        } else {
          // updating the invoice
          await client.query(
            qrys.updateInvoiceStatus,
            [idInvoice, remaining_payment - amount],
            (err, result) => {
              if (err) {
                executed = false;
                logger.info("\nclient.query():", err);
                // Rollback before executing another transaction
                client.query("ROLLBACK");
              }
              executed = true;
              queryInvoice = {
                command: result.command,
                rowCount: result.rowCount,
              };

              logger.info(
                "client.query() COMMIT row count on update:",
                queryInvoice
              );
            }
          );
          if (amount !== 0) {
            await client.query(
              qrys.insertPaymentInCancel,
              [
                idInvoice,
                idUser,
                amount,
                locationGPS,
                comments,
                textTicket,
                printedTicket,
                timestamp,
                idPayment,
              ],
              (err, result) => {
                if (err) {
                  executed = false;
                  logger.info("\nclient.query():", err);
                  // Rollback before executing another transaction
                  client.query("ROLLBACK");
                }
                executed = true;
                queryPayment = {
                  result: result.rows[0],
                };
                logger.info(
                  "client.query() COMMIT row count on insert:",
                  result.rowCount
                );
              }
            );
          }
          queryPayment = { message: "no se hizo ningun abono" };
        }
      }
    } else {
      executed = false;
      queryPayment = {
        message: "El id del abono ya existe intenta con uno diferente",
      };
    }
    await client.query("COMMIT");
    await client.release(true);
  } catch (error) {
    await client.query("ROLLBACK");
    await client.release(true);
  }

  return { executed, sqlResult: { queryInvoice, queryPayment } };
};
