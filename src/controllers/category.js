import * as categoryModel from "../models/category.js";
import logger from "../utils/logger.js";

export const getCategories = (req, res) => {
  categoryModel
    .getCategories()
    .then((response) => {
      if (response.length > 0) {
        res.status(200).json({
          statusCode: 200,
          statusMessage: "success",
          result: response,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          statusMessage: "error",
          result: "No hay Categorias por mostrar",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: error,
      });
    });
};

export const getCategory = (req, res) => {
  const { idCategory } = req.params;
  categoryModel
    .getCategory(idCategory)
    .then((response) => {
      if (response.length > 0) {
        res.status(200).json({
          statusCode: 200,
          statusMessage: "success",
          result: response,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          statusMessage: "error",
          result: "Categoría Inexistente",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: error,
      });
    });
};

export const updateCategory = (req, res) => {
  const { idCategory, name } = req.body;

  categoryModel
    .updateCategory(idCategory, name)
    .then((response) => {
      if (response.rowCount > 0) {
        res.status(200).json({
          statusCode: 200,
          statusMessage: "success",
          result: response,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          statusMessage: "error",
          result: "Categoría Inexistente",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: error,
      });
    });
};
export const insertCategory = (req, res) => {
  const { idCategory, name } = req.body;

  categoryModel
    .insertCategory(idCategory, name)
    .then((response) => {
      if (response.rowCount > 0) {
        res.status(200).json({
          statusCode: 200,
          statusMessage: "success",
          result: response,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          statusMessage: "error",
          result: "Categoría Inexistente",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: error,
      });
    });
};

export const deleteCategory = (req, res) => {
  const { idCategory } = req.params;
  categoryModel
    .deleteCategory(idCategory)
    .then((response) => {
      if (response.rowCount > 0) {
        res.status(200).json({
          statusCode: 200,
          statusMessage: "success",
          result: "Categoría de Artículo eliminado correctamente",
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          statusMessage: "error",
          result: "Error al eliminar Categoría de Artículo",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        statusCode: 500,
        statusMessage: "error",
        result: error,
      });
    });
};
