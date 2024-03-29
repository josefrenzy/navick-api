import { login } from "../models/auth.js";
import { createToken } from "../services/auth.js";
// import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

export const loginController = async (req, res) => {
  const { username, password } = req.body;
  login(username).then((resultado) => {
    if (resultado.rowCount > 0) {
      const validPassword = bcrypt.compare(
        password,
        resultado.rows[0].password
      );
      const {
        username,
        name,
        id_route,
        id_user,
        id_user_type,
        status,
        description,
      } = resultado.rows[0];
      validPassword.then((value) => {
        if (value) {
          res.status(200).json({
            statusCode: 200,
            statusMessage: "success",
            result: {
              username: username,
              nombre: name,
              idUsuario: id_user,
              idUserType: id_user_type,
              status: status,
              idRuta: id_route,
              description,
              description,
              token: createToken(
                username,
                name,
                id_route,
                id_user,
                id_user_type,
                status
              ),
            },
          });
        } else {
          res.status(500).json({
            statusCode: 500,
            statusMessag: "error",
            result: "wrong password",
          });
        }
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: "user invalid",
      });
    }
  });
};
