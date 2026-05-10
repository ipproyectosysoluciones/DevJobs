import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import shortid from 'shortid';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import type { IVacanteDocument } from '../models/Vacantes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de Multer para uploads de CV
 * @en Multer configuration for CV uploads
 */
const configuracionMulter = {
  limits: { fileSize: 100000 },
  storage: multer.diskStorage({
    destination: (_req, _file, cb): void => {
      cb(null, path.join(__dirname, '../../public/uploads/cv'));
    },
    filename: (_req, file, cb): void => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  }),
  fileFilter(_req, file, cb): void {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato No Válido | Invalid Format'));
    }
  },
};

const upload = multer(configuracionMulter).single('cv');

/**
 * Mostrar formulario para nueva vacante
 * @en Show form for new vacancy
 */
export const formularioNuevaVacante = (req: Request, res: Response): void => {
  res.render('nueva-vacante', {
    nombrePagina: 'Nueva Vacante | New Vacancy',
    tagline:
      'Llena el formulario y publica tu vacante | Fill the form and post your vacancy',
    cerrarSesion: true,
    nombre: req.user?.nombre,
    imagen: req.user?.imagen,
  });
};

/**
 * Agregar nueva vacante a la base de datos
 * @en Add new vacancy to database
 */
export const agregarVacante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacante = new Vacante(req.body);
  vacante.autor = req.user?._id;
  vacante.skills = (req.body.skills as string).split(',');

  const nuevaVacante = await vacante.save();
  res.redirect(
    `/vacantes/${(nuevaVacante as unknown as IVacanteDocument).url}`,
  );
};

/**
 * Mostrar detalles de una vacante
 * @en Show vacancy details
 */
export const mostrarVacante = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  await import('../models/Usuarios.js'); // registrar modelo para populate
  const vacante = await Vacante.findOne({
    url: req.params.url,
  })
    .populate('autor')
    .lean();

  if (!vacante) {
    return next();
  }

  res.render('vacante', {
    vacante,
    nombrePagina: vacante.titulo,
    barra: true,
  });
};

/**
 * Mostrar formulario para editar vacante
 * @en Show form to edit vacancy
 */
export const formEditarVacante = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacante = await Vacante.findOne({
    url: req.params.url,
  }).lean();

  if (!vacante) {
    return next();
  }

  res.render('editar-vacante', {
    vacante,
    nombrePagina: `Editar - ${vacante.titulo} | Edit - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user?.nombre,
    imagen: req.user?.imagen,
  });
};

/**
 * Editar vacante en la base de datos
 * @en Edit vacancy in database
 */
export const editarVacante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacanteActualizada = req.body;
  vacanteActualizada.skills = (req.body.skills as string).split(',');

  const vacante = await Vacante.findOneAndUpdate(
    { url: req.params.url },
    vacanteActualizada,
    {
      new: true,
      runValidators: true,
    },
  );

  if (vacante) {
    res.redirect(`/vacantes/${(vacante as unknown as IVacanteDocument).url}`);
  }
};

/**
 * Validar datos de la vacante
 * @en Validate vacancy data
 */
export const validarVacante = [
  // Sanitizar y validar | Sanitize and validate
  body('titulo').trim().escape().notEmpty().withMessage('Agrega un Titulo a la Vacante | Add a Title to the Vacancy'),
  body('empresa').trim().escape().notEmpty().withMessage('Agrega una Empresa | Add a Company'),
  body('ubicacion').trim().escape().notEmpty().withMessage('Agrega una Ubicación | Add a Location'),
  body('salario').trim().escape(),
  body('contrato').trim().escape().notEmpty().withMessage('Selecciona el Tipo de Contrato | Select Contract Type'),
  body('skills').trim().escape().notEmpty().withMessage('Agrega al menos una habilidad | Add at least one skill'),

  // Handler de errores | Error handler
  (req: Request, res: Response, next: NextFunction): void => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      req.flash(
        'error',
        errores.array().map((error) => error.msg),
      );
      res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante | New Vacancy',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user?.nombre,
        mensajes: req.flash(),
      });
      return;
    }

    next();
  },
];

/**
 * Eliminar vacante
 * @en Delete vacancy
 */
export const eliminarVacante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const { id } = req.params;
  const vacante = await Vacante.findById(id);

  if (vacante && verificarAutor(vacante, req.user)) {
    await Vacante.findByIdAndDelete(vacante._id);
    res
      .status(200)
      .send('Vacante Eliminada Correctamente | Vacancy Successfully Deleted');
  } else {
    res.status(403).send('Error | Error');
  }
};

/**
 * Verificar si el usuario es el autor de la vacante
 * @en Check if user is the vacancy author
 */
const verificarAutor = (
  vacante: IVacanteDocument | null,
  usuario?: Express.User,
): boolean => {
  if (!vacante || !usuario) return false;
  return vacante.autor?.equals(usuario._id) ?? false;
};

/**
 * Middleware para subir CV
 * @en Middleware to upload CV
 */
export const subirCV = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof MulterError) {
        req.flash(
          'error',
          error.code === 'LIMIT_FILE_SIZE'
            ? 'El archivo es muy grande: Máximo 100kb | File too large: Max 100kb'
            : error.message,
        );
      } else {
        req.flash('error', error.message);
      }
      res.redirect('back');
      return;
    }
    next();
  });
};

/**
 * Contactar/postular a una vacante
 * @en Contact/apply for a vacancy
 */
export const contactar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacante = await Vacante.findOne({
    url: req.params.url,
  });

  if (!vacante) {
    return next();
  }

  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: (req.file as Express.Multer.File)?.filename ?? '',
  };

  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  req.flash(
    'correcto',
    'Se envió tu Curriculum Correctamente | CV Sent Successfully',
  );
  res.redirect('/');
};

/**
 * Mostrar candidatos de una vacante
 * @en Show candidates for a vacancy
 */
export const mostrarCandidatos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacante = await Vacante.findById(req.params.id).lean();

  if (!vacante) {
    return next();
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  if (vacante.autor.toString() !== req.user!._id.toString()) {
    return next();
  }

  res.render('candidatos', {
    nombrePagina: `Candidatos Vacante - ${vacante.titulo} | Candidates - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user?.nombre,
    imagen: req.user?.imagen,
    candidatos: vacante.candidatos,
  });
};

/**
 * Buscar vacantes por texto
 * @en Search vacancies by text
 */
export const buscarVacantes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const Vacante = (await import('../models/Vacantes.js')).default;
  const vacantes = await Vacante.find({
    $text: {
      $search: req.body.q,
    },
  }).lean();

  res.render('home', {
    nombrePagina: `Resultados para la búsqueda: ${req.body.q} | Search results: ${req.body.q}`,
    barra: true,
    vacantes,
  });
};
