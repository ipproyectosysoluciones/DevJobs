/**
 * @fileoverview Controlador del servicio de empleos
 * @fileoverview Jobs service controller
 * @module services/jobs/controller
 */

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Job from '../../models/Job.js';
import type { 
  CreateJobRequest, 
  ApplyJobRequest, 
  JobsResponse,
  ApplicationStatus 
} from './types.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';

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
      status: filterStatus,
      page = '1', 
      limit = '10' 
    } = req.query as Record<string, string>;

    // Build query
    const query: Record<string, unknown> = {};
    
    if (filterStatus) {
      query.status = filterStatus;
    } else {
      query.status = 'active';
    }

    if (type) {
      query.type = type;
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (country) {
      query['location.country'] = new RegExp(country, 'i');
    }

    if (remote === 'true') {
      query['location.remote'] = true;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    if (minSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary) };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    const response: JobsResponse = {
      jobs: jobs as never,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
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
 * @returns {Promise<void>}
 */
export async function getJobById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'Invalid job ID',
      });
      return;
    }

    const job = await Job.findById(id).lean();

    if (!job) {
      res.status(404).json({
        error: 'Empleo no encontrado',
        message: 'Job not found',
      });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Error en getJobById:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
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
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    if (!jobData.title || !jobData.description || !jobData.requirements) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Title, description and requirements are required',
      });
      return;
    }

    const job = new Job({
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      employerId: user.userId,
      location: jobData.location || { city: '', country: '', remote: false },
      salary: jobData.salary,
      type: jobData.type || 'full-time',
      status: 'active',
    });

    const savedJob = await job.save();

    res.status(201).json(savedJob.toObject());
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
 * @returns {Promise<void>}
 */
export async function updateJob(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const jobData = req.body;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'Invalid job ID',
      });
      return;
    }

    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({
        error: 'Empleo no encontrado',
        message: 'Job not found',
      });
      return;
    }

    if (job.employerId.toString() !== user?.userId) {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Not authorized to update this job',
      });
      return;
    }

    Object.assign(job, jobData);
    const updatedJob = await job.save();

    res.json(updatedJob.toObject());
  } catch (error) {
    console.error('Error en updateJob:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Elimina un empleo
 * @function deleteJob
 * @description Elimina un empleo existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function deleteJob(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'Invalid job ID',
      });
      return;
    }

    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({
        error: 'Empleo no encontrado',
        message: 'Job not found',
      });
      return;
    }

    if (job.employerId.toString() !== user?.userId && user?.role !== 'admin') {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Not authorized to delete this job',
      });
      return;
    }

    await Job.findByIdAndDelete(id);

    res.json({ message: 'Empleo eliminado', jobId: id });
  } catch (error) {
    console.error('Error en deleteJob:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Aplica a un empleo
 * @function applyToJob
 * @description Postula a un empleo existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function applyToJob(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const applicationData = req.body as ApplyJobRequest;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'Invalid job ID',
      });
      return;
    }

    const job = await Job.findById(id);

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

    const alreadyApplied = job.applications.some(
      app => app.userId.toString() === user?.userId
    );

    if (alreadyApplied) {
      res.status(400).json({
        error: 'Ya aplicaste a este empleo',
        message: 'Already applied to this job',
      });
      return;
    }

    job.applications.push({
      userId: new mongoose.Types.ObjectId(user?.userId),
      status: 'pending' as ApplicationStatus,
      coverLetter: applicationData.coverLetter || '',
      resume: applicationData.resume || '',
      createdAt: new Date(),
    } as never);

    await job.save();

    res.status(201).json({
      message: 'Postulación exitosa',
    });
  } catch (error) {
    console.error('Error en applyToJob:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene las postulaciones del usuario
 * @function getMyApplications
 * @description Retorna las postulaciones del usuario actual
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function getMyApplications(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const userJobs = await Job.find(
      { 'applications.userId': new mongoose.Types.ObjectId(user.userId) },
      { title: 1, 'applications.$': 1 }
    ).lean();

    const applications = userJobs.map(job => ({
      jobId: job._id,
      title: job.title,
      application: (job as never as { applications: Array<Record<string, unknown>> }).applications?.[0],
    }));

    res.json(applications);
  } catch (error) {
    console.error('Error en getMyApplications:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
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
