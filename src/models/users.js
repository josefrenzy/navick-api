const res = require("express/lib/response");
const connexion = require("../config/bdConnexion");

module.exports = {
  async obtenerUsuarios() {
    const resultados = await connexion.query("select * from users");
    return resultados.rows;
  },
  async obtenerUsuario(idUser) {
    const result = connexion.query(
      `
      SELECT *
      FROM
        public.users
      WHERE
        id_user=$1
    `,
      [idUser]
    );
    return (await result).rows;
  },
  async insertarUsuario(username, name, idUserType, password, idRoute) {
    const existRegister = connexion.query(
      `
      SELECT 1 
      FROM
        public.users
      WHERE
        username=$1
    `,
      [username]
    );
    if ((await existRegister).rows.length > 0) {
      return {
        error: "el username que elejiste ya existe por favor elije otro",
      };
    } else {
      const resultados = await connexion.query(
        `
      INSERT INTO 
        public.users(username, name, id_user_type, password, created_at, id_route, date_deleted, status)
      VALUES 
        ($1, $2, $3, $4, now(), $5, null, 1)`,
        [username, name, idUserType, password, idRoute]
      );
      return resultados;
    }
  },
  async actualizarUsuario(
    username,
    name,
    idUserType,
    hashPassword,
    status,
    idRoute
  ) {
    const result = connexion.query(
      `
      UPDATE 
        public.users
      SET 
        name=$2, id_user_type=$3, password=$4, date_deleted=now(), status=$5, idRoute=$6
      WHERE username=$1
      `,
      [username, name, idUserType, hashPassword, status, idRoute]
    );
    return result;
  },
  async eliminarUsuario(idUser) {
    const result = connexion.query(
      `
      DELETE FROM
        public.users
      WHERE 
        id_user=$1
      `,
      [idUser]
    );
    return result;
  },
};
