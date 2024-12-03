import express from 'express';
import { cartModel } from '../models/cartModel.js';
import { productModel } from '../models/productModel.js';

const router = express.Router();

// ** 1. Crear un carrito nuevo **
router.post('/', async (req, res) => {
  try {
    const newCart = new cartModel({ products: [] });
    await newCart.save();
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 2. Obtener un carrito por ID **
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartModel.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 3. Agregar un producto al carrito **
router.post('/:cartId/products/:productId', async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { quantity = 1 } = req.body;

    // Buscar el producto por su ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    let cart;

    // Si no existe el carrito, crearlo
    if (cartId === 'new') {
      cart = new cartModel({
        products: [
          {
            product: productId,
            quantity,
          },
        ],
      });
    } else {
      // Si el carrito ya existe, buscarlo
      cart = await cartModel.findById(cartId);

      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }

      // Verificar si el producto ya está en el carrito
      const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

      if (productIndex > -1) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        cart.products[productIndex].quantity += Number(quantity);
      } else {
        // Si el producto no está en el carrito, agregarlo
        cart.products.push({
          product: productId,
          quantity,
        });
      }
    }

    // Guardar el carrito (nuevo o actualizado)
    await cart.save();

    res.status(200).json({ status: 'success', message: 'Producto agregado al carrito', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito' });
  }
});

// ** 4. Eliminar un producto del carrito **
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    
    const cart = await cartModel.findById(cid);
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Eliminar el producto del carrito
    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

    if (productIndex !== -1) {
      cart.products.splice(productIndex, 1);
      await cart.save();
      res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito' });
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 5. Actualizar todos los productos del carrito **
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // Esperamos un arreglo de productos { product: id, quantity: X }

    const cart = await cartModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Actualizamos los productos del carrito
    cart.products = products.map(item => ({ product: item.product, quantity: item.quantity }));
    
    await cart.save();
    res.status(200).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 6. Actualizar la cantidad de un producto específico en el carrito **
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await cartModel.findById(cid);
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const product = cart.products.find(item => item.product.toString() === pid);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    // Actualizar la cantidad del producto
    product.quantity = quantity;

    await cart.save();
    res.status(200).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ** 7. Eliminar todos los productos del carrito **
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const cart = await cartModel.findById(cid);
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Limpiar el carrito
    cart.products = [];
    
    await cart.save();
    res.status(200).json({ status: 'success', message: 'Todos los productos han sido eliminados del carrito' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
