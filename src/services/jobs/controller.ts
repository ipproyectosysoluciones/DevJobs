/**
 * @fileoverview Controlador del servicio de empleos
 * @fileoverview Jobs service controller
 * @module services/jobs/controller
 */

import type { Request, Response } from 'express';
import type { 
  Job, 
  CreateJobRequest, 
  ApplyJobRequest, 
  JobsResponse,
  ApplicationStatus 
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB)
const jobs: Map<string, Job> = new Map();

// Semilla de datos de ejemplo
seedJobs();

/**
 * Obtiene todos los empleos con filtros y paginación
 * @function getJobs
 * @description Retorna lista de empleos con filtros opcionales
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function getJobs(req: Request, res: Response): Promise<void> {
  try {
    const { 
      search, 
      city, 
      country, 
      remote, 
      type, 
      minSalary, 
      status = 'active',
      page = 1, 
      limit = 10 
    } = req.query as Record<string, string>;

    let filteredJobs = Array.from(jobs.values());

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }

    if (city) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.city.toLowerCase() === city.toLowerCase()
      );
    }

    if (country) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (remote === 'true') {
      filteredJobs = filteredJobs.filter(job => job.location.remote);
    }

    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (minSalary) {
      filteredJobs = filteredJobs.filter(job => 
        job.salary && job.salary.min >= parseInt(minSalary)
      );
    }

    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Paginación
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / parseInt(String(limit)));
    const startIndex = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + parseInt(String(limit)));

    const response: JobsResponse = {
      jobs: paginatedJobs,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      totalPages,
    };

    res.json(response);
  } catch (error) {
    console.error('Error en getJobs:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene un empleo por ID
 * @function getJobById
 * @description Retorna un empleo específico
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getJobById(req: Request, res: Response): void {
  const id = req.params.id as string;
  const job = jobs.get(id);

  if (!job) {
    res.status(404).json({
      error: 'Empleo no encontrado',
      message: 'Job not found',
    });
    return;
  }

  res.json(job);
}

/**
 * Crea un nuevo empleo
 * @function createJob
 * @description Crea una nueva vacante de empleo
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function createJob(req: Request, res: Response): Promise<void> {
  try {
    const jobData = req.body as CreateJobRequest;
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    // Validar datos requeridos
    if (!jobData.title || !jobData.description || !jobData.requirements) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Title, description and requirements are required',
      });
      return;
    }

    const job: Job = {
      _id: crypto.randomUUID(),
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      employerId: user.userId,
      location: jobData.location || { city: '', country: '', remote: false },
      salary: jobData.salary,
      type: jobData.type || 'full-time',
      status: 'active',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(job._id, job);

    res.status(201).json(job);
  } catch (error) {
    console.error('Error en createJob:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Actualiza un empleo
 * @function updateJob
 * @description Actualiza los datos de un empleo existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function updateJob(req: Request, res: Response): void {
  const id = req.params.id as string;
  const jobData = req.body;
  const user = (req as any).user;

  const job = jobs.get(id);

  if (!job) {
    res.status(404).json({
      error: 'Empleo no encontrado',
      message: 'Job not found',
    });
    return;
  }

  // Verificar que el usuario es el empleador
  if (job.employerId !== user?.userId) {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Not authorized to update this job',
    });
    return;
  }

  const updatedJob: Job = {
    ...job,
    ...jobData,
    _id: job._id,
    employerId: job.employerId,
    createdAt: job.createdAt,
    updatedAt: new Date(),
  };

  jobs.set(id, updatedJob);
  res.json(updatedJob);
}

/**
 * Elimina un empleo
 * @function deleteJob
 * @description Elimina un empleo existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function deleteJob(req: Request, res: Response): void {
  const id = req.params.id as string;
  const user = (req as any).user;

  const job = jobs.get(id);

  if (!job) {
    res.status(404).json({
      error: 'Empleo no encontrado',
      message: 'Job not found',
    });
    return;
  }

  // Verificar que el usuario es el empleador o admin
  if (job.employerId !== user?.userId && user?.role !== 'admin') {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Not authorized to delete this job',
    });
    return;
  }

  jobs.delete(id);
  res.json({ message: 'Empleo eliminado', jobId: id });
}

/**
 * Aplica a un empleo
 * @function applyToJob
 * @description Postula a un empleo existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function applyToJob(req: Request, res: Response): void {
  const id = req.params.id as string;
  const applicationData = req.body as ApplyJobRequest;
  const user = (req as any).user;

  const job = jobs.get(id);

  if (!job) {
    res.status(404).json({
      error: 'Empleo no encontrado',
      message: 'Job not found',
    });
    return;
  }

  if (job.status !== 'active') {
    res.status(400).json({
      error: 'El empleo no está activo',
      message: 'Job is not active',
    });
    return;
  }

  // Verificar si ya aplicó
  const alreadyApplied = job.applications.some(app => app.userId === user?.userId);
  if (alreadyApplied) {
    res.status(400).json({
      error: 'Ya aplicaste a este empleo',
      message: 'Already applied to this job',
    });
    return;
  }

  const application = {
    userId: user?.userId || '',
    status: 'pending' as ApplicationStatus,
    coverLetter: applicationData.coverLetter,
    resume: applicationData.resume,
    createdAt: new Date(),
  };

  job.applications.push(application);
  jobs.set(id, job);

  res.status(201).json({
    message: 'Postulación exitosa',
    application,
  });
}

/**
 * Obtiene las postulaciones del usuario
 * @function getMyApplications
 * @description Retorna las postulaciones del usuario actual
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getMyApplications(req: Request, res: Response): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const userApplications: Array<{ job: Job; application: Job['applications'][0] }> = [];

  jobs.forEach(job => {
    const application = job.applications.find(app => app.userId === user.userId);
    if (application) {
      userApplications.push({ job, application });
    }
  });

  res.json(userApplications);
}

/**
 * Semilla de datos de ejemplo
 * @function seedJobs
 */
function seedJobs(): void {
  const sampleJobs: Job[] = [
    {
      _id: '1',
      title: 'Frontend Developer',
      description: 'Buscamos un desarrollador frontend con experiencia en React',
      requirements: ['React', 'TypeScript', 'CSS', 'HTML'],
      employerId: 'emp-1',
      location: { city: 'Madrid', country: 'España', remote: true },
      salary: { min: 30000, max: 50000, currency: 'EUR' },
      type: 'full-time',
      status: 'active',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      title: 'Backend Developer',
      description: 'Buscamos un desarrollador backend con Node.js',
      requirements: ['Node.js', 'Express', 'MongoDB', 'TypeScript'],
      employerId: 'emp-1',
      location: { city: 'Barcelona', country: 'España', remote: false },
      salary: { min: 35000, max: 60000, currency: 'EUR' },
      type: 'full-time',
      status: 'active',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      title: 'Full Stack Developer',
      description: 'Desarrollador full stack para proyecto interesante',
      requirements: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      employerId: 'emp-2',
      location: { city: 'Buenos Aires', country: 'Argentina', remote: true },
      salary: { min: 40000, max: 70000, currency: 'USD' },
      type: 'full-time',
      status: 'active',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  sampleJobs.forEach(job => jobs.set(job._id, job));
}

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getMyApplications,
};
