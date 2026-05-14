import { Router } from "express";
import * as homeController from "../controllers/homeController.js";
import * as vacantesController from "../controllers/vacantesController.js";
import * as usuariosController from "../controllers/usuariosController.js";
import * as authController from "../controllers/authController.js";
import * as rolesController from "../services/roles/mongodbController.js";
import * as adminRolesController from "../controllers/adminRolesController.js";
import { soloAdmin } from "../middleware/permisos.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

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
    authRateLimiter,
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
  router.post("/iniciar-sesion", authRateLimiter, authController.autenticarUsuario);

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
  router.post("/reestablecer-password", authRateLimiter, authController.enviarToken);

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
  router.post("/reestablecer-password/:token", authRateLimiter, authController.guardarPassword);

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
    usuariosController.validarPerfil,
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

  // ==========================================
  // RUTAS DE ROLES | ROLES ROUTES
  // ==========================================

  /**
   * @route GET /api/roles
   * @desc Obtener todos los roles
   * @access Public
   */
  router.get("/api/roles", rolesController.getRoles);

  /**
   * @route GET /api/roles/:name
   * @desc Obtener un rol por nombre
   * @access Public
   */
  router.get("/api/roles/:name", rolesController.getRoleByName);

  /**
   * @route GET /api/permisos
   * @desc Obtener todos los permisos
   * @access Public
   */
  router.get("/api/permisos", rolesController.getPermissions);

  /**
   * @route POST /api/roles
   * @desc Crear un nuevo rol
   * @access Private (Admin)
   */
  router.post("/api/roles", authController.verificarUsuario, rolesController.createRole);

  /**
   * @route PUT /api/roles/:name
   * @desc Actualizar un rol
   * @access Private (Admin)
   */
  router.put("/api/roles/:name", authController.verificarUsuario, soloAdmin(), rolesController.updateRole);

  /**
   * @route DELETE /api/roles/:name
   * @desc Eliminar un rol
   * @access Private (Admin)
   */
  router.delete("/api/roles/:name", authController.verificarUsuario, soloAdmin(), rolesController.deleteRole);

  /**
   * @route POST /api/roles/:userId/assign
   * @desc Asignar rol a usuario
   * @access Private (Admin)
   */
  router.post("/api/roles/:userId/assign", authController.verificarUsuario, rolesController.assignRole);

  /**
   * @route POST /api/permisos/verificar
   * @desc Verificar permisos del usuario actual
   * @access Private
   */
  router.post("/api/permisos/verificar", authController.verificarUsuario, rolesController.checkPermission);

  // ==========================================
  // RUTAS ADMIN DE ROLES | ADMIN ROLE ROUTES
  // ==========================================

  router.get(
    "/admin/roles",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.mostrarRoles
  );

  router.get(
    "/admin/roles/crear",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.formCrearRol
  );

  router.post(
    "/admin/roles/crear",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.crearRol
  );

  router.get(
    "/admin/roles/editar/:name",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.formEditarRol
  );

  router.post(
    "/admin/roles/editar/:name",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.actualizarRol
  );

  router.post(
    "/admin/roles/eliminar/:name",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.eliminarRol
  );

  router.get(
    "/admin/roles/asignar/:userId",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.asignarRol
  );

  router.post(
    "/admin/roles/asignar/:userId",
    authController.verificarUsuario,
    soloAdmin(),
    adminRolesController.procesarAsignacion
  );

  return router;
};

export default routes;