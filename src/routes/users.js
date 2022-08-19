import express from "express";
import { ensureAuthenticated } from "../middlewares/auth.js";
import {
  getUsersType,
  listaUsuarios,
  listaUsuario,
  insertaUsuario,
  updateUserStatus,
  actualizaUsuario,
  eliminaUsuario,
} from "../controllers/users.js";
const routesUser = express.Router();

console.log("entro a la ruta");

/* GET users listing. */
routesUser.get("/tipo", ensureAuthenticated, getUsersType);
routesUser.post("/updateStatus", ensureAuthenticated, updateUserStatus);
routesUser.get("/", ensureAuthenticated, listaUsuarios);
routesUser.get("/:idUser", ensureAuthenticated, listaUsuario);
routesUser.post(
  "/", //ensureAuthenticated,
  insertaUsuario
);
routesUser.put(
  "/",
  //ensureAuthenticated,
  actualizaUsuario
);
routesUser.delete("/:idUser", ensureAuthenticated, eliminaUsuario);

console.log("sali de la ruta");

// module.exports = routesUser;
export default routesUser;
