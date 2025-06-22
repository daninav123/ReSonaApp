// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Material } from '../models';
import { auditLogMiddleware } from '../middleware/auditLog';
// @ts-ignore
import multer from 'multer';
import path from 'path';
import fs from 'fs';



const router = Router();

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/materials');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/materials
router.get('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const materials = await Material.find();
    res.json({ data: materials });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/materials/:id
router.get('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      res.status(404).json({ message: 'Material not found' });
      return;
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/materials
router.post('/', authenticateJWT, auditLogMiddleware('create', 'material'), upload.array('photos', 5), async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, quantityTotal, quantityReserved } = req.body;
    const photos = req.files ? (req.files as any[]).map(f => `/uploads/materials/${f.filename}`) : [];
    const material = new Material({
      name,
      description,
      status,
      quantityTotal: Number(quantityTotal) || 0,
      quantityReserved: Number(quantityReserved) || 0,
      photos,
    });
    await material.save();
    res.status(201).json({ message: 'Material created', material });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/materials/:id
router.put('/:id', authenticateJWT, auditLogMiddleware('update', 'material'), upload.array('photos', 5), async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, quantityTotal, quantityReserved } = req.body;
    const photos = req.files ? (req.files as any[]).map(f => `/uploads/materials/${f.filename}`) : undefined;
    const update: any = { name, description, status, quantityTotal, quantityReserved };
    if (photos && photos.length > 0) update.photos = photos;
    const updated = await Material.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) {
    res.status(404).json({ message: 'Material not found' });
    return;
}
    res.json({ message: 'Material updated', material: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', authenticateJWT, auditLogMiddleware('delete', 'material'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await Material.findByIdAndDelete(req.params.id);
    if (!deleted) {
    res.status(404).json({ message: 'Material not found' });
    return;
}
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
