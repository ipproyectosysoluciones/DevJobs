import { Router, Request, Response, NextFunction } from "express";
import * as homeController from "../controllers/homeController.js";
import * as vacantesController from "../controllers/vacantesController.js";
import * as usuariosController from "../controllers/usuariosController.js";
import * as authController from "../controllers/authController.js";

const router = Router();

/**
 * Definición de rutas del proyecto DevJobs
 * @en DevJobs project routes definition
 */
const routes = (): Router => {
  // ==========================================
  // RUTAS PÚBLICAS | PUBLIC ROUTES
  // ==========================================

  /**
   * @route GET /
   * @desc Página principal - Mostrar todos los trabajos
   * @access Public
   */
  router.get("/", homeController.mostrarTrabajos);

  /**
   * @route GET /vacantes/:url
   * @desc Mostrar detalles de una vacante
   * @access Public
   */
  router.get("/vacantes/:url", vacantesController.mostrarVacante);

  /**
   * @route POST /buscador
   * @desc Buscar vacantes por texto
   * @access Public
   */
  router.post("/buscador", vacantesController.buscarVacantes);

  // ==========================================
  // RUTAS DE AUTH | AUTH ROUTES
  // ==========================================

  /**
   * @route GET /crear-cuenta
   * @desc Mostrar formulario de registro
   * @access Public
   */
  router.get("/crear-cuenta", usuariosController.formCrearCuenta);

  /**
   * @route POST /crear-cuenta
   * @desc Crear nueva cuenta de usuario
   * @access Public
   */
  router.post(
    "/crear-cuenta",
    usuariosController.validarRegistro,
    usuariosController.crearUsuario
  );

  /**
   * @route GET /iniciar-sesion
   * @desc Mostrar formulario de inicio de sesión
   * @access Public
   */
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);

  /**
   * @route POST /iniciar-sesion
   * @desc Autenticar usuario
   * @access Public
   */
  router.post("/iniciar-sesion", authController.autenticarUsuario);

  // ==========================================
  // RUTAS DE PASSWORD | PASSWORD ROUTES
  // ==========================================

  /**
   * @route GET /reestablecer-password
   * @desc Mostrar formulario para solicitar reset
   * @access Public
   */
  router.get("/reestablecer-password", authController.formReestablecerPassword);

  /**
   * @route POST /reestablecer-password
   * @desc Enviar token de reset por email
   * @access Public
   */
  router.post("/reestablecer-password", authController.enviarToken);

  /**
   * @route GET /reestablecer-password/:token
   * @desc Mostrar formulario para nuevo password
   * @access Public
   */
  router.get("/reestablecer-password/:token", authController.reestablecerPassword);

  /**
   * @route POST /reestablecer-password/:token
   * @desc Guardar nuevo password
   * @access Public
   */
  router.post("/reestablecer-password/:token", authController.guardarPassword);

  // ==========================================
  // RUTAS PROTEGIDAS | PROTECTED ROUTES
  // ==========================================

  /**
   * @route GET /cerrar-sesion
   * @desc Cerrar sesión del usuario
   * @access Private
   */
  router.get(
    "/cerrar-sesion",
    authController.verificarUsuario,
    authController.cerrarSesion
  );

  /**
   * @route GET /administracion
   * @desc Panel de administración
   * @access Private
   */
  router.get(
    "/administracion",
    authController.verificarUsuario,
    authController.mostrarPanel
  );

  /**
   * @route GET /vacantes/nueva
   * @desc Mostrar formulario para nueva vacante
   * @access Private
   */
  router.get(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante
  );

  /**
   * @route POST /vacantes/nueva
   * @desc Crear nueva vacante
   * @access Private
   */
  router.post(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante
  );

  /**
   * @route GET /vacantes/editar/:url
   * @desc Mostrar formulario para editar vacante
   * @access Private
   */
  router.get(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.formEditarVacante
  );

  /**
   * @route POST /vacantes/editar/:url
   * @desc Actualizar vacante
   * @access Private
   */
  router.post(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.editarVacante
  );

  /**
   * @route DELETE /vacantes/eliminar/:id
   * @desc Eliminar vacante
   * @access Private
   */
  router.delete(
    "/vacantes/eliminar/:id",
    vacantesController.eliminarVacante
  );

  /**
   * @route GET /editar-perfil
   * @desc Mostrar formulario para editar perfil
   * @access Private
   */
  router.get(
    "/editar-perfil",
    authController.verificarUsuario,
    usuariosController.formEditarPerfil
  );

  /**
   * @route POST /editar-perfil
   * @desc Actualizar perfil de usuario
   * @access Private
   */
  router.post(
    "/editar-perfil",
    authController.verificarUsuario,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
  );

  /**
   * @route POST /vacantes/:url
   * @desc Postular a una vacante (enviar CV)
   * @access Public
   */
  router.post(
    "/vacantes/:url",
    vacantesController.subirCV,
    vacantesController.contactar
  );

  /**
   * @route GET /candidatos/:id
   * @desc Mostrar candidatos de una vacante
   * @access Private
   */
  router.get(
    "/candidatos/:id",
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos
  );

  return router;
};

export default routes;