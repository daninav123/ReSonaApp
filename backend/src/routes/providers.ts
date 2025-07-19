import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Provider } from '../models/Provider';
import { auditLogMiddleware } from '../middleware/auditLog';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Multer for document upload
const storage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const uploadDir = path.join(__dirname, '../../uploads/providers');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/providers
router.get('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: any = {};
    
    // Filtrado por categoría
    if (req.query.category) {
      query.category = { $in: [req.query.category] };
    }
    
    // Filtrado por estado
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Búsqueda por texto
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const providers = await Provider.find(query)
      .sort({ [req.query.sortBy as string || 'name']: req.query.order === 'desc' ? -1 : 1 })
      .limit(Number(req.query.limit) || 100)
      .skip(Number(req.query.skip) || 0);
    
    const total = await Provider.countDocuments(query);
    
    res.json({ 
      data: providers,
      pagination: {
        total,
        limit: Number(req.query.limit) || 100,
        skip: Number(req.query.skip) || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/providers/:id
router.get('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/providers
router.post('/', authenticateJWT, auditLogMiddleware('create', 'provider'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      taxId,
      category,
      rating,
      status,
      paymentTerms,
      notes,
      products
    } = req.body;

    // Validación de campos obligatorios
    if (!name || !contactPerson || !email || !phone || !address || !taxId) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const provider = new Provider({
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      taxId,
      category: Array.isArray(category) ? category : [category],
      rating: Number(rating) || 0,
      status: status || 'pending',
      paymentTerms,
      notes,
      products: products || [],
      history: [{
        date: new Date(),
        action: 'Creación',
        description: 'Proveedor registrado en el sistema',
        user: (req as any).user._id
      }]
    });

    await provider.save();
    res.status(201).json({ message: 'Proveedor creado correctamente', provider });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese CIF/NIF' });
    }
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/providers/:id
router.put('/:id', authenticateJWT, auditLogMiddleware('update', 'provider'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      taxId,
      category,
      rating,
      status,
      paymentTerms,
      notes,
      products
    } = req.body;

    // Preparamos el objeto de actualización
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (taxId) updateData.taxId = taxId;
    if (category) updateData.category = Array.isArray(category) ? category : [category];
    if (rating !== undefined) updateData.rating = Number(rating);
    if (status) updateData.status = status;
    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms;
    if (notes !== undefined) updateData.notes = notes;
    if (products) updateData.products = products;

    // Añadimos una entrada al historial
    const historyEntry = {
      date: new Date(),
      action: 'Actualización',
      description: 'Información del proveedor actualizada',
      user: (req as any).user._id
    };

    // Utilizamos $push para añadir al array de history
    const updated = await Provider.findByIdAndUpdate(
      req.params.id,
      { 
        $set: updateData,
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor actualizado correctamente', provider: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese CIF/NIF' });
    }
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/providers/:id
router.delete('/:id', authenticateJWT, auditLogMiddleware('delete', 'provider'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await Provider.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/providers/:id/documents
router.post('/:id/documents', authenticateJWT, upload.single('document'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type } = req.body;
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún documento' });
    }

    const documentData = {
      name: name || file.originalname,
      type: type || file.mimetype,
      url: `/uploads/providers/${file.filename}`,
      uploadDate: new Date()
    };

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          documents: documentData,
          history: {
            date: new Date(),
            action: 'Documento añadido',
            description: `Se ha añadido el documento: ${documentData.name}`,
            user: (req as any).user._id
          }
        }
      },
      { new: true }
    );

    if (!provider) {
      // Si no se encuentra el proveedor, eliminamos el archivo subido
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.status(201).json({ 
      message: 'Documento añadido correctamente', 
      document: documentData
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/providers/:id/documents/:documentId
router.delete('/:id/documents/:documentId', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    // Encontrar el documento
    const documentIndex = provider.documents.findIndex(doc => doc._id.toString() === req.params.documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Obtener la URL del archivo para eliminarlo del sistema de archivos
    const documentUrl = provider.documents[documentIndex].url;
    const filePath = path.join(__dirname, '../../', documentUrl);
    
    // Eliminar el documento del array
    provider.documents.splice(documentIndex, 1);
    
    // Añadir entrada al historial
    provider.history.push({
      date: new Date(),
      action: 'Documento eliminado',
      description: `Se ha eliminado un documento del proveedor`,
      user: (req as any).user._id
    });
    
    await provider.save();
    
    // Eliminar el archivo físicamente si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/providers/:id/products
router.post('/:id/products', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, price, description, category } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'El nombre y el precio son obligatorios' });
    }
    
    const product = {
      name,
      code: code || '',
      price: Number(price),
      description: description || '',
      category: category || ''
    };
    
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          products: product,
          history: {
            date: new Date(),
            action: 'Producto añadido',
            description: `Se ha añadido el producto: ${product.name}`,
            user: (req as any).user._id
          }
        }
      },
      { new: true }
    );
    
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.status(201).json({ 
      message: 'Producto añadido correctamente', 
      product: provider.products[provider.products.length - 1]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/providers/:id/products/:productId
router.put('/:id/products/:productId', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, price, description, category } = req.body;
    const provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    // Encontrar el índice del producto a actualizar
    const productIndex = provider.products.findIndex(p => p._id.toString() === req.params.productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Actualizar el producto
    if (name) provider.products[productIndex].name = name;
    if (code !== undefined) provider.products[productIndex].code = code;
    if (price !== undefined) provider.products[productIndex].price = Number(price);
    if (description !== undefined) provider.products[productIndex].description = description;
    if (category !== undefined) provider.products[productIndex].category = category;
    
    // Añadir entrada al historial
    provider.history.push({
      date: new Date(),
      action: 'Producto actualizado',
      description: `Se ha actualizado el producto: ${provider.products[productIndex].name}`,
      user: (req as any).user._id
    });
    
    await provider.save();
    
    res.json({ 
      message: 'Producto actualizado correctamente', 
      product: provider.products[productIndex]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/providers/:id/products/:productId
router.delete('/:id/products/:productId', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    // Encontrar el producto
    const productIndex = provider.products.findIndex(p => p._id.toString() === req.params.productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const productName = provider.products[productIndex].name;
    
    // Eliminar el producto del array
    provider.products.splice(productIndex, 1);
    
    // Añadir entrada al historial
    provider.history.push({
      date: new Date(),
      action: 'Producto eliminado',
      description: `Se ha eliminado el producto: ${productName}`,
      user: (req as any).user._id
    });
    
    await provider.save();
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
