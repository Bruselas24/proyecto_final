import express from 'express';
import { productModel } from '../models/productModel.js';
import { cartModel } from '../models/cartModel.js';

const router = express.Router();

// ** 1. Mostrar todos los productos con paginación **
router.get('/products', async (req, res) => {
  try {
    // Parámetros de paginación y orden
    const { limit = 10, page = 1, query = '', sort = '' } = req.query;
    const queryFilter = query ? { category: query } : {}; // Filtro por categoría si hay query

    // Ordenamiento
    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    // Paginación y búsqueda
    const products = await productModel.find(queryFilter)
      .sort(sortOption)
      .skip((page - 1) * limit) // Saltar los productos de páginas anteriores
      .limit(Number(limit));

    // Obtener el total de productos para calcular el número de páginas
    const totalProducts = await productModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Enlaces para la paginación
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.render('products', {
      products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevLink: prevPage ? `/products?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null,
      nextLink: nextPage ? `/products?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 2. Mostrar detalles de un producto específico **
router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findById(pid);

    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }

    const cartId = await cartModel.create({products: []});
    console.log(cartId)

    res.render('productDetail', {
      name: product.name,
      price: product.price,
      category: product.category,
      available: product.available,
      description: product.description || "Descripción no disponible",
      _id: product._id,
      cartId: cartId._id
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 3. Ver el carrito de compras **
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid).populate('products.product');

    if (!cart) {
      return res.status(404).render('error', { message: 'Carrito no encontrado' });
    }

    res.render('cart', {
      cart,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
