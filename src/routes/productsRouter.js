import { Router } from 'express';
import { productModel } from '../models/productModel.js';

const productsRouter = Router();

// GET: Listar productos con filtros, paginación y ordenamiento
productsRouter.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = '', query } = req.query;

    // Construcción del filtro de búsqueda por categoría
    const filter = query
      ? { category: query }
      : {}; // Si no hay filtro, no se aplica nada

    // Configuración de paginación y ordenamiento
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {},
    };

    // Consulta con Mongoose Paginate
    const products = await productModel.paginate(filter, options);

    // Verifica si se obtuvieron productos correctamente
    if (!products || !products.docs.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No products found for the given filter.',
      });
    }

    // Respuesta con los productos paginados
    res.json({
      status: 'success',
      payload: products.docs,  // Productos obtenidos
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}`
        : null,
      nextLink: products.hasNextPage
        ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}`
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los productos' });
  }
});


// GET: Obtener un producto por su ID
productsRouter.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findById(pid);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al obtener el producto' });
  }
});

// POST: Crear un nuevo producto
productsRouter.post('/', async (req, res) => {
  try {
    const newProduct = req.body;
    const createdProduct = await productModel.create(newProduct);

    res.status(201).json({ status: 'success', payload: createdProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al crear el producto' });
  }
});

// PUT: Actualizar un producto existente por su ID
productsRouter.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedProduct = req.body;

    const result = await productModel.findByIdAndUpdate(pid, updatedProduct, { new: true });

    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el producto' });
  }
});

// DELETE: Eliminar un producto por su ID
productsRouter.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;

    const result = await productModel.findByIdAndDelete(pid);

    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar el producto' });
  }
});

export default productsRouter;